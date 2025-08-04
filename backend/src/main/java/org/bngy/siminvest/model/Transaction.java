package org.bngy.siminvest.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public enum Type {
        DEPOSIT, WITHDRAWAL
    }

    @Enumerated(EnumType.STRING)
    private Type type;

    private double amount;

    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "account_id")
    @JsonBackReference
    private Account account;
}
