package com.example.tenant_service.service;

import com.example.tenant_service.entity.Tenant;
import com.example.tenant_service.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {

    private final TenantRepository repo;

    @Override
    public Tenant create(Tenant t) {
        return repo.save(t);
    }

    @Override
    public List<Tenant> getAll() {
        return repo.findAll();
    }

    @Override
    public Optional<Tenant> getById(Long id) {
        return repo.findById(id);
    }

    @Override
    public Optional<Tenant> update(Long id, Tenant t) {
        return repo.findById(id).map(existing -> {
            existing.setName(t.getName());
            existing.setPhone(t.getPhone());
            existing.setEmail(t.getEmail());
            existing.setAddress(t.getAddress());
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
