package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Order;
import vn.doan.domain.Customer;
import vn.doan.domain.enums.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByCustomer(Customer customer);

    List<Order> findByCustomerOrderByCreatedAtDesc(Customer customer);
 
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
}