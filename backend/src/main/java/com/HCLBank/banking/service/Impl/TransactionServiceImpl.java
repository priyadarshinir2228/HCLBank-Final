package com.HCLBank.banking.service.impl;

import com.HCLBank.banking.dto.TransactionHistoryDTO;
import com.HCLBank.banking.entity.Account;
import com.HCLBank.banking.entity.Transaction;
import com.HCLBank.banking.repository.AccountRepository;
import com.HCLBank.banking.repository.TransactionRepository;
import com.HCLBank.banking.service.TransactionService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public TransactionServiceImpl(TransactionRepository transactionRepository,
                                  AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    @Transactional
    public void transfer(Long sourceAccountId,
                         Long targetAccountId,
                         BigDecimal amount) {
        if (sourceAccountId == null || targetAccountId == null) {
            throw new RuntimeException("Source and Target account IDs are required");
        }

        if (sourceAccountId.equals(targetAccountId)) {
            throw new RuntimeException("Source and Target accounts cannot be same");
        }

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Transfer amount must be positive");
        }

        Account sourceAccount = accountRepository.findById(sourceAccountId)
                .orElseThrow(() -> new RuntimeException("Source account not found"));

        Account targetAccount = accountRepository.findById(targetAccountId)
                .orElseThrow(() -> new RuntimeException("Target account not found"));

        BigDecimal sourceBalance = sourceAccount.getBalance() == null ? BigDecimal.ZERO : sourceAccount.getBalance();
        BigDecimal targetBalance = targetAccount.getBalance() == null ? BigDecimal.ZERO : targetAccount.getBalance();

        if (sourceBalance.compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance in source account");
        }

        sourceAccount.setBalance(sourceBalance.subtract(amount));
        targetAccount.setBalance(targetBalance.add(amount));
        accountRepository.save(sourceAccount);
        accountRepository.save(targetAccount);

        Transaction senderTxn = new Transaction();
        senderTxn.setTransactionType("DEBIT");
        senderTxn.setTransactionAmount(amount);
        senderTxn.setTransactionDate(LocalDateTime.now());
        senderTxn.setSourceAccount(sourceAccount);
        senderTxn.setTargetAccount(null);
        senderTxn.setRemarks("Sent to " + targetAccount.getAccountName());
        transactionRepository.save(senderTxn);

        Transaction receiverTxn = new Transaction();
        receiverTxn.setTransactionType("CREDIT");
        receiverTxn.setTransactionAmount(amount);
        receiverTxn.setTransactionDate(LocalDateTime.now());
        receiverTxn.setSourceAccount(null);
        receiverTxn.setTargetAccount(targetAccount);
        receiverTxn.setRemarks("Received from " + sourceAccount.getAccountName());
        transactionRepository.save(receiverTxn);
    }

    @Override
    public List<TransactionHistoryDTO> getHistory(Long accountId) {
        List<Transaction> transactions = transactionRepository.findBySourceAccountAccountIdOrTargetAccountAccountIdOrderByTransactionDateDesc(accountId, accountId);

        return transactions.stream().map(t -> {
            String type;
            String txnType = t.getTransactionType() == null ? "" : t.getTransactionType().toUpperCase();
            if ("DEBIT".equals(txnType) || "WITHDRAW".equals(txnType)) {
                type = "DEBIT";
            } else if ("CREDIT".equals(txnType) || "DEPOSIT".equals(txnType)) {
                type = "CREDIT";
            } else {
                boolean isSource = t.getSourceAccount() != null && t.getSourceAccount().getAccountId().equals(accountId);
                type = isSource ? "DEBIT" : "CREDIT";
            }

            String otherParty = "Unknown";
            if (t.getRemarks() != null && !t.getRemarks().isBlank()
                    && (t.getSourceAccount() == null || t.getTargetAccount() == null)) {
                otherParty = t.getRemarks();
            } else if (t.getTargetAccount() != null) {
                otherParty = t.getTargetAccount().getAccountName();
            } else if (t.getSourceAccount() != null) {
                otherParty = t.getSourceAccount().getAccountName();
            }

            return TransactionHistoryDTO.builder()
                    .date(t.getTransactionDate())
                    .amount(t.getTransactionAmount())
                    .type(type)
                    .otherParty(otherParty)
                    .status("SUCCESS")
                    .build();
        }).collect(Collectors.toList());
    }
}
