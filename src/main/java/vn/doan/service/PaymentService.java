
package vn.doan.service;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

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
import vn.doan.dto.response.PaymentResponse;

import vn.doan.exception.BusinessValidationException;
import vn.doan.exception.ResourceNotFoundException;

import vn.doan.repository.LoyaltyTransactionRepo;
import vn.doan.repository.OrderRepository;
import vn.doan.repository.PaymentRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {

    // Thời gian chờ thanh toán: 60 phút
    private static final int PAYMENT_TIMEOUT_MINUTES = 60;

    private static final String MOMO_SANDBOX_URL =
            "https://test-payment.momo.vn/v2/gateway/api/create";

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final LoyaltyTransactionRepo loyaltyTransactionRepo;
    private final OrderService orderService;

    // Thông tin tài khoản ngân hàng lấy từ application.properties
    @Value("${payment.bank-transfer.bank-id:}")
    private String bankId;

    @Value("${payment.bank-transfer.account-number:}")
    private String bankAccountNumber;

    @Value("${payment.bank-transfer.account-name:}")
    private String bankAccountName;

    // 1. KHỞI TẠO GIAO DỊCH THANH TOÁN
    @Transactional
    public PaymentUrlResponse createPaymentTransaction(
            PaymentCreateRequest request) {

        // Tìm đơn hàng
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy đơn hàng: " + request.getOrderId()
                        )
                );

        // Chỉ cho phép thanh toán đơn hàng đang chờ
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessValidationException(
                    "Đơn hàng không ở trạng thái chờ thanh toán."
            );
        }

        // Kiểm tra đơn hàng đã có giao dịch hay chưa
        if (paymentRepository.findByOrder(order).isPresent()) {
            throw new BusinessValidationException(
                    "Đơn hàng này đã có giao dịch thanh toán."
            );
        }

        // Kiểm tra số tiền
        if (request.getTotalAmount() != order.getFinalAmount()) {
            throw new BusinessValidationException(
                    "Số tiền thanh toán không khớp với hóa đơn."
            );
        }

        // Kiểm tra phương thức thanh toán
        PaymentMethod method;

        try {
            method = PaymentMethod.valueOf(
                    request.getPaymentMethod().trim().toUpperCase(Locale.ROOT)
            );
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BusinessValidationException(
                    "Phương thức thanh toán không hợp lệ. Chỉ chấp nhận MOMO hoặc BANK_TRANSFER."
            );
        }

        // Tạo URL theo phương thức thanh toán
        String paymentUrl = buildPaymentUrl(method, order);

        // Tạo giao dịch
        Payment payment = new Payment(
                order,
                order.getFinalAmount(),
                method
        );

        paymentRepository.save(payment);

        // Thời điểm hết hạn
        LocalDateTime expiredAt = payment.getCreatedAt().plusMinutes(PAYMENT_TIMEOUT_MINUTES);

        return new PaymentUrlResponse(
                order.getId(),
                paymentUrl,
                expiredAt
        );
    }

    // 2. TẠO URL THANH TOÁN THEO PHƯƠNG THỨC
    private String buildPaymentUrl(
            PaymentMethod method,
            Order order) {

        return switch (method) {

            case MOMO -> buildMomoPaymentUrl(order);

            case BANK_TRANSFER -> buildBankTransferUrl(order);

        };
    }


    // Tạo URL MoMo sandbox (mô phỏng theo code hiện tại)
    private String buildMomoPaymentUrl(Order order) {

        return UriComponentsBuilder
                .fromUriString(MOMO_SANDBOX_URL)
                .queryParam("orderId", order.getId())
                .queryParam("amount", order.getFinalAmount())
                .queryParam(
                        "orderInfo",
                        "Thanh toan don hang " + order.getId()
                )
                .build()
                .encode()
                .toUriString();
    }


    // Tạo mã QR chuyển khoản ngân hàng bằng VietQR
    private String buildBankTransferUrl(Order order) {

        // Kiểm tra thông tin tài khoản ngân hàng
        if (bankId == null || bankId.isBlank()
                || bankAccountNumber == null || bankAccountNumber.isBlank()
                || bankAccountName == null || bankAccountName.isBlank()) {

            throw new BusinessValidationException(
                    "Chưa cấu hình thông tin tài khoản ngân hàng. " +
                    "Vui lòng kiểm tra application.properties."
            );
        }

        // Nội dung chuyển khoản không dấu, không ký tự đặc biệt
        String transferContent = "BREWLITE"
                + order.getId().replaceAll("[^a-zA-Z0-9]", "");

        // Nội dung VietQR tối đa 50 ký tự
        if (transferContent.length() > 50) {
            transferContent = transferContent.substring(0, 50);
        }

        return UriComponentsBuilder
                .fromUriString(
                        "https://img.vietqr.io/image/"
                                + bankId + "-"
                                + bankAccountNumber
                                + "-compact2.png"
                )
                .queryParam("amount", order.getFinalAmount())
                .queryParam("addInfo", transferContent)
                .queryParam("accountName", bankAccountName)
                .build()
                .encode()
                .toUriString();
    }

    // 3. XỬ LÝ CALLBACK / WEBHOOK THANH TOÁN
    @Transactional
    public PaymentResult processPaymentCallback(
            PaymentCallbackDTO callbackDTO) {

        if (callbackDTO == null
                || callbackDTO.getOrderId() == null
                || callbackDTO.getOrderId().isBlank()) {

            throw new BusinessValidationException(
                    "Thông tin callback không hợp lệ."
            );
        }

        Order order = orderRepository.findById(callbackDTO.getOrderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy đơn hàng."
                        )
                );

        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy giao dịch thanh toán."
                        )
                );

        // Kiểm tra số tiền callback
        if (callbackDTO.getAmount() != payment.getTotalAmount()) {
            throw new BusinessValidationException(
                    "Số tiền callback không khớp với giao dịch."
            );
        }

        // Kiểm tra phương thức thanh toán callback
        if (callbackDTO.getPaymentMethod() != null
                && !callbackDTO.getPaymentMethod().isBlank()) {

            try {
                PaymentMethod callbackMethod = PaymentMethod.valueOf(
                        callbackDTO.getPaymentMethod()
                                .trim()
                                .toUpperCase(Locale.ROOT)
                );

                if (callbackMethod != payment.getPaymentMethod()) {
                    throw new BusinessValidationException(
                            "Phương thức thanh toán callback không khớp."
                    );
                }

            } catch (IllegalArgumentException e) {
                throw new BusinessValidationException(
                        "Phương thức thanh toán callback không hợp lệ."
                );
            }
        }

        // Nếu giao dịch đã thành công thì không xử lý lại
        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            return new PaymentResult(
                    PaymentStatus.SUCCESS,
                    "Giao dịch đã được xử lý thành công trước đó.",
                    order.getId()
            );
        }

        // Không cho phép callback thay đổi giao dịch đã kết thúc
        if (isTerminalStatus(payment.getPaymentStatus())) {
            return new PaymentResult(
                    payment.getPaymentStatus(),
                    "Giao dịch đã kết thúc với trạng thái "
                            + payment.getPaymentStatus(),
                    order.getId()
            );
        }

        LocalDateTime now = LocalDateTime.now();

        // Kiểm tra giao dịch có bị hết hạn trước callback không
        if (isPaymentExpired(payment, now)) {

            expirePayment(payment, order, now);

            return new PaymentResult(
                    PaymentStatus.EXPIRED,
                    "Giao dịch đã hết hạn thanh toán.",
                    order.getId()
            );
        }

        // Xác định trạng thái callback
        PaymentStatus callbackStatus =
                resolveCallbackStatus(callbackDTO.getResponseCode());

        // Giao dịch vẫn đang chờ xử lý
        if (callbackStatus == PaymentStatus.PENDING) {
            return new PaymentResult(
                    PaymentStatus.PENDING,
                    "Giao dịch đang chờ xác nhận thanh toán.",
                    order.getId()
            );
        }

        // Thanh toán thành công
        if (callbackStatus == PaymentStatus.SUCCESS) {

            // Chuyển trạng thái đơn hàng sang CONFIRM
            if (order.getStatus() == OrderStatus.PENDING) {
                order.changeStatus(OrderStatus.CONFIRM);

            } else if (order.getStatus() != OrderStatus.CONFIRM) {

                throw new BusinessValidationException(
                        "Không thể xác nhận thanh toán vì trạng thái đơn hàng không phù hợp."
                );
            }

            payment.setPaymentStatus(PaymentStatus.SUCCESS);
            payment.setPaymentDate(now);

            // Tích điểm thưởng cho khách hàng
            awardLoyaltyPoints(order);

            return new PaymentResult(
                    PaymentStatus.SUCCESS,
                    "Thanh toán thành công.",
                    order.getId()
            );
        }

        // Thanh toán bị hủy
        if (callbackStatus == PaymentStatus.CANCELLED) {

            cancelRelatedOrder(order);

            payment.setPaymentStatus(PaymentStatus.CANCELLED);
            payment.setPaymentDate(now);

            return new PaymentResult(
                    PaymentStatus.CANCELLED,
                    "Giao dịch thanh toán đã bị hủy.",
                    order.getId()
            );
        }

        // Giao dịch hết hạn
        if (callbackStatus == PaymentStatus.EXPIRED) {

            expirePayment(payment, order, now);

            return new PaymentResult(
                    PaymentStatus.EXPIRED,
                    "Giao dịch thanh toán đã hết hạn.",
                    order.getId()
            );
        }

        // Thanh toán thất bại
        cancelRelatedOrder(order);

        payment.setPaymentStatus(PaymentStatus.FAILED);
        payment.setPaymentDate(now);

        return new PaymentResult(
                PaymentStatus.FAILED,
                "Thanh toán thất bại.",
                order.getId()
        );
    }

    // 4. XÁC ĐỊNH TRẠNG THÁI CALLBACK
    private PaymentStatus resolveCallbackStatus(String responseCode) {

        if (responseCode == null || responseCode.isBlank()) {
            throw new BusinessValidationException(
                    "Mã phản hồi thanh toán không được để trống."
            );
        }

        String code = responseCode.trim().toUpperCase(Locale.ROOT);

        return switch (code) {

            // Thành công
            case "0", "00", "SUCCESS" ->
                    PaymentStatus.SUCCESS;

            // Đang xử lý
            case "1000", "7000", "7002", "9000",
                 "PENDING", "PROCESSING" ->
                    PaymentStatus.PENDING;

            // Đã hủy
            case "1003", "1006", "1017",
                 "CANCEL", "CANCELED", "CANCELLED",
                 "USER_CANCELLED" ->
                    PaymentStatus.CANCELLED;

            // Đã hết hạn
            case "1005", "EXPIRED", "TIMEOUT" ->
                    PaymentStatus.EXPIRED;

            // Những mã còn lại được xem là thất bại
            default -> PaymentStatus.FAILED;
        };
    }

    // 5. KHÁCH HÀNG CHỦ ĐỘNG HỦY THANH TOÁN
    @Transactional
    public PaymentResult cancelPayment(String orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy đơn hàng: " + orderId
                        )
                );

        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy giao dịch thanh toán."
                        )
                );

        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new BusinessValidationException(
                    "Giao dịch đã thanh toán thành công, không thể hủy."
            );
        }

        if (isTerminalStatus(payment.getPaymentStatus())) {
            return new PaymentResult(
                    payment.getPaymentStatus(),
                    "Giao dịch đã kết thúc.",
                    order.getId()
            );
        }

        LocalDateTime now = LocalDateTime.now();

        // Nếu đã quá thời gian thì chuyển thành EXPIRED
        if (isPaymentExpired(payment, now)) {

            expirePayment(payment, order, now);

            return new PaymentResult(
                    PaymentStatus.EXPIRED,
                    "Giao dịch đã hết hạn, không thể hủy.",
                    order.getId()
            );
        }

        // Hủy đơn hàng và hoàn lại tồn kho
        cancelRelatedOrder(order);

        payment.setPaymentStatus(PaymentStatus.CANCELLED);
        payment.setPaymentDate(now);

        return new PaymentResult(
                PaymentStatus.CANCELLED,
                "Hủy giao dịch thanh toán thành công.",
                order.getId()
        );
    }

    // 6. TỰ ĐỘNG XỬ LÝ GIAO DỊCH HẾT HẠN
    @Scheduled(fixedDelayString =
            "${payment.expiration.check-interval-ms:60000}")
    @Transactional
    public void expirePendingPayments() {

        LocalDateTime now = LocalDateTime.now();

        List<Payment> pendingPayments =
                paymentRepository.findByPaymentStatus(
                        PaymentStatus.PENDING
                );

        for (Payment payment : pendingPayments) {

            if (!isPaymentExpired(payment, now)) {
                continue;
            }

            Order order = payment.getOrder();

            // Chỉ hết hạn nếu đơn hàng có thể hủy
            if (!canCancelOrder(order)) {
                continue;
            }

            expirePayment(payment, order, now);
        }
    }
    // Kiểm tra giao dịch đã hết hạn chưa
    private boolean isPaymentExpired(
        Payment payment,
        LocalDateTime now) {

    if (payment.getCreatedAt() == null) {
        return false;
    }

    LocalDateTime expiredAt = payment.getCreatedAt()
            .plusMinutes(PAYMENT_TIMEOUT_MINUTES);

    return !now.isBefore(expiredAt);
    }
    // Xử lý hết hạn
    private void expirePayment(
            Payment payment,
            Order order,
            LocalDateTime now) {

        cancelRelatedOrder(order);

        payment.setPaymentStatus(PaymentStatus.EXPIRED);
        payment.setPaymentDate(now);
    }

    // 7. HỦY ĐƠN HÀNG VÀ KHÔI PHỤC TỒN KHO
    private void cancelRelatedOrder(Order order) {
        if (order.getStatus() == OrderStatus.CANCELED) {
            return;
        }
        if (!canCancelOrder(order)) {
            throw new BusinessValidationException(
                    "Không thể hủy đơn hàng ở trạng thái "
                            + order.getStatus()
            );
        }
        orderService.cancelOrder(order.getId());
    }
    private boolean canCancelOrder(Order order) {

        return order.getStatus() == OrderStatus.CANCELED
                || order.getStatus().canTransitionTo(
                        OrderStatus.CANCELED
                );
    }


    // Kiểm tra trạng thái giao dịch đã kết thúc chưa
    private boolean isTerminalStatus(PaymentStatus status) {

        return status == PaymentStatus.SUCCESS
                || status == PaymentStatus.FAILED
                || status == PaymentStatus.CANCELLED
                || status == PaymentStatus.EXPIRED;
    }

    // 8. TÍCH ĐIỂM THƯỞNG CHO KHÁCH HÀNG
    private void awardLoyaltyPoints(Order order) {

        if (order.getCustomer() == null) {
            return;
        }

        User user = order.getCustomer().getUser();

        if (user == null) {
            return;
        }

        // 10.000 VNĐ = 1 điểm
        int pointsEarned = (int) (
                order.getFinalAmount() / 10000
        );

        if (pointsEarned <= 0) {
            return;
        }

        List<LoyaltyTransaction> history =
                loyaltyTransactionRepo.findByUserId(user.getId());

        int currentBalance = history.isEmpty()
                ? 0
                : history.get(history.size() - 1).getBalancedAfter();

        int newBalance = currentBalance + pointsEarned;

        LoyaltyTransaction loyaltyTx = new LoyaltyTransaction(
                user,
                order,
                LoyalType.EARN,
                pointsEarned,
                newBalance,
                "Tích điểm từ đơn hàng " + order.getId()
        );

        loyaltyTransactionRepo.save(loyaltyTx);
    }

// 9. LẤY DANH SÁCH GIAO DỊCH THÀNH CÔNG

    public List<PaymentResponse> getAllSuccessfulPayments() {

        return paymentRepository
                .findByPaymentStatus(PaymentStatus.SUCCESS)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

// 10. Xem biên lai thanh toán theo OrderId
    public PaymentResponse getPaymentReceiptByOrderId(
            String orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy đơn hàng: " + orderId
                        )
                );

        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Chưa có giao dịch thanh toán cho đơn hàng này."
                        )
                );

        return mapToResponse(payment);
    }
// 11. LẤY CHI TIẾT GIAO DỊCH THEO PAYMENT ID
public PaymentResponse getPaymentById(String paymentId) {

    Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Không tìm thấy giao dịch thanh toán với ID: " + paymentId
                    )
            );

    return mapToResponse(payment);
}
// 12. LỌC DANH SÁCH GIAO DỊCH THANH TOÁN
public List<PaymentResponse> filterPayments(
        PaymentStatus status,
        PaymentMethod method) {
    List<Payment> payments;
    // Trường hợp có cả trạng thái và phương thức
    if (status != null && method != null) {
        payments = paymentRepository
                .findByPaymentStatusAndPaymentMethod(status, method);
    }
    // Chỉ lọc theo trạng thái
    else if (status != null) {
        payments = paymentRepository
                .findByPaymentStatus(status);
    }
    // Chỉ lọc theo phương thức thanh toán
    else if (method != null) {
        payments = paymentRepository
                .findByPaymentMethod(method);
    }
    // Không truyền điều kiện: lấy tất cả
    else {

        payments = paymentRepository.findAll();
    }
    return payments.stream()
            .map(this::mapToResponse)
            .toList();
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
