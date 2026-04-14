package com.example.invoice_service.controller;

import com.example.invoice_service.dto.InvoiceGenerateRequest;
import com.example.invoice_service.dto.RevenueDTO;
import com.example.invoice_service.entity.Invoice;
import com.example.invoice_service.entity.MeterReading;
import com.example.invoice_service.entity.UtilityPrice;
import com.example.invoice_service.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService invoiceService;

    @PostMapping("/generate")
    public ResponseEntity<Invoice> generateInvoice(@RequestBody InvoiceGenerateRequest request) {
        return ResponseEntity.ok(invoiceService.generateInvoice(request));
    }

    @PostMapping("/input-meter")
    public ResponseEntity<MeterReading> inputMeterReading(@RequestBody MeterReading reading) {
        return ResponseEntity.ok(invoiceService.saveMeterReading(reading));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<Invoice>> getByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(invoiceService.getByRoom(roomId));
    }

    @PutMapping("/pay/{id}")
    public ResponseEntity<Invoice> payInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.payInvoice(id));
    }

    @GetMapping("/utility-price/current")
    public ResponseEntity<UtilityPrice> getCurrentUtilityPrice() {
        return ResponseEntity.ok(invoiceService.getCurrentPrice());
    }

    @PostMapping("/utility-price")
    public ResponseEntity<UtilityPrice> updateUtilityPrice(@RequestBody UtilityPrice price) {
        return ResponseEntity.ok(invoiceService.updateUtilityPrice(price));
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<RevenueDTO>> getRevenueByRoom() {
        return ResponseEntity.ok(invoiceService.getRevenueByRoom());
    }
}