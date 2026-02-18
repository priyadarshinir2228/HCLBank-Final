package com.HCLBank.banking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserSearchResponseDTO {
    private String name;
    private String upiId;
    private String bankName;
    private Long accountId;
}
