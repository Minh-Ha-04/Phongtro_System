// ============================================================
//  render.js — Render layer: danh sách phòng & panel chi tiết
//  Phụ thuộc: config.js · utils.js · data.js · actions.js
// ============================================================

/** Render danh sách phòng theo search + filter hiện tại */
function renderRooms() {
  const searchTerm = document.getElementById('roomSearch').value.toLowerCase();
  const container  = document.getElementById('roomList');

  let filtered = state.rooms.filter(r =>
    r.roomNumber.toLowerCase().includes(searchTerm)
  );

  if (state.currentFilter !== 'all') {
    filtered = filtered.filter(r => {
      const isOccupied = !!getActiveContractByRoom(r.id);
      return state.currentFilter === 'occupied' ? isOccupied : !isOccupied;
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-text">Không tìm thấy phòng</div>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(room => {
    const isOccupied = !!getActiveContractByRoom(room.id);
    const isSelected = state.selectedRoom?.id === room.id;
    const statusBadge = isOccupied
      ? badge('occupied', '✅ Đang thuê')
      : badge('vacant',   '⬜ Trống');

    return `
      <div class="room-card ${isSelected ? 'selected' : ''}" onclick="selectRoom(${room.id})">
        <div class="room-card-top">
          <div>
            <div class="room-number">Phòng ${room.roomNumber}</div>
            <div class="room-meta">
              <span>📐 ${room.area}m²</span>
              <span>🏢 Tầng ${room.floor}</span>
            </div>
          </div>
          <div>${statusBadge}</div>
        </div>
        <div class="room-price">${fmt(room.rentPrice)}/tháng</div>
      </div>`;
  }).join('');
}

/** Chọn phòng: refresh invoices + contracts rồi render detail */
async function selectRoom(roomId) {
  const room = state.rooms.find(r => r.id === roomId);
  if (!room) return;

  state.selectedRoom = room;
  state.selectedRoomId = room.id; 
  state.detailTab    = state.detailTab || 'info'; // giữ tab nếu đang ở tab contracts

  // Refresh invoices + contracts cho phòng này
  try {
    const [invs, roomContracts] = await Promise.all([
      apiCall(`/invoices/room/${room.id}`).catch(() => []),
      apiCall(`/contracts/room/${room.id}`).catch(() => []),
    ]);
    state.invoicesByRoom[room.id]  = invs;
    state.contractsByRoom          = state.contractsByRoom || {};
    state.contractsByRoom[room.id] = roomContracts;

    // Cập nhật lại activeContracts từ danh sách vừa load
    const today = todayISO();
    const prev  = state.activeContracts.filter(c => c.roomId !== room.id);
    const newActives = roomContracts.filter(c =>
      c.status === 'ACTIVE' && c.startDate <= today && c.endDate >= today
    );
    state.activeContracts = [...prev, ...newActives];
  } catch { /* silent */ }

  renderRooms();
  renderDetail(room);
  updateStats();
}

/** Render panel chi tiết bên phải */
function renderDetail(room) {
  document.getElementById('emptyState').style.display = 'none';

  const detContainer = document.getElementById('roomDetail');
  detContainer.style.display       = 'flex';
  detContainer.style.flexDirection = 'column';
  detContainer.style.height        = '100%';

  const activeContract = getActiveContractByRoom(room.id);
  const isOccupied     = !!activeContract;
  const { currentMonth, currentYear } = state;

  const statusBadge = isOccupied
    ? badge('occupied', '✅ Đang thuê')
    : badge('vacant', '⬜ Trống');

  // Header với nút sửa phòng
  const header = `
  <div class="detail-header">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;position:relative;z-index:1;">
      <div>
        <div class="detail-room-name">🚪 Phòng ${room.roomNumber}</div>
        <div class="detail-room-sub" style="margin-top:6px;">
          ${statusBadge}
          <span>📐 ${room.area}m²</span>
          <span>🏢 Tầng ${room.floor}</span>
        </div>
        <div class="detail-price">${fmt(room.rentPrice)} <span>/tháng</span></div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn-edit-room" onclick="openEditRoomModal(${room.id})" title="Sửa thông tin phòng">
          ✏️ Sửa phòng
        </button>
        <button class="btn-delete-room" onclick="deleteRoom(${room.id})" title="Xóa phòng">
          Xóa phòng
        </button>
      </div>
    </div>
  </div>`;

  // Tab bar
  const currentTab = state.detailTab || 'info';
  const tabs = `
    <div class="detail-tabs">
      <div class="detail-tab ${currentTab === 'info' ? 'active' : ''}"
           onclick="switchDetailTab('info', ${room.id})">📋 Thông tin</div>
      <div class="detail-tab ${currentTab === 'contracts' ? 'active' : ''}"
           onclick="switchDetailTab('contracts', ${room.id})">📄 Lịch sử hợp đồng </div>
    </div>`;

  let body = '';
  if (currentTab === 'info') {
    body = isOccupied && activeContract
      ? renderTenantInfo(activeContract, getCurrentInvoice(room.id), room, currentMonth, currentYear)
      : renderNewContractForm(room);
  } else {
    body = renderContractHistory(room);
  }

  detContainer.innerHTML = header + tabs + `<div class="detail-body">${body}</div>`;
  initAllDatePickers();
}

/** Chuyển tab trong detail panel */
function switchDetailTab(tab, roomId) {
  state.detailTab = tab;
  const room = state.rooms.find(r => r.id === roomId);
  if (room) renderDetail(room);
}

/** Render tab Thông tin: khách thuê + hóa đơn */
/** Render tab Thông tin: khách thuê + hóa đơn */
function renderTenantInfo(contract, invoice, room, month, year) {
  const tenant = state.tenantsMap[contract.tenantId] || {};

  const tenantBox = `
    <div class="info-box">
      <div class="info-box-title">👤 Khách thuê</div>
      ${infoRow('Họ tên',        tenant.name           || 'N/A')}
      ${infoRow('Số điện thoại', tenant.phone          || 'N/A')}
      ${infoRow('Email',         tenant.email          || 'N/A')}
      ${infoRow('CCCD',          tenant.identityNumber || 'N/A')}
      ${infoRow('Địa chỉ',      tenant.address        || 'N/A')}
    </div>`;

  const contractBox = `
    <div class="info-box">
      <div class="info-box-title">📄 Hợp đồng hiện tại</div>
      ${infoRow('Mã HĐ',    contract.id)}
      ${infoRow('Bắt đầu',  fmtDate(contract.startDate))}
      ${infoRow('Kết thúc', fmtDate(contract.endDate))}
      ${infoRow('Tiền cọc', fmt(contract.deposit))}
      ${infoRow('Ghi chú',  contract.note || 'Không')}
    </div>`;

  let invoiceHtml = '';
  if (invoice) {
    const paidBadge = invoice.status === 'PAID'
      ? badge('occupied', '✅ Đã TT')
      : badge('warn',     '⚠️ Chưa TT');

    invoiceHtml = `
      <div class="invoice-box">
        <div class="invoice-box-title">
          🧾 Hóa đơn tháng ${invoice.month}/${invoice.year} ${paidBadge}
        </div>
        <div class="invoice-row"><span class="invoice-label">Tiền phòng</span><span class="invoice-val">${fmt(invoice.rentAmount)}</span></div>
        <div class="invoice-row"><span class="invoice-label">Tiền điện</span><span class="invoice-val">${fmt(invoice.electricityAmount)}</span></div>
        <div class="invoice-row"><span class="invoice-label">Tiền nước</span><span class="invoice-val">${fmt(invoice.waterAmount)}</span></div>
        <hr class="invoice-divider"/>
        <div class="invoice-total"><span>Tổng cộng</span><span>${fmt(invoice.totalAmount)}</span></div>
        ${invoice.status !== 'PAID' ? `
          <div class="btn-row" style="margin-top:12px">
            <button class="btn btn-primary" style="width:100%" onclick="payInvoice(${invoice.id})">
              💳 Thanh toán ngay
            </button>
          </div>` : ''}
      </div>`;
  }

  return `
    <div class="info-grid">${tenantBox}${contractBox}</div>
    ${invoiceHtml}
    <div class="btn-row">
      <button class="btn btn-primary" style="flex:1"
        onclick="openInvoiceModal(${room.id}, ${room.rentPrice})">
        🧾 Tạo hóa đơn tháng
      </button>
      <button class="btn btn-danger-outline" onclick="cancelContract(${contract.id})">
        📋 Kết thúc HĐ
      </button>
    </div>
    <div class="btn-row" style="margin-top:8px;">
      <button class="btn btn-outline" style="width:100%" onclick="openInvoiceHistory(${room.id})">
        📜 Xem tất cả hóa đơn
      </button>
    </div>`;
}

/** Render tab Lịch sử hợp đồng */
function renderContractHistory(room) {
  const allContracts = (state.contractsByRoom || {})[room.id] || [];

  // Sắp xếp mới nhất lên đầu
  const sorted = [...allContracts].sort((a, b) =>
    new Date(b.startDate) - new Date(a.startDate)
  );

  const listHtml = sorted.length === 0
  ? `<div class="empty-state" style="padding:30px 0;">
       <div class="empty-icon">📄</div>
       <div class="empty-text">Chưa có hợp đồng nào</div>
     </div>`
  : sorted.map(c => {
      const tenant = state.tenantsMap[c.tenantId] || {};
      const isActive = isContractActive(c);
      const statusBadge = isActive
        ? badge('occupied', '✅ Đang hiệu lực')
        : (c.status === 'CANCELLED'
            ? badge('warn', '🚫 Đã huỷ')
            : badge('vacant', '⬜ Chưa có hiệu lực'));

      // Các nút hành động
      let actionButtons = '';
      if (isActive) {
        actionButtons = `
          <span class="link-cancel" onclick="cancelContract(${c.id})">Kết thúc HĐ</span>
          <span class="link-delete" onclick="deleteContract(${c.id})" style="margin-left:12px;">🗑️ Xóa HĐ</span>
        `;
      } else {
        actionButtons = `
          <span class="link-delete" onclick="deleteContract(${c.id})">🗑️ Xóa HĐ</span>
        `;
      }

      return `
        <div class="contract-history-card">
          <div class="contract-history-top">
            <div>
              <div class="contract-history-name">👤 ${tenant.name || 'N/A'}</div>
              <div class="contract-history-dates">
                ${fmtDate(c.startDate)} → ${fmtDate(c.endDate)}
              </div>
            </div>
            <div>${statusBadge}</div>
          </div>
          <div class="contract-history-meta">
            <span>📞 ${tenant.phone || 'N/A'}</span>
            ${actionButtons}
          </div>
        </div>`;
    }).join('');

  return `
    ${listHtml}
    <button class="btn btn-primary" style="width:100%;margin-top:4px;"
      onclick="openNewContractModal(${room.id})">
      ➕ Thêm hợp đồng mới
    </button>`;
}

/** Render form tạo hợp đồng mới khi phòng trống (tab info) */
function renderNewContractForm(room) {
  return `
    <div style="background:linear-gradient(135deg,#f0f9ff,#fdf4ff);
                border:1.5px dashed #a5b4fc;border-radius:16px;padding:20px 22px;">
      <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:18px;">
        ➕ Tạo hợp đồng thuê phòng
      </div>
      <div class="form-group" style="margin-bottom:12px">
        <label>Họ và tên khách thuê *</label>
        <input type="text" id="newContractName" placeholder="Nguyễn Văn A"/>
      </div>
      <div class="form-row" style="margin-bottom:12px">
        <div class="form-group"><label>Số điện thoại</label><input type="tel" id="newContractPhone"/></div>
        <div class="form-group"><label>CCCD</label><input type="text" id="newContractIdentity"/></div>
      </div>
      <div class="form-row" style="margin-bottom:12px">
        <div class="form-group"><label>Email</label><input type="email" id="newContractEmail"/></div>
        <div class="form-group"><label>Địa chỉ</label><input type="text" id="newContractAddress"/></div>
      </div>
     <div class="form-row" style="margin-bottom:12px">
          <div class="form-group">
            <label>Ngày bắt đầu *</label>
            <input type="text" id="newContractStart" class="datepicker-input" placeholder="dd/mm/yyyy" value="${fmtDate(todayISO())}"/>
          </div>
          <div class="form-group">
            <label>Ngày kết thúc *</label>
            <input type="text" id="newContractEnd"   class="datepicker-input" placeholder="dd/mm/yyyy"/>
          </div>
      </div>
      <button class="btn btn-success" style="width:100%" onclick="createNewContract(${room.id})">
        ✅ Lưu hợp đồng
      </button>
    </div>`;
}
function getTotalRevenueByRoom(roomId) {
  const invoices = state.invoicesByRoom?.[roomId] || [];

  return invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
}
function getTotalRevenueAll() {
  let total = 0;

  Object.values(state.invoicesByRoom || {}).forEach(invoices => {
    total += invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  });

  return total;
}