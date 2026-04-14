package com.example.contract_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "contracts")
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long roomId;
    private Long tenantId;

    private LocalDate startDate;
    private LocalDate endDate;

    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        ACTIVE,
        PENDING,
        COMPLETED,
        CANCELLED
    }
}