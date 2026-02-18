package com.HCLBank.banking.controller;

import com.HCLBank.banking.dto.UserSearchResponseDTO;
import com.HCLBank.banking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.HCLBank.banking.entity.User;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/search")
    public ResponseEntity<UserSearchResponseDTO> searchUser(@RequestParam String upiId) {
        return ResponseEntity.ok(userService.searchByUpiId(upiId));
    }

    @PostMapping("/kyc/submit")
    public ResponseEntity<String> submitKyc() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userService.submitKyc(email);
        return ResponseEntity.ok("KYC submitted successfully");
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserSearchResponseDTO>> getAllUsersForSearch() {
        return ResponseEntity.ok(userService.getAllUsersForSearch());
    }

    // Admin endpoints
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/kyc-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateKycStatus(@PathVariable Long id, @RequestParam boolean status) {
        userService.updateKycStatus(id, status);
        return ResponseEntity.ok("KYC status updated");
    }
}
