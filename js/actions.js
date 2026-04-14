// ============================================================
//  actions.js — Action handlers: hợp đồng, hóa đơn, thanh toán, sửa phòng
//  Phụ thuộc: config.js · api.js · data.js · render.js · ui.js
// ============================================================

// ---- HỢP ĐỒNG ----

/** Tạo hợp đồng mới (dùng cho cả phòng trống - inline form, và modal) */
async function createNewContract(roomId) {
  const name = document.getElementById("newContractName").value.trim();
  if (!name) {
    showToast("Vui lòng nhập tên khách", "error");
    return;
  }

  const startDateRaw = document.getElementById('newContractStart').value;
    const endDateRaw = document.getElementById('newContractEnd').value;
  const startDate = toISODate(startDateRaw);
  const endDate = toISODate(endDateRaw);
  if (!startDate || !endDate) {
    showToast("Vui lòng nhập ngày bắt đầu và kết thúc", "error");
    return;
  }
  if (endDate <= startDate) {
    showToast("Ngày kết thúc phải sau ngày bắt đầu", "error");
    return;
  }

  // Kiểm tra trùng ngày với hợp đồng đã có
  const existing = (state.contractsByRoom || {})[roomId] || [];
  const overlap = existing.find(
    (c) =>
      c.status !== "CANCELLED" &&
      !(endDate <= c.startDate || startDate >= c.endDate)
  );
  if (overlap) {
    showToast(
      `Trùng ngày với HĐ từ ${fmtDate(overlap.startDate)} → ${fmtDate(
        overlap.endDate
      )}`,
      "error"
    );
    return;
  }

  const payload = {
    roomId,
    startDate,
    endDate,
    note: document.getElementById("newContractNote")?.value || "",
    tenant: {
      name,
      phone: document.getElementById("newContractPhone").value,
      email: document.getElementById("newContractEmail").value,
      address: document.getElementById("newContractAddress").value,
      identityNumber: document.getElementById("newContractIdentity").value,
    },
  };

  try {
    await apiCall("/contracts/full", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    showToast("Tạo hợp đồng thành công!", "success");
    closeModal("newContractModal");
    await loadAllData();
    state.detailTab = "contracts";
    selectRoom(roomId);
  } catch (err) {
    showToast("Lỗi: " + err.message, "error");
  }
}

/** Mở modal thêm hợp đồng mới (từ tab lịch sử) */
function openNewContractModal(roomId) {
  const room = state.rooms.find((r) => r.id === roomId);
  if (!room) return;

  // Điền sẵn thông tin
  document.getElementById(
    "ncm_roomLabel"
  ).textContent = `Phòng ${room.roomNumber}`;
  document.getElementById("ncm_roomId").value = roomId;
  document.getElementById("ncm_rentPrice").value = room.rentPrice;
  document.getElementById("newContractName").value = "";
  document.getElementById("newContractPhone").value = "";
  document.getElementById("newContractEmail").value = "";
  document.getElementById("newContractAddress").value = "";
  document.getElementById("newContractIdentity").value = "";
  document.getElementById("newContractStart").value = todayISO();
  document.getElementById("newContractEnd").value = "";

  // Hiện danh sách HĐ hiện có để tránh trùng
  const existing = (state.contractsByRoom || {})[roomId] || [];
  const active = existing.filter((c) => c.status !== "CANCELLED");
  const warningEl = document.getElementById("ncm_existingWarning");
  if (active.length > 0) {
    warningEl.style.display = "block";
    warningEl.innerHTML = `
      <div style="font-size:12px;font-weight:600;color:#92400e;margin-bottom:6px;">⚠️ HĐ hiện có (không được trùng ngày)</div>
      ${active
        .map(
          (c) => `
        <div style="font-size:12px;color:#78350f;padding:4px 0;border-bottom:1px dashed #fcd34d;">
          ${fmtDate(c.startDate)} → ${fmtDate(c.endDate)}
          ${
            isContractActive(c)
              ? '<span style="color:#059669;font-weight:700;"> (đang hiệu lực)</span>'
              : ""
          }
        </div>`
        )
        .join("")}`;
  } else {
    warningEl.style.display = "none";
  }

  openModal("newContractModal");
}

/** Kết thúc hợp đồng */
async function cancelContract(contractId) {
  if (!confirm("Kết thúc hợp đồng sẽ chuyển phòng sang trống. Tiếp tục?"))
    return;
  try {
    await apiCall(`/contracts/${contractId}/cancel`, { method: "PUT" });
    showToast("Đã kết thúc hợp đồng", "success");
    await loadAllData();
    if (state.selectedRoom) selectRoom(state.selectedRoom.id);
  } catch (err) {
    showToast("Lỗi: " + err.message, "error");
  }
}

// ---- SỬA PHÒNG ----

/** Mở modal sửa thông tin phòng */
function openEditRoomModal(roomId) {
  const room = state.rooms.find((r) => r.id === roomId);
  if (!room) return;

  document.getElementById("edit_roomId").value = roomId;
  document.getElementById("edit_roomNumber").value = room.roomNumber;
  document.getElementById("edit_floor").value = room.floor;
  document.getElementById("edit_area").value = room.area;
  document.getElementById("edit_price").value = room.rentPrice;
  document.getElementById("edit_description").value = room.description || "";
  document.getElementById("edit_note").value = room.note || "";

  openModal("editRoomModal");
}

/** Submit sửa thông tin phòng */
async function submitEditRoom() {
  const roomId = parseInt(document.getElementById("edit_roomId").value);
  const roomNumber = document.getElementById("edit_roomNumber").value.trim();
  if (!roomNumber) {
    showToast("Vui lòng nhập số phòng", "error");
    return;
  }

  const payload = {
    roomNumber,
    floor: parseInt(document.getElementById("edit_floor").value) || 0,
    area: parseFloat(document.getElementById("edit_area").value) || 0,
    rentPrice: parseFloat(document.getElementById("edit_price").value) || 0,
    description: document.getElementById("edit_description").value,
    note: document.getElementById("edit_note").value,
  };

  try {
    await apiCall(`/rooms/${roomId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    showToast("Cập nhật phòng thành công!", "success");
    closeModal("editRoomModal");
    await loadAllData();
    selectRoom(roomId);
  } catch (err) {
    showToast("Lỗi: " + err.message, "error");
  }
}

// ---- HÓA ĐƠN ----

let currentUtilityPrice = null;
let currentInvoiceRoomId = null;
async function openInvoiceModal(roomId, rentPrice) {
  currentInvoiceRoomId = roomId;
  const rentField = document.getElementById("inv_rent");
  if (rentField) rentField.value = rentPrice;
  const monthInput = document.getElementById("inv_month");
  const yearInput = document.getElementById("inv_year");

  if (monthInput && !monthInput.value) {
    monthInput.value = state.currentMonth;
  }
  if (yearInput && !yearInput.value) {
    yearInput.value = state.currentYear;
  }
  // Reset các trường chỉ số
  const elecOld = document.getElementById("inv_elec_old");
  if (elecOld) elecOld.value = "";
  const elecNew = document.getElementById("inv_elec_new");
  if (elecNew) elecNew.value = "";
  const waterOld = document.getElementById("inv_water_old");
  if (waterOld) waterOld.value = "";
  const waterNew = document.getElementById("inv_water_new");
  if (waterNew) waterNew.value = "";

  currentUtilityPrice = await loadUtilityPrice(yearInput, monthInput);

  if (!currentUtilityPrice) {
    showToast("Không lấy được giá điện nước", "error");
    return;
  }

  // Hiển thị giá
  document.getElementById("elecPricePerUnit").innerText =
    currentUtilityPrice.electricityPricePerKwh.toLocaleString() + " đ/kWh";

  document.getElementById("waterPricePerUnit").innerText =
    currentUtilityPrice.waterPricePerCube.toLocaleString() + " đ/m³";

  // Không dùng addEventListener nữa
  document.getElementById("inv_elec_old").oninput = estimateTotal;
  document.getElementById("inv_elec_new").oninput = estimateTotal;
  document.getElementById("inv_water_old").oninput = estimateTotal;
  document.getElementById("inv_water_new").oninput = estimateTotal;
  openModal("invoiceModal");
}
// Hàm ước tính tổng tiền dựa trên chỉ số và giá điện/nước hiện hành
async function estimateTotal() {
  const rent = +document.getElementById("inv_rent")?.value || 0;
  const elecOld =
    parseFloat(document.getElementById("inv_elec_old")?.value) || 0;
  const elecNew =
    parseFloat(document.getElementById("inv_elec_new")?.value) || 0;
  const waterOld =
    parseFloat(document.getElementById("inv_water_old")?.value) || 0;
  const waterNew =
    parseFloat(document.getElementById("inv_water_new")?.value) || 0;

  if (elecNew < elecOld || waterNew < waterOld) {
    setText("sum_elec", "⚠️ Chỉ số không hợp lệ");
    setText("sum_water", "⚠️ Chỉ số không hợp lệ");
    setText("sum_total", "⚠️");
    return;
  }

  const electricityPrice = currentUtilityPrice.electricityPricePerKwh;
  const waterPrice = currentUtilityPrice.waterPricePerCube;

  const electricityUsed = elecNew - elecOld;
  const waterUsed = waterNew - waterOld;

  const electricityAmount = electricityUsed * electricityPrice;
  const waterAmount = waterUsed * waterPrice;

  const extraServices = getExtraServices();
  const extraContainer = document.getElementById("extraServicesSummary");

  if (extraServices.length === 0) {
    extraContainer.innerHTML = "";
  } else {
    extraContainer.innerHTML = extraServices
      .map(
        (s) => `
      <div class="invoice-row">
        <span class="invoice-label">🛎️ ${s.name}</span>
        <span class="invoice-val">${fmt(s.amount)}</span>
      </div>
    `
      )
      .join("");
  }
  const extraTotal = extraServices.reduce((sum, s) => sum + s.amount, 0);

  const total = rent + electricityAmount + waterAmount + extraTotal;

  setText("sum_rent", fmt(rent));
  setText("sum_elec", fmt(electricityAmount));
  setText("sum_water", fmt(waterAmount));
  setText("sum_total", fmt(total));
}

async function submitInvoice() {
  if (!currentInvoiceRoomId) {
    showToast("Không xác định phòng", "error");
    return;
  }
  const month = parseInt(document.getElementById("inv_month")?.value);
  const year = parseInt(document.getElementById("inv_year")?.value);
  if (!month || month < 1 || month > 12) {
    showToast("Tháng không hợp lệ", "error");
    return;
  }

  if (!year || year < 2000) {
    showToast("Năm không hợp lệ", "error");
    return;
  }

  // Lấy chỉ số từ form
  const elecOld = parseFloat(document.getElementById("inv_elec_old")?.value);
  const elecNew = parseFloat(document.getElementById("inv_elec_new")?.value);
  const waterOld = parseFloat(document.getElementById("inv_water_old")?.value);
  const waterNew = parseFloat(document.getElementById("inv_water_new")?.value);

  if (isNaN(elecOld) || isNaN(elecNew) || isNaN(waterOld) || isNaN(waterNew)) {
    showToast("Vui lòng nhập đầy đủ chỉ số điện và nước", "error");
    return;
  }
  if (elecNew < elecOld) {
    showToast("Chỉ số điện mới phải lớn hơn chỉ số cũ", "error");
    return;
  }
  if (waterNew < waterOld) {
    showToast("Chỉ số nước mới phải lớn hơn chỉ số cũ", "error");
    return;
  }
  const extraServices = getExtraServices();
  // 1. Lưu chỉ số điện nước
  const meterPayload = {
    roomId: currentInvoiceRoomId,
    month: month,
    year: year,
    electricityOld: elecOld,
    electricityNew: elecNew,
    waterOld: waterOld,
    waterNew: waterNew,
  };

  try {
    await apiCall("/invoices/input-meter", {
      method: "POST",
      body: JSON.stringify(meterPayload),
    });
  } catch (err) {
    showToast("Lỗi lưu chỉ số: " + err.message, "error");
    return;
  }

  // 2. Tạo hóa đơn
  const invoicePayload = {
    roomId: currentInvoiceRoomId,
    month: month,
    year: year,
    extraServices: getExtraServices(),
  };
  try {
    await apiCall("/invoices/generate", {
      method: "POST",
      body: JSON.stringify(invoicePayload),
    });
    showToast("Hóa đơn đã được tạo thành công!", "success");
    closeModal("invoiceModal");
    await loadAllData();
    if (state.selectedRoom) selectRoom(state.selectedRoom.id);
  } catch (err) {
    showToast("Lỗi tạo hóa đơn: " + err.message, "error");
  }
}

async function payInvoice(invoiceId) {
  try {
    await apiCall(`/invoices/pay/${invoiceId}`, { method: "PUT" });
    showToast("Thanh toán thành công", "success");
    await loadAllData();
    if (state.selectedRoom) selectRoom(state.selectedRoom.id);
  } catch (err) {
    showToast("Lỗi thanh toán: " + err.message, "error");
  }
}

// ---- PHÒNG MỚI ----

async function submitAddRoom() {
  const roomNumber = document.getElementById("new_roomNumber").value.trim();
  if (!roomNumber) {
    showToast("Vui lòng nhập số phòng", "error");
    return;
  }

  const payload = {
    roomNumber,
    floor: parseInt(document.getElementById("new_floor").value) || 0,
    area: parseFloat(document.getElementById("new_area").value) || 0,
    rentPrice: parseFloat(document.getElementById("new_price").value) || 0,
    description: document.getElementById("new_description").value,
    note: document.getElementById("new_note").value,
  };

  try {
    await apiCall("/rooms", { method: "POST", body: JSON.stringify(payload) });
    showToast("Thêm phòng thành công", "success");
    closeModal("addRoomModal");
    await loadAllData();
  } catch (err) {
    showToast("Lỗi: " + err.message, "error");
  }
}

// Thêm một dòng dịch vụ mới
function addExtraService() {
  const container = document.getElementById("extraServicesContainer");
  const newItem = document.createElement("div");
  newItem.className = "extra-service-item";
  newItem.style.display = "flex";
  newItem.style.gap = "8px";
  newItem.style.marginBottom = "8px";
  newItem.innerHTML = `
    <input type="text" placeholder="Tên dịch vụ" class="extra-name" style="flex: 2;" />
    <input type="number" placeholder="Số tiền" class="extra-amount" style="flex: 1;" />
    <button type="button" class="btn-remove-service" style="background: none; border: none; color: #ef4444; cursor: pointer;" onclick="removeExtraService(this)">✖</button>
  `;
  container.appendChild(newItem);
}

// Xóa một dòng dịch vụ
function removeExtraService(btn) {
  const item = btn.closest(".extra-service-item");
  if (item) item.remove();
}

// Lấy danh sách dịch vụ từ form
function getExtraServices() {
  const items = document.querySelectorAll(
    "#extraServicesContainer .extra-service-item"
  );
  const services = [];
  items.forEach((item) => {
    const name = item.querySelector(".extra-name").value.trim();
    const amount = parseFloat(item.querySelector(".extra-amount").value);
    if (name && !isNaN(amount) && amount > 0) {
      services.push({ name, amount });
    }
  });
  return services;
}
async function loadUtilityPrice() {
  try {
    return await apiCall("/invoices/utility-price/current");
  } catch (err) {
    console.error("Lỗi load giá điện nước:", err);
    return null;
  }
}
/** Mở modal lịch sử hóa đơn của phòng */
async function openInvoiceHistory(roomId) {
  const invoices = state.invoicesByRoom[roomId] || [];
  const container = document.getElementById("invoiceHistoryBody");
  if (!container) return;

  if (invoices.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">📄</div><div class="empty-text">Chưa có hóa đơn nào</div></div>`;
  } else {
    // Sắp xếp theo tháng/năm giảm dần
    const sorted = [...invoices].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    container.innerHTML = sorted
      .map((inv) => {
        const paidBadge =
          inv.status === "PAID"
            ? badge("occupied", "✅ Đã thanh toán")
            : badge("warn", "⚠️ Chưa thanh toán");
        return `
        <div class="invoice-history-item" style="border:1px solid #e5e7eb; border-radius:12px; padding:12px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div><strong>Tháng ${inv.month}/${inv.year}</strong></div>
            <div>${paidBadge}</div>
          </div>
          <div style="margin-top:8px;">
            <div>💰 Tổng: ${fmt(inv.totalAmount)}</div>
            ${
              inv.status !== "PAID"
                ? `
              <button class="btn btn-primary btn-sm" style="margin-top:8px; width:100%;" onclick="payInvoiceFromHistory(${inv.id}, ${roomId})">
                💳 Thanh toán ngay
              </button>
            `
                : ""
            }
          </div>
        </div>
      `;
      })
      .join("");
  }
  openModal("invoiceHistoryModal");
}

/** Thanh toán hóa đơn từ modal lịch sử, sau đó đóng modal và refresh */
async function payInvoiceFromHistory(invoiceId, roomId) {
  try {
    await apiCall(`/invoices/pay/${invoiceId}`, { method: "PUT" });
    showToast("Thanh toán thành công", "success");
    closeModal("invoiceHistoryModal");
    await loadAllData();
    if (state.selectedRoom) selectRoom(state.selectedRoom.id);
  } catch (err) {
    showToast("Lỗi thanh toán: " + err.message, "error");
  }
}
async function deleteRoom(roomId) {
  const room = state.rooms.find(r => r.id === roomId);
  if (!room) return;

  const activeContract = getActiveContractByRoom(roomId);
  if (activeContract) {
    alert('Không thể xóa phòng đang có hợp đồng thuê. Vui lòng kết thúc hợp đồng trước.');
    return;
  }

  if (confirm(`Bạn có chắc chắn muốn xóa phòng ${room.roomNumber}?`)) {
    try {
      // Gọi API xóa phòng (thay đổi URL theo backend của bạn)
      await apiCall(`/rooms/${roomId}`, { method: 'DELETE' });
      // Xóa khỏi state
      state.rooms = state.rooms.filter(r => r.id !== roomId);
      // Cập nhật giao diện
      if (state.selectedRoomId === roomId) {
        state.selectedRoom = null;
        state.selectedRoomId = null;
        document.getElementById('roomDetail').style.display = 'none';
        document.getElementById('emptyState').style.display = 'flex';
      }
      renderRooms();
      updateStats();
    } catch (error) {
      console.error('Xóa phòng thất bại:', error);
      alert('Có lỗi xảy ra khi xóa phòng.');
    }
  }
}
async function deleteContract(contractId) {
  if (!confirm('Bạn có chắc chắn muốn xóa hợp đồng này? Hành động không thể khôi phục.')) {
    return;
  }

  try {
    await apiCall(`/contracts/${contractId}`, { method: 'DELETE' });

    // Xóa contract khỏi state
    // Cập nhật contractsByRoom
    for (const roomId in state.contractsByRoom) {
      state.contractsByRoom[roomId] = state.contractsByRoom[roomId].filter(c => c.id !== contractId);
    }

    // Cập nhật activeContracts
    state.activeContracts = state.activeContracts.filter(c => c.id !== contractId);

    // Nếu phòng đang được chọn, render lại detail
    if (state.selectedRoom) {
      renderDetail(state.selectedRoom);
    }

    // Cập nhật thống kê nếu cần
    updateStats();

    // Có thể refresh lại danh sách phòng (để cập nhật trạng thái phòng)
    renderRooms();
  } catch (error) {
    console.error('Xóa hợp đồng thất bại:', error);
    alert('Không xóa được hợp đồng đang hoạt động');
  }
}
// ---- C?U H�NH GI� ----

async function openUtilityPriceModal() {
  try {
    const price = await apiCall('/invoices/utility-price/current');
    if (price) {
      document.getElementById('cfg_elec_price').value = price.electricityPricePerKwh;
      document.getElementById('cfg_water_price').value = price.waterPricePerCube;
    }
  } catch (err) {
    console.warn('Chua c� c?u h�nh gi�, s? d?ng m?c d?nh');
    document.getElementById('cfg_elec_price').value = 3000;
    document.getElementById('cfg_water_price').value = 15000;
  }
  openModal('utilityPriceModal');
}

async function submitUtilityPrice() {
  const elec = parseFloat(document.getElementById('cfg_elec_price').value);
  const water = parseFloat(document.getElementById('cfg_water_price').value);
  if (isNaN(elec) || isNaN(water) || elec < 0 || water < 0) {
    showToast('Vui l�ng nh?p gi� h?p l?', 'error');
    return;
  }
  const payload = { electricityPricePerKwh: elec, waterPricePerCube: water };
  try {
    await apiCall('/invoices/utility-price', { method: 'POST', body: JSON.stringify(payload) });
    showToast('C?p nh?t gi� di?n nu?c th�nh c�ng!', 'success');
    closeModal('utilityPriceModal');
    if (typeof currentUtilityPrice !== 'undefined') { currentUtilityPrice = await loadUtilityPrice(); }
  } catch (err) {
    showToast('L?i: ' + err.message, 'error');
  }
}
