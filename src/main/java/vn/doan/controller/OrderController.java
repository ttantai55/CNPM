package vn.doan.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import vn.doan.domain.enums.OrderStatus;
import vn.doan.dto.request.OrderCreateRequest;
import vn.doan.dto.response.OrderResponse;
import vn.doan.service.OrderService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    public OrderResponse create(@Valid @RequestBody OrderCreateRequest request) {
        return orderService.checkout(request);
    }

    @GetMapping
    public List<OrderResponse> list(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return orderService.getAllOrders().stream()
                .filter(o -> status == null || status.name().equals(o.getStatus()))
                .filter(o -> from == null || !o.getCreatedAt().isBefore(from))
                .filter(o -> to == null || !o.getCreatedAt().isAfter(to))
                .toList();
    }

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable String id) { return orderService.getOrderDetails(id); }

    @PatchMapping("/{id}/status")
    public OrderResponse status(@PathVariable String id, @RequestBody StatusRequest request) {
        orderService.changeOrderStatus(id, request.getStatus());
        return orderService.getOrderDetails(id);
    }

    public static class StatusRequest {
        private OrderStatus status;
        public OrderStatus getStatus() { return status; }
        public void setStatus(OrderStatus status) { this.status = status; }
    }
}