
package vn.doan.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.doan.service.PaymentService;

import vn.doan.dto.request.PaymentCreateRequest;
import vn.doan.dto.request.PaymentCallbackDTO;

import vn.doan.dto.response.PaymentUrlResponse;
import vn.doan.dto.response.PaymentResult;
import vn.doan.dto.response.PaymentResponse;
import vn.doan.domain.enums.PaymentStatus;
import vn.doan.domain.enums.PaymentMethod;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    public record ApiResponse<T>(
            boolean success,
            String message,
            T data
    ) {}

    // 1. TẠO GIAO DỊCH THANH TOÁN
    // POST: /api/payments
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentUrlResponse>> createPaymentTransaction(
            @Valid @RequestBody PaymentCreateRequest request) {

        PaymentUrlResponse data =
                paymentService.createPaymentTransaction(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>(
                        true,
                        "Tạo giao dịch thanh toán thành công.",
                        data
                )
        );
    }

    // 2. XỬ LÝ CALLBACK THANH TOÁN
    // POST: /api/payments/callback
    @PostMapping("/callback")
public ResponseEntity<ApiResponse<PaymentResult>> processPaymentCallback(
        @Valid @RequestBody PaymentCallbackDTO callbackDTO) {

        PaymentResult data =
                paymentService.processPaymentCallback(callbackDTO);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        data.getMessage(),
                        data
                )
        );
    }

    // 3. LẤY DANH SÁCH THANH TOÁN THÀNH CÔNG
    // GET: /api/payments/successful

    @GetMapping("/successful")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllSuccessfulPayments() {

        List<PaymentResponse> data =
                paymentService.getAllSuccessfulPayments();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Lấy danh sách thanh toán thành công.",
                        data
                )
        );
    }

    // 4. LẤY BIÊN LAI THANH TOÁN THEO ORDER ID
    // GET: /api/payments/orders/{orderId}/receipt
    @GetMapping("/orders/{orderId}/receipt")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentReceiptByOrderId(
            @PathVariable String orderId) {

        PaymentResponse data =
                paymentService.getPaymentReceiptByOrderId(orderId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Lấy biên lai thanh toán thành công.",
                        data
                )
        );
    }

    
    // 5. HỦY GIAO DỊCH THANH TOÁN
    // POST: /api/payments/orders/{orderId}/cancel
    @PostMapping("/orders/{orderId}/cancel")
    public ResponseEntity<ApiResponse<PaymentResult>> cancelPayment(
            @PathVariable String orderId) {

        PaymentResult data = paymentService.cancelPayment(orderId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        data.getMessage(),
                        data
                )
        );
    }

    // 6. LẤY CHI TIẾT GIAO DỊCH THEO PAYMENT ID
    // GET: /api/payments/{paymentId}
    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(
            @PathVariable String paymentId) {

        PaymentResponse data = paymentService.getPaymentById(paymentId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Lấy thông tin giao dịch thành công.",
                        data
                )
        );
    }

    // 7. LỌC DANH SÁCH GIAO DỊCH THANH TOÁN
    // GET: /api/payments?status=SUCCESS&method=MOMO
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> filterPayments(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) PaymentMethod method) {

        List<PaymentResponse> data =
                paymentService.filterPayments(status, method);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Lấy danh sách giao dịch thành công.",
                        data
                )
        );
    }

}
