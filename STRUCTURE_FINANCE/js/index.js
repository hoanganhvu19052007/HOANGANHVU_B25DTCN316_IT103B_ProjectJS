const movies = [
  {
    id: 1,
    title: "Dune: Part Two",
    titleVi: "Dune: Hành Tinh Cát - Phần 2",
    genres: "Hành động, Viễn tưởng",
    duration: 166,
    releaseDate: "01-03-2024",
    status: 1, // 0 đã chiếu 1 đang chiếu 2. sắp chiếu
    posterUrl:
      "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    description:
      "Tiếp nối phần trước, Paul Atreides hợp nhất với Fremen để trả thù gia tộc Harkonnen và đối mặt với số phận của mình.",
    ticketPrice: 95000,
  },
  {
    id: 2,
    title: "Kung Fu Panda 4",
    titleVi: "Kung Fu Panda 4",
    genres: "Hoạt hình, Hài",
    duration: 94,
    releaseDate: "08-03-2024",
    status: 1,
    posterUrl:
      "https://image.tmdb.org/t/p/original/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
    description:
      "Po tiếp tục hành trình trở thành Chiến binh Rồng, đối mặt với kẻ thù mới và tìm người kế nhiệm.",
    ticketPrice: 80000,
  },
  {
    id: 3,
    title: "Godzilla x Kong: The New Empire",
    titleVi: "Godzilla x Kong: Đế Chế Mới",
    genres: "Hành động, Viễn tưởng",
    duration: 115,
    releaseDate: "29-03-2024",
    status: 1,
    posterUrl:
      "https://image.tmdb.org/t/p/original/tMefBSflR6PGQLv7WvFPpKLZkyk.jpg",
    description:
      "Godzilla và Kong hợp sức chống lại mối đe dọa mới từ lòng đất.",
    ticketPrice: 88000,
  },
  {
    id: 4,
    title: "Mai",
    titleVi: "Mai",
    genres: "Tâm lý, Tình cảm",
    duration: 131,
    releaseDate: "10-02-2024",
    status: 1,
    posterUrl:
      "https://th.bing.com/th/id/OIP.DdBSYgUiHeU-OLbNO4lnwgHaKf?w=129&h=184&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
    description:
      "Câu chuyện về một người phụ nữ mạnh mẽ đối mặt với những biến cố trong cuộc sống.",
    ticketPrice: 80000,
  },
  {
    id: 5,
    title: "Exhuma",
    titleVi: "Exhuma: Quật Mộ Trùng Ma",
    genres: "Kinh dị, Bí ẩn",
    duration: 134,
    releaseDate: "15-03-2024",
    status: 1,
    posterUrl:
      "https://static2.vieon.vn/vieplay-image/thumbnail_big_v4_ntc/2025/05/23/5fomihpc_1920x1080-quatmotrungma-notitle_1267_712.jpeg",
    description:
      "Một nhóm chuyên gia phong thủy khai quật mộ cổ và đối mặt với lời nguyền đáng sợ.",
    ticketPrice: 80000,
  },
];

// Lưu movies vào localStorage (xóa cache cũ để cập nhật ảnh mới)
localStorage.setItem("movies", JSON.stringify(movies));

// Render 4 phim đang chiếu
const renderMovies = () => {
  const storedMovies = JSON.parse(localStorage.getItem("movies")) || [];
  const nowShowing = storedMovies.filter((m) => m.status === 1).slice(0, 4);
  const movieGrid = document.querySelector(".movie-grid");
  if (!movieGrid) return;

  // Xóa nội dung cũ trước
  movieGrid.innerHTML = "";

  nowShowing.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");

    movieCard.innerHTML = `
      <img src="${movie.posterUrl}" alt="${movie.titleVi}" />
      <div class="movie-info">
        <h3>${movie.titleVi}</h3>
        <p><i class="fa-regular fa-clock"></i> ${movie.duration} phút • ${movie.genres}</p>
        <button class="btn-block">Mua Vé</button>
      </div>
    `;

    movieGrid.appendChild(movieCard);
  });
};
// Render hero với phim cuối (Exhuma có ảnh landscape đẹp)
const renderHero = () => {
  const storedMovies = JSON.parse(localStorage.getItem("movies")) || [];
  const heroMovie = storedMovies[4];
  if (!heroMovie) return;

  const heroSection = document.querySelector(".hero");
  heroSection.style.backgroundImage = `url('${heroMovie.posterUrl}')`;
  document.querySelector(".hero-content h1").textContent = heroMovie.titleVi;
  document.querySelector(".hero-content p").textContent = heroMovie.description;
};

renderMovies();
renderHero();

const btnPrimary = document.querySelector(".btn-primary");
btnPrimary.addEventListener("click", () => {
  setTimeout(() => {
    window.location.href = "./login.html";
  }, 1000);
});

// nút đăng xuất account
const authContainer = document.getElementById("authContainer");
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

const modal = document.getElementById("logoutModal");

if (currentUser) {
  authContainer.innerHTML = `
    <span>Xin chào, ${currentUser.email}</span>
    <button id="logoutBtn" class="btn-primary">Đăng xuất</button>
  `;

  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  // Nút xác nhận
  document.getElementById("confirmLogout").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.reload();
  });

  // Nút hủy
  document.getElementById("cancelLogout").addEventListener("click", () => {
    modal.style.display = "none";
  });
} else {
  authContainer.innerHTML = `
    <button id="loginBtn" class="btn-primary">Đăng nhập / Đăng ký</button>
  `;

  document.getElementById("loginBtn").addEventListener("click", () => {
    window.location.href = "./login.html";
  });
}
