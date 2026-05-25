import { useState, useEffect, useMemo } from "react";
import { Icon, FormField, Input, Select, useToast } from "../components/UI.jsx";
import { C } from "../styles.js";
import { useApp } from "../context/AppContext.jsx";
import { templateVersions } from "../api.js";

export default function Nova({ setPage }) {
    const { modelos, addComunicacao, loading } = useApp();
    const { show, Toast } = useToast();

    const [modeloId, setModeloId] = useState("");
    const [versoes, setVersoes] = useState([]);
    const [versaoId, setVersaoId] = useState("");
    const [versaoNome, setVersaoNome] = useState("v1");
    const [versaoBody, setVersaoBody] = useState("");
    const [versaoSubject, setVersaoSubject] = useState("");
    const [loadingVersoes, setLoadingVersoes] = useState(false);

    const [para, setPara] = useState("");
    const [cc, setCc] = useState("");
    const [cco, setCco] = useState("");
    const [showCC, setShowCC] = useState(false);
    const [envio, setEnvio] = useState("imediato");
    const [agendadoEm, setAgendadoEm] = useState("");
    const [lacunas, setLacunas] = useState({});
    const [anexos, setAnexos] = useState([]);
    const [errors, setErrors] = useState({});
    const [sending, setSending] = useState(false);

    const modeloSel = modelos.find((m) => String(m.id) === String(modeloId));

    // Parse {{variable}} placeholders from the selected version's body.
    const lacunasDetectadas = useMemo(() => {
        const matches = [...versaoBody.matchAll(/\{\{(\w+)\}\}/g)];
        return [...new Set(matches.map((m) => m[1]))];
    }, [versaoBody]);

    // Load versions whenever the selected template changes.
    useEffect(() => {
        if (!modeloId) {
            setVersoes([]);
            setVersaoId("");
            setVersaoBody("");
            setVersaoSubject("");
            return;
        }
        setLoadingVersoes(true);
        templateVersions
            .list(modeloId)
            .then((data) => {
                const list = Array.isArray(data) ? data : (data?.content ?? []);
                setVersoes(list);
                if (list.length > 0) {
                    const latest = list[list.length - 1];
                    setVersaoId(latest.id);
                    setVersaoNome(latest.name ?? `v${list.length}`);
                    setVersaoBody(latest.body ?? "");
                    setVersaoSubject(latest.subject ?? "");
                } else {
                    setVersaoId("");
                    setVersaoBody("");
                    setVersaoSubject("");
                }
            })
            .catch(() => setVersoes([]))
            .finally(() => setLoadingVersoes(false));
        setLacunas({});
    }, [modeloId]);

    // Live preview: replace {{var}} with filled values.
    const conteudoPreview = versaoBody.replace(
        /\{\{(\w+)\}\}/g,
        (_, k) => lacunas[k] || `{{${k}}}`,
    );
    const assuntoPreview = versaoSubject
        ? versaoSubject.replace(
              /\{\{(\w+)\}\}/g,
              (_, k) => lacunas[k] || `{{${k}}}`,
          )
        : modeloSel?.nome ?? "";

    const validate = () => {
        const e = {};
        if (!para.trim()) e.para = "Destinatário obrigatório.";
        if (!modeloId) e.modelo = "Selecione um modelo.";
        if (envio === "agendado" && !agendadoEm)
            e.agendadoEm = "Informe a data e hora.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleEnviar = async () => {
        if (!validate()) return;
        setSending(true);
        try {
            await addComunicacao({
                dest: para + (cc ? ` (CC: ${cc})` : ""),
                modeloId,
                versaoId: versaoId || undefined,
                versao: versaoNome,
                lacunas,
                cc: cc || undefined,
                cco: cco || undefined,
                scheduledAt: envio === "agendado" ? agendadoEm : undefined,
            });
            show("Comunicação enviada com sucesso!");
            setTimeout(() => setPage("historico"), 1200);
        } catch (err) {
            show(err.message ?? "Erro ao enviar.", "error");
        } finally {
            setSending(false);
        }
    };

    const handleAnexo = (e) => {
        const files = Array.from(e.target.files);
        const totalMB =
            [...anexos, ...files].reduce((a, f) => a + f.size, 0) / 1024 / 1024;
        if (totalMB > 10) {
            show("Limite de 10MB excedido.", "error");
            return;
        }
        setAnexos((prev) => [...prev, ...files]);
    };

    const versoesOpts = versoes.map((v, i) => ({
        value: String(v.id),
        label:
            v.name ??
            `v${versoes.length - i}${i === 0 ? " (mais recente)" : ""}`,
    }));

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="page-title">Nova comunicação</div>
                    <div className="page-sub">
                        Selecione um modelo, preencha as lacunas e envie.
                    </div>
                </div>
            </div>

            <div className="content">
                <div className="nova-layout">
                    {/* ── Left ── */}
                    <div className="nova-left">
                        {/* Modelo */}
                        <div className="card">
                            <div className="card-section-title">Modelo</div>
                            <div className="row-2">
                                <FormField label="Modelo" required>
                                    {loading.modelos ? (
                                        <div
                                            className="input"
                                            style={{ color: C.textMuted }}
                                        >
                                            Carregando modelos...
                                        </div>
                                    ) : (
                                        <Select
                                            value={String(modeloId)}
                                            onChange={(v) => setModeloId(v)}
                                            options={modelos.map((m) => ({
                                                value: String(m.id),
                                                label: m.nome,
                                            }))}
                                            placeholder="Selecione..."
                                        />
                                    )}
                                    {errors.modelo && (
                                        <div className="form-error">
                                            {errors.modelo}
                                        </div>
                                    )}
                                </FormField>

                                <FormField label="Versão">
                                    {loadingVersoes ? (
                                        <div
                                            className="input"
                                            style={{ color: C.textMuted }}
                                        >
                                            Carregando...
                                        </div>
                                    ) : versoes.length > 0 ? (
                                        <Select
                                            value={String(versaoId)}
                                            onChange={(v) => {
                                                setVersaoId(v);
                                                const found = versoes.find(
                                                    (x) => String(x.id) === v,
                                                );
                                                setVersaoNome(
                                                    found?.name ?? v,
                                                );
                                                setVersaoBody(
                                                    found?.body ?? "",
                                                );
                                                setVersaoSubject(
                                                    found?.subject ?? "",
                                                );
                                                setLacunas({});
                                            }}
                                            options={versoesOpts}
                                        />
                                    ) : (
                                        <div
                                            className="input"
                                            style={{ color: C.textMuted }}
                                        >
                                            {modeloId
                                                ? "Sem versões"
                                                : "—"}
                                        </div>
                                    )}
                                </FormField>
                            </div>

                            {/* Assunto da versão selecionada */}
                            {versaoSubject && (
                                <div
                                    className="text-13 text-sub"
                                    style={{ marginTop: 6 }}
                                >
                                    <strong>Assunto:</strong> {versaoSubject}
                                </div>
                            )}

                            {modeloId && !loadingVersoes &&
                                versoes.length === 0 && (
                                    <div
                                        className="lacunas-hint"
                                        style={{
                                            marginTop: 10,
                                            color: C.warning,
                                            background: C.warningBg,
                                        }}
                                    >
                                        Este modelo não tem versões. Crie uma
                                        em Modelos antes de enviar.
                                    </div>
                                )}
                        </div>

                        {/* Destinatários */}
                        <div className="card">
                            <div className="card-section-title">
                                Destinatários
                            </div>
                            <FormField label="Para" required>
                                <Input
                                    value={para}
                                    onChange={(v) => {
                                        setPara(v);
                                        setErrors((e) => ({
                                            ...e,
                                            para: "",
                                        }));
                                    }}
                                    placeholder="nome@empresa.com"
                                    hasError={!!errors.para}
                                />
                                {errors.para && (
                                    <div className="form-error">
                                        {errors.para}
                                    </div>
                                )}
                            </FormField>
                            {showCC ? (
                                <div className="row-2">
                                    <FormField label="CC">
                                        <Input
                                            value={cc}
                                            onChange={setCc}
                                            placeholder="cc@empresa.com"
                                        />
                                    </FormField>
                                    <FormField label="CCO">
                                        <Input
                                            value={cco}
                                            onChange={setCco}
                                            placeholder="cco@empresa.com"
                                        />
                                    </FormField>
                                </div>
                            ) : (
                                <span
                                    className="cc-link"
                                    onClick={() => setShowCC(true)}
                                >
                                    + Adicionar CC / CCO
                                </span>
                            )}
                        </div>

                        {/* Lacunas — shown only when the version body has {{variables}} */}
                        {lacunasDetectadas.length > 0 && (
                            <div className="card">
                                <div className="card-section-title">
                                    Mensagem
                                </div>
                                <div className="lacunas-hint">
                                    Lacunas detectadas:{" "}
                                    {lacunasDetectadas
                                        .map((l) => `{{${l}}}`)
                                        .join(", ")}
                                </div>
                                <div className="code-preview">
                                    {versaoBody}
                                </div>
                                <div className="row-2">
                                    {lacunasDetectadas.map((l) => (
                                        <FormField key={l} label={l}>
                                            <Input
                                                value={lacunas[l] ?? ""}
                                                onChange={(v) =>
                                                    setLacunas((p) => ({
                                                        ...p,
                                                        [l]: v,
                                                    }))
                                                }
                                                placeholder={`Valor para {{${l}}}`}
                                            />
                                        </FormField>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Anexos */}
                        <div className="card">
                            <div className="card-section-title">Anexos</div>
                            <label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleAnexo}
                                    style={{ display: "none" }}
                                />
                                <div className="dropzone">
                                    <Icon
                                        name="attach"
                                        size={22}
                                        color="#ccc"
                                    />
                                    <div className="dropzone-text">
                                        Arraste arquivos ou clique para
                                        selecionar
                                    </div>
                                    <div className="dropzone-hint">
                                        Máx. 10 MB no total
                                    </div>
                                </div>
                            </label>
                            {anexos.length > 0 && (
                                <div className="attachments-list">
                                    {anexos.map((f, i) => (
                                        <div
                                            key={i}
                                            className="attachment-chip"
                                        >
                                            <Icon
                                                name="attach"
                                                size={12}
                                                color={C.green}
                                            />
                                            {f.name}
                                            <button
                                                className="btn-icon"
                                                onClick={() =>
                                                    setAnexos((a) =>
                                                        a.filter(
                                                            (_, j) => j !== i,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Icon
                                                    name="x"
                                                    size={12}
                                                    color={C.green}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Right ── */}
                    <div className="nova-right">
                        <div className="card">
                            <div className="card-section-title">Envio</div>
                            {["imediato", "agendado"].map((opt) => (
                                <label key={opt} className="radio-option">
                                    <input
                                        type="radio"
                                        name="envio"
                                        value={opt}
                                        checked={envio === opt}
                                        onChange={() => setEnvio(opt)}
                                        style={{ accentColor: C.green }}
                                    />
                                    {opt === "imediato"
                                        ? "Enviar imediatamente"
                                        : "Agendar envio"}
                                </label>
                            ))}
                            {envio === "agendado" && (
                                <FormField label="Data e hora">
                                    <input
                                        type="datetime-local"
                                        value={agendadoEm}
                                        onChange={(e) =>
                                            setAgendadoEm(e.target.value)
                                        }
                                        className="input"
                                    />
                                    {errors.agendadoEm && (
                                        <div className="form-error">
                                            {errors.agendadoEm}
                                        </div>
                                    )}
                                </FormField>
                            )}
                            <button
                                className="btn btn-primary w-full mb-8"
                                style={{ justifyContent: "center" }}
                                onClick={handleEnviar}
                                disabled={sending}
                            >
                                <Icon name="send" size={14} color="white" />
                                {sending ? "Enviando..." : "Enviar agora"}
                            </button>
                        </div>

                        <div className="card">
                            <div className="card-section-title">
                                Pré-visualização
                            </div>
                            <div className="preview-box">
                                {modeloSel ? (
                                    <>
                                        <div className="preview-subject">
                                            <span className="preview-label">
                                                Assunto
                                            </span>
                                            {assuntoPreview}
                                        </div>
                                        <div>
                                            <span className="preview-label">
                                                Conteúdo
                                            </span>
                                            {conteudoPreview ? (
                                                <span className="preview-body">
                                                    {conteudoPreview}
                                                </span>
                                            ) : (
                                                <span
                                                    style={{
                                                        color: C.textMuted,
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    {loadingVersoes
                                                        ? "Carregando versão..."
                                                        : versoes.length === 0
                                                          ? "Nenhuma versão disponível."
                                                          : "Sem conteúdo."}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <span className="preview-empty">
                                        Selecione um modelo para
                                        pré-visualizar.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Toast />
        </>
    );
}
