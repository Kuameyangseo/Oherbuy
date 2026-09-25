import axios from "axios";

// prefer NEXT_PUBLIC_API_URL (used in several places), fall back to older NEXT_PUBLIC_SERVER_URI
const configuredBase = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_URI) || 'http://localhost:8080';
const base = typeof window === 'undefined' ? configuredBase : '';
const axiosInstance = axios.create({
    baseURL: base,
    withCredentials: true
});

// Helpful runtime debug: print the resolved baseURL in browser console so
// you can confirm the frontend is pointing at the expected API gateway.
if (typeof window !== 'undefined') {
    try {
        // eslint-disable-next-line no-console
        console.debug('[axiosinstance] resolved baseURL ->', base);
    } catch (e) {
        // no-op
    }
}

// Ensure axios instance baseURL is set on the instance too (helps runtime changes)
axiosInstance.defaults.baseURL = base;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const handleLogout = () => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== '/login') {
        window.location.href = '/login'; // Redirect to login page
    }
};

const safeServerLogout = async () => {
    try {
        // attempt to clear server cookies before redirecting
        await axios.post('/api/logout', {}, { withCredentials: true });
    } catch (e) {
        // ignore - best effort
        // eslint-disable-next-line no-console
        console.debug('safeServerLogout failed', (e && typeof e === 'object' && 'message' in e) ? (e as any).message : e);
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
        // If the request was for the frontend's logged-in-user or accounts.me
        // endpoint and the server returned 401, treat the client as a guest
        // instead of attempting a token refresh. This avoids refresh loops
        // that cause many requests and hit server rate limits (429).
        if (error.response && error.response.status === 401 && originalRequest && originalRequest.url && (originalRequest.url.includes('/logged-in-user') || originalRequest.url.includes('/accounts/me'))) {
            // Return a successful guest response so React Query and the UI
            // render guest state and stop making auth-refresh attempts.
            return Promise.resolve({
                status: 200,
                statusText: 'OK',
                data: { success: true, user: null, account: null },
                headers: error.response.headers,
                config: originalRequest,
            });
        }

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
                // Attempt to refresh tokens
                // eslint-disable-next-line no-console
                console.debug('axiosinstance: attempting token refresh');
                const refreshRes = await axios.post('/api/refresh-token', {}, { withCredentials: true });

                // if server responded OK, notify queued requests
                if (refreshRes.status === 200) {
                    isRefreshing = false;
                    onRefreshSuccess('');
                    return axiosInstance(originalRequest);
                }

                // non-200 treated as failure
                throw new Error(`refresh failed: ${refreshRes.status}`);
            } catch (err) {
                isRefreshing = false;
                refreshSubscribers = [];
                // attempt server logout to clear cookies, then redirect
                // eslint-disable-next-line no-console
                console.debug(
                    'axiosinstance: refresh failed, performing safe logout',
                    (err && typeof err === 'object' && 'message' in err) ? (err as any).message : err
                );
                await safeServerLogout();
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