package vn.doan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.Promotion;
import vn.doan.domain.enums.DiscountType;
import vn.doan.dto.request.VoucherApplyRequest;
import vn.doan.dto.request.VoucherCreateRequest;
import vn.doan.dto.response.VoucherApplyResponse;
import vn.doan.dto.response.VoucherResponse;
import vn.doan.exception.BusinessValidationException;
import vn.doan.exception.ResourceNotFoundException;
import vn.doan.repository.PromotionRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PromotionService {

    private final PromotionRepository promotionRepository;

    /** Lấy toàn bộ voucher trong hệ thống. */
    public List<VoucherResponse> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(this::mapToVoucherResponse)
                .collect(Collectors.toList());
    }

    /** Lấy các voucher đang hoạt động, còn hạn và chưa hết lượt sử dụng. */
    public List<VoucherResponse> getActivePromotions() {
        return promotionRepository.findByIsActiveTrue().stream()
                .filter(Promotion::isValid)
                .map(this::mapToVoucherResponse)
                .collect(Collectors.toList());
    }

    /** Lấy chi tiết voucher theo ID. */
    public VoucherResponse getPromotionById(String promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy chương trình khuyến mãi với ID: " + promotionId));

        return mapToVoucherResponse(promotion);
    }

    /** Lấy chi tiết voucher theo mã. */
    public VoucherResponse getPromotionByCode(String voucherCode) {
        Promotion promotion = findPromotionByCode(voucherCode);
        return mapToVoucherResponse(promotion);
    }

    /**
     * Tạo voucher mới từ DTO hiện có.
     */
    @Transactional
    public VoucherResponse createPromotion(VoucherCreateRequest request) {
        validateCreateRequest(request);

        String normalizedCode = normalizeVoucherCode(request.getCode());
        if (promotionRepository.findByVoucherCode(normalizedCode).isPresent()) {
            throw new BusinessValidationException("Mã voucher đã tồn tại trong hệ thống.");
        }

        LocalDate today = LocalDate.now();
        LocalDate endDate = request.getExpiredAt().toLocalDate();

        if (endDate.isBefore(today)) {
            throw new BusinessValidationException("Ngày hết hạn voucher không hợp lệ.");
        }

        Promotion promotion = new Promotion(
                normalizedCode,
                null,
                DiscountType.FIX_AMOUNT,
                request.getDiscountAmount(),
                today,
                endDate,
                request.getQuantity()
        );

        Promotion savedPromotion = promotionRepository.save(promotion);
        return mapToVoucherResponse(savedPromotion);
    }

    /**
     * Kiểm tra voucher và tính số tiền được giảm.
     */
    public VoucherApplyResponse applyVoucher(VoucherApplyRequest request) {
        if (request == null || request.getVoucherCode() == null
                || request.getVoucherCode().trim().isEmpty()) {
            return new VoucherApplyResponse(false, 0,
                    "Vui lòng nhập mã voucher.");
        }

        if (request.getCartTotalAmount() == null || request.getCartTotalAmount() <= 0) {
            return new VoucherApplyResponse(false, 0,
                    "Tổng tiền giỏ hàng phải lớn hơn 0.");
        }

        Promotion promotion = promotionRepository
                .findByVoucherCode(normalizeVoucherCode(request.getVoucherCode()))
                .orElse(null);

        if (promotion == null) {
            return new VoucherApplyResponse(false, 0,
                    "Mã voucher không tồn tại.");
        }

        if (!promotion.isValid()) {
            return new VoucherApplyResponse(false, 0,
                    "Voucher đã hết hạn, bị tắt hoặc đã hết lượt sử dụng.");
        }

        long discountAmount = promotion.calculateDiscount(request.getCartTotalAmount());
        if (discountAmount <= 0) {
            return new VoucherApplyResponse(false, 0,
                    "Voucher không tạo ra giá trị giảm giá hợp lệ.");
        }

        return new VoucherApplyResponse(true, discountAmount,
                "Áp dụng voucher thành công.");
    }

    /**
     * Lấy Entity voucher hợp lệ để OrderService có thể gắn vào đơn hàng.
     */
    public Promotion getValidPromotion(String voucherCode) {
        Promotion promotion = findPromotionByCode(voucherCode);

        if (!promotion.isValid()) {
            throw new BusinessValidationException(
                    "Mã giảm giá đã hết hạn, không hoạt động hoặc vượt quá giới hạn sử dụng.");
        }

        return promotion;
    }

    /** Tăng số lần sử dụng voucher sau khi đơn hàng được tạo thành công. */
    @Transactional
    public void incrementUsage(String voucherCode) {
        Promotion promotion = findPromotionByCode(voucherCode);

        if (!promotion.isValid()) {
            throw new BusinessValidationException(
                    "Voucher không còn hợp lệ hoặc đã hết lượt sử dụng.");
        }

        promotion.setUsedCount(Math.addExact(promotion.getUsedCount(), 1));
        // promotion đang ở trạng thái Managed; JPA Dirty Checking sẽ tự cập nhật.
    }

    /** Bật/tắt chương trình khuyến mãi theo ID. */
    @Transactional
    public VoucherResponse updatePromotionStatus(String promotionId, boolean active) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy chương trình khuyến mãi với ID: " + promotionId));

        promotion.setActive(active);
        return mapToVoucherResponse(promotion);
    }

    private Promotion findPromotionByCode(String voucherCode) {
        if (voucherCode == null || voucherCode.trim().isEmpty()) {
            throw new BusinessValidationException("Mã voucher không được để trống.");
        }

        String normalizedCode = normalizeVoucherCode(voucherCode);
        return promotionRepository.findByVoucherCode(normalizedCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy voucher với mã: " + normalizedCode));
    }

    private void validateCreateRequest(VoucherCreateRequest request) {
        if (request == null) {
            throw new BusinessValidationException("Thông tin tạo voucher không được để trống.");
        }
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            throw new BusinessValidationException("Mã voucher không được để trống.");
        }
        if (request.getDiscountAmount() == null || request.getDiscountAmount() < 1000) {
            throw new BusinessValidationException("Số tiền giảm tối thiểu là 1000đ.");
        }
        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new BusinessValidationException("Số lượng voucher phải từ 1 trở lên.");
        }
        if (request.getExpiredAt() == null) {
            throw new BusinessValidationException("Ngày hết hạn voucher không được để trống.");
        }
        if (request.getMinOrderValue() == null || request.getMinOrderValue() < 0) {
            throw new BusinessValidationException("Giá trị đơn hàng tối thiểu không hợp lệ.");
        }
        if (request.getMinOrderValue() > 0) {
            throw new BusinessValidationException(
                    "Promotion hiện chưa lưu được minOrderValue. Hãy bổ sung thuộc tính này vào Promotion và cột tương ứng trong database trước khi dùng điều kiện đơn hàng tối thiểu.");
        }
    }

    private String normalizeVoucherCode(String voucherCode) {
        return voucherCode.trim().toUpperCase(Locale.ROOT);
    }

    private VoucherResponse mapToVoucherResponse(Promotion promotion) {
        LocalDateTime expiredAt = promotion.getEndDate() == null
                ? null
                : promotion.getEndDate().atTime(LocalTime.MAX);

        return new VoucherResponse(
                promotion.getId(),
                promotion.getVoucherCode(),
                promotion.getDiscountValue(),
                0L, // Promotion hiện chưa có trường minOrderValue.
                toSafeInt(promotion.getUsageLimit()),
                toSafeInt(promotion.getUsedCount()),
                expiredAt,
                promotion.isValid()
        );
    }

    private int toSafeInt(long value) {
        if (value > Integer.MAX_VALUE) {
            return Integer.MAX_VALUE;
        }
        if (value < Integer.MIN_VALUE) {
            return Integer.MIN_VALUE;
        }
        return (int) value;
    }

    private VoucherResponse mapToResponse(Promotion promotion) {
    LocalDateTime expiredAt = promotion.getEndDate() == null
            ? null
            : promotion.getEndDate().atTime(LocalTime.MAX);

    return new VoucherResponse(
            promotion.getId(),
            promotion.getVoucherCode(),
            promotion.getDiscountValue(),
            0L,
            toSafeInt(promotion.getUsageLimit()),
            toSafeInt(promotion.getUsedCount()),
            expiredAt,
            promotion.isValid()
    );
}
}
