package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.doan.domain.Customer;

public interface CustomerRepository extends JpaRepository<Customer, String> {}
