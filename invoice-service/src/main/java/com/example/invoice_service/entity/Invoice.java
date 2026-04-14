package com.example.invoice_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long roomId;
    private Double totalAmount;
    private int month;
    private int year;
    private String status; // PENDING, PAID
    private LocalDate paymentDate;
    private Double rentAmount;
    private Double electricityAmount;
    private Double waterAmount;
}