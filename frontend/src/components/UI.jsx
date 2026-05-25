import { useState, useCallback, useRef } from "react";

// ── Icon ────────────────────────────────────────────────────────────────────
// Inline SVGs. `color` drives stroke (line icons). Stroke-based set keeps the
// visual language consistent across the app.
const ICON_PATHS = {
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
    history: <><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" /></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z" /></>,
    alert: <><path d="M10.3 3.3 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    trash: <><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    externalLink: <><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
    attach: <><path d="m21.4 11.1-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8.5-8.4" /></>,
    x: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
    check: <><path d="M20 6 9 17l-5-5" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.7 2.7" /><path d="M6.6 6.6A13.5 13.5 0 0 0 2 11s3.5 7 10 7a10.9 10.9 0 0 0 4-.8" /><path d="m2 2 20 20" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    template: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" /></>,
    home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M9 22V12h6v10" /></>,
    chevronDown: <><path d="m6 9 6 6 6-6" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" /></>,
    users: <><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0-3-3.85" /></>,
};

export function Icon({ name, size = 16, color = "currentColor" }) {
    const path = ICON_PATHS[name];
    if (!path) return null;
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {path}
        </svg>
    );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_CLASS = {
    Enviado: "badge badge-enviado",
    Agendado: "badge badge-agendado",
    Erro: "badge badge-erro",
    Rascunho: "badge badge-rascunho",
};

export function Badge({ status }) {
    const cls = BADGE_CLASS[status] ?? "badge";
    return <span className={cls}>{status}</span>;
}

// ── StatCard ───────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon }) {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <span className="stat-card-label">{label}</span>
                {icon && <Icon name={icon} size={16} color="#888888" />}
            </div>
            <div className="stat-card-value">{value}</div>
            {sub && <div className="stat-card-sub">{sub}</div>}
        </div>
    );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, width, children }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-box"
                style={width ? { width } : undefined}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <span className="modal-title">{title}</span>
                    <button className="btn-icon" onClick={onClose} aria-label="Fechar">
                        <Icon name="x" size={16} color="#555555" />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}

// ── FormField ───────────────────────────────────────────────────────────────────
export function FormField({ label, required, hint, children }) {
    return (
        <div className="form-field">
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="form-required">*</span>}
                </label>
            )}
            {children}
            {hint && <div className="form-hint">{hint}</div>}
        </div>
    );
}

// ── Input ───────────────────────────────────────────────────────────────────────
export function Input({ value, onChange, placeholder, type = "text", hasError, disabled }) {
    return (
        <input
            type={type}
            value={value ?? ""}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`input${hasError ? " input-error" : ""}`}
        />
    );
}

// ── Select ──────────────────────────────────────────────────────────────────────
export function Select({ value, onChange, options = [], placeholder }) {
    return (
        <div className="select-wrapper">
            <select
                className="input"
                value={value ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            <div className="select-chevron">
                <Icon name="chevronDown" size={16} color="#555555" />
            </div>
        </div>
    );
}

// ── useToast ────────────────────────────────────────────────────────────────────
export function useToast() {
    const [toast, setToast] = useState(null);
    const timer = useRef(null);

    const show = useCallback((message, type = "success") => {
        if (timer.current) clearTimeout(timer.current);
        setToast({ message, type });
        timer.current = setTimeout(() => setToast(null), 2500);
    }, []);

    const Toast = useCallback(() => {
        if (!toast) return null;
        const cls =
            toast.type === "error" ? "toast toast-error" : "toast toast-success";
        return (
            <div className={cls}>
                <Icon
                    name={toast.type === "error" ? "alert" : "check"}
                    size={16}
                    color="#ffffff"
                />
                {toast.message}
            </div>
        );
    }, [toast]);

    return { show, Toast };
}
