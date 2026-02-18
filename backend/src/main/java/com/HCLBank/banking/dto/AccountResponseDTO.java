package com.HCLBank.banking.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AccountResponseDTO {

    private Long accountId;
    private String accountName;
    private String accountType;
    private String remarks;
}

