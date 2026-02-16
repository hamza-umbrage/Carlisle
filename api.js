// API client with JWT authentication and auto-refresh
const API = {
  getToken() {
    return sessionStorage.getItem('token');
  },

  getUser() {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },

  async request(method, path, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    const token = this.getToken();
    if (token) {
      opts.headers['Authorization'] = 'Bearer ' + token;
    }

    if (body) {
      opts.body = JSON.stringify(body);
    }

    let res = await fetch('/api' + path, opts);

    // Auto-refresh on expired token
    if (res.status === 401) {
      let data;
      try { data = await res.json(); } catch { data = {}; }

      if (data.code === 'TOKEN_EXPIRED') {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          opts.headers['Authorization'] = 'Bearer ' + this.getToken();
          res = await fetch('/api' + path, opts);
        } else {
          this.clearSession();
          location.href = 'index.html';
          return null;
        }
      }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Request failed');
    }

    return res.json();
  },

  get(path) { return this.request('GET', path); },
  post(path, body) { return this.request('POST', path, body); },
  put(path, body) { return this.request('PUT', path, body); },
  del(path) { return this.request('DELETE', path); },

  async upload(path, formData) {
    const opts = { method: 'POST', body: formData };
    const token = this.getToken();
    if (token) opts.headers = { 'Authorization': 'Bearer ' + token };
    const res = await fetch('/api' + path, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  },

  async login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('refreshToken', data.refreshToken);
    sessionStorage.setItem('user', JSON.stringify(data.user));

    return data.user;
  },

  async refreshToken() {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('refreshToken', data.refreshToken);
      return true;
    } catch {
      return false;
    }
  },

  async logout() {
    const refreshToken = sessionStorage.getItem('refreshToken');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getToken(),
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore errors on logout
    }
    this.clearSession();
  },

  clearSession() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
  },
};
