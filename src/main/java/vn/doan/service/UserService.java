package vn.doan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.Customer;
import vn.doan.domain.User;
import vn.doan.dto.request.CustomerCreateRequest;
import vn.doan.dto.request.CustomerUpdateRequest;
import vn.doan.dto.response.CustomerResponse;
import vn.doan.dto.response.UserResponse;
import vn.doan.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

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
        );
    }
}