package org.bngy.siminvest.service;

import org.springframework.stereotype.Service;

@Service
public class InvestmentService {
    public double calculateExpectedReturn(double initialAmount, double monthlyContribution, double annualRate, int durationMonths) {
        double monthlyRate = annualRate / 12.0 / 100.0;
        double futureValueInitial = initialAmount * Math.pow(1 + monthlyRate, durationMonths);
        double futureValuePac = monthlyContribution * (Math.pow(1 + monthlyRate, durationMonths) - 1) / monthlyRate;

        return futureValueInitial + futureValuePac - initialAmount - (monthlyContribution * durationMonths);
    }
}
