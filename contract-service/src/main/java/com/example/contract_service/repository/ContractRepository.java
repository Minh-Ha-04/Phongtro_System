package com.example.contract_service.repository;

import com.example.contract_service.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByRoomIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long roomId,
            Contract.Status status,
            LocalDate startDate,
            LocalDate endDate
    );
    List<Contract> findByRoomId(Long roomId);
    List<Contract> findByTenantId(Long tenantId);
    List<Contract> findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Contract.Status status, LocalDate date, LocalDate sameDate);
}
