package vn.doan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.Cart;
import vn.doan.domain.CartItem;
import vn.doan.domain.Product;
import vn.doan.domain.Topping;
import vn.doan.domain.User;
import vn.doan.dto.request.CartItemRequest;
import vn.doan.dto.response.CartItemResponse;
import vn.doan.dto.response.CartResponse;
import vn.doan.exception.BusinessValidationException;
import vn.doan.exception.ResourceNotFoundException;
import vn.doan.repository.CartRepository;
import vn.doan.repository.ProductRepository;
import vn.doan.repository.ToppingRepository;
import vn.doan.repository.UserRepository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ToppingRepository toppingRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartResponse getCart(String userId) {
        return toResponse(getOrCreateCart(userId));
    }

    @Transactional
    public CartResponse replaceCart(String userId, List<CartItemRequest> requests) {
        Cart cart = getOrCreateCart(userId);
        List<CartItemRequest> items = requests == null ? List.of() : requests;
        if (items.size() > 100) {
            throw new BusinessValidationException("Giỏ hàng vượt quá số món cho phép.");
        }
        items.forEach(this::validateItem);

        List<String> productIds = items.stream().map(CartItemRequest::getProductId).distinct().toList();
        Map<String, Product> products = new HashMap<>();
        productRepository.findAllById(productIds).forEach(product -> products.put(product.getId(), product));

        cart.clearCart();
        for (CartItemRequest request : items) {
            Product product = products.get(request.getProductId());
            if (product == null) {
                throw new ResourceNotFoundException("Không tìm thấy sản phẩm: " + request.getProductId());
            }
            CartItem item = new CartItem(cart, product, request.getQuantity());
            item.setSize(request.getSize());
            item.setSugarPercent(request.getSugarPercent());
            item.setIcePercent(request.getIcePercent());
            item.setNote(request.getNote());
            item.setToppingIds(new ArrayList<>(request.getToppingIds()));
            cart.addItem(item);
        }

        return toResponse(cartRepository.saveAndFlush(cart));
    }

    private Cart getOrCreateCart(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản."));
        if (user.getRole() == null || !user.getRole().toUpperCase().contains("CUSTOMER")) {
            throw new BusinessValidationException("Giỏ hàng chỉ dành cho tài khoản khách hàng.");
        }
        return cartRepository.findByUserId(userId).orElseGet(() -> cartRepository.saveAndFlush(new Cart(user)));
    }

    private void validateItem(CartItemRequest item) {
        if (item == null || item.getProductId() == null || item.getProductId().isBlank()
                || item.getQuantity() < 1 || item.getQuantity() > 20
                || item.getSize() == null || !List.of("S", "M", "L").contains(item.getSize())
                || item.getSugarPercent() == null || !List.of(0, 25, 50, 75, 100).contains(item.getSugarPercent())
                || item.getIcePercent() == null || !List.of(0, 25, 50, 100).contains(item.getIcePercent())
                || item.getToppingIds() == null || item.getToppingIds().size() > 3
                || item.getToppingIds().stream().anyMatch(id -> id == null || id.isBlank())
                || item.getToppingIds().stream().distinct().count() != item.getToppingIds().size()) {
            throw new BusinessValidationException("Thông tin món trong giỏ hàng không hợp lệ.");
        }
    }

    private CartResponse toResponse(Cart cart) {
        List<String> toppingIds = cart.getItems().stream()
                .flatMap(item -> item.getToppingIds().stream()).distinct().toList();
        Map<String, Topping> toppings = new HashMap<>();
        toppingRepository.findAllById(toppingIds).forEach(topping -> toppings.put(topping.getId(), topping));

        List<CartItemResponse> items = cart.getItems().stream().map(item -> {
            long unitPrice = item.getProduct().getPrice() + ("L".equals(item.getSize()) ? 6000 : 0)
                    + item.getToppingIds().stream().map(toppings::get).filter(topping -> topping != null)
                    .mapToLong(Topping::getPrice).sum();
            return new CartItemResponse(item.getId(), item.getProduct().getId(), item.getProduct().getName(),
                    item.getProduct().getImageUrl(), unitPrice, item.getQuantity(),
                    unitPrice * item.getQuantity(), item.getSize(), item.getSugarPercent(),
                    item.getIcePercent(), item.getNote(), List.copyOf(item.getToppingIds()));
        }).toList();
        long total = items.stream().mapToLong(CartItemResponse::getSubtotal).sum();
        return new CartResponse(cart.getId(), cart.getUser().getId(), total, items);
    }
}
