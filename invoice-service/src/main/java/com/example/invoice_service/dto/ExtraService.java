package com.example.invoice_service.dto;

import lombok.Data;

@Data
public class ExtraService {
    private String name;      // tên dịch vụ, ví dụ "Phí vệ sinh"
    private Double amount;    // số tiền
}