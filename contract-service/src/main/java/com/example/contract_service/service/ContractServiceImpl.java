package com.example.contract_service.service;

import com.example.contract_service.dto.CreateContractRequest;
import com.example.contract_service.dto.Room;
import com.example.contract_service.dto.Tenant;
import com.example.contract_service.entity.Contract;
import com.example.contract_service.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContractServiceImpl implements ContractService {

    private final ContractRepository repo;
    private final RestTemplate restTemplate;

    @Value("${room-service.url:http://localhost:8081}")
    private String roomServiceUrl;

    @Value("${tenant-service.url:http://localhost:8082}")
    private String tenantServiceUrl;

    @Override
    public Contract createFull(CreateContractRequest req) {
        log.info("[CONTRACT-SERVICE] Tạo hợp đồng cho phòng  {}", req.getRoomId());
        
        try {
            log.info("[CONTRACT-SERVICE] ----> [GET] Calling ROOM-SERVICE: {}/rooms/{}", roomServiceUrl, req.getRoomId());
            ResponseEntity<Room> roomRes = restTemplate.getForEntity(
                    roomServiceUrl + "/rooms/" + req.getRoomId(),
                    Room.class
            );

            if (!roomRes.getStatusCode().is2xxSuccessful() || roomRes.getBody() == null) {
                log.error("[CONTRACT-SERVICE] Không tìm thấy phòng ");
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Phòng không tồn tại");
            }
            log.info("[CONTRACT-SERVICE] <---- [RESULT] Room OK: {}", roomRes.getBody().getRoomNumber());

        } catch (Exception e) {
            log.error("[CONTRACT-SERVICE] Room service error: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Room service lỗi");
        }

        Tenant createdTenant;
        try {
            log.info("[CONTRACT-SERVICE] ----> [POST] Gọi sang TENANT-SERVICE để tạo khách hàng mới: {}", req.getTenant().getName());
            createdTenant = restTemplate.postForObject(
                    tenantServiceUrl + "/tenants",
                    req.getTenant(),
                    Tenant.class
            );
            log.info("[CONTRACT-SERVICE] <---- [RESULT] Tạo khách hàng với ID : {}", createdTenant != null ? createdTenant.getId() : "null");
        } catch (Exception e) {
            log.error("[CONTRACT-SERVICE] Tenant service lỗi: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Tenant service lỗi");
        }

        if (createdTenant == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không tạo được khách hàng");
        }

        Contract c = new Contract();
        c.setRoomId(req.getRoomId());
        c.setTenantId(createdTenant.getId());
        c.setStartDate(req.getStartDate());
        c.setEndDate(req.getEndDate());
        c.setTotalAmount(req.getTotalAmount());

        log.info("[CONTRACT-SERVICE] Kiểm tra các hợp đồng chồng chéo...");
        List<Contract> overlap = repo
                .findByRoomIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        c.getRoomId(),
                        Contract.Status.ACTIVE,
                        c.getEndDate(),
                        c.getStartDate()
                );

        if (!overlap.isEmpty()) {
            log.warn("[CONTRACT-SERVICE] PHòng bị chồng chéo :{}", c.getRoomId());
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Phòng đã có hợp đồng ACTIVE trong khoảng thời gian này"
            );
        }

        c.setStatus(Contract.Status.ACTIVE);
        log.info("[CONTRACT-SERVICE] Hợp đồng đã được tạo và kích hoạt thành công.");
        return repo.save(c);
    }

    @Override
    public List<Contract> getAll() {
        return repo.findAll();
    }

    @Override
    public List<Contract> getByRoom(Long roomId) {
        log.info("[CONTRACT-SERVICE] Tìm kiếm hợp đồng cho phòng : {}", roomId);
        return repo.findByRoomId(roomId);
    }

    @Override
    public List<Contract> getByTenant(Long tenantId) {
        return repo.findByTenantId(tenantId);
    }

    @Override
    public Contract cancel(Long id) {
        log.info("[CONTRACT-SERVICE] Cancelling contract ID: {}", id);
        Contract contract = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy contract"));

        if (contract.getStatus() != Contract.Status.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Chỉ hợp đồng ACTIVE mới được hủy");
        }

        contract.setStatus(Contract.Status.CANCELLED);
        log.info("[CONTRACT-SERVICE] Hợp đồng ID: {} đã bị hủy ", id);
        return repo.save(contract);
    }

    @Override
    public List<Contract> getActiveContracts(LocalDate date) {
        return repo.findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                Contract.Status.ACTIVE, date, date);
    }

    @Override
    public Contract updateFull(Long id, CreateContractRequest req) {
        log.info("[CONTRACT-SERVICE] Updating contract ID: {}", id);
        Contract existing = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy contract"));

        if (existing.getStatus() == Contract.Status.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Không thể sửa hợp đồng đã hủy");
        }

        try {
            restTemplate.getForEntity(
                    roomServiceUrl + "/rooms/" + existing.getRoomId(),
                    Room.class
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE, "Room service lỗi");
        }

        try {
            log.info("[CONTRACT-SERVICE] ----> [PUT] Cập nhật khách hàng trong TENANT-SERVICE: {}", existing.getTenantId());
            restTemplate.put(
                    tenantServiceUrl + "/tenants/" + existing.getTenantId(),
                    req.getTenant()
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE, "Tenant service lỗi");
        }

        List<Contract> overlap = repo
                .findByRoomIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        existing.getRoomId(),
                        Contract.Status.ACTIVE,
                        req.getEndDate(),
                        req.getStartDate()
                ).stream()
                .filter(c -> !c.getId().equals(id))
                .toList();

        if (!overlap.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Trùng thời gian với contract khác");
        }

        existing.setStartDate(req.getStartDate());
        existing.setEndDate(req.getEndDate());
        existing.setTotalAmount(req.getTotalAmount());

        return repo.save(existing);
    }

    @Override
    public void deleteContract(Long id) {
        log.info("[CONTRACT-SERVICE] Xóa hợp đồng ID: {}", id);
        Contract contract = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy contract"));

        if (contract.getStatus() == Contract.Status.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể xóa hợp đồng đang hiệu lực. Hãy hủy trước.");
        }

        repo.deleteById(id);
    }
}
