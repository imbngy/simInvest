package org.bngy.siminvest.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private double balance;

    @Column(name = "last_interest_applied_at")
    private LocalDateTime lastInterestAppliedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}