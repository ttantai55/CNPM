package vn.doan.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.doan.domain.Customer;
import vn.doan.domain.Order;
import vn.doan.domain.OrderItem;
import vn.doan.domain.Payment;
import vn.doan.domain.Product;
import vn.doan.domain.enums.PaymentMethod;
import vn.doan.dto.request.PaymentCallbackDTO;
import vn.doan.repository.LoyaltyTransactionRepo;
import vn.doan.repository.OrderRepository;
import vn.doan.repository.PaymentRepository;
import vn.doan.repository.ProductRepository;

import java.util.Optional;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private ProductRepository productRepository;
    @Mock private LoyaltyTransactionRepo loyaltyTransactionRepo;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                paymentRepository,
                orderRepository,
                productRepository,
                loyaltyTransactionRepo
        );
    }

    @Test
    void incrementsWeeklySalesByPaidQuantityOnlyOnce() {
        Order order = createOrderWithItem(2);
        Payment payment = new Payment(order, 80_000, PaymentMethod.MOMO);
        when(orderRepository.findById("ORD_TEST")).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderForUpdate(order)).thenReturn(Optional.of(payment));
        when(productRepository.incrementWeeklySalesCount("PROD_TEST", 2)).thenReturn(1);
        PaymentCallbackDTO callback = callback("00");

        paymentService.processPaymentCallback(callback);
        paymentService.processPaymentCallback(callback);

        verify(productRepository, times(1)).incrementWeeklySalesCount("PROD_TEST", 2);
    }

    @Test
    void doesNotIncrementWeeklySalesForFailedPayment() {
        Order order = createOrderWithItem(2);
        Payment payment = new Payment(order, 80_000, PaymentMethod.MOMO);
        when(orderRepository.findById("ORD_TEST")).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderForUpdate(order)).thenReturn(Optional.of(payment));

        paymentService.processPaymentCallback(callback("05"));

        verifyNoInteractions(productRepository);
    }

    private Order createOrderWithItem(long quantity) {
        Order order = new Order();
        order.setId("ORD_TEST");
        order.setCustomer(new Customer());
        Product product = new Product();
        product.setId("PROD_TEST");
        order.getItems().add(new OrderItem(order, product, quantity, 40_000, null));
        return order;
    }

    private PaymentCallbackDTO callback(String responseCode) {
        PaymentCallbackDTO callback = new PaymentCallbackDTO();
        callback.setOrderId("ORD_TEST");
        callback.setPaymentMethod("MOMO");
        callback.setAmount(80_000);
        callback.setResponseCode(responseCode);
        return callback;
    }
}
