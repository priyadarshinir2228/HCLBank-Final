package com.HCLBank.banking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.HCLBank.banking.entity.Account;

import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByCustomerCustomerId(Long customerId);

}
