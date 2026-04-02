// 1. Khởi tạo hoặc lấy dữ liệu từ localStorage
let movies = JSON.parse(localStorage.getItem("movies")) || [];
let editIndex = null; // Biến dùng để kiểm tra đang Thêm mới (null) hay Sửa (chỉ số index)

// 2. Các phần tử DOM
const movieTableBody = document.getElementById("movie-table-body");
const modal = document.getElementById("movie-modal");
const btnAddMovie = document.getElementById("open-modal-btn");
const btnClose = document.getElementById("close-modal");
const btnCancel = document.getElementById("btn-cancel");
const movieForm = document.getElementById("movie-form");
const modalTitle = document.querySelector(".modal-header h2");
const btnSubmit = document.querySelector(".btn-submit-red");

// 3. Hàm Render bảng phim ra màn hình
const renderTable = () => {
  if (!movieTableBody) return;
  movieTableBody.innerHTML = "";

  if (movies.length === 0) {
    movieTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color: #666;">Chưa có phim nào trong danh sách.</td></tr>`;
    return;
  }

  movies.forEach((movie, index) => {
    let statusClass = "";
    let statusLabel = "";

    // Đồng bộ logic trạng thái: 0: Đã chiếu, 1: Đang chiếu, 2: Sắp chiếu
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
      <td>${movie.releaseDate}</td>
      <td><span class="${statusClass}">${statusLabel}</span></td>
      <td class="actions">
        <i class="fa-solid fa-pen" onclick="editMovie(${index})" style="cursor:pointer; margin-right:10px;"></i>
        <i class="fa-solid fa-circle-xmark" onclick="deleteMovie(${index})" style="color: #666; cursor:pointer;"></i>
      </td>
    `;
    movieTableBody.appendChild(tr);
  });
};

// 4. Xử lý đóng/mở Modal
btnAddMovie.addEventListener("click", () => {
  editIndex = null; // Reset về chế độ thêm mới
  movieForm.reset();
  modalTitle.innerText = "Thêm Phim Mới"; //
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

// 5. Hàm sửa phim (Đổ dữ liệu vào modal)
window.editMovie = (index) => {
  editIndex = index; // Lưu vị trí phim đang sửa
  const movie = movies[index];

  // Thay đổi giao diện modal sang chế độ Cập nhật
  modalTitle.innerText = "Cập Nhật Thông Tin Phim";
  btnSubmit.innerHTML = '<i class="fa-solid fa-save"></i> Cập nhật';

  // Đổ dữ liệu từ mảng vào các ô input
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

// 6. Xử lý Lưu dữ liệu (Gộp cả Thêm và Sửa)
movieForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const movieData = {
    titleVi: document.getElementById("movie-name").value,
    genres: document.getElementById("movie-genre").value,
    duration: document.getElementById("movie-duration").value,
    releaseDate: document.getElementById("movie-date").value,
    status: document.getElementById("movie-status").value,
    ticketPrice: document.getElementById("movie-price").value,
    posterUrl: document.getElementById("movie-image").value,
    description: document.getElementById("movie-desc").value,
  };

  if (editIndex !== null) {
    // Nếu đang ở chế độ sửa, cập nhật lại phần tử tại vị trí editIndex
    movieData.id = movies[editIndex].id;
    movies[editIndex] = movieData;
  } else {
    // Nếu thêm mới
    movieData.id = Date.now();
    movies.push(movieData);
  }

  // Lưu lại vào localStorage
  localStorage.setItem("movies", JSON.stringify(movies));

  // Cập nhật giao diện
  renderTable();
  closeModal();
  movieForm.reset();
});

// 7. Hàm Xóa phim
window.deleteMovie = (index) => {
  if (confirm("Bạn có chắc chắn muốn xóa phim này không?")) {
    movies.splice(index, 1);
    localStorage.setItem("movies", JSON.stringify(movies));
    renderTable();
  }
};

// Đăng xuất

const logoutModal = document.getElementById("logout-modal");
const btnOut = document.querySelector(".btn-out");
const btnCloseLogout = document.getElementById("close-logout");
const btnStay = document.getElementById("btn-stay");
const btnConfirmLogout = document.getElementById("btn-confirm-logout");

// Mở modal khi bấm vào icon logout
if (btnOut) {
  btnOut.addEventListener("click", (e) => {
    e.preventDefault();
    logoutModal.classList.add("show");
  });
}

// Đóng modal khi bấm Hủy hoặc dấu X
const closeLogoutModal = () => {
  logoutModal.classList.remove("show");
};

btnCloseLogout.onclick = closeLogoutModal;
btnStay.onclick = closeLogoutModal;

// Đóng khi click ra ngoài vùng xám
window.addEventListener("click", (e) => {
  if (e.target === logoutModal) closeLogoutModal();
});

// Xử lý khi bấm nút Đăng xuất màu đỏ
btnConfirmLogout.onclick = () => {
  // Xóa dữ liệu đăng nhập nếu có (Ví dụ: localStorage.removeItem("user"))
  console.log("User logged out");

  // Chuyển hướng về trang login
  window.location.href = "login.html";
};

// 8. Khởi tạo bảng khi trang tải xong
document.addEventListener("DOMContentLoaded", renderTable);
