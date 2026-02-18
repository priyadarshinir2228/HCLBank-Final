package com.HCLBank.banking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AccountRequestDTO {

    @NotBlank
    private String accountName;

    @NotBlank
    private String accountType;

    private String remarks;

    @NotNull
    private Long customerId;
}
