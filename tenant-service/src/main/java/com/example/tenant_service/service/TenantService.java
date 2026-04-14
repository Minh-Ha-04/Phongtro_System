package com.example.tenant_service.service;

import com.example.tenant_service.entity.Tenant;
import java.util.List;
import java.util.Optional;

public interface TenantService {
    Tenant create(Tenant t);
    List<Tenant> getAll();
    Optional<Tenant> getById(Long id);
    Optional<Tenant> update(Long id, Tenant t);
    boolean delete(Long id);
}
