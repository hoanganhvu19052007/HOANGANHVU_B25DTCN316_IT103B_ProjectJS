// CHUYỂN TAB SIDEBAR (movie-view / ticket-view)

document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".menu-item");
  const viewSections = document.querySelectorAll(".view-section");

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      menuItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");

      viewSections.forEach((section) => (section.style.display = "none"));

      const targetId = item.getAttribute("data-target");
      if (targetId) {
        document.getElementById(targetId).style.display = "block";
      }
    });
  });

  // Khởi tạo bảng khi trang tải xong
  updateFilterCounts();
  renderTable();
});

// PHẦN 2: DỮ LIỆU & TRẠNG THÁI

let movies = JSON.parse(localStorage.getItem("movies")) || [];
let editIndex = null;
let currentFilter = "all";
let currentSearch = "";
let currentPage = 1;
const MOVIES_PER_PAGE = 5;

// Gán email từ localStorage nếu có
const userEmailEl = document.querySelector(".user-email");
if (userEmailEl) {
  const adminData = JSON.parse(localStorage.getItem("currentUser"));
  if (adminData && adminData.email) userEmailEl.textContent = adminData.email;
}

// PHẦN 3: TIỆN ÍCH

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

const getFilteredMovies = () => {
  return movies
    .map((movie, index) => ({ movie, index }))
    .filter(({ movie }) => {
      const statusMatch =
        currentFilter === "all" ||
        (currentFilter === "showing" && movie.status == 1) ||
        (currentFilter === "upcoming" && movie.status == 2) ||
        (currentFilter === "ended" && movie.status == 0);

      const searchMatch =
        currentSearch === "" ||
        movie.titleVi.toLowerCase().includes(currentSearch.toLowerCase());

      return statusMatch && searchMatch;
    });
};

// PHẦN 4: RENDER BẢNG PHIM

const renderTable = () => {
  const movieTableBody = document.getElementById("movie-table-body");
  if (!movieTableBody) return;
  movieTableBody.innerHTML = "";

  const filtered = getFilteredMovies();
  updateFilterCounts();

  if (filtered.length === 0) {
    const emptyMsg =
      currentSearch !== ""
        ? `Không tìm thấy phim nào với từ khóa "<strong>${currentSearch}</strong>".`
        : "Chưa có phim nào trong danh sách này.";
    movieTableBody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align:center; padding: 60px 20px;">
                <div style="display:flex; flex-direction:column; align-items:center; gap:12px; color:#888;">
                  <i class="fa-solid fa-film" style="font-size:48px; color:#ddd;"></i>
                  <p style="font-size:15px;">${emptyMsg}</p>
                </div>
              </td>
            </tr>`;
    renderPagination(0);
    return;
  }

  const totalPages = Math.ceil(filtered.length / MOVIES_PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages;

  const startIdx = (currentPage - 1) * MOVIES_PER_PAGE;
  const pageItems = filtered.slice(startIdx, startIdx + MOVIES_PER_PAGE);

  pageItems.forEach(({ movie, index }) => {
    let statusClass = "";
    let statusLabel = "";
    if (movie.status == 0) {
      statusClass = "status-ended";
      statusLabel = "Đã chiếu";
    } else if (movie.status == 1) {
      statusClass = "status-showing";
      statusLabel = "Đang chiếu";
    } else if (movie.status == 2) {
      statusClass = "status-upcoming";
      statusLabel = "Sắp chiếu";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td><img src="${movie.posterUrl || "https://via.placeholder.com/50x70"}" class="movie-poster"></td>
            <td><strong>${movie.titleVi}</strong></td>
            <td><span class="badge">${movie.genres}</span></td>
            <td>${movie.duration} phút</td>
            <td>${formatDate(movie.releaseDate)}</td>
            <td><span class="${statusClass}">${statusLabel}</span></td>
            <td class="actions">
              <i class="fa-solid fa-pen" onclick="editMovie(${index})" style="cursor:pointer; margin-right:10px;"></i>
              <i class="fa-solid fa-circle-xmark" onclick="deleteMovie(${index})" style="color: #666; cursor:pointer;"></i>
            </td>`;
    movieTableBody.appendChild(tr);
  });

  renderPagination(filtered.length);
};

// PHẦN 5: PHÂN TRANG

const renderPagination = (totalItems) => {
  const totalPages = Math.ceil(totalItems / MOVIES_PER_PAGE);
  const paginationEl = document.querySelector(".pagination");
  const paginationInfo = document.querySelector(".pagination-footer p");

  if (paginationInfo) {
    if (totalItems === 0) {
      paginationInfo.textContent = "Không có phim nào";
    } else {
      const start = (currentPage - 1) * MOVIES_PER_PAGE + 1;
      const end = Math.min(currentPage * MOVIES_PER_PAGE, totalItems);
      paginationInfo.textContent = `Hiển thị ${end - start + 1} trên ${totalItems} phim`;
    }
  }

  if (!paginationEl) return;
  paginationEl.innerHTML = "";
  if (totalPages <= 1) return;

  // Nút Prev
  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.style.opacity = currentPage === 1 ? "0.4" : "1";
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });
  paginationEl.appendChild(prevBtn);

  // Số trang
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      pages.push(totalPages);
    }
    return pages;
  };

  getPageNumbers().forEach((page) => {
    if (page === "...") {
      const span = document.createElement("span");
      span.textContent = "...";
      span.style.padding = "0 4px";
      paginationEl.appendChild(span);
    } else {
      const btn = document.createElement("button");
      btn.textContent = page;
      if (page === currentPage) btn.classList.add("active");
      btn.addEventListener("click", () => {
        currentPage = page;
        renderTable();
      });
      paginationEl.appendChild(btn);
    }
  });

  // Nút Next
  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.style.opacity = currentPage === totalPages ? "0.4" : "1";
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
    }
  });
  paginationEl.appendChild(nextBtn);
};

// PHẦN 6: CẬP NHẬT SỐ LƯỢNG FILTER

const updateFilterCounts = () => {
  const counts = [
    movies.length,
    movies.filter((m) => m.status == 1).length,
    movies.filter((m) => m.status == 2).length,
    movies.filter((m) => m.status == 0).length,
  ];
  const labels = ["Tất cả", "Đang chiếu", "Sắp chiếu", "Đã chiếu"];

  document.querySelectorAll(".filter-btn").forEach((btn, i) => {
    const dotEl = btn.querySelector(".dot");
    const dotHTML = dotEl ? dotEl.outerHTML : '<span class="dot"></span>';
    btn.innerHTML = `${dotHTML}${labels[i]} (${counts[i]})`;
  });
};

// PHẦN 7: TÌM KIẾM PHIM

const searchInput = document.getElementById("search-input");
if (searchInput) {
  const searchBox = searchInput.closest(".search-box");
  const clearBtn = document.createElement("i");
  clearBtn.className = "fa-solid fa-xmark search-clear-btn";
  clearBtn.style.cssText =
    "cursor:pointer; color:#999; display:none; position:absolute; right:12px; top:50%; transform:translateY(-50%);";
  searchBox.style.position = "relative";
  searchBox.appendChild(clearBtn);

  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value;
    currentPage = 1;
    clearBtn.style.display = currentSearch ? "block" : "none";
    renderTable();
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    currentSearch = "";
    currentPage = 1;
    clearBtn.style.display = "none";
    searchInput.focus();
    renderTable();
  });
}

// PHẦN 8: LỌC THEO TRẠNG THÁI

const filterBtns = document.querySelectorAll(".filter-btn");
const filterValues = ["all", "showing", "upcoming", "ended"];

filterBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = filterValues[index] || "all";
    currentPage = 1;
    renderTable();
  });
});

// PHẦN 9: MODAL THÊM / SỬA PHIM

const modal = document.getElementById("movie-modal");
const btnAddMovie = document.getElementById("open-modal-btn");
const btnClose = document.getElementById("close-modal");
const btnCancel = document.getElementById("btn-cancel");
const movieForm = document.getElementById("movie-form");
const modalTitle = document.querySelector("#movie-modal .modal-header h2");
const btnSubmit = document.querySelector(".btn-submit-red");

btnAddMovie.addEventListener("click", () => {
  editIndex = null;
  movieForm.reset();
  modalTitle.innerText = "Thêm Phim Mới";
  btnSubmit.innerHTML = "+ Thêm mới";
  modal.classList.add("show");
});

const closeModal = () => {
  modal.classList.remove("show");
  editIndex = null;
};

btnClose.addEventListener("click", closeModal);
btnCancel.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Hàm sửa phim (global để onclick inline gọi được)
window.editMovie = (index) => {
  editIndex = index;
  const movie = movies[index];

  modalTitle.innerText = "Cập Nhật Thông Tin Phim";
  btnSubmit.innerHTML = '<i class="fa-solid fa-save"></i> Cập nhật';

  document.getElementById("movie-name").value = movie.titleVi;
  document.getElementById("movie-genre").value = movie.genres;
  document.getElementById("movie-duration").value = movie.duration;
  document.getElementById("movie-date").value = movie.releaseDate;
  document.getElementById("movie-status").value = movie.status;
  document.getElementById("movie-price").value = movie.ticketPrice;
  document.getElementById("movie-image").value = movie.posterUrl;
  document.getElementById("movie-desc").value = movie.description;

  modal.classList.add("show");
};

// PHẦN 10: LƯU PHIM (THÊM MỚI / CẬP NHẬT)

movieForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const titleVi = document.getElementById("movie-name").value.trim();
  const genres = document.getElementById("movie-genre").value.trim();
  const duration = parseFloat(document.getElementById("movie-duration").value);
  const releaseDate = document.getElementById("movie-date").value;
  const status = document.getElementById("movie-status").value;
  const ticketPrice = parseFloat(document.getElementById("movie-price").value);
  const posterUrl = document.getElementById("movie-image").value.trim();
  const description = document.getElementById("movie-desc").value.trim();
  const clearAllErrors = () => {
    document.getElementById("errName").textContent = "";
    document.getElementById("errGenre").textContent = "";
    document.getElementById("errDuration").textContent = "";
    document.getElementById("errDate").textContent = "";
    document.getElementById("errPrice").textContent = "";
    document.getElementById("errImg").textContent = "";
  };

  let hasError = false;

  document.getElementById("btn-cancel").addEventListener("click", () => {
    clearAllErrors();
  });
  document.getElementById("close-modal").addEventListener("click", () => {
    clearAllErrors();
  });
  // Validate tên phim
  if (!titleVi) {
    document.getElementById("errName").textContent =
      "Tên phim không được để trống";
    hasError = true;
  } else {
    document.getElementById("errName").textContent = "";
  }

  // Validate thể loại
  if (!genres) {
    document.getElementById("errGenre").textContent =
      "Thể loại không được để trống";
    hasError = true;
  } else {
    document.getElementById("errGenre").textContent = "";
  }

  // Validate thời lượng
  if (isNaN(duration) || duration <= 0) {
    document.getElementById("errDuration").textContent =
      "Thời gian không được để trống";
    hasError = true;
  } else {
    document.getElementById("errDuration").textContent = "";
  }

  // Validate ngày chiếu
  if (!releaseDate) {
    document.getElementById("errDate").textContent =
      "Ngày chiếu không được để trống";
    hasError = true;
  } else {
    document.getElementById("errDate").textContent = "";
  }

  // Validate giá vé
  if (isNaN(ticketPrice) || ticketPrice < 0) {
    document.getElementById("errPrice").textContent = "Giá tiền phải lớn hơn 0";
    hasError = true;
  } else {
    document.getElementById("errPrice").textContent = "";
  }
  // validate link ảnh
  if (!posterUrl) {
    document.getElementById("errImg").textContent =
      "Link ảnh không được để trống";
    hasError = true;
  } else {
    document.getElementById("errImg").textContent = "";
  }
  // Nếu có lỗi thì dừng
  if (hasError) return;

  // Clear toàn bộ lỗi
  clearAllErrors();

  const movieData = {
    id: Date.now(),
    titleVi,
    genres,
    duration,
    releaseDate,
    status,
    ticketPrice,
    posterUrl,
    description,
  };

  if (editIndex !== null) {
    movieData.id = movies[editIndex].id;
    movies[editIndex] = movieData;
    localStorage.setItem("movies", JSON.stringify(movies));
    renderTable();
    closeModal();
    movieForm.reset();
    showToast(
      "Cập nhật thành công",
      `Đã cập nhật phim "${titleVi}" thành công!`,
      "success",
    );
  } else {
    movieData.id = Date.now();
    movies.push(movieData);
    localStorage.setItem("movies", JSON.stringify(movies));
    const totalAfter = getFilteredMovies().length;
    currentPage = Math.ceil(totalAfter / MOVIES_PER_PAGE);
    renderTable();
    closeModal();
    movieForm.reset();
    showToast(
      "Thêm thành công",
      `Đã thêm phim "${titleVi}" vào danh sách!`,
      "success",
      "#28a745"
    );
  }
});

// PHẦN 11: XÓA PHIM

const deleteModal = document.getElementById("delete-confirm-modal");
const deleteMovieNameEl = document.getElementById("delete-movie-name");
const btnCancelDelete = document.getElementById("btn-cancel-delete");
const btnConfirmDelete = document.getElementById("btn-confirm-delete");
let indexToDelete = null;

window.deleteMovie = (index) => {
  indexToDelete = index;
  deleteMovieNameEl.innerText = `"${movies[index].titleVi}"`;
  deleteModal.classList.add("show");
};

btnCancelDelete.onclick = () => {
  deleteModal.classList.remove("show");
  indexToDelete = null;
  showToast("Đã hủy", "Đã hủy thao tác xóa.", "cancel");
};

btnConfirmDelete.onclick = () => {
  if (indexToDelete !== null) {
    const deletedName = movies[indexToDelete].titleVi;
    movies.splice(indexToDelete, 1);
    localStorage.setItem("movies", JSON.stringify(movies));
    const totalPages = Math.ceil(getFilteredMovies().length / MOVIES_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    renderTable();
    deleteModal.classList.remove("show");
    indexToDelete = null;
    showToast("Đã xóa", `Đã xóa phim "${deletedName}" thành công!`, "success");
  }
};

window.addEventListener("click", (e) => {
  if (e.target === deleteModal) {
    deleteModal.classList.remove("show");
    indexToDelete = null;
  }
});

// PHẦN 12: ĐĂNG XUẤT

const logoutModal = document.getElementById("logout-modal");
const btnOut = document.querySelector(".btn-out");
const btnCloseLogout = document.getElementById("close-logout");
const btnStay = document.getElementById("btn-stay");
const btnConfirmLogout = document.getElementById("btn-confirm-logout");

if (btnOut) {
  btnOut.addEventListener("click", (e) => {
    e.preventDefault();
    logoutModal.classList.add("show");
  });
}

const closeLogoutModal = () => logoutModal.classList.remove("show");
if (btnCloseLogout) btnCloseLogout.onclick = closeLogoutModal;
if (btnStay) btnStay.onclick = closeLogoutModal;
window.addEventListener("click", (e) => {
  if (e.target === logoutModal) closeLogoutModal();
});
if (btnConfirmLogout) {
  btnConfirmLogout.onclick = () => {
    window.location.href = "login.html";
  };
}

// PHẦN 13: TOAST THÔNG BÁO

function showToast(title, message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  const icon =
    type === "success"
      ? '<i class="fa-solid fa-circle-check"></i>'
      : '<i class="fa-solid fa-circle-xmark"></i>';

  toast.className = `toast ${type === "success" ? "toast-success" : "toast-cancel"}`;
  toast.innerHTML = `
          <div class="toast-icon">${icon}</div>
          <div class="toast-content"><h4>${title}</h4><p>${message}</p></div>
          <div class="toast-close"><i class="fa-solid fa-xmark"></i></div>`;
  container.appendChild(toast);

  const autoClose = setTimeout(() => {
    toast.style.animation = "fadeOut 0.5s ease forwards";
    setTimeout(() => toast.remove(), 500);
  }, 3000);

  toast.querySelector(".toast-close").onclick = () => {
    clearTimeout(autoClose);
    toast.remove();
  };
}
