package com.example.contract_service.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateContractRequest {

    private Tenant tenant;   // gửi thông tin tenant mới
    private Long roomId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalAmount;
}