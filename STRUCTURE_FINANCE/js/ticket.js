// ===== KHỞI TẠO EMAIL ADMIN =====
const userEmailEl = document.querySelector(".user-email");
if (userEmailEl) {
  try {
    const adminData = JSON.parse(localStorage.getItem("currentUser"));
    if (adminData && adminData.email) userEmailEl.textContent = adminData.email;
  } catch (e) {}
}

// ===== DỮ LIỆU MẪU =====
let tickets = [];
try {
  const stored = localStorage.getItem("tickets");
  if (stored) tickets = JSON.parse(stored);
} catch (e) {}

if (!tickets || tickets.length === 0) {
  tickets = [
    {
      id: 1001,
      ticketCode: "VE-1001",
      customerName: "Nguyễn Văn A",
      customerPhone: "0987654321",
      movieId: 1,
      movieTitle: "Dune: Hành Tinh Cát - Phần 2",
      showDate: "2026-03-15",
      showTime: "10:00",
      seats: ["F12", "F13"],
      seatCount: 2,
      pricePerSeat: 90000,
      totalAmount: 180000,
      paymentMethod: 0,
      paymentStatus: true,
      createdAt: "2026-03-10T14:30:00Z",
      note: "Khách yêu cầu ghế gần lối đi",
    },
    {
      id: 1002,
      ticketCode: "VE-1002",
      customerName: "Trần Thị B",
      customerPhone: "0912654321",
      movieId: 4,
      movieTitle: "Mai",
      showDate: "2026-03-16",
      showTime: "13:30",
      seats: ["G5"],
      seatCount: 1,
      pricePerSeat: 90000,
      totalAmount: 90000,
      paymentMethod: 1,
      paymentStatus: false,
      createdAt: "2026-03-11T09:15:00Z",
      note: "",
    },
    {
      id: 1003,
      ticketCode: "VE-1003",
      customerName: "Lê Văn C",
      customerPhone: "0905654321",
      movieId: 2,
      movieTitle: "Kung Fu Panda 4",
      showDate: "2026-03-17",
      showTime: "19:00",
      seats: ["H10", "H11", "H12"],
      seatCount: 3,
      pricePerSeat: 90000,
      totalAmount: 270000,
      paymentMethod: 2,
      paymentStatus: true,
      createdAt: "2026-03-12T16:45:00Z",
      note: "Combo bắp nước tặng kèm",
    },
    {
      id: 1004,
      ticketCode: "VE-1004",
      customerName: "Phạm Thu D",
      customerPhone: "0978123456",
      movieId: 3,
      movieTitle: "Avengers: Secret Wars",
      showDate: "2026-04-07",
      showTime: "20:30",
      seats: ["D3", "D4"],
      seatCount: 2,
      pricePerSeat: 120000,
      totalAmount: 240000,
      paymentMethod: 0,
      paymentStatus: false,
      createdAt: "2026-04-07T08:00:00Z",
      note: "",
    },
    {
      id: 1005,
      ticketCode: "VE-1005",
      customerName: "Hoàng Minh E",
      customerPhone: "0933456789",
      movieId: 5,
      movieTitle: "Inside Out 2",
      showDate: "2026-04-07",
      showTime: "15:00",
      seats: ["A1"],
      seatCount: 1,
      pricePerSeat: 90000,
      totalAmount: 90000,
      paymentMethod: 1,
      paymentStatus: true,
      createdAt: "2026-04-07T10:20:00Z",
      note: "",
    },
  ];
  localStorage.setItem("tickets", JSON.stringify(tickets));
}

// ===== BIẾN TRẠNG THÁI =====
let editTicketIndex = null;
let deleteTicketIndex = null;
let searchQuery = "";
let currentPage = 1;
const PER_PAGE = 5;

// ===== HELPER FUNCTIONS =====
const formatDate = (d) => {
  if (!d) return "";
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const formatMoney = (n) => Number(n).toLocaleString("vi-VN") + "đ";

const saveTickets = () => localStorage.setItem("tickets", JSON.stringify(tickets));

// ===== LỌC VÉ =====
const getFiltered = () => {
  if (!searchQuery) return tickets;
  const q = searchQuery.toLowerCase();
  return tickets.filter(
    (t) =>
      t.ticketCode.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      (t.customerPhone && t.customerPhone.includes(q)) ||
      t.movieTitle.toLowerCase().includes(q)
  );
};

// ===== CẬP NHẬT STATS =====
const updateStats = () => {
  const pendingCount = tickets.filter((t) => !t.paymentStatus).length;
  const totalRevenue = tickets.filter((t) => t.paymentStatus).reduce((sum, t) => sum + t.totalAmount, 0);
  
  const pendingEl = document.getElementById("pending-count");
  const totalEl = document.getElementById("total-count");
  const revenueEl = document.getElementById("revenue-count");
  
  if (pendingEl) pendingEl.textContent = pendingCount;
  if (totalEl) totalEl.textContent = tickets.length;
  if (revenueEl) revenueEl.textContent = formatMoney(totalRevenue);
};

// ===== RENDER BẢNG =====
const renderTable = () => {
  const tbody = document.getElementById("ticket-table-body");
  if (!tbody) return;

  const filtered = getFiltered();
  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <i class="fa-solid fa-ticket"></i>
            <p>Không tìm thấy vé nào.</p>
          </div>
        </td>
      </tr>`;
    const infoEl = document.getElementById("ticket-pagination-info");
    const pageEl = document.getElementById("ticket-pagination");
    if (infoEl) infoEl.textContent = "Không có vé nào";
    if (pageEl) pageEl.innerHTML = "";
    updateStats();
    return;
  }

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  pageItems.forEach((t) => {
    const globalIdx = tickets.indexOf(t);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="color-red">#${t.ticketCode}</span></td>
      <td>
        ${t.customerName}
        <span>${t.customerPhone || ""}</span>
      </td>
      <td>${t.movieTitle}</td>
      <td>
        ${t.showTime || ""}
        <span>${formatDate(t.showDate)}</span>
      </td>
      <td>${t.seats.join(", ")}</td>
      <td style="font-weight:600;color:#fff">${formatMoney(t.totalAmount)}</td>
      <td>
        <span class="status ${t.paymentStatus ? "success" : "pending"}">
          ${t.paymentStatus ? "Đã thanh toán" : "Chờ xử lý"}
        </span>
      </td>
      <td style="text-align:center">
        <button class="btn-edit" onclick="editTicket(${globalIdx})" title="Sửa vé">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button class="btn-delete" onclick="confirmDelete(${globalIdx})" title="Hủy vé">
          <i class="fa-solid fa-circle-xmark"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const s = start + 1;
  const e = Math.min(start + PER_PAGE, filtered.length);
  const infoEl = document.getElementById("ticket-pagination-info");
  if (infoEl) infoEl.textContent = `Hiển thị ${s} – ${e} trên ${filtered.length} vé`;

  renderPagination(filtered.length);
  updateStats();
};

// ===== PHÂN TRANG =====
const renderPagination = (total) => {
  const el = document.getElementById("ticket-pagination");
  if (!el) return;
  const totalPages = Math.ceil(total / PER_PAGE);
  el.innerHTML = "";
  if (totalPages <= 1) return;

  const createBtn = (content, page, disabled = false, isActive = false) => {
    const btn = document.createElement("button");
    btn.innerHTML = content;
    btn.disabled = disabled;
    if (isActive) btn.classList.add("active");
    if (!disabled) {
      btn.onclick = () => {
        currentPage = page;
        renderTable();
      };
    }
    return btn;
  };

  el.appendChild(createBtn('<i class="fa-solid fa-chevron-left"></i>', currentPage - 1, currentPage === 1));

  for (let i = 1; i <= totalPages; i++) {
    el.appendChild(createBtn(i, i, false, i === currentPage));
  }

  el.appendChild(createBtn('<i class="fa-solid fa-chevron-right"></i>', currentPage + 1, currentPage === totalPages));
};

// ===== TÌM KIẾM =====
const searchInput = document.getElementById("search-ticket-input");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    currentPage = 1;
    renderTable();
  });
}

// ===== MODAL VÉ =====
const ticketModal = document.getElementById("ticket-modal");
const ticketForm = document.getElementById("ticket-form");

const openTicketModal = () => {
  if (ticketModal) ticketModal.classList.add("show");
};

const closeTicketModal = () => {
  if (!ticketModal) return;
  ticketModal.classList.remove("show");
  if (ticketForm) ticketForm.reset();
  editTicketIndex = null;

  const titleEl = document.getElementById("ticket-modal-title");
  const submitBtn = document.getElementById("btn-ticket-submit");
  if (titleEl) titleEl.textContent = "Đặt Vé Mới";
  if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Xác nhận đặt vé';
  clearErrors();
};

const clearErrors = () => {
  ["errCustomer", "errPhone", "errMovie", "errTime", "errTDate", "errSeat", "errTPrice"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
};

// Nút mở modal
const openBtn = document.getElementById("open-ticket-modal");
if (openBtn) openBtn.onclick = openTicketModal;

// Nút đóng modal
const closeBtn = document.getElementById("close-ticket-modal");
if (closeBtn) closeBtn.onclick = closeTicketModal;

const cancelBtn = document.getElementById("btn-ticket-cancel");
if (cancelBtn) cancelBtn.onclick = closeTicketModal;

// Click ngoài modal để đóng
if (ticketModal) {
  ticketModal.addEventListener("click", (e) => {
    if (e.target === ticketModal) closeTicketModal();
  });
}

// ===== SỬA VÉ =====
window.editTicket = (idx) => {
  if (idx < 0 || idx >= tickets.length) return;
  const t = tickets[idx];
  editTicketIndex = idx;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
  };

  set("t-customer", t.customerName);
  set("t-phone", t.customerPhone);
  set("t-movie", t.movieTitle);
  set("t-time", t.showTime);
  set("t-date", t.showDate);
  set("t-seat", t.seats.join(", "));
  set("t-price", t.totalAmount);
  set("t-status", t.paymentStatus ? "success" : "pending");
  set("t-payment-method", t.paymentMethod ?? 0);

  const titleEl = document.getElementById("ticket-modal-title");
  const submitBtn = document.getElementById("btn-ticket-submit");
  if (titleEl) titleEl.textContent = "Cập nhật thông tin vé";
  if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Cập nhật';

  openTicketModal();
};

// ===== LƯU VÉ (THÊM / SỬA) =====
if (ticketForm) {
  ticketForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();

    const get = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : "";
    };

    const customer = get("t-customer");
    const phone = get("t-phone");
    const movie = get("t-movie");
    const time = get("t-time");
    const date = get("t-date");
    const seat = get("t-seat");
    const priceRaw = get("t-price");
    const price = parseFloat(priceRaw);
    const status = get("t-status");
    const paymentMethod = parseInt(get("t-payment-method") || "0");

    let hasError = false;

    const setErr = (id, msg) => {
      const el = document.getElementById(id);
      if (el) el.textContent = msg;
      hasError = true;
    };

    if (!customer) setErr("errCustomer", "Tên khách không được để trống");
    if (!phone) setErr("errPhone", "Số điện thoại không được để trống");
    else if (!/^0\d{9}$/.test(phone)) setErr("errPhone", "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)");
    if (!movie) setErr("errMovie", "Tên phim không được để trống");
    if (!time) setErr("errTime", "Giờ chiếu không được để trống");
    if (!date) setErr("errTDate", "Ngày chiếu không được để trống");
    if (!seat) setErr("errSeat", "Ghế không được để trống");
    if (isNaN(price) || price <= 0) setErr("errTPrice", "Tổng tiền phải lớn hơn 0");

    if (hasError) return;

    const seatsArray = seat.split(",").map((s) => s.trim()).filter(Boolean);
    const isPaid = status === "success";

    if (editTicketIndex !== null) {
      // Cập nhật vé hiện có
      const existing = tickets[editTicketIndex];
      tickets[editTicketIndex] = {
        ...existing,
        customerName: customer,
        customerPhone: phone,
        movieTitle: movie,
        showTime: time,
        showDate: date,
        seats: seatsArray,
        seatCount: seatsArray.length,
        pricePerSeat: Math.floor(price / seatsArray.length),
        totalAmount: price,
        paymentMethod: paymentMethod,
        paymentStatus: isPaid,
      };
      showToast("Cập nhật thành công", `Đã cập nhật vé #${tickets[editTicketIndex].ticketCode}`, "success");
    } else {
      // Thêm vé mới
      const newId = tickets.length > 0 ? Math.max(...tickets.map((t) => t.id)) + 1 : 1001;
      const newTicket = {
        id: newId,
        ticketCode: `VE-${newId}`,
        customerName: customer,
        customerPhone: phone,
        movieId: 0,
        movieTitle: movie,
        showDate: date,
        showTime: time,
        seats: seatsArray,
        seatCount: seatsArray.length,
        pricePerSeat: Math.floor(price / seatsArray.length),
        totalAmount: price,
        paymentMethod: paymentMethod,
        paymentStatus: isPaid,
        createdAt: new Date().toISOString(),
        note: "",
      };
      tickets.push(newTicket);
      showToast("Đặt vé thành công", `Đã thêm vé #${newTicket.ticketCode}`, "success");
    }

    saveTickets();
    renderTable();
    closeTicketModal();
  });
}

// ===== XÓA VÉ =====
const deleteModal = document.getElementById("delete-confirm-modal");

window.confirmDelete = (idx) => {
  if (idx < 0 || idx >= tickets.length) return;
  deleteTicketIndex = idx;
  const codeEl = document.getElementById("delete-ticket-code");
  if (codeEl) codeEl.textContent = tickets[idx].ticketCode;
  if (deleteModal) deleteModal.classList.add("show");
};

const closeDeleteModal = () => {
  if (deleteModal) deleteModal.classList.remove("show");
  deleteTicketIndex = null;
};

const cancelDeleteBtn = document.getElementById("btn-cancel-delete");
if (cancelDeleteBtn) cancelDeleteBtn.onclick = closeDeleteModal;

const cancelDeleteBtn2 = document.getElementById("btn-cancel-delete2");
if (cancelDeleteBtn2) cancelDeleteBtn2.onclick = closeDeleteModal;

const confirmDeleteBtn = document.getElementById("btn-confirm-delete");
if (confirmDeleteBtn) {
  confirmDeleteBtn.onclick = () => {
    if (deleteTicketIndex !== null && deleteTicketIndex >= 0) {
      const code = tickets[deleteTicketIndex].ticketCode;
      tickets.splice(deleteTicketIndex, 1);
      saveTickets();
      closeDeleteModal();
      renderTable();
      showToast("Đã hủy vé", `Vé #${code} đã được hủy thành công`, "success");
    }
  };
}

if (deleteModal) {
  deleteModal.addEventListener("click", (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });
}

// ===== ĐĂNG XUẤT =====
const logoutModal = document.getElementById("logout-modal");
const btnOut = document.querySelector(".btn-out");

const closeLogoutModal = () => {
  if (logoutModal) logoutModal.classList.remove("show");
};

if (btnOut) {
  btnOut.addEventListener("click", (e) => {
    e.preventDefault();
    if (logoutModal) logoutModal.classList.add("show");
  });
}

const closeLogoutBtn = document.getElementById("close-logout");
if (closeLogoutBtn) closeLogoutBtn.onclick = closeLogoutModal;

const btnStay = document.getElementById("btn-stay");
if (btnStay) btnStay.onclick = closeLogoutModal;

if (logoutModal) {
  logoutModal.addEventListener("click", (e) => {
    if (e.target === logoutModal) closeLogoutModal();
  });
}

const btnConfirmLogout = document.getElementById("btn-confirm-logout");
if (btnConfirmLogout) {
  btnConfirmLogout.onclick = () => {
    window.location.href = "login.html";
  };
}

// ===== TOAST NOTIFICATION =====
function showToast(title, message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const icon =
    type === "success"
      ? '<i class="fa-solid fa-circle-check" style="color:#00d084"></i>'
      : '<i class="fa-solid fa-circle-xmark" style="color:#e50914"></i>';

  toast.className = `toast toast-${type === "success" ? "success" : "cancel"}`;
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
    <div class="toast-close"><i class="fa-solid fa-xmark"></i></div>
  `;

  container.appendChild(toast);

  const timeout = setTimeout(() => {
    toast.style.animation = "fadeOut 0.4s ease forwards";
    setTimeout(() => toast.remove(), 400);
  }, 4000);

  const closeEl = toast.querySelector(".toast-close");
  if (closeEl) {
    closeEl.onclick = () => {
      clearTimeout(timeout);
      toast.style.animation = "fadeOut 0.4s ease forwards";
      setTimeout(() => toast.remove(), 400);
    };
  }
}

// ===== KHỞI TẠO =====
renderTable();