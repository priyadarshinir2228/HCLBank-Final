package com.HCLBank.banking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DepositResponseDTO {
    private Long accountId;
    private BigDecimal balanceAmount;
    private LocalDateTime balanceDate;

    public DepositResponseDTO() {}

    public DepositResponseDTO(Long accountId, BigDecimal balanceAmount, LocalDateTime balanceDate) {
        this.accountId = accountId;
        this.balanceAmount = balanceAmount;
        this.balanceDate = balanceDate;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public BigDecimal getBalanceAmount() {
        return balanceAmount;
    }

    public void setBalanceAmount(BigDecimal balanceAmount) {
        this.balanceAmount = balanceAmount;
    }

    public LocalDateTime getBalanceDate() {
        return balanceDate;
    }

    public void setBalanceDate(LocalDateTime balanceDate) {
        this.balanceDate = balanceDate;
    }
}
