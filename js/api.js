// ============================================================
//  api.js — API helpers (phụ thuộc: config.js)
// ============================================================

/**
 * Wrapper fetch với base URL, JSON headers, và error handling.
 * @param {string} endpoint
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function apiCall(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `HTTP ${res.status}`);
  }

  // Kiểm tra xem response có body JSON không
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }

  // Nếu không phải JSON, đọc text (có thể rỗng) và trả về
  const text = await res.text();
  return text || null;
}

/**
 * Gọi nhiều API song song, mỗi request có fallback riêng nếu lỗi.
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