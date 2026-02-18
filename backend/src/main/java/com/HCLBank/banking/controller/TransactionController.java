package com.HCLBank.banking.controller;

import com.HCLBank.banking.dto.TransactionHistoryDTO;
import com.HCLBank.banking.dto.TransferRequestDTO;
import com.HCLBank.banking.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/transfer")
    public ResponseEntity<String> transfer(@RequestBody TransferRequestDTO request) {
        transactionService.transfer(
                request.getSourceAccountId(),
                request.getTargetAccountId(),
                request.getAmount()
        );
        return ResponseEntity.ok("Transfer successful");
    }

    @GetMapping("/history/{accountId}")
    public ResponseEntity<List<TransactionHistoryDTO>> getHistory(@PathVariable Long accountId) {
        return ResponseEntity.ok(transactionService.getHistory(accountId));
    }
}
