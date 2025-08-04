package org.bngy.siminvest.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentSimulation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String asset;
    private double amount;
    private int durationMonths;
    private double interestRate;

    private LocalDateTime simulatedAt;

    private double expectedReturn;

    @Column(nullable = false)
    private boolean confirmed = false;

    @Column(name="monthlyContribution")
    private Double monthlyContribution;

    @Column(name="pacMonthsPaid")
    private int pacMonthsPaid = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonManagedReference
    private User user;

    @ManyToOne
    @JoinColumn(name = "account_id")
    @JsonManagedReference
    private Account account;

    @OneToMany(mappedBy = "investment", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<InvestmentTransaction> transactions = new ArrayList<>();

}

