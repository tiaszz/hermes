import { useState, useMemo } from "react";
import { Badge, Icon, Modal, useToast } from "../components/UI.jsx";
import { C } from "../styles.js";
import { useApp } from "../context/AppContext.jsx";

const STATUS_TABS = ["Todos", "Enviado", "Agendado", "Erro", "Rascunho"];

export default function Historico({ setPage }) {
    const {
        comunicacoes,
        removeComunicacao,
        updateComunicacaoStatus,
        loading,
        error,
        fetchComunicacoes,
    } = useApp();

    const [tab, setTab] = useState("Todos");
    const [search, setSearch] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null);
    const { show, Toast } = useToast();

    const filtered = useMemo(() => {
        let list = comunicacoes;
        if (tab !== "Todos") list = list.filter((c) => c.status === tab);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (c) =>
                    c.dest.toLowerCase().includes(q) ||
                    c.modelo.toLowerCase().includes(q),
            );
        }
        return list;
    }, [comunicacoes, tab, search]);

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="page-title">Histórico</div>
                    <div className="page-sub">
                        Todas as comunicações processadas.
                    </div>
                </div>
                <div className="flex gap-10">
                    <button
                        className="btn btn-secondary"
                        onClick={fetchComunicacoes}
                    >
                        <Icon name="history" size={14} color={C.textSub} />{" "}
                        Atualizar
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => setPage("nova")}
                    >
                        <Icon name="send" size={14} color="white" /> Nova
                        comunicação
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
                        Erro ao carregar dados: {error}
                    </div>
                )}

                <div className="card">
                    <div className="historico-toolbar">
                        <div className="tabs-bar">
                            {STATUS_TABS.map((t) => (
                                <button
                                    key={t}
                                    className={`tab-btn${tab === t ? " active" : ""}`}
                                    onClick={() => setTab(t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <div className="search-box">
                            <Icon
                                name="search"
                                size={14}
                                color={C.textMuted}
                            />
                            <input
                                placeholder="Buscar destinatário ou modelo..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading.comunicacoes ? (
                        <div
                            style={{
                                textAlign: "center",
                                padding: 48,
                                color: C.textMuted,
                            }}
                        >
                            Carregando...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <Icon
                                    name="history"
                                    size={36}
                                    color={C.textMuted}
                                />
                            </div>
                            <div className="empty-state-title">
                                Nenhuma comunicação encontrada.
                            </div>
                            <div className="empty-state-desc">
                                {tab !== "Todos" || search
                                    ? "Tente mudar os filtros."
                                    : "Crie a primeira comunicação."}
                            </div>
                            {tab === "Todos" && !search && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setPage("nova")}
                                >
                                    <Icon name="send" size={14} color="white" />{" "}
                                    Nova comunicação
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    {[
                                        "Destinatário",
                                        "Modelo",
                                        "Status",
                                        "Quando",
                                        "",
                                    ].map((h) => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c) => (
                                    <tr key={c.id}>
                                        <td className="td-primary">
                                            {c.dest}
                                        </td>
                                        <td className="td-sub">
                                            {c.modelo} · {c.versao}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-6">
                                                <Badge status={c.status} />
                                                <select
                                                    value={c.status}
                                                    onChange={(e) => {
                                                        updateComunicacaoStatus(
                                                            c.id,
                                                            e.target.value,
                                                        );
                                                        show(
                                                            "Status atualizado.",
                                                        );
                                                    }}
                                                    className="status-inline-select"
                                                >
                                                    {[
                                                        "Enviado",
                                                        "Agendado",
                                                        "Erro",
                                                        "Rascunho",
                                                    ].map((s) => (
                                                        <option key={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="td-muted">{c.quando}</td>
                                        <td>
                                            <button
                                                className="btn-icon"
                                                onClick={() =>
                                                    setConfirmDelete(c.id)
                                                }
                                            >
                                                <Icon
                                                    name="trash"
                                                    size={15}
                                                    color={C.danger}
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <div className="records-count">
                        {filtered.length} registro
                        {filtered.length !== 1 ? "s" : ""}
                        {tab !== "Todos" && ` · filtro: ${tab}`}
                    </div>
                </div>
            </div>

            {confirmDelete && (
                <Modal
                    title="Confirmar exclusão"
                    onClose={() => setConfirmDelete(null)}
                    width={360}
                >
                    <p className="text-sub mb-22">
                        Remover esta comunicação da lista?
                    </p>
                    <div className="flex justify-end gap-10">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setConfirmDelete(null)}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={() => {
                                removeComunicacao(confirmDelete);
                                setConfirmDelete(null);
                                show("Comunicação removida.");
                            }}
                        >
                            Remover
                        </button>
                    </div>
                </Modal>
            )}

            <Toast />
        </>
    );
}
