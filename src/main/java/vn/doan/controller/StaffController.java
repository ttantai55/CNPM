package vn.doan.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import vn.doan.domain.Barista;
import vn.doan.domain.User;
import vn.doan.dto.request.StaffRequest;
import vn.doan.dto.response.UserResponse;
import vn.doan.repository.BaristaRepository;
import vn.doan.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/admin/staff")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffController {
    private final UserRepository users;
    private final BaristaRepository baristas;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public List<UserResponse> list() {
        return users.findAll().stream().filter(this::isStaff).map(this::response).toList();
    }

    @PostMapping
    @Transactional
    public UserResponse create(@Valid @RequestBody StaffRequest request) {
        Barista barista = baristas.save(new Barista(
                request.getFullName() == null || request.getFullName().isBlank()
                        ? request.getUsername()
                        : request.getFullName().trim()));
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setFullName(request.getFullName());
        user.setPosition(request.getPosition());
        user.setRole("STAFF");
        user.setHashPassword(passwordEncoder.encode(request.getPassword()));
        user.setBarista(barista);
        return response(users.save(user));
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable String id, @RequestBody StaffRequest request) {
        User user = users.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên."));
        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPosition() != null) user.setPosition(request.getPosition());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setHashPassword(passwordEncoder.encode(request.getPassword()));
        }
        return response(user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        User user = users.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên."));
        if (!isStaff(user)) throw new IllegalArgumentException("Tài khoản không phải nhân viên.");
        users.delete(user);
    }

    private boolean isStaff(User user) {
        return user.getRole() != null && user.getRole().toUpperCase().contains("STAFF");
    }

    private UserResponse response(User user) {
        UserResponse response = new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole(),
                user.getAvatarUrl(), user.getCreatedAt(), user.getUpdatedAt(),
                user.getInfo() == null ? null : user.getInfo().getId(),
                user.getBarista() == null ? null : user.getBarista().getId(),
                user.getFullName(), user.getPhone());
        response.setPosition(user.getPosition());
        return response;
    }
}
