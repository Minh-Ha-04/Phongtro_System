package com.example.contract_service.dto;

import lombok.Data;

@Data
public class Tenant {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String identityNumber;
}