import { useState } from "react";
import { Icon } from "../components/UI.jsx";
import { auth } from "../api.js";

export default function Login({ onLogin }) {
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
        <div className="login-layout">
            <div className="login-left">
                <div className="login-brand">
                    <div className="login-brand-icon">
                        <Icon name="mail" size={18} color="white" />
                    </div>
                    <span className="login-brand-name">Communiq</span>
                </div>
                <div>
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
                <div className="login-form">
                    <h2 className="login-title">Entrar</h2>
                    <p className="login-desc">
                        Acesse com seu usuário corporativo.
                    </p>

                    <label className="form-label">Usuário</label>
                    <input
                        value={user}
                        onChange={(e) => {
                            setUser(e.target.value);
                            setError("");
                        }}
                        placeholder="seu.usuario"
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        className={`input mb-14${error && !user ? " input-error" : ""}`}
                    />

                    <label className="form-label">Senha</label>
                    <input
                        type="password"
                        value={pass}
                        onChange={(e) => {
                            setPass(e.target.value);
                            setError("");
                        }}
                        placeholder="••••••••"
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        className={`input mb-14${error && !pass ? " input-error" : ""}`}
                    />

                    {error && <p className="form-error mb-8">{error}</p>}

                    <div className="login-options">
                        <label className="login-remember">
                            <input
                                type="checkbox"
                                style={{ accentColor: "#1e5631" }}
                            />
                            Manter conectado
                        </label>
                        <span className="login-forgot">
                            Esqueci minha senha
                        </span>
                    </div>

                    <button
                        className="login-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>

                    <p className="login-api-note">
                        Para integrações programáticas, utilize{" "}
                        <span className="login-api-link">chaves de API</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}
