// ============================================================
//  utils.js — Formatters & Tiện ích nhỏ
// ============================================================

/** Định dạng số tiền VNĐ */
function fmt(n) {
  return (n || 0).toLocaleString('vi-VN') + ' đ';
}

/** Định dạng ngày từ ISO (yyyy-mm-dd) sang dd/mm/yyyy để hiển thị */
function fmtDate(d) {
  if (!d) return 'N/A';
  // d có thể là string "yyyy-mm-dd" hoặc Date object
  const date = new Date(d);
  if (isNaN(date.getTime())) return 'N/A';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Chuyển từ dd/mm/yyyy sang yyyy-mm-dd để gửi API */
function toISODate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length !== 3) return '';
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
}

/** Ngày hôm nay dạng ISO (YYYY-MM-DD) */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Tạo badge HTML */
function badge(cls, text) {
  return `<span class="badge ${cls}">${text}</span>`;
}

/** Gán text vào element theo id */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/** Tạo một info-row HTML (dùng trong detail panel) */
function infoRow(label, val) {
  return `
    <div class="info-row">
      <span class="info-label">${label}</span>
      <span class="info-val">${val ?? 'N/A'}</span>
    </div>`;
}

/** Kiểm tra hợp đồng có đang active hôm nay không */
function isContractActive(contract) {
  const today = todayISO();
  return (
    contract.status === 'ACTIVE' &&
    contract.startDate <= today &&
    contract.endDate   >= today
  );
}
function getActiveContractByRoom(roomId) {
  const contracts = state.contractsByRoom?.[roomId] || [];
  return contracts.find(c => isContractActive(c));
}