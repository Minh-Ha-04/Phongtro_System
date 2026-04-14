package com.example.invoice_service.dto;

import lombok.Data;

@Data
public class RoomDTO {
    private Long id;
    private String roomNumber;
    private Double rentPrice;
}