
package vn.doan.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.doan.service.PromotionService;
import vn.doan.service.LoyaltyService;

import vn.doan.dto.request.VoucherCreateRequest;
import vn.doan.dto.request.VoucherApplyRequest;
import vn.doan.dto.request.LoyaltyTransactionRequest;

import vn.doan.dto.response.VoucherResponse;
import vn.doan.dto.response.VoucherApplyResponse;
import vn.doan.dto.response.LoyaltyTransactionResponse;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;
    private final LoyaltyService loyaltyService;

    public record ApiResponse<T>(
            boolean success,
            String message,
            T data
    ) {}

    // GET: Lấy tất cả voucher
    // Endpoint: GET /api/promotions
    @GetMapping("/promotions")
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> getAllPromotions() {

        List<VoucherResponse> data = promotionService.getAllPromotions();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Lấy danh sách voucher thành công.",
                        data
                )
        );
    }

    // GET: Lấy danh sách voucher đang hoạt động
    // Endpoint: GET /api/promotions/active
    @GetMapping("/promotions/active")
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> getActivePromotions() {

        List<VoucherResponse> data = promotionService.getActivePromotions();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Lấy danh sách voucher đang hoạt động thành công.",
                        data
                )
        );
    }

    // GET: Lấy chi tiết voucher theo ID
    // Endpoint: GET /api/promotions/{promotionId}
    @GetMapping("/promotions/{promotionId}")
    public ResponseEntity<ApiResponse<VoucherResponse>> getPromotionById(
            @PathVariable String promotionId) {

        VoucherResponse data = promotionService.getPromotionById(promotionId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Lấy thông tin voucher thành công.",
                        data
                )
        );
    }

    // GET: Tìm voucher theo mã
    // Endpoint: GET /api/promotions/code/{voucherCode}
    @GetMapping("/promotions/code/{voucherCode}")
    public ResponseEntity<ApiResponse<VoucherResponse>> getPromotionByCode(
            @PathVariable String voucherCode) {

        VoucherResponse data = promotionService.getPromotionByCode(voucherCode);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Tìm voucher thành công.",
                        data
                )
        );
    }

    // POST: Tạo voucher mới
    // Endpoint: POST /api/promotions
    @PostMapping("/promotions")
    public ResponseEntity<ApiResponse<VoucherResponse>> createPromotion(
            @Valid @RequestBody VoucherCreateRequest request) {

        VoucherResponse data = promotionService.createPromotion(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>(
                        true,
                        "Tạo voucher thành công.",
                        data
                )
        );
    }

    // POST: Kiểm tra và áp dụng voucher
    // Endpoint: POST /api/promotions/apply
    @PostMapping("/promotions/apply")
    public ResponseEntity<ApiResponse<VoucherApplyResponse>> applyVoucher(
            @Valid @RequestBody VoucherApplyRequest request) {

        VoucherApplyResponse data = promotionService.applyVoucher(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        data.getMessage(),
                        data
                )
        );
    }

    // PUT: Bật hoặc tắt trạng thái voucher
    // Endpoint: PUT /api/promotions/{promotionId}/status?active=true
    @PutMapping("/promotions/{promotionId}/status")
    public ResponseEntity<ApiResponse<VoucherResponse>> updatePromotionStatus(
            @PathVariable String promotionId,
            @RequestParam boolean active) {

        VoucherResponse data = promotionService.updatePromotionStatus(
                promotionId,
                active
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        active
                                ? "Kích hoạt voucher thành công."
                                : "Ngừng kích hoạt voucher thành công.",
                        data
                )
        );
    }

    // GET: Lấy lịch sử giao dịch điểm của khách hàng
    // Endpoint: GET /api/loyalty/{customerId}
    @GetMapping("/loyalty/{customerId}")
    public ResponseEntity<ApiResponse<List<LoyaltyTransactionResponse>>> getCustomerLoyaltyHistory(
            @PathVariable String customerId) {

        List<LoyaltyTransactionResponse> data =
                loyaltyService.getUserLoyaltyHistory(customerId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Lấy lịch sử điểm thưởng thành công.",
                        data
                )
        );
    }

    // POST: Tạo giao dịch điểm thưởng
    // Endpoint: POST /api/loyalty/transactions
    @PostMapping("/loyalty/transactions")
    public ResponseEntity<ApiResponse<LoyaltyTransactionResponse>> processLoyaltyTransaction(
            @Valid @RequestBody LoyaltyTransactionRequest request) {

        LoyaltyTransactionResponse data =
                loyaltyService.processManualTransaction(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>(
                        true,
                        "Thực hiện giao dịch điểm thưởng thành công.",
                        data
                )
        );
    }
}
