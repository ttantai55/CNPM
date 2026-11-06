package vn.doan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.Customer;
import vn.doan.domain.User;
import vn.doan.dto.request.CustomerCreateRequest;
import vn.doan.dto.request.CustomerUpdateRequest;
import vn.doan.dto.response.CustomerResponse;
import vn.doan.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerService {

    private final UserRepository userRepository;

    //1. Lấy thông tin hồ sơ khách hàng (Dựa vào User ID)
    public CustomerResponse getCustomerProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với ID: " + userId));

        Customer customer = user.getInfo();
        if (customer == null) {
            throw new RuntimeException("Tài khoản này chưa cập nhật hồ sơ khách hàng.");
        }

        return mapToResponse(customer, user);
    }

    //* 2. Tạo mới hồ sơ khách hàng (Gắn vào một User đã tồn tại)
    @Transactional
    public CustomerResponse createCustomerProfile(CustomerCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với ID: " + request.getUserId()));

        // Kiểm tra xem User này đã có hồ sơ chưa
        if (user.getInfo() != null) {
            throw new IllegalStateException("Tài khoản này đã có hồ sơ khách hàng.");
        }

        // Tạo Entity Customer mới
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

    // 3. Cập nhật hồ sơ khách hàng
    
    @Transactional
    public CustomerResponse updateCustomerProfile(String userId, CustomerUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với ID: " + userId));

        Customer customer = user.getInfo();
        if (customer == null) {
            throw new RuntimeException("Tài khoản này chưa có hồ sơ khách hàng để cập nhật.");
        }

        // Cập nhật thông tin vào Entity đã được Managed
        customer.setName(request.getName());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setGender(request.isGender());
        customer.setAddress(request.getAddress());
        customer.setPhone(request.getPhone());

        return mapToResponse(customer, user);
    }

    // --- HÀM TIỆN ÍCH MAP ENTITY SANG DTO RESPONSE ---
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