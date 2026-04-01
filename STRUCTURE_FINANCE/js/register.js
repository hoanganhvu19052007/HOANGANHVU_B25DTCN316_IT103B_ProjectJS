let users = JSON.parse(localStorage.getItem("users")) || [
  {
    id: 1,
    fullName: "Admin Chính",
    email: "LQTuan@rikkei.edu.vn",
    password: "Admin123456",
    role: "admin",
    createdAt: "2026-03-03T12:26:21.617Z",
    isActive: true,
  },
  {
    id: 2,
    fullName: "Nguyễn Van A",
    email: "nguyenvana@example.com",
    password: "Matkhau123",
    role: "user",
    createdAt: "2026-03-01T12:26:21.617Z",
    isActive: true,
  },
  {
    id: 3,
    fullName: "Trần Thị B",
    email: "tranthib@example.com",
    password: "12345678",
    role: "user",
    createdAt: "2026-03-03T12:26:21.617Z",
    isActive: false,
  },
];

// Lưu dữ liệu mặc định nếu chưa có trong localStorage
if (!localStorage.getItem("users")) {
  localStorage.setItem("users", JSON.stringify(users));
}

const nameElement = document.getElementById("fullname");
const emailElement = document.getElementById("email");
const passwordElement = document.getElementById("password");
const confirmElement = document.getElementById("confirm");
const termsCheckbox = document.getElementById("terms");


const errTerms = document.getElementById("errTerms");
const errName = document.getElementById("errName");
const errEmail = document.getElementById("errEmail");
const errPassword = document.getElementById("errPassword");
const btn_register = document.querySelector(".btn-register");
const toggleBtns = document.querySelectorAll(".form__eye");
// thông báo đăng nhập
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

btn_register.addEventListener("click", () => {
  let name = nameElement.value.trim();
  let email = emailElement.value.trim();
  let password = passwordElement.value.trim();
  let confirm = confirmElement.value.trim();

  let isValid = true;

  errName.textContent = "";
  errEmail.textContent = "";
  errPassword.textContent = "";
  errTerms.textContent = "";

  if (name === "") {
    errName.textContent = "Tên không được để trống";
    isValid = false;
  }

  if (email === "") {
    errEmail.textContent = "Email không được để trống";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errEmail.textContent = "Email không đúng định dạng";
    isValid = false;
  } else {
    // Kiểm tra email đã tồn tại trong localStorage
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (existingUser) {
      errEmail.textContent = "Email này đã được đăng ký";
      isValid = false;
    }
  }

  if (password === "") {
    errPassword.textContent = "Mật khẩu không được để trống";
    isValid = false;
  } else if (password.length < 8) {
    errPassword.textContent = "Mật khẩu phải có ít nhất 8 ký tự";
    isValid = false;
  } else if (!/[A-Z]/.test(password)) {
    errPassword.textContent = "Mật khẩu phải có ít nhất 1 chữ hoa";
    isValid = false;
  } else if (!/[0-9]/.test(password)) {
    errPassword.textContent = "Mật khẩu phải có ít nhất 1 chữ số";
    isValid = false;
  } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errPassword.textContent =
      "Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%...)";
    isValid = false;
  } else if (confirm === "") {
    errPassword.textContent = "Vui lòng xác nhận mật khẩu";
    isValid = false;
  } else if (password !== confirm) {
    errPassword.textContent = "Mật khẩu xác nhận không khớp";
    isValid = false;
  }

  if (!termsCheckbox.checked) {
    errTerms.textContent = "Bạn phải đồng ý với điều khoản sử dụng";
    isValid = false;
  }

  if (isValid) {
    const newUser = {
      id: Math.random() * 1000000000,
      fullName: name,
      email: email,
      password: password,
      role: "user",
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    showToast(
      "success",
      "Đăng ký thành công",
      "Chào mừng bạn đến với Rikkei Cinema!",
    );
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1500);
  }
});

toggleBtns[0].onclick = () => {
  const isHidden = passwordElement.type === "password";
  passwordElement.type = isHidden ? "text" : "password";
  toggleBtns[0].querySelector("i").className = isHidden
    ? "fa-solid fa-eye-slash"
    : "far fa-eye";
};

toggleBtns[1].onclick = () => {
  const isHidden = confirmElement.type === "password";
  confirmElement.type = isHidden ? "text" : "password";
  toggleBtns[1].querySelector("i").className = isHidden
    ? "fa-solid fa-eye-slash"
    : "far fa-eye";
};
