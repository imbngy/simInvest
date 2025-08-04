package org.bngy.siminvest.repository;

import org.bngy.siminvest.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByAccountId(Long accountId);

    Transaction findFirstByAccountIdAndTypeOrderByTimestampAsc(Long id, Transaction.Type type);

    void deleteByAccountId(Long id);
}
