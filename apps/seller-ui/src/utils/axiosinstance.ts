import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI || 'http://localhost:8080',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let refreshSubscribers: ((value?: any) => void)[] = [];

const handleLogout = () => {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const subscribeTokenRefresh = (cb: (value?: any) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshSuccess = (accessToken?: string) => {
  refreshSubscribers.forEach(cb => cb(accessToken));
  refreshSubscribers = [];
};

axiosInstance.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((accessToken?: string) => {
            // if server returned an access token, attach it to the retried request
            if (accessToken) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            }
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // use axiosInstance so baseURL and defaults apply; withCredentials ensures cookies are sent
        const res = await axiosInstance.post('/api/refresh-token', {}, { withCredentials: true });

        // If server returns a new access token in body, set default header and pass it to subscribers
        const accessToken = res?.data?.accessToken;
        if (accessToken) {
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        }

        onRefreshSuccess(accessToken);
        return axiosInstance(originalRequest);
      } catch (err) {
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;