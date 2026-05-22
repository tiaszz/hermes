import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { templates, emailMessages } from "../api.js";

const AppContext = createContext(null);

// Backend STATUS → frontend label normalisation. Done here (in context) so
// page components only ever deal with the Portuguese frontend names.
const STATUS_MAP = {
    SENT: "Enviado",
    SCHEDULED: "Agendado",
    ERROR: "Erro",
    DRAFT: "Rascunho",
};

function mapStatus(status) {
    if (!status) return "Rascunho";
    return STATUS_MAP[status] ?? status;
}

// Maps a backend email-message record to the frontend comunicacao shape.
function mapMessage(m) {
    return {
        id: m.id,
        dest: m.toEmail,
        modelo: `Template ${m.templateVersionId}`, // best effort without a versions lookup
        versao: `v${m.templateVersionId}`,
        status: mapStatus(m.status),
        quando: m.createdAt
            ? new Date(m.createdAt).toLocaleString("pt-BR")
            : "—",
    };
}

// Computes dashboard stats from the current comunicacoes list.
function computeStats(list, prev) {
    return {
        enviadosHoje: list.filter((c) => c.status === "Enviado").length,
        agendados: list.filter((c) => c.status === "Agendado").length,
        erros: list.filter((c) => c.status === "Erro").length,
        burstMax: prev?.burstMax ?? 0,
    };
}

export function AppProvider({ children }) {
    const [comunicacoes, setComunicacoes] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [stats, setStats] = useState({
        enviadosHoje: 0,
        agendados: 0,
        burstMax: 0,
        erros: 0,
    });
    const [loading, setLoading] = useState({
        comunicacoes: true,
        modelos: true,
    });
    const [error, setError] = useState(null);

    const fetchModelos = useCallback(async () => {
        setLoading((l) => ({ ...l, modelos: true }));
        try {
            const data = await templates.list();
            // Tolerate a paginated { content: [] } shape as well as a plain array.
            const list = Array.isArray(data) ? data : (data?.content ?? []);
            setModelos(
                list.map((t) => ({
                    id: t.id,
                    nome: t.name,
                    conteudo: "",
                    lacunas: [],
                })),
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading((l) => ({ ...l, modelos: false }));
        }
    }, []);

    const fetchComunicacoes = useCallback(async () => {
        setLoading((l) => ({ ...l, comunicacoes: true }));
        setError(null);
        try {
            const data = await emailMessages.list();
            const list = Array.isArray(data) ? data : (data?.content ?? []);
            const mapped = list.map(mapMessage);
            setComunicacoes(mapped);
            setStats((prev) => computeStats(mapped, prev));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading((l) => ({ ...l, comunicacoes: false }));
        }
    }, []);

    useEffect(() => {
        fetchModelos();
        fetchComunicacoes();
    }, [fetchModelos, fetchComunicacoes]);

    // Local-only removal — no DELETE endpoint exists on the backend.
    const removeComunicacao = useCallback((id) => {
        setComunicacoes((prev) => {
            const next = prev.filter((c) => c.id !== id);
            setStats((s) => computeStats(next, s));
            return next;
        });
    }, []);

    // Local-only status change — no PATCH endpoint exists on the backend.
    const updateComunicacaoStatus = useCallback((id, status) => {
        setComunicacoes((prev) => {
            const next = prev.map((c) =>
                c.id === id ? { ...c, status } : c,
            );
            setStats((s) => computeStats(next, s));
            return next;
        });
    }, []);

    const updateStats = useCallback((newStats) => {
        setStats((s) => ({ ...s, ...newStats }));
    }, []);

    const addComunicacao = useCallback(
        async ({ dest, modeloId, versaoId, versao, lacunas, cc, cco, scheduledAt }) => {
            const body = {
                templateVersionId: Number(versaoId || modeloId),
                toEmail: dest.split(" (CC:")[0].trim(),
                ccEmails: cc || undefined,
                bccEmails: cco || undefined,
                scheduledAt: scheduledAt || undefined,
                variables: lacunas || {},
            };
            const created = await emailMessages.create(body);

            // Append optimistically using the backend response when available,
            // falling back to the data we just submitted.
            const item = created
                ? mapMessage(created)
                : {
                      id: Date.now(),
                      dest: body.toEmail,
                      modelo: `Template ${body.templateVersionId}`,
                      versao: versao || `v${body.templateVersionId}`,
                      status: scheduledAt ? "Agendado" : "Enviado",
                      quando: new Date().toLocaleString("pt-BR"),
                  };
            setComunicacoes((prev) => {
                const next = [item, ...prev];
                setStats((s) => computeStats(next, s));
                return next;
            });
            return item;
        },
        [],
    );

    const value = {
        comunicacoes,
        removeComunicacao,
        updateComunicacaoStatus,
        stats,
        updateStats,
        loading,
        error,
        fetchComunicacoes,
        modelos,
        addComunicacao,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used within an AppProvider");
    return ctx;
}
