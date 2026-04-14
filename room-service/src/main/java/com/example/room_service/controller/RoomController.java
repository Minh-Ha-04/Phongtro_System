package com.example.room_service.controller;

import com.example.room_service.entity.Room;
import com.example.room_service.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
@Slf4j
public class RoomController {

    private final RoomService roomService;

    // GET ALL
    @GetMapping
    public List<Room> getAll() {
        log.info("[ROOM-SERVICE] Received request to GET ALL rooms");
        return roomService.getAll();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Room> getById(@PathVariable Long id) {
        log.info("[ROOM-SERVICE] Received request to GET room by ID: {}", id);
        return roomService.getById(id)
                .map(room -> {
                    log.info("[ROOM-SERVICE] Found room: {}", room.getRoomNumber());
                    return ResponseEntity.ok(room);
                })
                .orElseGet(() -> {
                    log.warn("[ROOM-SERVICE] Room not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    // CREATE
    @PostMapping
    public Room create(@RequestBody Room r) {
        log.info("[ROOM-SERVICE] Received request to CREATE room: {}", r.getRoomNumber());
        return roomService.create(r);
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Room> update(@PathVariable Long id, @RequestBody Room r) {
        log.info("[ROOM-SERVICE] Received request to UPDATE room ID: {}", id);
        return roomService.update(id, r)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("[ROOM-SERVICE] Received request to DELETE room ID: {}", id);
        if (!roomService.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }
}