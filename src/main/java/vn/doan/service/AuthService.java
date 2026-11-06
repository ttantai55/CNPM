package vn.doan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.Cart;
import vn.doan.domain.Customer;
import vn.doan.domain.User;
import vn.doan.dto.request.UserCreateRequest;
import vn.doan.dto.request.LoginRequest; 
import vn.doan.dto.response.AuthResponse;
import vn.doan.repository.UserRepository;
import vn.doan.security.JwtTokenProvider;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // 1. Đăng ký tài khoản mới
    
    @Transactional
    public AuthResponse register(UserCreateRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalStateException("Tên đăng nhập đã tồn tại trong hệ thống.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email này đã được sử dụng.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setAvatarUrl(request.getAvatarUrl());
        
        user.setHashPassword(passwordEncoder.encode(request.getPassword()));
        
        user.setRole("ROLE_CUSTOMER");

        // Tạo cart cho user mới
        Cart cart = new Cart();
        cart.setUser(user);
        user.setCart(cart);
        // Lưu vào Database
        User savedUser = userRepository.save(user);

        // Tạo JWT Token ngay sau khi đăng ký để tự động đăng nhập
        String token = jwtTokenProvider.generateToken(savedUser);

        return mapToAuthResponse(savedUser, token);
    }

    // 2. Đăng nhập hệ thống
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Tên đăng nhập hoặc mật khẩu không chính xác."));

        // Kiểm tra mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), user.getHashPassword())) {
            throw new RuntimeException("Tên đăng nhập hoặc mật khẩu không chính xác.");
        }

        // Tạo JWT Token
        String token = jwtTokenProvider.generateToken(user);

        return mapToAuthResponse(user, token);
    }

    // --- HÀM TIỆN ÍCH DÙNG ĐỂ MAP SANG AUTH RESPONSE ---
    private AuthResponse mapToAuthResponse(User user, String token) {
        // Lấy FullName từ Customer Info (Nếu đã cập nhật hồ sơ)
        String fullName = null;
        if (user.getInfo() != null) {
            fullName = user.getInfo().getName();
        }

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getRole(),
                fullName,
                user.getAvatarUrl()
        );
    }
}