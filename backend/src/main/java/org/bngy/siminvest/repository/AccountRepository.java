package org.bngy.siminvest.repository;

import org.bngy.siminvest.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserId(Long userId);

    Optional<Account> findById(Long accountId);
}