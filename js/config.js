// ============================================================
//  config.js — Cau hinh & State toan cuc
// ============================================================

const API_BASE = 'http://localhost:30080';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

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

// Bien noi bo cho modal hoa don
let _currentInvoiceRoomId = null;
