package com.example.contract_service.controller;

import com.example.contract_service.dto.CreateContractRequest;
import com.example.contract_service.entity.Contract;
import com.example.contract_service.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/contracts")
public class ContractController {

    private final ContractService service;

    @PostMapping("/full")
    public Contract createFull(@RequestBody CreateContractRequest req) {
        return service.createFull(req);
    }

    @GetMapping
    public List<Contract> getAll() {
        return service.getAll();
    }

    @GetMapping("/room/{roomId}")
    public List<Contract> getByRoom(@PathVariable Long roomId) {
        return service.getByRoom(roomId);
    }

    @GetMapping("/tenant/{tenantId}")
    public List<Contract> getByTenant(@PathVariable Long tenantId) {
        return service.getByTenant(tenantId);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Contract> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(service.cancel(id));
    }

    @GetMapping("/active")
    public List<Contract> getActiveContracts(@RequestParam LocalDate date) {
        return service.getActiveContracts(date);
    }

    @PutMapping("/{id}/full")
    public ResponseEntity<Contract> updateFull(
            @PathVariable Long id,
            @RequestBody CreateContractRequest req) {
        return ResponseEntity.ok(service.updateFull(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContract(@PathVariable Long id) {
        service.deleteContract(id);
        return ResponseEntity.noContent().build();
    }
}