package vn.doan.dto.response;

public class VoucherApplyResponse {

    private boolean isValid;
    private long discountAmount; 
    private String message;

    public VoucherApplyResponse() {}

    public VoucherApplyResponse(boolean isValid, long discountAmount, String message) {
        this.isValid = isValid;
        this.discountAmount = discountAmount;
        this.message = message;
    }

    // Các hàm Getters
    public boolean isValid() { return isValid; }
    
    public long getDiscountAmount() { return discountAmount; }
    
    public String getMessage() { return message; }
}