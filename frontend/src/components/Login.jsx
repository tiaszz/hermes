import { useState } from "react";
import { Icon } from "../components/UI.jsx";
import { auth } from "../api.js";
import { users } from "../api.js";
import hero from "../assets/hero.png";

function LoginForm({ onLogin, onSwitch }) {
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!user.trim() || !pass.trim()) {
            setError("Preencha usuário e senha.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            await auth.login(user, pass);
            onLogin();
        } catch (err) {
            setError(err.message ?? "Credenciais inválidas.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-form">
            <h2 className="login-title">Entrar</h2>
            <p className="login-desc">Acesse com seu usuário corporativo.</p>

            <label className="form-label">Usuário</label>
            <input
                value={user}
                onChange={(e) => { setUser(e.target.value); setError(""); }}
                placeholder="seu.usuario"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={`input mb-14${error && !user ? " input-error" : ""}`}
            />

            <label className="form-label">Senha</label>
            <input
                type="password"
                value={pass}
                onChange={(e) => { setPass(e.target.value); setError(""); }}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={`input mb-14${error && !pass ? " input-error" : ""}`}
            />

            {error && <p className="form-error mb-8">{error}</p>}

            <div className="login-options">
                <label className="login-remember">
                    <input type="checkbox" style={{ accentColor: "#1e5631" }} />
                    Manter conectado
                </label>
                <span className="login-forgot">Esqueci minha senha</span>
            </div>

            <button
                className="login-btn"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? "Entrando..." : "Entrar"}
            </button>

            <p className="login-api-note">
                Não tem conta?{" "}
                <span className="login-api-link" onClick={onSwitch}>
                    Criar conta
                </span>
            </p>
        </div>
    );
}

function RegisterForm({ onSwitch, onRegistered }) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirm: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const set = (k) => (e) => {
        setForm((f) => ({ ...f, [k]: e.target.value }));
        setErrors((er) => ({ ...er, [k]: "" }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Nome obrigatório.";
        if (!form.email.trim()) e.email = "E-mail obrigatório.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = "E-mail inválido.";
        if (!form.password) e.password = "Senha obrigatória.";
        else if (form.password.length < 6) e.password = "Mínimo 6 caracteres.";
        if (form.password !== form.confirm) e.confirm = "As senhas não coincidem.";
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true);
        try {
            await users.create({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                role: "ROLE_USER",
            });
            setSuccess(true);
            setTimeout(onSwitch, 2000);
        } catch (err) {
            setErrors({ email: err.message ?? "Erro ao criar conta." });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="login-form" style={{ textAlign: "center" }}>
                <div style={{ marginBottom: 16 }}>
                    <Icon name="check" size={40} color="#1e5631" />
                </div>
                <h2 className="login-title">Conta criada!</h2>
                <p className="login-desc">
                    Redirecionando para o login...
                </p>
            </div>
        );
    }

    return (
        <div className="login-form">
            <h2 className="login-title">Criar conta</h2>
            <p className="login-desc">Preencha os dados para se cadastrar.</p>

            <label className="form-label">Nome completo</label>
            <input
                value={form.name}
                onChange={set("name")}
                placeholder="João Silva"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={`input mb-14${errors.name ? " input-error" : ""}`}
            />
            {errors.name && <p className="form-error mb-8">{errors.name}</p>}

            <label className="form-label">E-mail</label>
            <input
                value={form.email}
                onChange={set("email")}
                placeholder="joao@empresa.com"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={`input mb-14${errors.email ? " input-error" : ""}`}
            />
            {errors.email && <p className="form-error mb-8">{errors.email}</p>}

            <label className="form-label">Senha</label>
            <input
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={`input mb-14${errors.password ? " input-error" : ""}`}
            />
            {errors.password && <p className="form-error mb-8">{errors.password}</p>}

            <label className="form-label">Confirmar senha</label>
            <input
                type="password"
                value={form.confirm}
                onChange={set("confirm")}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={`input mb-14${errors.confirm ? " input-error" : ""}`}
            />
            {errors.confirm && <p className="form-error mb-8">{errors.confirm}</p>}

            <button
                className="login-btn"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? "Criando conta..." : "Criar conta"}
            </button>

            <p className="login-api-note">
                Já tem conta?{" "}
                <span className="login-api-link" onClick={onSwitch}>
                    Entrar
                </span>
            </p>
        </div>
    );
}

export default function Login({ onLogin }) {
    const [mode, setMode] = useState("login");

    return (
        <div className="login-layout">
            <div className="login-left">
                <div className="login-brand">
                    <div className="login-brand-icon">
                        <Icon name="mail" size={18} color="white" />
                    </div>
                    <span className="login-brand-name">Hermes</span>
                </div>
                <div>
                    <img
                        src={hero}
                        alt=""
                        style={{
                            width: 220,
                            opacity: 0.9,
                            marginBottom: 28,
                            display: "block",
                        }}
                    />
                    <h1 className="login-headline">
                        Centralize as comunicações
                        <br />
                        da sua operação.
                    </h1>
                    <p className="login-sub">
                        Plataforma corporativa para envio de e-mails
                        <br />
                        baseada em modelos, com agendamento e API.
                    </p>
                </div>
                <div className="login-footer">
                    © 2026 · Desafio Fatec Indaiatuba
                </div>
            </div>

            <div className="login-right">
                {mode === "login" ? (
                    <LoginForm
                        onLogin={onLogin}
                        onSwitch={() => setMode("register")}
                    />
                ) : (
                    <RegisterForm
                        onSwitch={() => setMode("login")}
                        onRegistered={onLogin}
                    />
                )}
            </div>
        </div>
    );
}
