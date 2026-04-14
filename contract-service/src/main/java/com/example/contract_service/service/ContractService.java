package com.example.contract_service.service;

import com.example.contract_service.dto.CreateContractRequest;
import com.example.contract_service.entity.Contract;
import java.time.LocalDate;
import java.util.List;

public interface ContractService {
    Contract createFull(CreateContractRequest req);
    List<Contract> getAll();
    List<Contract> getByRoom(Long roomId);
    List<Contract> getByTenant(Long tenantId);
    Contract cancel(Long id);
    List<Contract> getActiveContracts(LocalDate date);
    Contract updateFull(Long id, CreateContractRequest req);
    void deleteContract(Long id);
}
