package com.HCLBank.banking.service.impl;

import com.HCLBank.banking.dto.AccountRequestDTO;
import com.HCLBank.banking.dto.AccountResponseDTO;
import com.HCLBank.banking.dto.DepositRequestDTO;
import com.HCLBank.banking.dto.DepositResponseDTO;
import com.HCLBank.banking.entity.Account;
import com.HCLBank.banking.entity.Transaction;
import com.HCLBank.banking.entity.User;
import com.HCLBank.banking.exception.ResourceNotFoundException;
import com.HCLBank.banking.repository.AccountRepository;
import com.HCLBank.banking.repository.TransactionRepository;
import com.HCLBank.banking.repository.UserRepository;
import com.HCLBank.banking.service.AccountService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public AccountServiceImpl(AccountRepository accountRepository,
                              UserRepository userRepository,
                              TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public AccountResponseDTO createAccount(AccountRequestDTO requestDTO) {
        Account account = new Account();
        account.setAccountName(requestDTO.getAccountName());
        account.setAccountType(requestDTO.getAccountType());
        account.setRemarks(requestDTO.getRemarks());
        account.setBalance(BigDecimal.ZERO);
        Account savedAccount = accountRepository.save(account);

        return AccountResponseDTO.builder()
                .accountId(savedAccount.getAccountId())
                .accountName(savedAccount.getAccountName())
                .accountType(savedAccount.getAccountType())
                .remarks(savedAccount.getRemarks())
                .build();
    }

    @Override
    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    @Override
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    @Override
    @Transactional
    public Account deposit(Long accountId, Double amount) {
        if (amount <= 0) {
            throw new RuntimeException("Deposit amount must be positive");
        }
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        BigDecimal delta = BigDecimal.valueOf(amount);
        BigDecimal current = account.getBalance() == null ? BigDecimal.ZERO : account.getBalance();
        account.setBalance(current.add(delta));
        accountRepository.save(account);

        Transaction depositTxn = new Transaction();
        depositTxn.setTransactionType("CREDIT");
        depositTxn.setTransactionAmount(delta);
        depositTxn.setTransactionDate(LocalDateTime.now());
        depositTxn.setSourceAccount(null);
        depositTxn.setTargetAccount(account);
        depositTxn.setRemarks("Self Deposit");
        transactionRepository.save(depositTxn);

        return account;
    }

    @Override
    @Transactional
    public DepositResponseDTO deposit(DepositRequestDTO request) {
        if (request == null || request.getAccountId() == null) {
            throw new RuntimeException("Account ID is required");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Deposit amount must be positive");
        }

        Long accountId = request.getAccountId();
        BigDecimal amount = request.getAmount();

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        BigDecimal current = account.getBalance() == null ? BigDecimal.ZERO : account.getBalance();
        BigDecimal newBalance = current.add(amount);
        account.setBalance(newBalance);
        accountRepository.save(account);

        Transaction depositTxn = new Transaction();
        depositTxn.setTransactionType("CREDIT");
        depositTxn.setTransactionAmount(amount);
        depositTxn.setTransactionDate(LocalDateTime.now());
        depositTxn.setSourceAccount(null);
        depositTxn.setTargetAccount(account);
        depositTxn.setRemarks("Self Deposit");
        transactionRepository.save(depositTxn);

        return new DepositResponseDTO(accountId, newBalance, LocalDateTime.now());
    }

    @Override
    @Transactional
    public Account withdraw(Long accountId, Double amount) {
        if (amount <= 0) {
            throw new RuntimeException("Withdrawal amount must be positive");
        }
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        BigDecimal current = account.getBalance() == null ? BigDecimal.ZERO : account.getBalance();
        BigDecimal delta = BigDecimal.valueOf(amount);
        if (current.compareTo(delta) < 0) {
            throw new RuntimeException("Insufficient balance");
        }
        account.setBalance(current.subtract(delta));
        accountRepository.save(account);

        Transaction withdrawTxn = new Transaction();
        withdrawTxn.setTransactionType("DEBIT");
        withdrawTxn.setTransactionAmount(delta);
        withdrawTxn.setTransactionDate(LocalDateTime.now());
        withdrawTxn.setSourceAccount(account);
        withdrawTxn.setTargetAccount(null);
        withdrawTxn.setRemarks("Self Withdrawal");
        transactionRepository.save(withdrawTxn);

        return account;
    }

    @Override
    public Account getMyAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getCustomer() == null) {
            throw new ResourceNotFoundException("Customer profile not found");
        }
        List<Account> accounts = accountRepository.findByCustomerCustomerId(user.getCustomer().getCustomerId());
        if (accounts.isEmpty()) {
            throw new ResourceNotFoundException("No accounts found for this user");
        }
        Account account = accounts.get(0);
        return account;
    }
}
