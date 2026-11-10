package vn.doan.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.doan.dto.request.PaymentCallbackDTO;
import vn.doan.dto.request.PaymentCreateRequest;
import vn.doan.dto.response.PaymentResult;
import vn.doan.dto.response.PaymentUrlResponse;
import vn.doan.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {
    private final PaymentService payments;

    @PostMapping("/create")
    public PaymentUrlResponse create(@RequestBody CreateRequest request) {
        PaymentCreateRequest dto = new PaymentCreateRequest(request.getOrderId(), request.getAmount(), request.getMethod());
        return payments.createPaymentTransaction(dto);
    }

    @PostMapping({"/confirm", "/callback"})
    public PaymentResult confirm(@RequestBody ConfirmRequest request) {
        PaymentCallbackDTO dto = new PaymentCallbackDTO();
        dto.setOrderId(request.getOrderId());
        dto.setPaymentMethod(request.getMethod());
        dto.setAmount(request.getAmount());
        dto.setResponseCode("00");
        return payments.processPaymentCallback(dto);
    }

    public static class CreateRequest {
        private String orderId;
        private String method;
        private long amount;
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        public long getAmount() { return amount; }
        public void setAmount(long amount) { this.amount = amount; }
    }
    public static class ConfirmRequest extends CreateRequest {}
}