package com.HCLBank.banking.service;

import com.HCLBank.banking.dto.AccountRequestDTO;
import com.HCLBank.banking.dto.AccountResponseDTO;
import com.HCLBank.banking.dto.DepositRequestDTO;
import com.HCLBank.banking.dto.DepositResponseDTO;
import com.HCLBank.banking.entity.Account;

import java.util.List;

public interface AccountService {

    AccountResponseDTO createAccount(AccountRequestDTO requestDTO);

    Account getAccountById(Long id);

    List<Account> getAllAccounts();

    Account deposit(Long accountId, Double amount);

    Account withdraw(Long accountId, Double amount);

    DepositResponseDTO deposit(DepositRequestDTO request);

    Account getMyAccount(String email);
}
