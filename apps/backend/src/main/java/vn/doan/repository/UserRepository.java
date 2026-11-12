package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.User; // Nhớ kiểm tra lại đường dẫn import file Entity User của ông

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByUsername(String userName);

    // 1. Dùng lúc Đăng ký: Kiểm tra xem Email có ai xài chưa
    boolean existsByEmail(String email);

    // 2. Dùng lúc Đăng ký: Kiểm tra xem Số điện thoại có ai xài chưa
    boolean existsByPhone(String phone);

    // 3. Dùng lúc Đăng nhập: Tìm kiếm thông tin User bằng Email
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByUsernameIgnoreCase(String username);
    Optional<User> findByPhone(String phone);
}