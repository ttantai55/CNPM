package vn.doan.controller.excepsion;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import vn.doan.dto.response.ErrorResponse;
import vn.doan.exception.BusinessValidationException;
import vn.doan.exception.ResourceNotFoundException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Hứng lỗi Không tìm thấy (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
            
        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(), // 404
                HttpStatus.NOT_FOUND.getReasonPhrase(), // "Not Found"
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "") // Lấy đường dẫn API
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    // Hứng lỗi Vi phạm nghiệp vụ (400)
    @ExceptionHandler(BusinessValidationException.class)
    public ResponseEntity<ErrorResponse> handleBusinessValidationException(
            BusinessValidationException ex, WebRequest request) {
            
        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(), // 400
                HttpStatus.BAD_REQUEST.getReasonPhrase(), // "Bad Request"
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // (Tùy chọn) Hứng mọi lỗi rác 500 do code sai, NullPointer, đứt kết nối DB...
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, WebRequest request) {
            
        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(), // 500
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau!",
                request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}