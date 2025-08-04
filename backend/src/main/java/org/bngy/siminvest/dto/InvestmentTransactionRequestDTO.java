package org.bngy.siminvest.dto;

import lombok.Data;

@Data
public class InvestmentTransactionRequestDTO {
    private Long investmentId;
    private double amount;
    private String type; // "DEPOSIT" o "WITHDRAWAL"
}
