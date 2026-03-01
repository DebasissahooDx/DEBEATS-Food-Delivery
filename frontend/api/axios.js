axios.interceptors.response.use(
    (response) => response, // Return response if everything is fine
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 (Unauthorized) and we haven't retried yet
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Try to get a new token
                const res = await axios.post("http://localhost:8080/api/user/refresh-token");
                if (res.data.success) {
                    const newToken = res.data.accessToken;
                    // Update global state and retry the original failed request
                    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                // Refresh token also expired -> redirect to login
                window.location.href = "/"; 
            }
        }
        return Promise.reject(error);
    }
);