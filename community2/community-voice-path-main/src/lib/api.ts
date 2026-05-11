const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

export const api = async (
    path: string,
    options: RequestInit = {}
): Promise<Response> => {
    const token = getToken();
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    return response;
};

export const apiGet = async <T>(path: string): Promise<T> => {
    const res = await api(path);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Request failed" }));
        throw new Error(err.message || "Request failed");
    }
    return res.json();
};

export const apiPost = async <T>(path: string, body: unknown): Promise<T> => {
    const res = await api(path, {
        method: "POST",
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Request failed" }));
        throw new Error(err.message || "Request failed");
    }
    return res.json();
};

export const apiPatch = async <T>(path: string, body: unknown): Promise<T> => {
    const res = await api(path, {
        method: "PATCH",
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Request failed" }));
        throw new Error(err.message || "Request failed");
    }
    return res.json();
};
