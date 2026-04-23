// authApi.js

const rootApi = "https://taynguyen.weathervietnam.vn/api";

const TOKEN_KEY = 'aiJwt';

const HEADERS = {
  DEFAULT_HEADER: { "Content-Type": "application/json" },
  JWT_HEADER: () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
    accept: "application/json",
  }),
};

export const auth = {
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  login: async (user_name, user_pass) => {
    const res = await fetch(rootApi + "/users/login", {
      method: "POST",
      headers: HEADERS.DEFAULT_HEADER,
      body: JSON.stringify({ user_name, user_pass }),
    });
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch (_) {}
    if (!res.ok) throw new Error(data.message || data.detail || "Sai tài khoản hoặc mật khẩu");
    const payload = data.data ?? data;
    const token = payload.access_token || payload.token || payload.aiJwt;
    if (!token) throw new Error("Không nhận được token từ server");
    localStorage.setItem(TOKEN_KEY, token);
    return token;
  },

  logout: () => { localStorage.removeItem(TOKEN_KEY); window.location.reload(); },
};

export const API = {
  STATIONS: {
    getAll: (page_size = 10) => ({
      endPoint: `${rootApi}/stations/?page_size=${page_size}`,
      method: "GET",
      headers: HEADERS.JWT_HEADER, // ✅ bỏ ()
    }),
  },
  CONFIG: {
    getAll: (page_size = 10) => ({
      endPoint: `${rootApi}/trungbo-aws-config/?page_size=${page_size}`,
      method: "GET",
      headers: HEADERS.JWT_HEADER, // ✅ bỏ ()
    }),
    getById: (station_id) => ({
      endPoint: `${rootApi}/trungbo-aws-config/${station_id}`,
      method: "GET",
      headers: HEADERS.JWT_HEADER, // ✅ bỏ ()
    }),
    create: () => ({
      endPoint: `${rootApi}/trungbo-aws-config/`,
      method: "POST",
      headers: HEADERS.JWT_HEADER, // ✅ bỏ ()
    }),
    update: (station_id) => ({
      endPoint: `${rootApi}/trungbo-aws-config/${station_id}`,
      method: "PUT",
      headers: HEADERS.JWT_HEADER, // ✅ bỏ ()
    }),
    delete: (station_id) => ({
      endPoint: `${rootApi}/trungbo-aws-config/${station_id}`, // ✅ thêm /
      method: "DELETE",
      headers: HEADERS.JWT_HEADER, // ✅ bỏ ()
    }),
  },
  STATION_GROUPS: {
    getAll: (page_size = 1000) => ({
      endPoint: `${rootApi}/stationgroups/?page_size=${page_size}`,
      method: "GET",
      headers: HEADERS.JWT_HEADER,
    }),
    getByCode: (code) => ({
      endPoint: `${rootApi}/stationgroups/${code}`,
      method: "GET",
      headers: HEADERS.JWT_HEADER,
    }),
    create: () => ({
      endPoint: `${rootApi}/stationgroups/`,
      method: "POST",
      headers: HEADERS.JWT_HEADER,
    }),
    update: (code) => ({
      endPoint: `${rootApi}/stationgroups/${code}`,
      method: "PUT",
      headers: HEADERS.JWT_HEADER,
    }),
    delete: (code) => ({
      endPoint: `${rootApi}/stationgroups/${code}`,
      method: "DELETE",
      headers: HEADERS.JWT_HEADER,
    }),
  },
};

export async function callApi({ endPoint, method, headers }, body = null) {
  const resolvedHeaders = typeof headers === 'function' ? headers() : headers; // ✅ resolve tại đây
  const options = { method, headers: resolvedHeaders };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(endPoint, options);
  if (res.status === 401) { auth.removeToken(); window.location.reload(); return; }
  const text = await res.text();
  let data = {};
  try { data = JSON.parse(text); } catch (_) {}
  if (!res.ok) throw new Error(
    data.message        // ✅ "Không thể xóa trạm '622713': trạm đã có dữ liệu..."
    || data.detail 
    || `Lỗi ${res.status}`
  );
  return data;
}