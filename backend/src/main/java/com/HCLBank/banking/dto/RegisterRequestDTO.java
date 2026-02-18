package com.HCLBank.banking.dto;

import lombok.Data;

@Data
public class RegisterRequestDTO {
    private String userName;
    private String email;
    private String password;
    private String role;
}
