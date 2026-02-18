package com.HCLBank.banking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.HCLBank.banking.entity.Transaction;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findBySourceAccountAccountIdOrTargetAccountAccountIdOrderByTransactionDateDesc(Long sourceAccountId, Long targetAccountId);
}

