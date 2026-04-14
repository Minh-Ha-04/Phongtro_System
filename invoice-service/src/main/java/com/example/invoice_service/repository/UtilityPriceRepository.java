package com.example.invoice_service.repository;

import com.example.invoice_service.entity.UtilityPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface UtilityPriceRepository extends JpaRepository<UtilityPrice, Long> {
    // Sắp xếp theo ngày giảm dần, nếu cùng ngày thì lấy ID lớn nhất (mới nhất)
    Optional<UtilityPrice> findFirstByEffectiveFromLessThanEqualOrderByEffectiveFromDescIdDesc(LocalDate date);
}