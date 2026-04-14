package com.example.room_service.service;

import com.example.room_service.entity.Room;

import java.util.List;
import java.util.Optional;

public interface RoomService {
    List<Room> getAll();
    Optional<Room> getById(Long id);
    Room create(Room room);
    Optional<Room> update(Long id, Room room);
    boolean delete(Long id);
}
