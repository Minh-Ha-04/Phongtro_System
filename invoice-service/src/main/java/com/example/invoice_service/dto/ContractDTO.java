package com.example.invoice_service.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ContractDTO {
    public enum ContractStatus {
        ACTIVE,
        PENDING,
        COMPLETED,
        CANCELLED
    }
    private Long id;
    private Long roomId;
    private Long tenantId;
    private LocalDate startDate;
    private LocalDate endDate;
    private ContractStatus status;

}
