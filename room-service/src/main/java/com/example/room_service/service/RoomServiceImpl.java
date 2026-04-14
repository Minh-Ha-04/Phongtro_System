package com.example.room_service.service;

import com.example.room_service.entity.Room;
import com.example.room_service.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository repo;

    @Override
    public List<Room> getAll() {
        return repo.findAll();
    }

    @Override
    public Optional<Room> getById(Long id) {
        return repo.findById(id);
    }

    @Override
    public Room create(Room room) {
        return repo.save(room);
    }

    @Override
    public Optional<Room> update(Long id, Room room) {
        return repo.findById(id).map(existing -> {
            existing.setRoomNumber(room.getRoomNumber());
            existing.setArea(room.getArea());
            existing.setFloor(room.getFloor());
            existing.setRentPrice(room.getRentPrice());
            existing.setDescription(room.getDescription());
            existing.setNote(room.getNote());
            return repo.save(existing);
        });
    }

    @Override
    public boolean delete(Long id) {
        if (!repo.existsById(id)) {
            return false;
        }
        repo.deleteById(id);
        return true;
    }
}
