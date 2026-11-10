package vn.doan.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import vn.doan.domain.Customer;
import vn.doan.domain.User;
import vn.doan.dto.request.UserUpdateRequest;
import vn.doan.dto.response.UserResponse;
import vn.doan.exception.ResourceNotFoundException;
import vn.doan.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserProfileController {
    private final UserRepository users;

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
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
            Customer customer = user.getInfo();
            if (customer == null) {
                customer = new Customer();
                customer.setUser(user);
                user.setInfo(customer);
            }
            customer.setName(request.getFullName());
        }
        Customer customer = user.getInfo();
        if (customer != null) {
            if (request.getPhone() != null) customer.setPhone(request.getPhone());
            if (request.getGender() != null) customer.setGender(request.getGender());
            customer.setDateOfBirth(request.getDateOfBirth());
            customer.setAddress(request.getAddress());
        }
        return response(users.save(user));
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
                user.getFullName(), user.getPhone());
        if (user.getInfo() != null) {
            response.setGender(user.getInfo().isGender());
            response.setDateOfBirth(user.getInfo().getDateOfBirth());
            response.setAddress(user.getInfo().getAddress());
        }
        response.setPosition(user.getPosition());
        return response;
    }
}
