package com.HCLBank.banking.controller;

import com.HCLBank.banking.dto.AccountRequestDTO;
import com.HCLBank.banking.dto.AccountResponseDTO;
import com.HCLBank.banking.dto.DepositRequestDTO;
import com.HCLBank.banking.dto.DepositResponseDTO;
import com.HCLBank.banking.entity.Account;
import com.HCLBank.banking.service.AccountService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;


import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/account")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/my-account")
    public ResponseEntity<Account> getMyAccount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(accountService.getMyAccount(email));
    }

    @PostMapping
    public ResponseEntity<AccountResponseDTO> createAccount(
        @Valid @RequestBody AccountRequestDTO requestDTO) {

        AccountResponseDTO response = accountService.createAccount(requestDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
   }


    // Get Account by ID
    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccount(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountById(id));
 }


    // Get All Accounts
    @GetMapping
    public List<Account> getAllAccounts() {
        return accountService.getAllAccounts();
    }

    // Deposit
    @PutMapping("/{id}/deposit")
    public Account deposit(@PathVariable Long id, @RequestParam Double amount) {
        return accountService.deposit(id, amount);
    }

    @PostMapping("/deposit")
    public ResponseEntity<DepositResponseDTO> deposit(@RequestBody DepositRequestDTO request) {
        return ResponseEntity.ok(accountService.deposit(request));
    }

    // Withdraw
    @PutMapping("/{id}/withdraw")
    public Account withdraw(@PathVariable Long id, @RequestParam Double amount) {
        return accountService.withdraw(id, amount);
  }
}
