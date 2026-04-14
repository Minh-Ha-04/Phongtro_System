    package com.example.invoice_service.repository;

    import com.example.invoice_service.entity.InvoiceItem;
    import org.springframework.data.jpa.repository.JpaRepository;

    public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {
    }