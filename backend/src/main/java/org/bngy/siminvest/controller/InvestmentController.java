package org.bngy.siminvest.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.bngy.siminvest.dto.InvestmentTransactionRequestDTO;
import org.bngy.siminvest.dto.SimulationRequestDTO;
import org.bngy.siminvest.model.*;
import org.bngy.siminvest.repository.AccountRepository;
import org.bngy.siminvest.repository.InvestmentSimulationRepository;
import org.bngy.siminvest.repository.TransactionRepository;
import org.bngy.siminvest.service.InvestmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/simulations")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class InvestmentController {

    private final InvestmentSimulationRepository simulationRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final InvestmentService investmentService;

    @PostMapping
    public ResponseEntity<InvestmentSimulation> simulateInvestment(
            @RequestBody SimulationRequestDTO request,
            @AuthenticationPrincipal User user
    ) {
        // Validazione base
        if (request.getAmount() <= 0 || request.getDurationMonths() <= 0 || request.getInterestRate() <= 0 ||
                request.getAsset() == null || request.getAsset().isEmpty() || request.getAccountId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        Optional<Account> optionalAccount = accountRepository.findById(request.getAccountId());
        if (optionalAccount.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); // Account non trovato
        }

        Account account = optionalAccount.get();

        // Calcolo del rendimento atteso con PAC
        double expectedReturn = investmentService.calculateExpectedReturn(
                request.getAmount(),
                request.getMonthlyContribution() != null ? request.getMonthlyContribution() : 0.0,
                request.getInterestRate(),
                request.getDurationMonths()
        );

        // Costruzione dell'investimento
        InvestmentSimulation simulation = InvestmentSimulation.builder()
                .asset(request.getAsset())
                .amount(request.getAmount())
                .monthlyContribution(request.getMonthlyContribution() != null ? request.getMonthlyContribution() : 0.0)
                .durationMonths(request.getDurationMonths())
                .interestRate(request.getInterestRate())
                .expectedReturn(expectedReturn)
                .simulatedAt(LocalDateTime.now())
                .user(user)
                .account(account)
                .confirmed(false)
                .build();

        return ResponseEntity.ok(simulationRepository.save(simulation));
    }


    // Ottengo tutte le simulazioni dell'utente
    @GetMapping
    public ResponseEntity<List<InvestmentSimulation>> getMySimulations(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(simulationRepository.findByUserId(user.getId()));
    }

    // Ottengo una simulazione specifica per ID
    @GetMapping("/{id}")
    public ResponseEntity<InvestmentSimulation> getSimulationById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        Optional<InvestmentSimulation> opt = simulationRepository.findById(id);
        if (opt.isEmpty() || !opt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(opt.get());
    }

    // Ottengo le simulazioni confermate dell'utente
    @GetMapping("/confirmed")
    public ResponseEntity<List<InvestmentSimulation>> getConfirmedSimulations(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(simulationRepository.findByUserIdAndConfirmedTrue(user.getId()));
    }

    // Ottengo le simulazioni non confermate dell'utente
    @GetMapping("/unconfirmed")
    public ResponseEntity<List<InvestmentSimulation>> getUnconfirmedSimulations(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(simulationRepository.findByUserIdAndConfirmedFalse(user.getId()));
    }

    // Ottengo le transazioni associate ad un investimento
    @GetMapping("/{id}/transactions")
    public ResponseEntity<?> getInvestmentTransactions(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        Optional<InvestmentSimulation> opt = simulationRepository.findById(id);
        if (opt.isEmpty() || !opt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Investimento non trovato");
        }
        return ResponseEntity.ok(opt.get().getTransactions());
    }

    // Conferma un investimento, spostando i fondi dal conto dell'utente
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<?> confirmInvestment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        Optional<InvestmentSimulation> opt = simulationRepository.findById(id);
        if (opt.isEmpty() || !opt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Investimento non trovato");
        }

        InvestmentSimulation investment = opt.get();
        if (investment.isConfirmed()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Investimento già confermato.");
        }

        // Verifico se l'utente ha un conto associato all'investimento
        Account account = investment.getAccount();
        if (account == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Nessun conto associato all'investimento.");
        }

        // Verifico se il conto ha fondi sufficienti
        if (account.getBalance() < investment.getAmount()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Fondi insufficienti nel conto.");
        }

        // Sposto i fondi dal conto all'investimento
        account.setBalance(account.getBalance() - investment.getAmount());
        accountRepository.save(account);

        // Registro la transazione di prelievo dal conto
        Transaction tx = Transaction.builder()
                .type(Transaction.Type.WITHDRAWAL)
                .amount(investment.getAmount())
                .timestamp(LocalDateTime.now())
                .account(account)
                .build();
        transactionRepository.save(tx);

        // Registro la transazione di investimento -> deposito nell'investimento
        InvestmentTransaction itx = InvestmentTransaction.builder()
                .type(InvestmentTransaction.Type.DEPOSIT)
                .amount(investment.getAmount())
                .timestamp(LocalDateTime.now())
                .investment(investment)
                .build();
        investment.getTransactions().add(itx);
        simulationRepository.save(investment);

        // Confermo l'investimento
        investment.setConfirmed(true);
        investment.setCreatedAt(LocalDateTime.now());
        investment.setPacMonthsPaid(0);
        simulationRepository.save(investment);

        return ResponseEntity.ok(investment);
    }


    // Elimino un investimento e sposto i fondi verso il conto dell'utente se l'investimento è confermato
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInvestment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        Optional<InvestmentSimulation> opt = simulationRepository.findById(id);
        if (opt.isEmpty() || !opt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Investimento non trovato");
        }

        InvestmentSimulation investment = opt.get();
        Account account = investment.getAccount();

        if (account == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Nessun conto associato all'investimento.");
        }

        if (investment.isConfirmed()) {
            // Solo se l'investimento è confermato restituisco i fondi
            account.setBalance(account.getBalance() + investment.getAmount());
            accountRepository.save(account);

            // Transazione di ritorno
            Transaction tx = Transaction.builder()
                    .type(Transaction.Type.DEPOSIT)
                    .amount(investment.getAmount())
                    .timestamp(LocalDateTime.now())
                    .account(account)
                    .build();
            transactionRepository.save(tx);
        }

        // In ogni caso, elimino l'investimento
        simulationRepository.delete(investment);
        return ResponseEntity.ok("Investimento eliminato" + (investment.isConfirmed() ? " e fondi restituiti." : "."));
    }

    // Prelievo di fondi da un investimento verso un conto
    @PostMapping("/{id}/withdraw")
    public ResponseEntity<?> withdrawFromInvestment(
            @PathVariable Long id,
            @RequestBody InvestmentTransactionRequestDTO request,
            @AuthenticationPrincipal User user
    ) {
        Optional<InvestmentSimulation> opt = simulationRepository.findById(id);
        if (opt.isEmpty() || !opt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Investimento non trovato");
        }

        InvestmentSimulation investment = opt.get();
        if (!investment.isConfirmed()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Solo investimenti confermati possono essere prelevati.");
        }

        double amount = request.getAmount();
        if (amount <= 0 || investment.getAmount() < amount) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Importo non valido o fondi insufficienti.");
        }

        // Blocco i prelievi prima di metà durata
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime unlockDate = investment.getSimulatedAt().plusMonths(investment.getDurationMonths() / 2);

        if (now.isBefore(unlockDate)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Non puoi prelevare prima che siano trascorsi almeno metà dei mesi previsti.");
        }

        // Sposto i fondi prelevati verso il conto dell'utente
        Account account = investment.getAccount();
        if (account == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Nessun conto associato all'investimento.");
        }

        investment.setAmount(investment.getAmount() - amount);
        account.setBalance(account.getBalance() + amount);
        accountRepository.save(account);

        // Registro la transazione di deposito sul conto
        Transaction Dtx = Transaction.builder()
                .type(Transaction.Type.DEPOSIT)
                .amount(amount)
                .timestamp(now)
                .account(account)
                .build();
        transactionRepository.save(Dtx);

        // Registro la transazione di prelievo
        InvestmentTransaction tx = InvestmentTransaction.builder()
                .type(InvestmentTransaction.Type.WITHDRAWAL)
                .amount(amount)
                .timestamp(now)
                .investment(investment)
                .build();

        investment.getTransactions().add(tx);
        simulationRepository.save(investment);

        return ResponseEntity.ok(investment);
    }


    // Deposito di fondi su un investimento da conto collegato ad esso
    @PostMapping("/{id}/deposit")
    public ResponseEntity<?> depositToInvestment(
            @PathVariable Long id,
            @RequestBody InvestmentTransactionRequestDTO request,
            @AuthenticationPrincipal User user
    ) {
        Optional<InvestmentSimulation> opt = simulationRepository.findById(id);
        if (opt.isEmpty() || !opt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Investimento non trovato");
        }

        InvestmentSimulation investment = opt.get();
        if (!investment.isConfirmed()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Solo investimenti confermati possono ricevere depositi.");
        }

        double amount = request.getAmount();
        if (amount <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("L'importo deve essere positivo.");
        }

        // sposto i fondi depositati verso l'investimento
        Account account = investment.getAccount();
        if (account == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Nessun conto associato all'investimento.");
        }
        if (account.getBalance() < amount) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Fondi insufficienti nel conto.");
        }

        account.setBalance(account.getBalance() - amount);
        investment.setAmount(investment.getAmount() + amount);
        accountRepository.save(account);
        // Registro la transazione di prelievo dal conto
        Transaction tx = Transaction.builder()
                .type(Transaction.Type.WITHDRAWAL)
                .amount(amount)
                .timestamp(LocalDateTime.now())
                .account(account)
                .build();
        transactionRepository.save(tx);
        // Registro la transazione di deposito nell'investimento
        InvestmentTransaction itx = InvestmentTransaction.builder()
                .type(InvestmentTransaction.Type.DEPOSIT)
                .amount(amount)
                .timestamp(LocalDateTime.now())
                .investment(investment)
                .build();
        investment.getTransactions().add(itx);
        simulationRepository.save(investment);
        return ResponseEntity.ok(investment);

    }



}
