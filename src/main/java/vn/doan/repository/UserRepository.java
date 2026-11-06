package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    // 1. Tìm User theo tên đăng nhập
    Optional<User> findByUsername(String username);

    // 2. Kiểm tra tên đăng nhập đã tồn tại chưa 
    boolean existsByUsername(String username);

    // 3. Kiểm tra email đã được sử dụng chưa
    boolean existsByEmail(String email);
}