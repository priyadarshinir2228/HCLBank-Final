package com.HCLBank.banking.service;

import com.HCLBank.banking.dto.UserSearchResponseDTO;
import com.HCLBank.banking.entity.Role;
import com.HCLBank.banking.entity.User;
import com.HCLBank.banking.exception.ResourceNotFoundException;
import com.HCLBank.banking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<UserSearchResponseDTO> getAllUsersForSearch() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .map(this::convertToSearchDTO)
                .collect(Collectors.toList());
    }

    private UserSearchResponseDTO convertToSearchDTO(User user) {
        String name = (user.getCustomer() != null) ? user.getCustomer().getCustomerName() : user.getUserName();
        Long accountId = (user.getCustomer() != null && !user.getCustomer().getAccounts().isEmpty()) ? 
            user.getCustomer().getAccounts().get(0).getAccountId() : null;

        return UserSearchResponseDTO.builder()
                .name(name)
                .upiId(user.getUpiId())
                .bankName("HCL Bank")
                .accountId(accountId)
                .build();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void updateKycStatus(Long id, boolean status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setKycCompleted(status);
        userRepository.save(user);
    }

    public UserSearchResponseDTO searchByUpiId(String upiId) {
        User user = userRepository.findByUpiId(upiId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with UPI ID: " + upiId));

        return convertToSearchDTO(user);
    }

    public void submitKyc(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setKycCompleted(true);
        userRepository.save(user);
    }
}
