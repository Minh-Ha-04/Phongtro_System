package com.example.invoice_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "utility_prices")
@Data
public class UtilityPrice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double electricityPricePerKwh;  // giá điện (VNĐ/kWh)
    private Double waterPricePerCube;       // giá nước (VNĐ/m3)
    private LocalDate effectiveFrom;        // áp dụng từ ngày
    private LocalDate effectiveTo;          // có thể null nếu đang áp dụng
}