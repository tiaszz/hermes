import { useState, useEffect, useCallback } from "react";
import { Icon, FormField, Input, Select, Modal, useToast } from "../components/UI.jsx";
import { C } from "../styles.js";
import { users } from "../api.js";

const API_ENDPOINTS = [
    { method: "POST", path: "/api/auth/login", desc: "Autenticação" },
    { method: "GET", path: "/api/templates", desc: "Listar modelos" },
    { method: "POST", path: "/api/templates", desc: "Criar modelo" },
    { method: "GET", path: "/api/templates/:id/versions", desc: "Versões do modelo" },
    { method: "POST", path: "/api/templates/:id/versions", desc: "Criar versão" },
    { method: "GET", path: "/api/email-messages", desc: "Listar comunicações" },
    { method: "POST", path: "/api/email-messages", desc: "Enviar comunicação" },
    { method: "GET", path: "/api/users", desc: "Listar usuários" },
    { method: "POST", path: "/api/users", desc: "Criar usuário" },
];

const ROLES = [
    { value: "ROLE_ADMIN", label: "Administrador" },
    { value: "ROLE_USER", label: "Usuário" },
];

function roleLabel(role) {
    return ROLES.find((r) => r.value === role)?.label ?? role;
}

function NovoUsuarioModal({ onSave, onClose }) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirm: "",
        role: "ROLE_USER",
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const set = (k) => (v) => {
        setForm((f) => ({ ...f, [k]: v }));
        setErrors((e) => ({ ...e, [k]: "" }));
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

    const handleSave = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setSaving(true);
        try {
            await onSave({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role,
            });
            onClose();
        } catch (err) {
            setErrors({ email: err.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal title="Novo usuário" onClose={onClose} width={460}>
            <FormField label="Nome completo" required>
                <Input value={form.name} onChange={set("name")} placeholder="João Silva" hasError={!!errors.name} />
                {errors.name && <div className="form-error">{errors.name}</div>}
            </FormField>
            <FormField label="E-mail" required>
                <Input value={form.email} onChange={set("email")} placeholder="joao@empresa.com" hasError={!!errors.email} />
                {errors.email && <div className="form-error">{errors.email}</div>}
            </FormField>
            <FormField label="Função">
                <Select value={form.role} onChange={set("role")} options={ROLES} />
            </FormField>
            <div className="row-2">
                <FormField label="Senha" required>
                    <Input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" hasError={!!errors.password} />
                    {errors.password && <div className="form-error">{errors.password}</div>}
                </FormField>
                <FormField label="Confirmar senha" required>
                    <Input type="password" value={form.confirm} onChange={set("confirm")} placeholder="••••••••" hasError={!!errors.confirm} />
                    {errors.confirm && <div className="form-error">{errors.confirm}</div>}
                </FormField>
            </div>
            <div className="flex justify-end gap-10 mt-14">
                <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Criando..." : "Criar usuário"}
                </button>
            </div>
        </Modal>
    );
}

export default function Configuracoes() {
    const [showSmtpPass, setShowSmtpPass] = useState(false);
    const [showNovoUsuario, setShowNovoUsuario] = useState(false);
    const [listaUsuarios, setListaUsuarios] = useState([]);
    const [loadingUsuarios, setLoadingUsuarios] = useState(true);
    const { show, Toast } = useToast();

    const fetchUsuarios = useCallback(async () => {
        setLoadingUsuarios(true);
        try {
            const data = await users.list();
            setListaUsuarios(Array.isArray(data) ? data : (data?.content ?? []));
        } catch {
            setListaUsuarios([]);
        } finally {
            setLoadingUsuarios(false);
        }
    }, []);

    useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

    const handleCreateUser = async (body) => {
        const created = await users.create(body);
        setListaUsuarios((prev) => [...prev, created]);
        show("Usuário criado com sucesso!");
    };

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="page-title">Configurações</div>
                    <div className="page-sub">Informações do sistema e configurações de conta.</div>
                </div>
            </div>

            <div className="content content-narrow">
                <div className="flex-col gap-16">
                    {/* Perfil */}
                    <div className="card">
                        <div className="config-section-header">
                            <div className="config-section-title">Perfil</div>
                            <div className="config-section-desc">Informações da conta de acesso ao sistema.</div>
                        </div>
                        <FormField label="E-mail / usuário">
                            <Input value="teste@admin.com" disabled />
                        </FormField>
                        <FormField label="Função">
                            <Input value="Administrador" disabled />
                        </FormField>
                        <div className="form-actions">
                            <button className="btn btn-secondary" onClick={() => show("Funcionalidade disponível em breve.", "error")}>
                                Alterar senha
                            </button>
                        </div>
                    </div>

                    {/* Usuários */}
                    <div className="card">
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: 16,
                            }}
                        >
                            <div>
                                <div className="config-section-title">Usuários</div>
                                <div className="config-section-desc">Gerencie os usuários com acesso ao sistema.</div>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowNovoUsuario(true)}
                            >
                                <Icon name="plus" size={14} color="white" /> Novo usuário
                            </button>
                        </div>

                        {loadingUsuarios ? (
                            <div style={{ textAlign: "center", padding: 24, color: C.textMuted, fontSize: 13 }}>
                                Carregando...
                            </div>
                        ) : listaUsuarios.length === 0 ? (
                            <div style={{ textAlign: "center", padding: 24, color: C.textMuted, fontSize: 13 }}>
                                Nenhum usuário encontrado.
                            </div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        {["Nome", "E-mail", "Função", "Criado em"].map((h) => (
                                            <th key={h}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {listaUsuarios.map((u) => (
                                        <tr key={u.id}>
                                            <td>
                                                <div className="flex items-center gap-10">
                                                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                                                        {u.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-500">{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="td-sub">{u.email}</td>
                                            <td>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        background: u.role === "ROLE_ADMIN" ? C.greenLight : "#f3f4f6",
                                                        color: u.role === "ROLE_ADMIN" ? C.greenMid : C.textSub,
                                                    }}
                                                >
                                                    {roleLabel(u.role)}
                                                </span>
                                            </td>
                                            <td className="td-muted">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* SMTP */}
                    <div className="card">
                        <div className="config-section-header">
                            <div className="config-section-title">SMTP</div>
                            <div className="config-section-desc">
                                Configurações de envio definidas via variáveis de ambiente no servidor.
                            </div>
                        </div>
                        <div className="row-2">
                            <FormField label="Host">
                                <Input value="smtp.gmail.com" disabled />
                            </FormField>
                            <FormField label="Porta">
                                <Input value="587" disabled />
                            </FormField>
                        </div>
                        <FormField label="Usuário (MAIL_USERNAME)">
                            <Input value="Definido via variável de ambiente" disabled />
                        </FormField>
                        <FormField label="Senha (MAIL_PASSWORD)">
                            <div className="password-wrapper">
                                <Input type={showSmtpPass ? "text" : "password"} value="definido-via-env" disabled />
                                <button className="password-toggle" onClick={() => setShowSmtpPass((s) => !s)}>
                                    <Icon name={showSmtpPass ? "eyeOff" : "eye"} size={16} color={C.textMuted} />
                                </button>
                            </div>
                        </FormField>
                    </div>

                    {/* API reference */}
                    <div className="card">
                        <div className="config-section-header">
                            <div className="config-section-title">Referência de API</div>
                            <div className="config-section-desc">
                                Endpoints REST disponíveis para integrações externas. Autenticação via Bearer token.
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {API_ENDPOINTS.map((e) => (
                                <div
                                    key={e.path}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: "7px 10px",
                                        borderRadius: 6,
                                        background: "#fafafa",
                                    }}
                                >
                                    <span
                                        style={{
                                            background: e.method === "POST" ? C.greenLight : "#f0f0f0",
                                            color: e.method === "POST" ? C.greenMid : C.textSub,
                                            borderRadius: 4,
                                            padding: "2px 7px",
                                            fontSize: 11,
                                            fontWeight: 600,
                                            width: 42,
                                            textAlign: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {e.method}
                                    </span>
                                    <code style={{ fontSize: 12, fontFamily: "monospace", color: C.textPrimary, flex: 1 }}>
                                        {e.path}
                                    </code>
                                    <span style={{ fontSize: 12, color: C.textMuted }}>{e.desc}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <a
                                href="/swagger-ui.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                style={{ textDecoration: "none" }}
                            >
                                <Icon name="externalLink" size={14} color={C.textSub} />
                                Abrir Swagger UI
                            </a>
                        </div>
                    </div>

                    {/* Sobre */}
                    <div className="card">
                        <div className="config-section-header">
                            <div className="config-section-title">Sobre</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: C.textSub }}>
                            <div className="flex justify-between">
                                <span>Aplicação</span>
                                <span className="font-500">Hermes · Gateway de Comunicação</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Backend</span>
                                <span className="font-500">Spring Boot · porta 8080</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Frontend</span>
                                <span className="font-500">React 19 · Vite</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Projeto</span>
                                <span className="font-500">Desafio Fatec Indaiatuba · 2026</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showNovoUsuario && (
                <NovoUsuarioModal
                    onSave={handleCreateUser}
                    onClose={() => setShowNovoUsuario(false)}
                />
            )}

            <Toast />
        </>
    );
}
