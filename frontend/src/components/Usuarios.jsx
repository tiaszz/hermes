import { useState, useEffect, useCallback } from "react";
import {
    Icon,
    Modal,
    FormField,
    Input,
    Select,
    useToast,
} from "../components/UI.jsx";
import { C } from "../styles.js";
import { users } from "../api.js";

const ROLES = [
    { value: "ROLE_ADMIN", label: "Administrador" },
    { value: "ROLE_USER", label: "Usuário" },
];

function ROLE_LABEL(role) {
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
        else if (form.password.length < 6)
            e.password = "Mínimo 6 caracteres.";
        if (form.password !== form.confirm)
            e.confirm = "As senhas não coincidem.";
        return e;
    };

    const handleSave = async () => {
        const e = validate();
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }
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
                <Input
                    value={form.name}
                    onChange={set("name")}
                    placeholder="João Silva"
                    hasError={!!errors.name}
                />
                {errors.name && (
                    <div className="form-error">{errors.name}</div>
                )}
            </FormField>

            <FormField label="E-mail" required>
                <Input
                    value={form.email}
                    onChange={set("email")}
                    placeholder="joao@empresa.com"
                    hasError={!!errors.email}
                />
                {errors.email && (
                    <div className="form-error">{errors.email}</div>
                )}
            </FormField>

            <FormField label="Função">
                <Select
                    value={form.role}
                    onChange={set("role")}
                    options={ROLES}
                />
            </FormField>

            <div className="row-2">
                <FormField label="Senha" required>
                    <Input
                        type="password"
                        value={form.password}
                        onChange={set("password")}
                        placeholder="••••••••"
                        hasError={!!errors.password}
                    />
                    {errors.password && (
                        <div className="form-error">{errors.password}</div>
                    )}
                </FormField>
                <FormField label="Confirmar senha" required>
                    <Input
                        type="password"
                        value={form.confirm}
                        onChange={set("confirm")}
                        placeholder="••••••••"
                        hasError={!!errors.confirm}
                    />
                    {errors.confirm && (
                        <div className="form-error">{errors.confirm}</div>
                    )}
                </FormField>
            </div>

            <div className="flex justify-end gap-10 mt-14">
                <button className="btn btn-secondary" onClick={onClose}>
                    Cancelar
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Criando..." : "Criar usuário"}
                </button>
            </div>
        </Modal>
    );
}

export default function Usuarios() {
    const [lista, setLista] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNovo, setShowNovo] = useState(false);
    const { show, Toast } = useToast();

    const fetchLista = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await users.list();
            setLista(Array.isArray(data) ? data : (data?.content ?? []));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLista();
    }, [fetchLista]);

    const handleCreate = async (body) => {
        const created = await users.create(body);
        setLista((prev) => [...prev, created]);
        show("Usuário criado com sucesso!");
    };

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="page-title">Usuários</div>
                    <div className="page-sub">
                        Gerencie os usuários com acesso ao sistema.
                    </div>
                </div>
                <div className="flex gap-10">
                    <button
                        className="btn btn-secondary"
                        onClick={fetchLista}
                    >
                        <Icon name="history" size={14} color={C.textSub} />{" "}
                        Atualizar
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowNovo(true)}
                    >
                        <Icon name="plus" size={14} color="white" /> Novo
                        usuário
                    </button>
                </div>
            </div>

            <div className="content">
                {error && (
                    <div
                        style={{
                            background: C.dangerBg,
                            color: C.danger,
                            borderRadius: 8,
                            padding: "10px 16px",
                            marginBottom: 16,
                            fontSize: 13,
                        }}
                    >
                        {error}
                    </div>
                )}

                <div className="card">
                    {loading ? (
                        <div
                            style={{
                                textAlign: "center",
                                padding: 48,
                                color: C.textMuted,
                            }}
                        >
                            Carregando usuários...
                        </div>
                    ) : lista.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <Icon
                                    name="users"
                                    size={40}
                                    color={C.textMuted}
                                />
                            </div>
                            <div className="empty-state-title">
                                Nenhum usuário encontrado.
                            </div>
                            <div className="empty-state-desc">
                                Crie o primeiro usuário do sistema.
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowNovo(true)}
                            >
                                <Icon name="plus" size={14} color="white" />{" "}
                                Criar usuário
                            </button>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    {[
                                        "Nome",
                                        "E-mail",
                                        "Função",
                                        "Criado em",
                                    ].map((h) => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {lista.map((u) => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="flex items-center gap-10">
                                                <div
                                                    className="avatar"
                                                    style={{
                                                        width: 28,
                                                        height: 28,
                                                        fontSize: 11,
                                                    }}
                                                >
                                                    {u.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <span className="font-500">
                                                    {u.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="td-sub">{u.email}</td>
                                        <td>
                                            <span
                                                className="badge"
                                                style={{
                                                    background:
                                                        u.role ===
                                                        "ROLE_ADMIN"
                                                            ? C.greenLight
                                                            : "#f3f4f6",
                                                    color:
                                                        u.role ===
                                                        "ROLE_ADMIN"
                                                            ? C.greenMid
                                                            : C.textSub,
                                                }}
                                            >
                                                {ROLE_LABEL(u.role)}
                                            </span>
                                        </td>
                                        <td className="td-muted">
                                            {u.createdAt
                                                ? new Date(
                                                      u.createdAt,
                                                  ).toLocaleDateString("pt-BR")
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {lista.length > 0 && (
                        <div className="records-count">
                            {lista.length} usuário
                            {lista.length !== 1 ? "s" : ""}
                        </div>
                    )}
                </div>
            </div>

            {showNovo && (
                <NovoUsuarioModal
                    onSave={handleCreate}
                    onClose={() => setShowNovo(false)}
                />
            )}

            <Toast />
        </>
    );
}
