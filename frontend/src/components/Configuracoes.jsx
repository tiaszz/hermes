import { useState } from "react";
import { Icon, FormField, Input, useToast } from "../components/UI.jsx";
import { C } from "../styles.js";

const API_ENDPOINTS = [
    { method: "POST", path: "/api/auth/login", desc: "Autenticação" },
    { method: "GET", path: "/api/templates", desc: "Listar modelos" },
    { method: "POST", path: "/api/templates", desc: "Criar modelo" },
    {
        method: "GET",
        path: "/api/templates/:id/versions",
        desc: "Versões do modelo",
    },
    {
        method: "POST",
        path: "/api/templates/:id/versions",
        desc: "Criar versão",
    },
    {
        method: "GET",
        path: "/api/email-messages",
        desc: "Listar comunicações",
    },
    {
        method: "POST",
        path: "/api/email-messages",
        desc: "Enviar comunicação",
    },
];

export default function Configuracoes() {
    const [showSmtpPass, setShowSmtpPass] = useState(false);
    const { show, Toast } = useToast();

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="page-title">Configurações</div>
                    <div className="page-sub">
                        Informações do sistema e configurações de conta.
                    </div>
                </div>
            </div>

            <div className="content content-narrow">
                <div className="flex-col gap-16">
                    {/* Perfil */}
                    <div className="card">
                        <div className="config-section-header">
                            <div className="config-section-title">Perfil</div>
                            <div className="config-section-desc">
                                Informações da conta de acesso ao sistema.
                            </div>
                        </div>
                        <FormField label="E-mail / usuário">
                            <Input value="teste@admin.com" disabled />
                        </FormField>
                        <FormField label="Função">
                            <Input value="Administrador" disabled />
                        </FormField>
                        <div className="form-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() =>
                                    show(
                                        "Funcionalidade disponível em breve.",
                                        "error",
                                    )
                                }
                            >
                                Alterar senha
                            </button>
                        </div>
                    </div>

                    {/* SMTP */}
                    <div className="card">
                        <div className="config-section-header">
                            <div className="config-section-title">SMTP</div>
                            <div className="config-section-desc">
                                Configurações de envio definidas via variáveis
                                de ambiente no servidor.
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
                            <Input
                                value="Definido via variável de ambiente"
                                disabled
                            />
                        </FormField>
                        <FormField label="Senha (MAIL_PASSWORD)">
                            <div className="password-wrapper">
                                <Input
                                    type={showSmtpPass ? "text" : "password"}
                                    value="definido-via-env"
                                    disabled
                                />
                                <button
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowSmtpPass((s) => !s)
                                    }
                                >
                                    <Icon
                                        name={
                                            showSmtpPass ? "eyeOff" : "eye"
                                        }
                                        size={16}
                                        color={C.textMuted}
                                    />
                                </button>
                            </div>
                        </FormField>
                    </div>

                    {/* API reference */}
                    <div className="card">
                        <div className="config-section-header">
                            <div className="config-section-title">
                                Referência de API
                            </div>
                            <div className="config-section-desc">
                                Endpoints REST disponíveis para integrações
                                externas. Autenticação via Bearer token.
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                            }}
                        >
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
                                            background:
                                                e.method === "POST"
                                                    ? C.greenLight
                                                    : "#f0f0f0",
                                            color:
                                                e.method === "POST"
                                                    ? C.greenMid
                                                    : C.textSub,
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
                                    <code
                                        style={{
                                            fontSize: 12,
                                            fontFamily: "monospace",
                                            color: C.textPrimary,
                                            flex: 1,
                                        }}
                                    >
                                        {e.path}
                                    </code>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            color: C.textMuted,
                                        }}
                                    >
                                        {e.desc}
                                    </span>
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
                                <Icon
                                    name="externalLink"
                                    size={14}
                                    color={C.textSub}
                                />
                                Abrir Swagger UI
                            </a>
                        </div>
                    </div>

                    {/* Sobre */}
                    <div className="card">
                        <div className="config-section-header">
                            <div className="config-section-title">Sobre</div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                                fontSize: 13,
                                color: C.textSub,
                            }}
                        >
                            <div className="flex justify-between">
                                <span>Aplicação</span>
                                <span className="font-500">
                                    Hermes · Gateway de Comunicação
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Backend</span>
                                <span className="font-500">
                                    Spring Boot · porta 8080
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Frontend</span>
                                <span className="font-500">
                                    React 19 · Vite
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Projeto</span>
                                <span className="font-500">
                                    Desafio Fatec Indaiatuba · 2026
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Toast />
        </>
    );
}
