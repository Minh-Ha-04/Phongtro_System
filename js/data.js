// ============================================================
//  data.js — Data layer: load, cache, getters, stats
// ============================================================

/**
 * Load tất cả dữ liệu ban đầu song song
 */
async function loadAllData() {
  try {
    const [rooms, contracts, tenants] = await apiCallAll([
      ['/rooms', {}, []],
      ['/contracts', {}, []],
      ['/tenants', {}, []],
    ]);

    state.rooms = rooms;
    state.contracts = contracts;
    state.selectedRoomId = null;
    state.selectedRoom = null;

    state.tenantsMap = {};
    tenants.forEach(t => { state.tenantsMap[t.id] = t; });

    // Xây dựng contractsByRoom
    state.contractsByRoom = {};
    contracts.forEach(c => {
      if (!state.contractsByRoom[c.roomId]) state.contractsByRoom[c.roomId] = [];
      state.contractsByRoom[c.roomId].push(c);
    });

    // Active contracts
    state.activeContracts = contracts.filter(isContractActive);

    // Load invoices cho tất cả phòng
    const invoiceRequests = rooms.map(r => [`/invoices/room/${r.id}`, {}, []]);
    const invoiceResults = await apiCallAll(invoiceRequests);
    state.invoicesByRoom = {};
    invoiceResults.forEach((invs, i) => {
      state.invoicesByRoom[rooms[i].id] = invs;
    });

    updateStats();
    renderRooms(); // ✅ chỉ gọi render, không truyền callback
  } catch (err) {
    showToast('Lỗi tải dữ liệu: ' + err.message, 'error');
  }
}

/** =========================
 *  UPDATE STATS
 *  ========================= */
function updateStats() {
  const {
    rooms,
    activeContracts,
    invoicesByRoom,
    selectedRoomId
  } = state;

  // ========================
  // 👉 CASE 1: 1 PHÒNG
  // ========================
  if (selectedRoomId) {
    const invs = invoicesByRoom[selectedRoomId] || [];

    const revenue = invs.reduce((sum, inv) => {
      return inv.status === 'PAID'
        ? sum + (inv.totalAmount || 0)
        : sum;
    }, 0);

    setText('totalRoomsStat', 1);
    setText(
      'occupiedRoomsStat',
      activeContracts.some(c => c.roomId === selectedRoomId) ? 1 : 0
    );
    setText('monthlyRevenueStat', fmt(revenue));
    return;
  }

  // ========================
  // 👉 CASE 2: TOÀN HỆ THỐNG
  // ========================
  const occupiedRoomIds = new Set(activeContracts.map(c => c.roomId));

  let totalRevenue = 0;

  rooms.forEach(room => {
    const invs = invoicesByRoom[room.id] || [];

    invs.forEach(inv => {
      if (inv.status === 'PAID') {
        totalRevenue += inv.totalAmount || 0;
      }
    });
  });

  setText('totalRoomsStat', rooms.length);
  setText('occupiedRoomsStat', occupiedRoomIds.size);
  setText('monthlyRevenueStat', fmt(totalRevenue));
}

/** =========================
 *  GETTERS
 *  ========================= */



/** Lấy hóa đơn tháng hiện tại */
function getCurrentInvoice(roomId) {
  const { currentMonth, currentYear } = state;

  return (state.invoicesByRoom[roomId] || []).find(
    i => i.month === currentMonth && i.year === currentYear
  ) || null;
}

/** Doanh thu 1 phòng (tổng tất cả thời gian) */
function calcRoomRevenue(roomId) {
  return (state.invoicesByRoom[roomId] || [])
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + (i.totalAmount || 0), 0);
}