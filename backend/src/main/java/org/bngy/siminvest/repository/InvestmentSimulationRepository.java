package org.bngy.siminvest.repository;

import org.bngy.siminvest.model.InvestmentSimulation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvestmentSimulationRepository extends JpaRepository<InvestmentSimulation, Long> {
    List<InvestmentSimulation> findByUserId(Integer userId);

    List<InvestmentSimulation> findByUserIdAndConfirmedTrue(Integer id);

    List<InvestmentSimulation> findByUserIdAndConfirmedFalse(Integer id);

    List<InvestmentSimulation> findByAccountId(Long id);

    List<InvestmentSimulation> findByConfirmedTrue();

    void deleteByAccountId(Long id);
}