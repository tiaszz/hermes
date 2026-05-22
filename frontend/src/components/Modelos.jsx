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
import { templates, templateVersions } from "../api.js";

function NovoModeloModal({ onSave, onClose }) {
    const [nome, setNome] = useState("");
    const [desc, setDesc] = useState("");
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        const e = {};
        if (!nome.trim()) e.nome = "Nome obrigatório.";
        if (!desc.trim()) e.desc = "Descrição obrigatória.";
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }
        setSaving(true);
        try {
            await onSave({ name: nome.trim(), description: desc.trim() });
            onClose();
        } catch (err) {
            setErrors({ nome: err.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal title="Novo modelo" onClose={onClose} width={460}>
            <FormField label="Nome" required>
                <Input
                    value={nome}
                    onChange={setNome}
                    placeholder="Ex: Boas-vindas"
                    hasError={!!errors.nome}
                />
                {errors.nome && (
                    <div className="form-error">{errors.nome}</div>
                )}
            </FormField>
            <FormField label="Descrição" required>
                <Input
                    value={desc}
                    onChange={setDesc}
                    placeholder="Descreva o propósito deste modelo"
                    hasError={!!errors.desc}
                />
                {errors.desc && (
                    <div className="form-error">{errors.desc}</div>
                )}
            </FormField>
            <div className="flex justify-end gap-10 mt-14">
                <button className="btn btn-secondary" onClick={onClose}>
                    Cancelar
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Salvando..." : "Criar modelo"}
                </button>
            </div>
        </Modal>
    );
}

const CONTENT_TYPES = [
    { value: "TEXT", label: "Texto puro" },
    { value: "HTML", label: "HTML" },
];

function VersoesModal({ modelo, onClose }) {
    const [versoes, setVersoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        subject: "",
        body: "",
        contentType: "TEXT",
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const { show, Toast } = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await templateVersions.list(modelo.id);
            setVersoes(Array.isArray(data) ? data : (data?.content ?? []));
        } catch {
            setVersoes([]);
        } finally {
            setLoading(false);
        }
    }, [modelo.id]);

    useEffect(() => {
        load();
    }, [load]);

    const handleAddVersion = async () => {
        const e = {};
        if (!form.subject.trim()) e.subject = "Assunto obrigatório.";
        if (!form.body.trim()) e.body = "Corpo obrigatório.";
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }
        setSaving(true);
        try {
            await templateVersions.create(modelo.id, {
                templateId: modelo.id,
                subject: form.subject.trim(),
                body: form.body.trim(),
                contentType: form.contentType,
            });
            show("Versão criada com sucesso!");
            setForm({ subject: "", body: "", contentType: "TEXT" });
            setErrors({});
            setShowForm(false);
            load();
        } catch (err) {
            show(err.message, "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal title={`Versões — ${modelo.nome}`} onClose={onClose} width={580}>
            {loading ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: 32,
                        color: C.textMuted,
                    }}
                >
                    Carregando versões...
                </div>
            ) : versoes.length === 0 && !showForm ? (
                <div className="empty-state" style={{ padding: "16px 0" }}>
                    <div className="empty-state-title">
                        Nenhuma versão ainda.
                    </div>
                    <div className="empty-state-desc">
                        Crie a primeira versão deste modelo.
                    </div>
                </div>
            ) : (
                versoes.map((v, i) => (
                    <div
                        key={v.id}
                        style={{
                            borderBottom:
                                i < versoes.length - 1
                                    ? `1px solid ${C.border}`
                                    : "none",
                            paddingBottom: 14,
                            marginBottom: 14,
                        }}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <span className="font-600">
                                v{v.versionNumber}
                            </span>
                            <span
                                className={`badge ${v.contentType === "HTML" ? "badge-html" : "badge-texto"}`}
                            >
                                {v.contentType}
                            </span>
                        </div>
                        <div className="text-13 text-sub mb-4">
                            <strong>Assunto:</strong> {v.subject}
                        </div>
                        <div
                            className="code-preview"
                            style={{ marginBottom: 0 }}
                        >
                            {v.body}
                        </div>
                    </div>
                ))
            )}

            {showForm && (
                <div
                    style={{
                        borderTop: `1px solid ${C.border}`,
                        paddingTop: 16,
                        marginTop: 8,
                    }}
                >
                    <div
                        className="card-section-title"
                        style={{ marginBottom: 12 }}
                    >
                        Nova versão
                    </div>
                    <FormField label="Assunto" required>
                        <Input
                            value={form.subject}
                            onChange={(v) =>
                                setForm((f) => ({ ...f, subject: v }))
                            }
                            placeholder="Assunto do e-mail"
                            hasError={!!errors.subject}
                        />
                        {errors.subject && (
                            <div className="form-error">{errors.subject}</div>
                        )}
                    </FormField>
                    <FormField label="Tipo de conteúdo">
                        <Select
                            value={form.contentType}
                            onChange={(v) =>
                                setForm((f) => ({ ...f, contentType: v }))
                            }
                            options={CONTENT_TYPES}
                        />
                    </FormField>
                    <FormField label="Corpo" required>
                        <textarea
                            className={`input${errors.body ? " input-error" : ""}`}
                            rows={5}
                            value={form.body}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, body: e.target.value }))
                            }
                            placeholder="Use {{variavel}} para campos dinâmicos"
                        />
                        {errors.body && (
                            <div className="form-error">{errors.body}</div>
                        )}
                    </FormField>
                    <div className="flex justify-end gap-10">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowForm(false);
                                setErrors({});
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleAddVersion}
                            disabled={saving}
                        >
                            {saving ? "Salvando..." : "Salvar versão"}
                        </button>
                    </div>
                </div>
            )}

            {!showForm && (
                <div style={{ marginTop: 16 }}>
                    <button
                        className="btn btn-secondary w-full"
                        style={{ justifyContent: "center" }}
                        onClick={() => setShowForm(true)}
                    >
                        <Icon name="plus" size={14} color={C.textSub} /> Nova
                        versão
                    </button>
                </div>
            )}

            <Toast />
        </Modal>
    );
}

export default function Modelos({ setPage }) {
    const [lista, setLista] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNovo, setShowNovo] = useState(false);
    const [versoesModelo, setVersoesModelo] = useState(null);
    const { show, Toast } = useToast();

    const fetchLista = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await templates.list();
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
        const created = await templates.create(body);
        setLista((prev) => [...prev, created]);
        show("Modelo criado com sucesso!");
    };

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="page-title">Modelos</div>
                    <div className="page-sub">
                        Gerencie os templates de e-mail e suas versões.
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
                        modelo
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

                {loading ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: 48,
                            color: C.textMuted,
                        }}
                    >
                        Carregando modelos...
                    </div>
                ) : lista.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <Icon
                                name="template"
                                size={40}
                                color={C.textMuted}
                            />
                        </div>
                        <div className="empty-state-title">
                            Nenhum modelo cadastrado.
                        </div>
                        <div className="empty-state-desc">
                            Crie o primeiro template de e-mail da sua
                            organização.
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowNovo(true)}
                        >
                            <Icon name="plus" size={14} color="white" /> Criar
                            modelo
                        </button>
                    </div>
                ) : (
                    <div className="modelos-grid">
                        {lista.map((m) => (
                            <div key={m.id} className="card card-hover">
                                <div className="modelo-card-header">
                                    <div className="modelo-card-icon">
                                        <Icon
                                            name="template"
                                            size={18}
                                            color={C.green}
                                        />
                                    </div>
                                    <div className="modelo-card-actions">
                                        <button
                                            className="btn-icon"
                                            title="Ver versões"
                                            onClick={() =>
                                                setVersoesModelo(m)
                                            }
                                        >
                                            <Icon
                                                name="history"
                                                size={15}
                                                color={C.textSub}
                                            />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            title="Usar este modelo"
                                            onClick={() => setPage("nova")}
                                        >
                                            <Icon
                                                name="send"
                                                size={15}
                                                color={C.textSub}
                                            />
                                        </button>
                                    </div>
                                </div>
                                <div className="modelo-card-name">{m.name}</div>
                                <div className="modelo-card-lacunas">
                                    {m.description}
                                </div>
                                <div className="modelo-card-footer">
                                    <span
                                        style={{
                                            color:
                                                m.active !== false
                                                    ? C.green
                                                    : C.textMuted,
                                        }}
                                    >
                                        {m.active !== false
                                            ? "Ativo"
                                            : "Inativo"}
                                    </span>
                                    <span>
                                        {m.createdAt
                                            ? new Date(
                                                  m.createdAt,
                                              ).toLocaleDateString("pt-BR")
                                            : "—"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showNovo && (
                <NovoModeloModal
                    onSave={handleCreate}
                    onClose={() => setShowNovo(false)}
                />
            )}

            {versoesModelo && (
                <VersoesModal
                    modelo={{ id: versoesModelo.id, nome: versoesModelo.name }}
                    onClose={() => setVersoesModelo(null)}
                />
            )}

            <Toast />
        </>
    );
}
