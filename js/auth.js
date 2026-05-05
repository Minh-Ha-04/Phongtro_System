// ============================================================
//  auth.js — Xu ly Dang nhap, Dang ky & Bao mat (JWT)
// ============================================================

/**
 * Kiem tra trang thai dang nhap khi vua vao trang
 */
function checkAuthOnLoad() {
  const token = localStorage.getItem(TOKEN_KEY);
  const loginOverlay = document.getElementById('loginOverlay');
  const mainContent = document.querySelector('.main');

  if (token) {
    loginOverlay.style.display = 'none';
    mainContent.style.display = 'flex';
    document.body.classList.remove('login-pending');

    // Update greeting with stored user info
    const userInfo = localStorage.getItem(USER_KEY);
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        const greeting = document.getElementById('userGreeting');
        if (greeting) {
          greeting.textContent = user.fullName || user.username || 'Admin';
        }
      } catch (e) { /* ignore parse error */ }
    }
  } else {
    loginOverlay.style.display = 'flex';
    mainContent.style.display = 'none';
    document.body.classList.add('login-pending');
  }
}

/**
 * Xu ly su kien nhan nut Dang nhap
 */
async function handleLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errorEl = document.getElementById('loginError');

  if (!user || !pass) {
    errorEl.textContent = 'Vui long nhap tai khoan va mat khau!';
    errorEl.style.display = 'block';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass }),
    });

    if (!res.ok) {
      errorEl.textContent = 'Sai tai khoan hoac mat khau!';
      errorEl.style.display = 'block';
      shakeLoginCard();
      return;
    }

    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    errorEl.style.display = 'none';

    // Hieu ung chuyen canh muot ma
    const loginOverlay = document.getElementById('loginOverlay');
    loginOverlay.style.opacity = '0';
    loginOverlay.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (e) {
    errorEl.textContent = 'Khong the ket noi den server!';
    errorEl.style.display = 'block';
    shakeLoginCard();
  }
}

/**
 * Xu ly su kien nhan nut Dang ky
 */
async function handleRegister() {
  const fullName = document.getElementById('registerFullName').value.trim();
  const user = document.getElementById('registerUser').value.trim();
  const pass = document.getElementById('registerPass').value;
  const passConfirm = document.getElementById('registerPassConfirm').value;
  const errorEl = document.getElementById('registerError');

  if (!fullName || !user || !pass) {
    errorEl.textContent = 'Vui long dien day du thong tin!';
    errorEl.style.display = 'block';
    return;
  }

  if (pass !== passConfirm) {
    errorEl.textContent = 'Mat khau xac nhan khong khop!';
    errorEl.style.display = 'block';
    return;
  }

  if (pass.length < 4) {
    errorEl.textContent = 'Mat khau phai co it nhat 4 ky tu!';
    errorEl.style.display = 'block';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass, fullName: fullName }),
    });

    if (res.status === 409) {
      errorEl.textContent = 'Tai khoan da ton tai!';
      errorEl.style.display = 'block';
      return;
    }

    if (!res.ok) {
      errorEl.textContent = 'Dang ky that bai!';
      errorEl.style.display = 'block';
      return;
    }

    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    errorEl.style.display = 'none';

    // Hieu ung chuyen canh
    const loginOverlay = document.getElementById('loginOverlay');
    loginOverlay.style.opacity = '0';
    loginOverlay.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (e) {
    errorEl.textContent = 'Khong the ket noi den server!';
    errorEl.style.display = 'block';
  }
}

/**
 * Chuyen sang form dang ky
 */
function showRegisterForm() {
  document.getElementById('loginFormSection').style.display = 'none';
  document.getElementById('registerFormSection').style.display = 'block';
  document.getElementById('loginError').style.display = 'none';
  document.getElementById('registerError').style.display = 'none';
  // Update header
  document.querySelector('.login-header h2').textContent = 'Dang ky tai khoan';
  document.querySelector('.login-header p').textContent = 'Tao tai khoan moi de su dung he thong';
}

/**
 * Chuyen sang form dang nhap
 */
function showLoginForm() {
  document.getElementById('loginFormSection').style.display = 'block';
  document.getElementById('registerFormSection').style.display = 'none';
  document.getElementById('loginError').style.display = 'none';
  document.getElementById('registerError').style.display = 'none';
  // Update header
  document.querySelector('.login-header h2').textContent = 'He thong Quan ly Phong tro';
  document.querySelector('.login-header p').textContent = 'Vui long dang nhap de tiep tuc';
}

/**
 * Dang xuat
 */
function handleLogout() {
  if (confirm('Ban co chac chan muon dang xuat?')) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.reload();
  }
}

/**
 * Hieu ung rung card khi sai thong tin
 */
function shakeLoginCard() {
  const card = document.querySelector('.login-card');
  card.style.animation = 'none';
  setTimeout(() => {
    card.style.animation = 'shake 0.4s';
  }, 10);
}

// Them animation rung khi sai mat khau vao CSS qua JS
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

// Khoi chay kiem tra khi trang load
document.addEventListener('DOMContentLoaded', checkAuthOnLoad);

/**
 * Ho tro nhan Enter de dang nhap/dang ky
 */
document.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    const overlay = document.getElementById('loginOverlay');
    if (overlay && overlay.style.display !== 'none') {
      const registerSection = document.getElementById('registerFormSection');
      if (registerSection && registerSection.style.display !== 'none') {
        handleRegister();
      } else {
        handleLogin();
      }
    }
  }
});
