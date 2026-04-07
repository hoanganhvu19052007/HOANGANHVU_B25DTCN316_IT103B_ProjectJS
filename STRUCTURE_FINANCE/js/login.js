// Lấy danh sách users từ localStorage
const users = JSON.parse(localStorage.getItem("users")) || [];

const emailElement = document.getElementById("email");
const passwordElement = document.getElementById("password");
const btn_submit = document.querySelector(".btn-submit");
const rememberCheckbox = document.getElementById("remember");

const errEmail = document.getElementById("errEmail");
const errPassword = document.getElementById("errPassword");

const showToast = (type, title, msg) => {
  const icons = { success: "✓", error: "✕", warning: "!", info: "i" };
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div class="toast-body">
      <p class="toast-title">${title}</p>
      <p class="toast-msg">${msg}</p>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  container.prepend(toast);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => toast.classList.add("show")),
  );
  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 250);
  }, 4000);
};

btn_submit.addEventListener("click", () => {
  const email = emailElement.value.trim();
  const password = passwordElement.value.trim();
  let isValid = true;

  errEmail.textContent = "";
  errPassword.textContent = "";

  // --- Validate ---
  if (email === "") {
    errEmail.textContent = "Email không được để trống";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errEmail.textContent = "Email không đúng định dạng";
    isValid = false;
  }

  if (password === "") {
    errPassword.textContent = "Mật khẩu không được để trống";
    isValid = false;
  }

  if (!isValid) return;

  // --- Kiểm tra user ---
  const foundUser = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );

  if (!foundUser) {
    errEmail.textContent = "Email không tồn tại trong hệ thống";
    return;
  }

  if (foundUser.password !== password) {
    errPassword.textContent = "Mật khẩu không chính xác";
    return;
  }

  if (!foundUser.isActive) {
    showToast("error", "Tài khoản bị khóa", "Vui lòng liên hệ quản trị viên.");
    return;
  }

  // --- Lưu phiên đăng nhập ---
  localStorage.setItem("currentUser", JSON.stringify(foundUser));

  showToast(
    "success",
    "Đăng nhập thành công",
    `Chào mừng ${foundUser.fullName}!`,
  );

  setTimeout(() => {
    if (foundUser.role === "admin") {
      window.location.href = "./admin.html";
    } else if (foundUser.role === "user") {
      window.location.href = "./index.html";
    }
  }, 1500);
});

// --- Toggle hiện/ẩn mật khẩu ---
function togglePass() {
  const isHidden = passwordElement.type === "password";
  passwordElement.type = isHidden ? "text" : "password";
}
