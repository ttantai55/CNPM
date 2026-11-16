package vn.doan.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.doan.domain.Customer;
import vn.doan.domain.LoyaltyTransaction;
import vn.doan.domain.Order;
import vn.doan.domain.Product;
import vn.doan.domain.User;
import vn.doan.domain.enums.LoyalType;
import vn.doan.domain.enums.OrderStatus;
import vn.doan.dto.request.OrderCreateRequest;
import vn.doan.dto.request.OrderItemRequest;
import vn.doan.repository.CustomerRepository;
import vn.doan.repository.LoyaltyTransactionRepo;
import vn.doan.repository.OrderRepository;
import vn.doan.repository.PaymentRepository;
import vn.doan.repository.ProductRepository;
import vn.doan.repository.PromotionRepository;
import vn.doan.repository.ToppingRepository;
import vn.doan.repository.UserRepository;

import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceLoyaltyTest {

    @Mock private OrderRepository orderRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private PromotionRepository promotionRepository;
    @Mock private ToppingRepository toppingRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private LoyaltyTransactionRepo loyaltyTransactionRepo;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(
                orderRepository,
                paymentRepository,
                productRepository,
                userRepository,
                promotionRepository,
                toppingRepository,
                customerRepository,
                loyaltyTransactionRepo
        );
    }

    @Test
    void awardsOnePointPerThousandDongWhenOrderCompletes() {
        User user = new User();
        user.setId("USER_1");
        Customer customer = new Customer();
        customer.setUser(user);
        Order order = new Order(customer);
        order.setId("ORDER_1");
        order.setFinalAmount(50_000);
        order.changeStatus(OrderStatus.CONFIRMED);
        order.changeStatus(OrderStatus.PREPARING);
        when(orderRepository.findById("ORDER_1")).thenReturn(Optional.of(order));
        when(userRepository.findByIdForUpdate("USER_1")).thenReturn(Optional.of(user));

        orderService.changeOrderStatus("ORDER_1", OrderStatus.COMPLETED);

        assertEquals(50, user.getLoyaltyPoints());
        ArgumentCaptor<LoyaltyTransaction> transaction = ArgumentCaptor.forClass(LoyaltyTransaction.class);
        verify(loyaltyTransactionRepo).save(transaction.capture());
        assertEquals(LoyalType.EARN, transaction.getValue().getTransactionType());
        assertEquals(50, transaction.getValue().getPoints());
        assertEquals(50, transaction.getValue().getBalanceAfter());
        assertThrows(IllegalStateException.class,
                () -> orderService.changeOrderStatus("ORDER_1", OrderStatus.COMPLETED));
        assertEquals(50, user.getLoyaltyPoints());
    }

    @Test
    void redeemsPointsAndAppliesFreeHighestDrinkDiscountAtCheckout() {
        User user = createCustomer(2_000);
        Product product = new Product("DRINK_1", "Latte", 50_000, null, null, true, null);
        when(userRepository.findByIdForUpdate("USER_1")).thenReturn(Optional.of(user));
        when(productRepository.findById("DRINK_1")).thenReturn(Optional.of(product));
        when(orderRepository.save(org.mockito.ArgumentMatchers.any(Order.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentRepository.findByOrder(org.mockito.ArgumentMatchers.any(Order.class)))
                .thenReturn(Optional.empty());

        var response = orderService.checkout(request("USER_1", "POINTS_2000_FREE_DRINK"));

        assertEquals(0, user.getLoyaltyPoints());
        assertEquals(50_000, response.getDiscountAmount());
        assertEquals(0, response.getFinalAmount());
        ArgumentCaptor<LoyaltyTransaction> transaction = ArgumentCaptor.forClass(LoyaltyTransaction.class);
        verify(loyaltyTransactionRepo).save(transaction.capture());
        assertEquals(LoyalType.REDEEM, transaction.getValue().getTransactionType());
        assertEquals(2_000, transaction.getValue().getPoints());
        assertEquals(0, transaction.getValue().getBalanceAfter());
    }

    @Test
    void rejectsRewardWhenCustomerDoesNotHaveEnoughPoints() {
        User user = createCustomer(499);
        when(userRepository.findByIdForUpdate("USER_1")).thenReturn(Optional.of(user));
        when(productRepository.findById("DRINK_1"))
                .thenReturn(Optional.of(new Product("DRINK_1", "Latte", 50_000, null, null, true, null)));

        assertThrows(IllegalStateException.class,
                () -> orderService.checkout(request("USER_1", "POINTS_500_10000")));

        assertEquals(499, user.getLoyaltyPoints());
        verifyNoInteractions(loyaltyTransactionRepo);
        verify(orderRepository, org.mockito.Mockito.never())
                .save(org.mockito.ArgumentMatchers.any(Order.class));
    }

    private User createCustomer(int points) {
        User user = new User();
        user.setId("USER_1");
        user.setLoyaltyPoints(points);
        Customer customer = new Customer();
        customer.setUser(user);
        customer.setName("Customer");
        user.setInfo(customer);
        return user;
    }

    private OrderCreateRequest request(String customerId, String rewardCode) {
        OrderCreateRequest request = new OrderCreateRequest();
        request.setCustomerId(customerId);
        request.setLoyaltyRewardCode(rewardCode);
        request.setItems(List.of(new OrderItemRequest("DRINK_1", 1, null, List.of())));
        return request;
    }
}
