// ============================================================
//  auth.js — Xu ly Dang nhap, Dang ky & Bao mat (JWT)
// ============================================================

/**
 * Kiem tra trang thai dang nhap khi vua vao trang
 */
function checkAuthOnLoad() {
  const token = localStorage.getItem(TOKEN_KEY);
  const loginOverlay = document.getElementById("loginOverlay");
  const mainContent = document.querySelector(".main");

  if (token) {
    loginOverlay.style.display = "none";
    mainContent.style.display = "flex";
    document.body.classList.remove("login-pending");

    // Update greeting with stored user info
    const userInfo = localStorage.getItem(USER_KEY);
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        const greeting = document.getElementById("userGreeting");
        if (greeting) {
          greeting.textContent = user.fullName || user.username || "Admin";
        }
      } catch (e) {
        /* ignore parse error */
      }
    }
  } else {
    loginOverlay.style.display = "flex";
    mainContent.style.display = "none";
    document.body.classList.add("login-pending");
  }
}

/**
 * Xu ly su kien nhan nut Dang nhap
 */
async function handleLogin() {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value;
  const errorEl = document.getElementById("loginError");

  if (!user || !pass) {
    errorEl.textContent = "Vui lòng nhập tài khoản và mật khẩu !";
    errorEl.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass }),
    });

    if (!res.ok) {
      errorEl.textContent = "Sai tài khoản hoặc mật khẩu!";
      errorEl.style.display = "block";
      shakeLoginCard();
      return;
    }

    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    errorEl.style.display = "none";

    // Hieu ung chuyen canh muot ma
    const loginOverlay = document.getElementById("loginOverlay");
    loginOverlay.style.opacity = "0";
    loginOverlay.style.transition = "opacity 0.5s ease";

    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (e) {
    errorEl.textContent = "Khônh thể kết nối tới sever !";
    errorEl.style.display = "block";
    shakeLoginCard();
  }
}

/**
 * Xu ly su kien nhan nut Dang ky
 */
async function handleRegister() {
  const fullName = document.getElementById("registerFullName").value.trim();
  const user = document.getElementById("registerUser").value.trim();
  const pass = document.getElementById("registerPass").value;
  const passConfirm = document.getElementById("registerPassConfirm").value;
  const errorEl = document.getElementById("registerError");

  if (!fullName || !user || !pass) {
    errorEl.textContent = "Vui lòng điền đầy đủ thông tin !";
    errorEl.style.display = "block";
    return;
  }

  if (pass !== passConfirm) {
    errorEl.textContent = "Mật khẩu xác nhận không khớp !";
    errorEl.style.display = "block";
    return;
  }

  if (pass.length < 4) {
    errorEl.textContent = "Mật khẩu có ít nhất 4 ký tự !";
    errorEl.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user,
        password: pass,
        fullName: fullName,
      }),
    });

    if (res.status === 409) {
      errorEl.textContent = "Tài khoản đã tồn tại !";
      errorEl.style.display = "block";
      return;
    }

    if (!res.ok) {
      errorEl.textContent = "Đăng ký thất bại !";
      errorEl.style.display = "block";
      return;
    }

    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    errorEl.style.display = "none";

    // Hieu ung chuyen canh
    const loginOverlay = document.getElementById("loginOverlay");
    loginOverlay.style.opacity = "0";
    loginOverlay.style.transition = "opacity 0.5s ease";

    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (e) {
    errorEl.textContent = "Khong the ket noi den server!";
    errorEl.style.display = "block";
  }
}

/**
 * Chuyen sang form dang ky
 */
function showRegisterForm() {
  document.getElementById("loginFormSection").style.display = "none";
  document.getElementById("registerFormSection").style.display = "block";
  document.getElementById("loginError").style.display = "none";
  document.getElementById("registerError").style.display = "none";
  // Update header
  document.querySelector(".login-header h2").textContent = "Đăng ký tài khoản ";
  document.querySelector(".login-header p").textContent =
    "Tạo tài khoản mới để quản lý phòng trọ dễ dàng hơn";
}

/**
 * Chuyen sang form dang nhap
 */
function showLoginForm() {
  document.getElementById("loginFormSection").style.display = "block";
  document.getElementById("registerFormSection").style.display = "none";
  document.getElementById("loginError").style.display = "none";
  document.getElementById("registerError").style.display = "none";
  // Update header
  document.querySelector(".login-header h2").textContent =
    "Hệ thống Quản lý Phòng trọ";
  document.querySelector(".login-header p").textContent =
    "Vui lòng đăng nhập để tiếp tục sử dụng các tính năng quản lý phòng trọ";
}

/**
 * Dang xuat
 */
function handleLogout() {
  if (confirm("Bạn có chắc muốn đăng xuất không ?")) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.reload();
  }
}

/**
 * Hieu ung rung card khi sai thong tin
 */
function shakeLoginCard() {
  const card = document.querySelector(".login-card");
  card.style.animation = "none";
  setTimeout(() => {
    card.style.animation = "shake 0.4s";
  }, 10);
}

// Them animation rung khi sai mat khau vao CSS qua JS
const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

// Khoi chay kiem tra khi trang load
document.addEventListener("DOMContentLoaded", checkAuthOnLoad);

/**
 * Ho tro nhan Enter de dang nhap/dang ky
 */
document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const overlay = document.getElementById("loginOverlay");
    if (overlay && overlay.style.display !== "none") {
      const registerSection = document.getElementById("registerFormSection");
      if (registerSection && registerSection.style.display !== "none") {
        handleRegister();
      } else {
        handleLogin();
      }
    }
  }
});
