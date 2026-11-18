package vn.doan.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import vn.doan.domain.Customer;
import vn.doan.domain.User;
import vn.doan.dto.request.ChangePasswordRequest;
import vn.doan.dto.request.UserUpdateRequest;
import vn.doan.dto.response.UserResponse;
import vn.doan.exception.ResourceNotFoundException;
import vn.doan.repository.UserRepository;
import vn.doan.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserProfileController {
    private final UserRepository users;
    private final UserService userService;

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public UserResponse get(@PathVariable String id) {
        return response(findUser(id));
    }

    @PatchMapping("/{id}")
    @Transactional
    public UserResponse update(@PathVariable String id, @RequestBody UserUpdateRequest request) {
        User user = findUser(id);
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        boolean hasCustomerUpdates = request.getFullName() != null || request.getPhone() != null
                || request.getGender() != null || request.getDateOfBirth() != null || request.getAddress() != null;
        Customer customer = user.getInfo();
        if (customer == null && hasCustomerUpdates) {
            customer = new Customer();
            customer.setUser(user);
            user.setInfo(customer);
        }
        if (customer != null) {
            if (request.getFullName() != null) customer.setName(request.getFullName());
            if (request.getPhone() != null) customer.setPhone(request.getPhone());
            if (request.getGender() != null) customer.setGender(request.getGender());
            if (request.getDateOfBirth() != null) customer.setDateOfBirth(request.getDateOfBirth());
            if (request.getAddress() != null) customer.setAddress(request.getAddress());
        }
        return response(users.save(user));
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<Void> changePassword(
            @PathVariable String id,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(id, request);
        return ResponseEntity.noContent().build();
    }

    private User findUser(String id) {
        return users.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng."));
    }

    private UserResponse response(User user) {
        UserResponse response = new UserResponse(
                user.getId(), user.getUsername(), user.getEmail(), user.getRole(),
                user.getAvatarUrl(), user.getCreatedAt(), user.getUpdatedAt(),
                user.getInfo() == null ? null : user.getInfo().getId(),
                user.getBarista() == null ? null : user.getBarista().getId(),
                user.getInfo() != null ? user.getInfo().getName()
                        : user.getBarista() == null ? null : user.getBarista().getName(),
                user.getInfo() != null ? user.getInfo().getPhone()
                        : user.getBarista() == null ? null : user.getBarista().getPhone());
        if (user.getInfo() != null) {
            response.setGender(user.getInfo().isGender());
            response.setDateOfBirth(user.getInfo().getDateOfBirth());
            response.setAddress(user.getInfo().getAddress());
        }
        response.setPosition(user.getPosition());
        response.setLoyaltyPoints(user.getLoyaltyPoints());
        return response;
    }
}
