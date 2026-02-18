package com.HCLBank.banking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.HCLBank.banking.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
