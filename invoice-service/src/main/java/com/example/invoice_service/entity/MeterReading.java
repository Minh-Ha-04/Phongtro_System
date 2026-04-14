package com.example.invoice_service.entity;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

// package com.example.invoice_service.entity;
@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"roomId", "month", "year"}))
@Data
public class MeterReading {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long roomId;
    private Integer month;
    private Integer year;
    private Double electricityOld;
    private Double electricityNew;
    private Double waterOld;
    private Double waterNew;
    private LocalDate readingDate;

}
