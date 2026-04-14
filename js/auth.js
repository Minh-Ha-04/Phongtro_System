// ============================================================
//  auth.js — Xử lý Đăng nhập & Bảo mật
// ============================================================

const ADMIN_ACCOUNT = {
  user: 'admin',
  pass: '123456'
};

/**
 * Kiểm tra trạng thái đăng nhập khi vừa vào trang
 */
function checkAuthOnLoad() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const loginOverlay = document.getElementById('loginOverlay');
  const mainContent = document.querySelector('.main');

  if (isLoggedIn === 'true') {
    loginOverlay.style.display = 'none';
    mainContent.style.display = 'flex';
    document.body.classList.remove('login-pending');
  } else {
    loginOverlay.style.display = 'flex';
    mainContent.style.display = 'none';
    document.body.classList.add('login-pending');
  }
}

/**
 * Xử lý sự kiện nhấn nút Đăng nhập
 */
function handleLogin() {
  const user = document.getElementById('loginUser').value;
  const pass = document.getElementById('loginPass').value;
  const errorEl = document.getElementById('loginError');

  if (user === ADMIN_ACCOUNT.user && pass === ADMIN_ACCOUNT.pass) {
    // Thành công
    localStorage.setItem('isLoggedIn', 'true');
    errorEl.style.display = 'none';
    
    // Hiệu ứng chuyển cảnh mượt mà
    const loginOverlay = document.getElementById('loginOverlay');
    loginOverlay.style.opacity = '0';
    loginOverlay.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
      window.location.reload(); // Reload để khởi tạo dữ liệu
    }, 500);
  } else {
    // Thất bại
    errorEl.style.display = 'block';
    // Hiệu ứng rung khung khi sai (optional)
    const card = document.querySelector('.login-card');
    card.style.animation = 'none';
    setTimeout(() => {
        card.style.animation = 'shake 0.4s';
    }, 10);
  }
}

/**
 * Đăng xuất
 */
function handleLogout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    localStorage.removeItem('isLoggedIn');
    window.location.reload();
  }
}

// Thêm animation rung khi sai mật khẩu vào CSS qua JS
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

// Khởi chạy kiểm tra khi trang load
document.addEventListener('DOMContentLoaded', checkAuthOnLoad);

/**
 * Hỗ trợ nhấn Enter để đăng nhập
 */
document.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    const overlay = document.getElementById('loginOverlay');
    if (overlay && overlay.style.display !== 'none') {
        handleLogin();
    }
  }
});
