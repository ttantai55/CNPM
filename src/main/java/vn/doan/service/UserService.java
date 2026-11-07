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

<<<<<<< HEAD
    // * 1. Lấy thông tin hồ sơ tài khoản
    public UserResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với ID: " + userId));

        return mapToResponse(user);
    }
    
    // * 2. Lấy danh sách toàn bộ người dùng
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // * 3. Cập nhật quyền cho nhân viên
    @Transactional
    public UserResponse updateStaffRole(String targetUserId, String newRole) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với ID: " + targetUserId));

        user.setRole(newRole);
        return mapToResponse(user);
    }

    // * 4. Lấy danh sách toàn bộ khách hàng
    public List<CustomerResponse> getAllCustomers(){
        List<User> users = userRepository.findAll();
        
        return users.stream()
                .filter(user -> user.getInfo() != null)
                .map(user -> mapToResponse(user.getInfo(), user))
                .collect(Collectors.toList());
    }

    // * 5. Tìm kiếm khách hàng theo sdt
    public CustomerResponse getCustomerByPhone(String phone) {
        User user = userRepository.findByInfo_Phone(phone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với số điện thoại: " + phone));
        
        return mapToResponse(user.getInfo(), user);
    }

    // * 6. Tạo mới hồ sơ khách hàng (Gắn vào một User đã tồn tại)
    @Transactional
    public CustomerResponse createCustomerProfile(CustomerCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với ID: " + request.getUserId()));

        if (user.getInfo() != null) {
            throw new IllegalStateException("Tài khoản này đã có hồ sơ khách hàng.");
        }

        Customer customer = new Customer(
                request.getName(),
                request.getDateOfBirth(),
                request.isGender(),
                request.getAddress(),
                request.getPhone()
        );

        customer.setUser(user);
        user.setInfo(customer);

        User savedUser = userRepository.save(user);

        return mapToResponse(savedUser.getInfo(), savedUser);
    }

    // * 7. Cập nhật hồ sơ khách hàng
    @Transactional
    public CustomerResponse updateCustomerProfile(String userId, CustomerUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với ID: " + userId));

        Customer customer = user.getInfo();
        if (customer == null) {
            throw new RuntimeException("Tài khoản này chưa có hồ sơ khách hàng để cập nhật.");
        }

        customer.setName(request.getName());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setGender(request.isGender());
        customer.setAddress(request.getAddress());
        customer.setPhone(request.getPhone());

        return mapToResponse(customer, user);
    }

    // --- HÀM TIỆN ÍCH DÙNG ĐỂ MAP ENTITY SANG DTO ---
    
    private UserResponse mapToResponse(User user) {
        String customerId = null;
        String fullName = null;
        String phone = null;
        if (user.getInfo() != null) {
            customerId = user.getInfo().getId();
            fullName = user.getInfo().getName();
            phone = user.getInfo().getPhone();
        }

        String baristaId = null;
        if (user.getBarista() != null) {
            baristaId = user.getBarista().getId();
        }

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getAvatarUrl(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                customerId,
                baristaId,
                fullName,
                phone
        );
    }

    private CustomerResponse mapToResponse(Customer customer, User user) {
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getDateOfBirth(),
                customer.isGender(),
                customer.getAddress(),
                customer.getPhone(),
                user.getId(),
                user.getEmail()
=======
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
>>>>>>> 588da0f172ce78ad6a0bf0eae51d3685fac2ddcb
        );
    }
}