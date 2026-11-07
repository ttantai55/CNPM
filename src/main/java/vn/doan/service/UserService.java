package vn.doan.service;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.User;
import vn.doan.dto.request.UpdateRoleRequest;
import vn.doan.dto.response.UpdateRoleResponse;
import vn.doan.dto.response.UserProfileResponse;
import vn.doan.exception.ResourceNotFoundException;
import vn.doan.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // Tối ưu hiệu năng đọc cho toàn class
public class UserService {

    private final UserRepository userRepository;

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