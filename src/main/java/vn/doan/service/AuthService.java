package vn.doan.service;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.User;
import vn.doan.domain.Customer;
import vn.doan.dto.request.LoginRequest;
import vn.doan.dto.request.RegisterRequest;
import vn.doan.dto.response.AuthResponse;
import vn.doan.dto.response.UserResponse;
import vn.doan.exception.BusinessValidationException;
import vn.doan.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()) || userRepository.existsByUsername(request.getUsername())
                || (request.getPhone() != null && !request.getPhone().isBlank() && userRepository.existsByPhone(request.getPhone()))) {
            throw new BusinessValidationException("Email, tên đăng nhập hoặc số điện thoại đã được sử dụng!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setFullName(request.getFullName());
        user.setHashPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_CUSTOMER");
        Customer customer = new Customer();
        customer.setName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setUser(user);
        user.setInfo(customer);

        User savedUser = userRepository.save(user);
        return authResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse authenticate(LoginRequest request) {
        String loginId = request.getLoginId().trim();
        User user = userRepository.findByEmailIgnoreCase(loginId)
                .or(() -> userRepository.findByUsernameIgnoreCase(loginId))
                .or(() -> userRepository.findByPhone(loginId))
                .orElseThrow(() -> new BusinessValidationException("Tài khoản hoặc mật khẩu không chính xác"));

        if (!passwordEncoder.matches(request.getPassword(), user.getHashPassword())) {
            throw new BusinessValidationException("Tài khoản hoặc mật khẩu không chính xác");
        }

        return authResponse(user);
    }

    private AuthResponse authResponse(User user) {
        UserResponse response = new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole(),
                user.getAvatarUrl(), user.getCreatedAt(), user.getUpdatedAt(),
                user.getInfo() == null ? null : user.getInfo().getId(),
                user.getBarista() == null ? null : user.getBarista().getId(), user.getFullName(), user.getPhone());
        return new AuthResponse("bl_" + java.util.UUID.randomUUID(), response);
    }
}