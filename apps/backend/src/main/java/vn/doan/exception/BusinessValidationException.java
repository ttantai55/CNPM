package vn.doan.exception;

public class BusinessValidationException extends BadRequestException {
    public BusinessValidationException(String message) {
        super(message);
    }
}
