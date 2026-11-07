package vn.doan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.User;
import vn.doan.dto.request.LoginRequest;
import vn.doan.dto.request.RegisterRequest;
import vn.doan.dto.response.AuthResponse;
import vn.doan.exception.BusinessValidationException;
import vn.doan.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 1. Kiểm tra xem email đã tồn tại trong hệ thống chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessValidationException("Email đã được sử dụng!");
        }

        // 2. Khởi tạo User mới
        User user = new User();
        user.setUsername(request.getName());
        user.setEmail(request.getEmail());
        user.setHashPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_CUSTOMER");

        // 3. Lưu xuống Database
        User savedUser = userRepository.save(user);



        return new AuthResponse(

                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getRole(),
                savedUser.getUsername(), 
                savedUser.getAvatarUrl()
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse authenticate(LoginRequest request) {
        // 1. Tìm user theo email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessValidationException("Tài khoản hoặc mật khẩu không chính xác"));

        // 2. So khớp mật khẩu thô với hashPassword trong DB
        if (!passwordEncoder.matches(request.getPassword(), user.getHashPassword())) {
            throw new BusinessValidationException("Tài khoản hoặc mật khẩu không chính xác");
        }


        

        return new AuthResponse(
                
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getUsername(),
                user.getAvatarUrl()
        );
    }
}