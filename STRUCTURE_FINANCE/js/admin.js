// 1. Khởi tạo hoặc lấy dữ liệu từ localStorage
let movies = JSON.parse(localStorage.getItem("movies")) || [];
let editIndex = null;

// Biến lưu trạng thái tìm kiếm, lọc & phân trang
let currentFilter = "all";
let currentSearch = "";
let currentPage = 1;
const MOVIES_PER_PAGE = 5;

// 2. Các phần tử DOM
const movieTableBody = document.getElementById("movie-table-body");
const modal = document.getElementById("movie-modal");
const btnAddMovie = document.getElementById("open-modal-btn");
const btnClose = document.getElementById("close-modal");
const btnCancel = document.getElementById("btn-cancel");
const movieForm = document.getElementById("movie-form");
const modalTitle = document.querySelector(".modal-header h2");
const btnSubmit = document.querySelector(".btn-submit-red");
const user_email = document.querySelector(".user-email");

if (user_email) {
  const adminData = JSON.parse(localStorage.getItem("currentUser"));
  user_email.textContent = adminData ? adminData.email : "admin@gmail.com";
}

// Hàm format ngày từ yyyy-mm-dd sang dd/mm/yyyy
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

// 3. Hàm lọc + tìm kiếm phim
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

// 4. Hàm Render bảng phim ra màn hình (có phân trang)
const renderTable = () => {
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

  // Tính toán phân trang
  const totalPages = Math.ceil(filtered.length / MOVIES_PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages;

  const startIdx = (currentPage - 1) * MOVIES_PER_PAGE;
  const endIdx = startIdx + MOVIES_PER_PAGE;
  const pageItems = filtered.slice(startIdx, endIdx);

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
      </td>
    `;
    movieTableBody.appendChild(tr);
  });

  renderPagination(filtered.length);
};

// 5. Render phân trang động
const renderPagination = (totalItems) => {
  const totalPages = Math.ceil(totalItems / MOVIES_PER_PAGE);
  const paginationEl = document.querySelector(".pagination");
  const paginationInfo = document.querySelector(".pagination-footer p");

  // Cập nhật text thông tin
  if (paginationInfo) {
    if (totalItems === 0) {
      paginationInfo.textContent = "Không có phim nào";
    } else {
      const start = (currentPage - 1) * MOVIES_PER_PAGE + 1;
      const end = Math.min(currentPage * MOVIES_PER_PAGE, totalItems);
      const displayCount = end - start + 1;
      paginationInfo.textContent = `Hiển thị ${displayCount} trên ${totalItems} phim`;
    }
  }

  if (!paginationEl) return;
  paginationEl.innerHTML = "";

  if (totalPages <= 1) return;

  // Nút Previous
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

  // Tạo danh sách số trang (có dấu ... nếu nhiều trang)
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
      if (currentPage < totalPages - 2) pages.push("...");
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

// Cập nhật số lượng trên các nút filter
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

// 6. Xử lý tìm kiếm
const searchInput = document.querySelector(".search-box input");
if (searchInput) {
  const searchBox = document.querySelector(".search-box");
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

// 7. Xử lý nút lọc theo trạng thái
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

// 8. Xử lý đóng/mở Modal thêm/sửa
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

// 9. Hàm sửa phim
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

// 10. Xử lý Lưu dữ liệu
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

  if (!releaseDate) {
    showToast("Lỗi nhập liệu", "Vui lòng chọn ngày khởi chiếu.", "cancel");
    return;
  }
  if (!genres) {
    showToast("Lỗi nhập liệu", "Vui lòng nhập thể loại phim.", "cancel");
    return;
  }
  if (isNaN(duration) || duration <= 0) {
    showToast(
      "Lỗi nhập liệu",
      "Thời lượng phim phải lớn hơn 0 phút.",
      "cancel",
    );
    return;
  }
  if (isNaN(ticketPrice) || ticketPrice < 0) {
    showToast("Lỗi nhập liệu", "Giá vé không được là số âm.", "cancel");
    return;
  }

  const movieData = {
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
    // Chuyển đến trang cuối để thấy phim vừa thêm
    const totalAfter = getFilteredMovies().length;
    currentPage = Math.ceil(totalAfter / MOVIES_PER_PAGE);
    renderTable();
    closeModal();
    movieForm.reset();
    showToast(
      "Thêm thành công",
      `Đã thêm phim "${titleVi}" vào danh sách!`,
      "success",
    );
  }
});

// 11. Xóa phim với modal xác nhận
const deleteModal = document.getElementById("delete-confirm-modal");
const deleteMovieName = document.getElementById("delete-movie-name");
const btnCancelDelete = document.getElementById("btn-cancel-delete");
const btnConfirmDelete = document.getElementById("btn-confirm-delete");
let indexToDelete = null;

window.deleteMovie = (index) => {
  indexToDelete = index;
  deleteMovieName.innerText = `"${movies[index].titleVi}"`;
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
    // Lùi trang nếu trang hiện tại không còn dữ liệu
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

// 12. Đăng xuất
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
btnCloseLogout.onclick = closeLogoutModal;
btnStay.onclick = closeLogoutModal;
window.addEventListener("click", (e) => {
  if (e.target === logoutModal) closeLogoutModal();
});
btnConfirmLogout.onclick = () => {
  window.location.href = "login.html";
};

// 13. Hàm hiển thị Toast thông báo
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
    <div class="toast-close"><i class="fa-solid fa-xmark"></i></div>
  `;
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

// 14. Khởi tạo khi trang tải xong
document.addEventListener("DOMContentLoaded", () => {
  updateFilterCounts();
  renderTable();
});
