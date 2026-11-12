package vn.doan.service;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.User;
import vn.doan.dto.request.UpdateRoleRequest;
import vn.doan.dto.request.UserCreateRequest;
import vn.doan.dto.response.UpdateRoleResponse;
import vn.doan.dto.response.UserProfileResponse;
import vn.doan.dto.response.UserResponse;
import vn.doan.exception.ResourceNotFoundException;
import vn.doan.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // Tối ưu hiệu năng đọc cho toàn class
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng"));

        return new UserProfileResponse(
                user.getId(), 
                user.getUsername(), 
                user.getEmail(), 
                user.getAvatarUrl(),
                user.getRole()
        );
    }
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse createStaff(UserCreateRequest request) {
        // 1. Kiểm tra xem username hoặc email đã tồn tại chưa (nếu cần)
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại trong hệ thống!");
        }

        // 2. Tạo Entity User mới
        User user = new User();
        user.setUsername(request.getUsername());
        // Nhớ mã hóa mật khẩu (password encoder) trước khi lưu nếu dự án có xài Spring Security nhé!
        user.setHashPassword(passwordEncoder.encode(request.getPassword())); 
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole("STAFF"); // Gán cứng quyền mặc định khi tạo mới là nhân viên

        // 3. Lưu vào Database
        User savedUser = userRepository.save(user);



    // Gán từng giá trị thông qua setter (hoặc dùng các hàm get tương ứng có sẵn trong savedUser)
    return new UserResponse(
        savedUser.getId(),
        savedUser.getUsername(),
        savedUser.getEmail(),
        savedUser.getRole(),
        savedUser.getAvatarUrl(),
        savedUser.getCreatedAt(),
        savedUser.getUpdatedAt(),
        null, // customerId
        null, // baristaId
        null, // fullName (hoặc savedUser.getFullName() nếu có)
        savedUser.getPhone()
    );
    }

   @Transactional
   @PreAuthorize("hasRole('ADMIN')")
    public UpdateRoleResponse updateStaffRole( String targetUserId, UpdateRoleRequest request) {
        // 1. Tìm nhân viên cần đổi quyền trong DB
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng này trong hệ thống"));

        // 2. Cập nhật role mới (Hibernate tự động Dirty Checking)
        user.setRole(request.getNewRole());

        // 3. Đúc gói Response trả về cho Frontend
        return new UpdateRoleResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                "Cập nhật quyền cho nhân viên thành công!"
        );
    }
}