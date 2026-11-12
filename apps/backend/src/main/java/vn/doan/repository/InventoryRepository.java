package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Inventory;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {
}