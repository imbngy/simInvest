package org.bngy.siminvest.dto;

import lombok.Data;

@Data
public class SimulationRequestDTO {
    private String asset;
    private double amount;
    private int durationMonths;
    private Double monthlyContribution;
    private double interestRate;
    private Long accountId;
}
