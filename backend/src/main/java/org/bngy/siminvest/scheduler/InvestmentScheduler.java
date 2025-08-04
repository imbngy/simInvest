package org.bngy.siminvest.scheduler;

import org.bngy.siminvest.model.InvestmentSimulation;
import org.bngy.siminvest.model.InvestmentTransaction;
import org.bngy.siminvest.model.Transaction;
import org.bngy.siminvest.repository.InvestmentSimulationRepository;
import org.bngy.siminvest.repository.AccountRepository;
import org.bngy.siminvest.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class InvestmentScheduler {

    @Autowired
    private InvestmentSimulationRepository investmentRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // Ogni giorno alle 3:00 di notte
    @Scheduled(cron = "0 0 3 * * *")
    public void processMonthlyContributions() {
        List<InvestmentSimulation> investments = investmentRepository.findByConfirmedTrue();

        for (InvestmentSimulation inv : investments) {
            if (inv.getMonthlyContribution() == null || inv.getMonthlyContribution() <= 0) continue;

            LocalDate today = LocalDate.now();
            LocalDate created = inv.getCreatedAt().toLocalDate();

            long monthsPassed = ChronoUnit.MONTHS.between(created, today);

            // Ha già pagato per questo mese?
            if (inv.getPacMonthsPaid() >= monthsPassed) continue;

            var account = inv.getAccount();

            if (account.getBalance() >= inv.getMonthlyContribution()) {
                account.setBalance(account.getBalance() - inv.getMonthlyContribution());
                inv.setAmount(inv.getAmount() + inv.getMonthlyContribution());
                inv.setPacMonthsPaid(inv.getPacMonthsPaid() + 1);

                // Aggiungo una transazione per il PAC all'account
                Transaction tx = Transaction.builder()
                        .type(Transaction.Type.WITHDRAWAL)
                        .amount(inv.getMonthlyContribution())
                        .timestamp(LocalDateTime.now())
                        .account(account)
                        .build();
                transactionRepository.save(tx);

                // Aggiungo una transazione per il PAC all'investimento
                InvestmentTransaction itx = InvestmentTransaction.builder()
                        .type(InvestmentTransaction.Type.DEPOSIT)
                        .amount(inv.getMonthlyContribution())
                        .timestamp(LocalDateTime.now())
                        .investment(inv)
                        .build();
                inv.getTransactions().add(itx);

                accountRepository.save(account);
                investmentRepository.save(inv);
                System.out.println("Versato PAC per investimento ID: " + inv.getId());
            } else {
                System.out.println("Saldo insufficiente per PAC su investimento ID: " + inv.getId());
            }
        }
    }
}
