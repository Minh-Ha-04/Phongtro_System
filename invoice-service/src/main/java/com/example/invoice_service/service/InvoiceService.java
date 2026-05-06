package com.example.invoice_service.service;

import com.example.invoice_service.dto.*;
import com.example.invoice_service.entity.*;
import com.example.invoice_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final UtilityPriceRepository utilityPriceRepository;
    private final RestTemplate restTemplate;

    @Value("${room-service.url:http://localhost:8081}")
    private String roomServiceUrl;

    // 1. Nhập chỉ số điện nước (Cập nhật nếu đã tồn tại)
    public MeterReading saveMeterReading(MeterReading reading) {
        log.info("[INVOICE-SERVICE] Lưu chỉ số điện nước cho phòng : {}, Tháng: {}/{}", reading.getRoomId(),
                reading.getMonth(), reading.getYear());
        return meterReadingRepository
                .findByRoomIdAndMonthAndYear(reading.getRoomId(), reading.getMonth(), reading.getYear())
                .map(existing -> {
                    log.info("[INVOICE-SERVICE] Cập nhật chỉ số điện nước  ID: {}", existing.getId());
                    existing.setElectricityOld(reading.getElectricityOld());
                    existing.setElectricityNew(reading.getElectricityNew());
                    existing.setWaterOld(reading.getWaterOld());
                    existing.setWaterNew(reading.getWaterNew());
                    existing.setReadingDate(LocalDate.now());
                    return meterReadingRepository.save(existing);
                })
                .orElseGet(() -> {
                    log.info("[INVOICE-SERVICE] Tạo mới chỉ số điện nước cho phòng  ID: {}", reading.getRoomId());
                    reading.setReadingDate(LocalDate.now());
                    return meterReadingRepository.save(reading);
                });
    }

    // 2. Tạo hóa đơn cho 1 phòng
    @Transactional
    public Invoice generateInvoice(InvoiceGenerateRequest request) {
        Long roomId = request.getRoomId();
        Integer month = request.getMonth();
        Integer year = request.getYear();

        log.info("[INVOICE-SERVICE] Tạo hóa đơn mới cho phòng  {} cho {}/{}", roomId, month, year);

        // Kiểm tra hóa đơn đã tồn tại
        if (invoiceRepository.findByRoomIdAndMonthAndYear(roomId, month, year).isPresent()) {
            log.warn("[INVOICE-SERVICE] Hóa đơn đã tồn taị {} tháng : {}", roomId, month);
            throw new RuntimeException("Hóa đơn đã tồn tại");
        }

        // Gọi Room Service để lấy thông tin phòng
        log.info("[INVOICE-SERVICE] ----> [GET] Calling ROOM-SERVICE: {}/rooms/{}", roomServiceUrl, roomId);
        RoomDTO room = restTemplate.getForObject(roomServiceUrl + "/rooms/" + roomId, RoomDTO.class);
        log.info("[INVOICE-SERVICE] <---- [RESULT] From ROOM-SERVICE: RoomNumber={}, Price={}", room.getRoomNumber(),
                room.getRentPrice());

        // Lấy chỉ số điện nước
        log.info("[INVOICE-SERVICE] Tìm thấy số điện nước  Room: {} Month: {}", roomId, month);
        MeterReading reading = meterReadingRepository.findByRoomIdAndMonthAndYear(roomId, month, year)
                .orElseThrow(() -> new RuntimeException("Chưa nhập chỉ số điện nước"));

        // Lấy giá điện nước (Dùng mặc định nếu chưa có)
        LocalDate date = LocalDate.of(year, month, 1);
        log.info("[INVOICE-SERVICE] Giá điện nước cho ngày : {}", date);
        UtilityPrice price = utilityPriceRepository
                .findFirstByEffectiveFromLessThanEqualOrderByEffectiveFromDescIdDesc(date)
                .orElseGet(() -> {
                    log.warn("[INVOICE-SERVICE] Không có giá điện nước {}, dùng mặc định", date);
                    UtilityPrice defaultP = new UtilityPrice();
                    defaultP.setElectricityPricePerKwh(3000.0);
                    defaultP.setWaterPricePerCube(15000.0);
                    return defaultP;
                });

        // Tính tiền điện, nước
        double elecUsed = reading.getElectricityNew() - reading.getElectricityOld();
        double waterUsed = reading.getWaterNew() - reading.getWaterOld();
        double elecAmount = elecUsed * price.getElectricityPricePerKwh();
        double waterAmount = waterUsed * price.getWaterPricePerCube();

        Invoice invoice = new Invoice();
        invoice.setRoomId(roomId);
        invoice.setMonth(month);
        invoice.setYear(year);
        invoice.setRentAmount(room.getRentPrice());
        invoice.setElectricityAmount(elecAmount);
        invoice.setWaterAmount(waterAmount);

        double totalExtra = 0;
        if (request.getExtraServices() != null) {
            totalExtra = request.getExtraServices().stream().mapToDouble(ExtraService::getAmount).sum();
        }
        invoice.setTotalAmount(room.getRentPrice() + elecAmount + waterAmount + totalExtra);
        invoice.setStatus("UNPAID");

        log.info("[INVOICE-SERVICE] Lưu hóa đơn . Tổng  {}", invoice.getTotalAmount());
        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getByRoom(Long roomId) {
        return invoiceRepository.findByRoomIdOrderByYearDescMonthDesc(roomId);
    }

    public Invoice payInvoice(Long id) {
        log.info("[INVOICE-SERVICE] Trả hóa đơn  {}", id);
        Invoice invoice = invoiceRepository.findById(id).orElseThrow();
        invoice.setStatus("PAID");
        invoice.setPaymentDate(LocalDate.now());
        return invoiceRepository.save(invoice);
    }

    // 7. Lấy giá hiện tại hoặc giá mặc định
    public UtilityPrice getCurrentPrice() {
        return utilityPriceRepository
                .findFirstByEffectiveFromLessThanEqualOrderByEffectiveFromDescIdDesc(LocalDate.now())
                .orElseGet(() -> {
                    UtilityPrice defaultPrice = new UtilityPrice();
                    defaultPrice.setElectricityPricePerKwh(3000.0);
                    defaultPrice.setWaterPricePerCube(15000.0);
                    defaultPrice.setEffectiveFrom(LocalDate.of(2000, 1, 1));
                    return defaultPrice;
                });
    }

    public UtilityPrice updateUtilityPrice(UtilityPrice newPrice) {
        log.info("[INVOICE-SERVICE] Cập nhật giá điện nước Điện={}, Nước={}",
                newPrice.getElectricityPricePerKwh(), newPrice.getWaterPricePerCube());
        newPrice.setEffectiveFrom(LocalDate.now());
        return utilityPriceRepository.save(newPrice);
    }

    public List<RevenueDTO> getRevenueByRoom() {
        return invoiceRepository.getRevenueByRoom();
    }
}