// ============================================================
//  ui.js — UI helpers: modal, toast, filter, search
//  Phụ thuộc: config.js · render.js
// ============================================================

// ---- MODAL ----

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Đóng modal khi click vào backdrop (vùng tối bên ngoài)
document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) backdrop.classList.remove('open');
  });
});

// ---- TOAST ----

/**
 * Hiển thị toast notification.
 * @param {string} msg
 * @param {'success'|'error'} type
 */
function showToast(msg, type = 'success') {
  const icon = type === 'success' ? '✅' : '❌';
  const el   = document.createElement('div');
  el.className   = `toast ${type}`;
  el.textContent = `${icon} ${msg}`;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ---- FILTER & SEARCH ----

/** Gọi lại renderRooms khi người dùng gõ tìm kiếm */
function filterRooms() {
  renderRooms();
}

/**
 * Đặt filter tab (all / occupied / vacant).
 * @param {string} filter
 * @param {HTMLElement} el - tab element được click
 */
function setFilter(filter, el) {
  state.currentFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderRooms();
}
// ui.js - các hàm xử lý giao diện và khởi tạo flatpickr
document.addEventListener('DOMContentLoaded', function() {
  // Khởi tạo flatpickr cho các input ngày tháng trong modal thêm/sửa hợp đồng
  const dateInputs = [
      { id: 'newContractStart', format: 'd/m/Y' },
      { id: 'newContractEnd', format: 'd/m/Y' }
      // Thêm các input date khác nếu có (ví dụ trong modal sửa hợp đồng, lọc...)
  ];
  dateInputs.forEach(({ id, format }) => {
      const el = document.getElementById(id);
      if (el) {
          flatpickr(el, {
              dateFormat: format,
              allowInput: true
          });
      }
  });
});
// ui.js
function initAllDatePickers() {
  // Tìm tất cả input có class "datepicker-input" chưa được khởi tạo
  document.querySelectorAll('.datepicker-input').forEach(input => {
      if (!input._flatpickr) {
          flatpickr(input, {
              dateFormat: "d/m/Y",   // hiển thị dd/mm/yyyy
              allowInput: true,      // cho phép gõ tay
              // Nếu muốn mặc định là ngày hôm nay (tuỳ chọn)
              defaultDate: input.value || null
          });
      }
  });
}