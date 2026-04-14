package com.example.invoice_service.repository;

import com.example.invoice_service.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.example.invoice_service.dto.RevenueDTO;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByRoomIdAndMonthAndYear(Long roomId, int month, int year);
    List<Invoice> findByRoomIdOrderByYearDescMonthDesc(Long roomId);

    @Query("SELECT new com.example.invoice_service.dto.RevenueDTO(i.roomId, SUM(i.totalAmount)) " +
           "FROM Invoice i WHERE i.status = 'PAID' GROUP BY i.roomId")
    List<RevenueDTO> getRevenueByRoom();
}