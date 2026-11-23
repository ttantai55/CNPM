package vn.doan.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.Customer;
import vn.doan.domain.User;
import vn.doan.dto.request.LoginRequest;
import vn.doan.dto.request.RegisterRequest;
import vn.doan.dto.response.AuthResponse;
import vn.doan.dto.response.UserResponse;
import vn.doan.exception.BusinessValidationException;
import vn.doan.repository.UserRepository;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${google.client-id:}")
    private String googleClientId;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()) || userRepository.existsByUsername(request.getUsername())
                || (request.getPhone() != null && !request.getPhone().isBlank()
                        && userRepository.existsByInfo_Phone(request.getPhone()))) {
            throw new BusinessValidationException("Email, tên đăng nhập hoặc số điện thoại đã được sử dụng!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setHashPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("CUSTOMER");
        user.setProvider("LOCAL");

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
                .or(() -> userRepository.findByInfo_Phone(loginId))
                .orElseThrow(() -> new BusinessValidationException("Tài khoản hoặc mật khẩu không chính xác"));

        if (user.getHashPassword() == null || "GOOGLE".equalsIgnoreCase(user.getProvider())) {
            throw new BusinessValidationException(
                    "Tài khoản này sử dụng đăng nhập Google. Vui lòng chọn 'Đăng nhập bằng Google'."
            );
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getHashPassword())) {
            throw new BusinessValidationException("Tài khoản hoặc mật khẩu không chính xác");
        }

        return authResponse(user);
    }

    @Transactional
    public AuthResponse loginWithGoogle(String idTokenString) {
        GoogleIdToken.Payload payload = verifyGoogleToken(idTokenString);

        String sub = payload.getSubject();
        String email = payload.getEmail();
        String googleName = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        // 1. Tìm user Google hiện hữu theo sub
        User user = userRepository.findByGoogleSub(sub).orElse(null);

        if (user == null) {
            // 2. Chặn tự động đổi tài khoản LOCAL thành GOOGLE nếu trùng email
            if (userRepository.existsByEmail(email)) {
                throw new BusinessValidationException(
                        "Email này đã được đăng ký bằng mật khẩu. Vui lòng đăng nhập bằng tài khoản hiện có."
                );
            }

            // 3. Tạo User mới + Customer tương ứng
            String uniqueUsername = generateUniqueUsername(email);
            String displayName = (googleName != null && !googleName.isBlank())
                    ? googleName.trim()
                    : uniqueUsername;

            user = new User();
            user.setUsername(uniqueUsername);
            user.setEmail(email);
            user.setGoogleSub(sub);
            user.setAvatarUrl(picture);
            user.setProvider("GOOGLE");
            user.setHashPassword(null);
            user.setRole("CUSTOMER");

            Customer customer = new Customer();
            customer.setName(displayName);
            customer.setPhone(null);
            customer.setUser(user);
            user.setInfo(customer);

            user = userRepository.save(user);
        }

        return authResponse(user);
    }

    private AuthResponse authResponse(User user) {
        UserResponse response = new UserResponse(
                user.getId(), user.getUsername(), user.getEmail(), user.getRole(),
                user.getAvatarUrl(), user.getCreatedAt(), user.getUpdatedAt(),
                user.getInfo() == null ? null : user.getInfo().getId(),
                user.getBarista() == null ? null : user.getBarista().getId(),
                user.getInfo() != null ? user.getInfo().getName()
                        : user.getBarista() == null ? null : user.getBarista().getName(),
                user.getInfo() != null ? user.getInfo().getPhone()
                        : user.getBarista() == null ? null : user.getBarista().getPhone()
        );
        return new AuthResponse(jwtService.generateToken(user.getId(), user.getRole()), response);
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idTokenString) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new BusinessValidationException("Hệ thống chưa cấu hình Google Client ID");
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new BusinessValidationException("Google ID token không hợp lệ hoặc đã hết hạn");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new BusinessValidationException("Email Google chưa được xác minh");
            }

            return payload;
        } catch (BusinessValidationException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessValidationException("Lỗi xác minh Google ID token");
        }
    }

    private String generateUniqueUsername(String email) {
        String base = email.split("@")[0]
                .replaceAll("[^a-zA-Z0-9._-]", "")
                .toLowerCase();
        if (base.isBlank()) {
            base = "user";
        }

        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + suffix;
            suffix++;
        }
        return candidate;
    }
}