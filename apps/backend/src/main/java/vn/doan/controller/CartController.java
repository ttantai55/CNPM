package vn.doan.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.doan.dto.request.CartItemRequest;
import vn.doan.dto.response.CartResponse;
import vn.doan.service.CartService;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping
    public CartResponse getCart(@PathVariable String userId) {
        return cartService.getCart(userId);
    }

    @PutMapping
    public CartResponse replaceCart(@PathVariable String userId,
                                    @Valid @RequestBody List<CartItemRequest> items) {
        return cartService.replaceCart(userId, items);
    }
}
