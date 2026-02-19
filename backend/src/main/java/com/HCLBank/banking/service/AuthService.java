package com.HCLBank.banking.service;

import com.HCLBank.banking.dto.AuthResponseDTO;
import com.HCLBank.banking.dto.LoginRequestDTO;
import com.HCLBank.banking.dto.RegisterRequestDTO;
import com.HCLBank.banking.exception.InvalidOperationException;
import com.HCLBank.banking.repository.UserRepository;
import com.HCLBank.banking.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.HCLBank.banking.entity.Customer;
import com.HCLBank.banking.entity.Account;
import com.HCLBank.banking.entity.Role;
import com.HCLBank.banking.entity.User;
import com.HCLBank.banking.repository.CustomerRepository;
import com.HCLBank.banking.repository.AccountRepository;
import java.math.BigDecimal;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthService(UserRepository userRepository,
                       CustomerRepository customerRepository,
                       AccountRepository accountRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new InvalidOperationException("Email already exists");
        }
        if (userRepository.findByUserName(request.getUserName()).isPresent()) {
            throw new InvalidOperationException("Username already exists");
        }

        // Create Customer
        Customer customer = new Customer();
        customer.setCustomerName(request.getUserName());
        customer = customerRepository.save(customer);

        // Create User
        User user = new User();
        user.setUserName(request.getUserName());
        user.setEmail(request.getEmail());
        user.setUserPwd(passwordEncoder.encode(request.getPassword()));
        
        Role userRole = Role.CUSTOMER;
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("ADMIN")) {
            userRole = Role.ADMIN;
        }
        user.setRole(userRole);
        
        user.setKycCompleted(userRole == Role.ADMIN); // Admins are auto-verified
        String sanitizedUpi = request.getUserName().replaceAll("\\s+", "").toLowerCase();
        user.setUpiId(sanitizedUpi + "@hcl");
        user.setCustomer(customer);
        userRepository.save(user);

        // Create Default Account
        Account account = new Account();
        account.setAccountName(request.getUserName() + "'s Account");
        account.setAccountType("SAVINGS");
        account.setBalance(BigDecimal.valueOf(1000.0)); // Welcome bonus
        account.setCustomer(customer);
        account = accountRepository.save(account);

        return AuthResponseDTO.builder()
                .message("User registered successfully")
                .username(user.getUserName())
                .build();
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidOperationException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponseDTO.builder()
                .token(token)
                .role(user.getRole().name())
                .username(user.getUserName())
                .email(user.getEmail())
                .kycCompleted(user.isKycCompleted())
                .message("Login successful")
                .build();
    }
}
