package com.example.room_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomNumber;
    private Double area;
    private Integer floor;
    private Double rentPrice;
    private String description;
    @Column(length = 500)
    private String note; //
}