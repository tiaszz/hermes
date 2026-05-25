// Central HTTP layer for the Hermes frontend.
// All endpoint paths live here (confirmed via Swagger). Native fetch only.
// JWT is stored in localStorage as "token" and sent as Authorization: Bearer.

const TOKEN_KEY = "token";

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

// Core request helper. Prefixes /api via the Vite proxy, attaches the
// Authorization header when authenticated, and centralises error handling.
async function request(path, { method = "GET", body, auth: useAuth = true } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (useAuth) {
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    let res;
    try {
        res = await fetch(`/api${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new Error("Falha de conexão com o servidor.");
    }

    // 401 → token is stale/invalid: clear it and force a re-login.
    if (res.status === 401) {
        clearToken();
        window.location.reload();
        throw new Error("Sessão expirada. Faça login novamente.");
    }

    if (!res.ok) {
        let message = `Erro ${res.status}`;
        try {
            const data = await res.json();
            message = data.message || data.error || message;
        } catch {
            // non-JSON error body; keep generic message
        }
        throw new Error(message);
    }

    if (res.status === 204) return null;
    try {
        return await res.json();
    } catch {
        return null;
    }
}

export const auth = {
    // Login.jsx passes the username string as `user`; backend expects `email`.
    // Response may be { token } or { accessToken } — handle both defensively.
    async login(user, pass) {
        const data = await request("/auth/login", {
            method: "POST",
            body: { email: user, password: pass },
            auth: false,
        });
        const token = data?.token ?? data?.accessToken;
        if (!token) throw new Error("Resposta de login inválida.");
        setToken(token);
        return token;
    },
    logout() {
        clearToken();
    },
    isAuthenticated() {
        return !!getToken();
    },
};

export const templates = {
    list() {
        return request("/templates");
    },
    get(id) {
        return request(`/templates/${id}`);
    },
    create(body) {
        return request("/templates", { method: "POST", body });
    },
};

export const templateVersions = {
    list(templateId) {
        return request(`/templates/${templateId}/versions`);
    },
    get(templateId, id) {
        return request(`/templates/${templateId}/versions/${id}`);
    },
    create(templateId, body) {
        return request(`/templates/${templateId}/versions`, { method: "POST", body });
    },
};

export const emailMessages = {
    list() {
        return request("/email-messages");
    },
    get(id) {
        return request(`/email-messages/${id}`);
    },
    create(body) {
        return request("/email-messages", { method: "POST", body });
    },
};

export const users = {
    list() {
        return request("/users");
    },
    get(id) {
        return request(`/users/${id}`);
    },
    create(body) {
        return request("/users", { method: "POST", body });
    },
};

export default { auth, templates, templateVersions, emailMessages, users };
