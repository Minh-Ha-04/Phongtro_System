// ============================================================
//  api.js — API helpers (phu thuoc: config.js)
// ============================================================

/**
 * Wrapper fetch voi base URL, JSON headers, JWT token, va error handling.
 * @param {string} endpoint
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 - redirect to login (only if user was logged in)
  if (res.status === 401 && token) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.reload();
    throw new Error('Phiên đăng nhập hết hạn');
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `HTTP ${res.status}`);
  }

  // Kiem tra xem response co body JSON khong
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }

  // Neu khong phai JSON, doc text (co the rong) va tra ve
  const text = await res.text();
  return text || null;
}

/**
 * Goi nhieu API song song, moi request co fallback rieng neu loi.
 * @param {Array<[string, RequestInit, any]>} requests - [endpoint, options, fallback]
 * @returns {Promise<any[]>}
 */
async function apiCallAll(requests) {
  return Promise.all(
    requests.map(([endpoint, options = {}, fallback = null]) =>
      apiCall(endpoint, options).catch(err => {
        console.warn(`apiCall ${endpoint}:`, err);
        return fallback;
      })
    )
  );
}
