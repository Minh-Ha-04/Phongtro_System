package com.example.tenant_service.controller;

import com.example.tenant_service.entity.Tenant;
import com.example.tenant_service.service.TenantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tenants")
@RequiredArgsConstructor
@Slf4j
public class TenantController {

    private final TenantService service;

    @PostMapping
    public Tenant create(@RequestBody Tenant t) {
        log.info("[TENANT-SERVICE] Tạo khách  {}", t.getName());
        return service.create(t);
    }

    @GetMapping
    public List<Tenant> getAll() {
        log.info("[TENANT-SERVICE] Lấy danh sách tất cả khách hàng");
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tenant> getById(@PathVariable Long id) {
        log.info("[TENANT-SERVICE] Lấy khách  ID: {}", id);
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tenant> update(@PathVariable Long id, @RequestBody Tenant t) {
        log.info("[TENANT-SERVICE] Cập nhật khách  ID: {}", id);
        return service.update(id, t)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("[TENANT-SERVICE] Xóa khách ID: {}", id);
        if (!service.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }
}