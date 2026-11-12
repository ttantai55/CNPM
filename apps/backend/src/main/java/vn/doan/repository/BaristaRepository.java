package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Barista;
import java.util.List;

@Repository
public interface BaristaRepository extends JpaRepository<Barista, String> {

    // Tìm nhân viên pha chế theo tên (không phân biệt hoa thường)
    List<Barista> findByNameContainingIgnoreCase(String name);
}