package org.bngy.siminvest.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.bngy.siminvest.dto.AccountRequestDTO;
import org.bngy.siminvest.dto.TransactionRequestDTO;
import org.bngy.siminvest.model.Account;
import org.bngy.siminvest.model.InvestmentSimulation;
import org.bngy.siminvest.model.User;
import org.bngy.siminvest.model.Transaction;
import org.bngy.siminvest.repository.AccountRepository;
import org.bngy.siminvest.repository.InvestmentSimulationRepository;
import org.bngy.siminvest.repository.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AccountController {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private static final double INTEREST_RATE_ANNUAL = 0.04;
    private final InvestmentSimulationRepository investmentSimulationRepository;

    // Crea un nuovo conto per l'utente autenticato
    @PostMapping
    public ResponseEntity<Account> createAccount(
            @RequestBody AccountRequestDTO request,
            @AuthenticationPrincipal User user
    ) {
        Account account = Account.builder()
                .name(request.getName())
                .balance(request.getBalance())
                .user(user)
                .build();

        Account savedAccount = accountRepository.save(account);

        // Se il saldo iniziale è maggiore di 0, registro una transazione di tipo DEPOSIT
        if (request.getBalance() > 0) {
            Transaction depositTransaction = Transaction.builder()
                    .account(savedAccount)
                    .amount(request.getBalance())
                    .type(Transaction.Type.DEPOSIT)
                    .timestamp(LocalDateTime.now())
                    .build();

            transactionRepository.save(depositTransaction);
        }

        return ResponseEntity.ok(savedAccount);
    }
    // Ottengo tutti i conti dell'utente autenticato
    @GetMapping
    public ResponseEntity<List<Account>> getMyAccounts(@AuthenticationPrincipal User user) {
        List<Account> accounts = accountRepository.findByUserId(Long.valueOf(user.getId()));
        LocalDateTime now = LocalDateTime.now();

        for (Account account : accounts) {
            LocalDateTime lastApplied = account.getLastInterestAppliedAt();

            if (lastApplied == null) {
                // Cerco la prima transazione di tipo DEPOSIT
                Transaction firstDeposit = transactionRepository
                        .findFirstByAccountIdAndTypeOrderByTimestampAsc(account.getId(), Transaction.Type.DEPOSIT);

                if (firstDeposit != null) {
                    lastApplied = firstDeposit.getTimestamp();
                } else {
                    // Nessun deposito mai fatto → nessun interesse da applicare
                    continue;
                }
            }

            long daysPassed = Duration.between(lastApplied, now).toDays();

            if (daysPassed >= 365) {
                int years = (int) (daysPassed / 365);
                double newBalance = account.getBalance() * Math.pow(1 + INTEREST_RATE_ANNUAL, years);
                account.setBalance(newBalance);
                account.setLastInterestAppliedAt(lastApplied.plusYears(years));
                accountRepository.save(account);
            }
        }

        return ResponseEntity.ok(accounts);
    }

    // Ottiengo un conto per ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getAccountById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        Account account = accountRepository.findById(id).orElse(null);
        if (account == null || !account.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Conto non trovato o non autorizzato.");
        }
        return ResponseEntity.ok(account);
    }

    // Elenco degli investimenti di un conto
    @GetMapping("/{id}/investments")
    public ResponseEntity<?> getAccountInvestments(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        Account account = accountRepository.findById(id).orElse(null);
        if (account == null || !account.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Conto non trovato o non autorizzato.");
        }

        List<InvestmentSimulation> investments = investmentSimulationRepository.findByAccountId(id);
        return ResponseEntity.ok(investments);
    }

    // Deposito fondi su un conto
    @PatchMapping("/{id}/deposit")
    public ResponseEntity<?> depositFunds(
            @PathVariable Long id,
            @RequestBody TransactionRequestDTO request,
            @AuthenticationPrincipal User user
    ) {
        Account account = accountRepository.findById(id).orElse(null);
        if (account == null || !account.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Conto non trovato o non autorizzato.");
        }

        account.setBalance(account.getBalance() + request.getAmount());
        accountRepository.save(account);

        // Salvo la transazione
        Transaction tx = Transaction.builder()
                .type(Transaction.Type.DEPOSIT)
                .amount(request.getAmount())
                .timestamp(LocalDateTime.now())
                .account(account)
                .build();
        transactionRepository.save(tx);

        return ResponseEntity.ok(account);
    }

    // Preleva fondi da un conto
    @PatchMapping("/{id}/withdraw")
    public ResponseEntity<?> withdrawFunds(
            @PathVariable Long id,
            @RequestBody TransactionRequestDTO request,
            @AuthenticationPrincipal User user
    ) {
        Account account = accountRepository.findById(id).orElse(null);
        if (account == null || !account.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Conto non trovato o non autorizzato.");
        }

        if (account.getBalance() < request.getAmount()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Fondi insufficienti.");
        }

        account.setBalance(account.getBalance() - request.getAmount());
        accountRepository.save(account);

        // Salvo la transazione
        Transaction tx = Transaction.builder()
                .type(Transaction.Type.WITHDRAWAL)
                .amount(request.getAmount())
                .timestamp(LocalDateTime.now())
                .account(account)
                .build();
        transactionRepository.save(tx);

        return ResponseEntity.ok(account);
    }

    // Elenco delle transazioni di un conto
    @GetMapping("/{id}/transactions")
    public ResponseEntity<?> getAccountTransactions(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        Account account = accountRepository.findById(id).orElse(null);
        if (account == null || !account.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Conto non trovato o non autorizzato.");
        }

        return ResponseEntity.ok(transactionRepository.findByAccountId(id));
    }

    // Elimino un conto e tutti gli investimenti e transazioni associate
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        Account account = accountRepository.findById(id).orElse(null);
        if (account == null || !account.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Conto non trovato o non autorizzato.");
        }

        // Elimino gli investimenti associati
        investmentSimulationRepository.deleteAll(investmentSimulationRepository.findByAccountId(id));

        // Elimino le transazioni associate
        transactionRepository.deleteAll(transactionRepository.findByAccountId(id));

        // Elimino il conto
        accountRepository.delete(account);

        return ResponseEntity.ok("Conto eliminato con successo.");
    }
}