package vn.doan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.*;
import vn.doan.domain.enums.OrderStatus;
import vn.doan.dto.request.OrderCreateRequest;
import vn.doan.dto.request.OrderItemRequest;
import vn.doan.dto.response.OrderItemResponse;
import vn.doan.dto.response.OrderProcessResponse;
import vn.doan.dto.response.OrderResponse;
import vn.doan.repository.OrderRepository;
import vn.doan.repository.PaymentRepository;
import vn.doan.repository.ProductRepository;
import vn.doan.repository.PromotionRepository;
import vn.doan.repository.ToppingRepository;
import vn.doan.repository.UserRepository;
import vn.doan.repository.CustomerRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.time.LocalDateTime; 
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository; 
    private final PromotionRepository promotionRepository;
    private final ToppingRepository toppingRepository;
    private final CustomerRepository customerRepository;

    // * 1. Lấy thông tin chi tiết một đơn hàng
    public OrderResponse getOrderDetails(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));
        return mapToResponse(order);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // * 2. Lấy danh sách các đơn hàng đang chờ pha chế (Dành cho Barista)
    public List<OrderResponse> getActiveOrdersForBarista() {
        List<OrderStatus> activeStatuses = Arrays.asList(
                OrderStatus.CONFIRMED,
                OrderStatus.PREPARING
        );
        List<Order> activeOrders = orderRepository.findByStatusIn(activeStatuses);

        return activeOrders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // * 3. Chốt đơn hàng
    @Transactional
    public OrderResponse checkout(OrderCreateRequest request) {
        // Lấy tt khách hàng thông qua UserRepository
        User user = request.getCustomerId() == null || request.getCustomerId().isBlank()
                ? null
                : userRepository.findById(request.getCustomerId())
                        .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));
        Customer customer = user == null ? null : user.getInfo();
        if (customer == null) {
            customer = new Customer();
            customer.setUser(user);
            customer.setName(request.getCustomerName() == null ? (user == null ? "Khách" : user.getFullName()) : request.getCustomerName());
            customer.setPhone(request.getPhone() == null ? (user == null ? null : user.getPhone()) : request.getPhone());
            if (user == null) customer = customerRepository.save(customer);
            else user.setInfo(customer);
        }

        // Tạo đơn hàng
        Order order = new Order(customer);

        long totalAmount = 0;

        // Xử lý từng món hàng + topping
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + itemReq.getProductId()));

            // Ktr trạng thái
            if (!product.isStatus()) {
                throw new IllegalStateException("Sản phẩm " + product.getName() + " hiện đang ngừng bán.");
            }
            if (itemReq.getQuantity() < 1) {
                throw new IllegalArgumentException("Số lượng sản phẩm phải lớn hơn 0.");
            }

            long totalToppingPrice = 0;
            List<Topping> selectedToppings = new ArrayList<>();
            
            if (itemReq.getToppingIds() != null && !itemReq.getToppingIds().isEmpty()) {
                for (String toppingId : itemReq.getToppingIds()) {
                    Topping topping = toppingRepository.findById(toppingId)
                            .or(() -> toppingRepository.findByNameIgnoreCase(toppingId))
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy Topping: " + toppingId));
                    if (!topping.isAvailable()) {
                        throw new IllegalStateException("Topping " + topping.getName() + " hiện đang hết hàng.");
                    }
                    selectedToppings.add(topping);
                }
            }
            totalToppingPrice = selectedToppings.stream().mapToLong(Topping::getPrice).sum();
            
            // Giá gốc = giá sản phẩm + giá các loại topping
            long unitPrice = product.getPrice() + ("L".equalsIgnoreCase(itemReq.getSize()) ? 6000 : 0) + totalToppingPrice;
            
            // Tạo OrderItem
            OrderItem orderItem = new OrderItem(order, product, itemReq.getQuantity(), unitPrice, itemReq.getNote());
            orderItem.setSize(itemReq.getSize());
            orderItem.setSugarPercent(itemReq.getSugarPercent());
            orderItem.setIcePercent(itemReq.getIcePercent());
            orderItem.setToppings(selectedToppings.stream().map(Topping::getName).toList());
            
            // Gắn topping vào orderItem
            for (Topping topping : selectedToppings) {
                OrderItemTopping itemTopping = new OrderItemTopping(
                        orderItem, 
                        topping, 
                        1, 
                        topping.getPrice() 
                );
                orderItem.getOrderItemToppings().add(itemTopping);
            }

            order.getItems().add(orderItem);

            // Tính tổng tiền
            totalAmount += orderItem.calculateSubtotal();
        }

        // Gán tổng tiền và xử lý khuyến mãi
        order.setTotalAmount(totalAmount);
        long discountAmount = 0;
        long finalAmount = totalAmount;

        // Kiểm tra xem có nhập mã khuyến mãi không
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            
            Promotion promotion = promotionRepository.findByVoucherCode(request.getVoucherCode())
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại."));

            if (!promotion.isValid()) {
                throw new IllegalStateException("Mã giảm giá đã hết hạn, không hoạt động hoặc vượt quá giới hạn sử dụng.");
            }

            discountAmount = promotion.calculateDiscount(totalAmount);
            finalAmount = totalAmount - discountAmount;

            order.setDiscount(promotion);
            promotion.setUsedCount(promotion.getUsedCount() + 1); 
        }

        order.setFinalAmount(finalAmount);
        Order savedOrder = orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    // * 4. Thay đổi trạng thái đơn hàng
    @Transactional
    public void changeOrderStatus(String orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));

        order.changeStatus(newStatus);
    }

    // * 5. Khách hàng hoặc nhân viên Hủy đơn
    @Transactional
    public void cancelOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));

        order.changeStatus(OrderStatus.CANCELLED);
    }

    // * 6. Lịch sử đơn hàng cho khách hàng (ĐÃ SỬA LỖI Ở ĐÂY)
    public List<OrderResponse> getCustomerOrderHistory(String customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));
        
        Customer customer = user.getInfo();
        if (customer == null) {
            throw new RuntimeException("Tài khoản này chưa có hồ sơ khách hàng.");
        }

        return orderRepository.findByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // * 7. Thống kê doanh thu theo khoảng thời gian
    public long calculateRevenue(LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> ordersInRange = orderRepository.findByCreatedAtBetween(startDate, endDate);

        return ordersInRange.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .mapToLong(Order::getFinalAmount)
                .sum();
    }

    // * 8. Lấy chi tiết ds các đơn hàng thành công
    public List<OrderResponse> getCompletedOrdersInRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> ordersInRange = orderRepository.findByCreatedAtBetween(startDate, endDate);

        return ordersInRange.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // --- HÀM TIỆN ÍCH MAP SANG DTO RESPONSE ---
    private OrderResponse mapToResponse(Order order) {
        
        // Map danh sách món hàng kèm tên Topping
        List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
            
            // Lấy tên các topping từ bảng trung gian
            List<String> toppingNames = item.getOrderItemToppings().stream()
                    .map(it -> it.getTopping().getName())
                    .collect(Collectors.toList());

            return new OrderItemResponse(
                    item.getId(),
                    item.getProduct().getId(),
                    item.getProduct().getName(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    item.calculateSubtotal(),
                    item.getNote(),
                    toppingNames,
                    item.getSize(),
                    item.getSugarPercent(),
                    item.getIcePercent(),
                    item.getToppings()
            );
        }).collect(Collectors.toList());

        List<OrderProcessResponse> processResponses = order.getProcesses().stream().map(process ->
                new OrderProcessResponse(
                        process.getId(),
                        order.getId(),
                        process.getStatus().name(),
                        process.getUpdateAt()
                )
        ).collect(Collectors.toList());

        // Lấy thông tin voucher nếu có
        long discountAmount = 0;
        String voucherCode = null;
        if (order.getDiscount() != null) {
            discountAmount = order.getTotalAmount() - order.getFinalAmount();
            voucherCode = order.getDiscount().getVoucherCode();
        }

        return new OrderResponse(
                order.getId(),
                order.getCustomer() == null ? null : order.getCustomer().getId(),
                order.getCustomer() == null ? null : order.getCustomer().getName(),
                order.getCustomer() == null ? null : order.getCustomer().getPhone(),
                order.getTotalAmount(),
                discountAmount, // Đã cập nhật tiền giảm giá
                order.getFinalAmount(),
                order.getStatus().name(),
                order.getCreatedAt(),
                itemResponses,
                processResponses,
                voucherCode,
                paymentRepository.findByOrder(order)
                        .map(payment -> payment.getPaymentMethod().name())
                        .orElse(null)
        );
    }
}