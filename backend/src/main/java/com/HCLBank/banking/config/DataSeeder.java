package com.HCLBank.banking.config;

import com.HCLBank.banking.entity.Account;
import com.HCLBank.banking.entity.Customer;
import com.HCLBank.banking.entity.Role;
import com.HCLBank.banking.entity.User;
import com.HCLBank.banking.repository.AccountRepository;
import com.HCLBank.banking.repository.CustomerRepository;
import com.HCLBank.banking.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataSeeder {

    private static final class SeedUser {
        private final String name;
        private final String userName;
        private final String email;
        private final String upiId;
        private final double openingBalance;

        private SeedUser(String name, String userName, String email, String upiId, double openingBalance) {
            this.name = name;
            this.userName = userName;
            this.email = email;
            this.upiId = upiId;
            this.openingBalance = openingBalance;
        }
    }

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   CustomerRepository customerRepository,
                                   AccountRepository accountRepository,
                                   PasswordEncoder passwordEncoder,
                                   PlatformTransactionManager transactionManager) {
        return args -> {
            TransactionTemplate tx = new TransactionTemplate(transactionManager);
            tx.executeWithoutResult(status -> {
                if (userRepository.findByUserName("admin").isEmpty()) {
                    User admin = new User();
                    admin.setUserName("admin");
                    admin.setEmail("admin@hcl.com");
                    admin.setUserPwd(passwordEncoder.encode("admin123"));
                    admin.setRole(Role.ADMIN);
                    admin.setKycCompleted(true);
                    admin.setUpiId("admin@hcl");
                    userRepository.save(admin);
                }

                List<SeedUser> seedUsers = List.of(
                    new SeedUser("Rahul", "rahul", "rahul@hcl.com", "rahul@hcl", 12000.0),
                    new SeedUser("Anjali", "anjali", "anjali@hcl.com", "anjali@hcl", 9500.0),
                    new SeedUser("Vikram", "vikram", "vikram@hcl.com", "vikram@hcl", 18250.0),
                    new SeedUser("Sneha", "sneha", "sneha@hcl.com", "sneha@hcl", 7400.0),
                    new SeedUser("Amit", "amit", "amit@hcl.com", "amit@hcl", 15600.0),
                    new SeedUser("Priya", "priya", "priya@hcl.com", "priya@hcl", 13300.0)
                );

                for (SeedUser seed : seedUsers) {
                    User user = userRepository.findByUserName(seed.userName)
                            .orElseGet(() -> userRepository.findByEmail(seed.email).orElse(null));

                    if (user == null) {
                        Customer customer = new Customer();
                        customer.setCustomerName(seed.name);
                        customer = customerRepository.save(customer);

                        user = new User();
                        user.setUserName(seed.userName);
                        user.setEmail(seed.email);
                        user.setUserPwd(passwordEncoder.encode("password123"));
                        user.setRole(Role.CUSTOMER);
                        user.setKycCompleted(true);
                        user.setUpiId(seed.upiId);
                        user.setCustomer(customer);
                        userRepository.save(user);
                    } else {
                        if (user.getCustomer() == null) {
                            Customer customer = new Customer();
                            customer.setCustomerName(seed.name);
                            customer = customerRepository.save(customer);
                            user.setCustomer(customer);
                        }
                        user.setRole(Role.CUSTOMER);
                        user.setKycCompleted(true);
                        if (user.getUpiId() == null || user.getUpiId().isBlank()) {
                            user.setUpiId(seed.upiId);
                        }
                        userRepository.save(user);
                    }

                    Customer customer = user.getCustomer();
                    if (customer == null) {
                        throw new IllegalStateException("Customer missing for seed user: " + seed.userName);
                    }

                    List<Account> accounts = accountRepository.findByCustomerCustomerId(customer.getCustomerId());
                    Account account;
                    if (accounts.isEmpty()) {
                        account = new Account();
                        account.setAccountName(seed.name + "'s Savings");
                        account.setAccountType("SAVINGS");
                        account.setBalance(BigDecimal.valueOf(seed.openingBalance));
                        account.setCustomer(customer);
                        account = accountRepository.saveAndFlush(account);
                    } else {
                        account = accounts.get(0);
                        if (account.getBalance() == null || account.getBalance().compareTo(BigDecimal.ZERO) <= 0) {
                            account.setBalance(BigDecimal.valueOf(seed.openingBalance));
                            accountRepository.save(account);
                        }
                    }
                }

                System.out.println("Database seeded with default admin and seed customers");
            });
        };
    }
}
