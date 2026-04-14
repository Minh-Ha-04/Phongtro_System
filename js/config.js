// ============================================================
//  config.js — Cấu hình & State toàn cục
// ============================================================

const API_BASE = 'http://localhost:30080';

const state = {
  rooms:           [],
  contracts:       [],
  activeContracts: [],
  invoicesByRoom:  {},   // roomId -> Invoice[]
  tenantsMap:      {},   // tenantId -> Tenant
  selectedRoom:    null,
  currentFilter:   'all',
  currentMonth:    new Date().getMonth() + 1,
  currentYear:     new Date().getFullYear(),
};

// Biến nội bộ cho modal hóa đơn
let _currentInvoiceRoomId = null;
