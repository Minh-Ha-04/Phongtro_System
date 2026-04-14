package com.example.invoice_service.dto;


import lombok.Data;
import java.util.List;

@Data
public class InvoiceGenerateRequest {
    private Long roomId;
    private int month;
    private int year;
    private List<ExtraService> extraServices; // danh sách dịch vụ khác
}
