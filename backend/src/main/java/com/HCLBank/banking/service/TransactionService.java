package com.HCLBank.banking.service;

import com.HCLBank.banking.dto.TransactionHistoryDTO;
import java.math.BigDecimal;
import java.util.List;

public interface TransactionService {

    void transfer(Long sourceAccountId, Long targetAccountId, BigDecimal amount);
    List<TransactionHistoryDTO> getHistory(Long accountId);
}

