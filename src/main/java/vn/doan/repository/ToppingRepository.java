package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Topping;
import java.util.List;

@Repository
public interface ToppingRepository extends JpaRepository<Topping, String> {

    // Lấy danh sách các topping hiện đang còn hàng (isAvailable = true)
    List<Topping> findByIsAvailableTrue();
}