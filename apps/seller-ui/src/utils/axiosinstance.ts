import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
    withCredentials: true
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const handleLogout = () => {
    if (window.location.pathname !== '/login') {
        window.location.href = '/login'; // Redirect to login page
    }
};

const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
}

const onRefreshSuccess = (token: string) => {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
}

axiosInstance.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token: string) => {
                        resolve(axiosInstance(originalRequest));
                    });
                });
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_SERVER_URI}/api/refresh-token`, 
                     {}, 
                     { withCredentials: true }
                );

                isRefreshing = false;
                onRefreshSuccess('');

                return axiosInstance(originalRequest);
            } catch (err) {
                isRefreshing = false;
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