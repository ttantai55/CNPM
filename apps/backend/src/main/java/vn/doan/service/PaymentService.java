package vn.doan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.LoyaltyTransaction;
import vn.doan.domain.Order;
import vn.doan.domain.Payment;
import vn.doan.domain.User;
import vn.doan.domain.enums.LoyalType;
import vn.doan.domain.enums.OrderStatus;
import vn.doan.domain.enums.PaymentMethod;
import vn.doan.domain.enums.PaymentStatus;
import vn.doan.dto.request.PaymentCallbackDTO;
import vn.doan.dto.request.PaymentCreateRequest;
import vn.doan.dto.response.PaymentResult;
import vn.doan.dto.response.PaymentUrlResponse;
import vn.doan.repository.LoyaltyTransactionRepo;
import vn.doan.repository.OrderRepository;
import vn.doan.repository.PaymentRepository;
import vn.doan.dto.response.PaymentResponse;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final LoyaltyTransactionRepo loyaltyTransactionRepo;

    // * 1. Khởi tạo giao dịch trả về url
    @Transactional
    public PaymentUrlResponse createPaymentTransaction(PaymentCreateRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + request.getOrderId()));

        if (request.getTotalAmount() != order.getFinalAmount()) {
            throw new IllegalArgumentException("Số tiền thanh toán không khớp với hóa đơn.");
        }

        PaymentMethod method;
        try {
            method = PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Phương thức thanh toán không hợp lệ.");
        }

        Payment existing = paymentRepository.findByOrder(order).orElse(null);
        if (existing != null) {
            if (existing.getPaymentMethod() != method || existing.getTotalAmount() != order.getFinalAmount()) {
                throw new IllegalStateException("Đơn hàng đã có giao dịch với phương thức thanh toán khác.");
            }
            return paymentUrl(order.getId(), method);
        }

        Payment payment = new Payment(order, order.getFinalAmount(), method);
        paymentRepository.save(payment);

        return paymentUrl(order.getId(), method);
    }

    private PaymentUrlResponse paymentUrl(String orderId, PaymentMethod method) {
        String paymentUrl = method == PaymentMethod.MOMO 
                ? "https://test-payment.momo.vn/v2/gateway/api/create?orderId=" + orderId
                : "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?orderId=" + orderId;
        LocalDateTime expiredAt = LocalDateTime.now().plusMinutes(60);
        return new PaymentUrlResponse(orderId, paymentUrl, expiredAt);
    }

    // * 2. Xử lý Callback/Webhook, Tích điểm và trả về Kết quả rõ ràng
    @Transactional
    public PaymentResult processPaymentCallback(PaymentCallbackDTO callbackDTO) {
        Order order = orderRepository.findById(callbackDTO.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));

        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch thanh toán."));

        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            return new PaymentResult(PaymentStatus.SUCCESS, "Giao dịch này đã được xử lý thành công trước đó", order.getId());
        }

        boolean isSuccess = "00".equals(callbackDTO.getResponseCode()) || "0".equals(callbackDTO.getResponseCode());

        if (isSuccess) {
            payment.setPaymentStatus(PaymentStatus.SUCCESS);
            payment.setPaymentDate(LocalDateTime.now());
            order.changeStatus(OrderStatus.CONFIRMED);
            // tích điểm thưởng
            User user = order.getCustomer().getUser(); 
            if (user != null) {
                int pointsEarned = (int) (order.getFinalAmount() / 10000); // 10k = 1 điểm
                if (pointsEarned > 0) {
                    List<LoyaltyTransaction> history = loyaltyTransactionRepo.findByUserId(user.getId());
                    int currentBalance = history.isEmpty() ? 0 : history.get(history.size() - 1).getBalancedAfter();
                    int newBalance = currentBalance + pointsEarned;

                    LoyaltyTransaction loyaltyTx = new LoyaltyTransaction(
                            user, order, LoyalType.EARN, pointsEarned, newBalance, "Tích điểm từ đơn hàng " + order.getId()
                    );
                    loyaltyTransactionRepo.save(loyaltyTx);
                }
            }

            // Trả về DTO 
            return new PaymentResult(PaymentStatus.SUCCESS, "Thanh toán thành công", order.getId());

        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            payment.setPaymentDate(LocalDateTime.now());
            order.changeStatus(OrderStatus.CANCELLED);
            
            // Trả về DTO
            return new PaymentResult(PaymentStatus.FAILED, "Thanh toán thất bại hoặc bị hủy", order.getId());
        }
    }

    // *3. Lấy danh sách giao dịch thành công
    public List<PaymentResponse> getAllSuccessfulPayments() {
        return paymentRepository.findByPaymentStatus(PaymentStatus.SUCCESS)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // *4. Khách hàng xem chi tiết biên lai thanh toán theo Mã đơn hàng
    public PaymentResponse getPaymentReceiptByOrderId(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));

        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() -> new RuntimeException("Chưa có giao dịch thanh toán cho đơn hàng này."));

        return mapToResponse(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getOrder().getId(),
                payment.getTotalAmount(),
                payment.getPaymentMethod().name(),
                payment.getPaymentStatus().name(),
                payment.getPaymentDate()
        );
    }
}