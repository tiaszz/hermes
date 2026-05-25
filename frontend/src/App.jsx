import { useState } from "react";
import "./style.css";
import Login from "./components/Login.jsx";
import Painel from "./components/Painel.jsx";
import Nova from "./components/Nova.jsx";
import Historico from "./components/Historico.jsx";
import Modelos from "./components/Modelos.jsx";
import Configuracoes from "./components/Configuracoes.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import { Icon } from "./components/UI.jsx";
import { auth } from "./api.js";

const NAV_ITEMS = [
    { key: "painel", label: "Painel", icon: "home" },
    { key: "nova", label: "Nova comunicação", icon: "send" },
    { key: "historico", label: "Histórico", icon: "history" },
    { key: "modelos", label: "Modelos", icon: "template" },
    { key: "config", label: "Configurações", icon: "settings" },
];

function Sidebar({ page, setPage, onLogout }) {
    const userName = localStorage.getItem("userName") || "Admin";
    const initial = userName.charAt(0).toUpperCase();

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">
                    <Icon name="mail" size={18} color="white" />
                </div>
                <div>
                    <div className="sidebar-brand-name">Hermes</div>
                    <div className="sidebar-brand-sub">Comunicação corporativa</div>
                </div>
            </div>

            <ul className="sidebar-nav">
                {NAV_ITEMS.map((item) => (
                    <li
                        key={item.key}
                        className={`nav-item${page === item.key ? " active" : ""}`}
                        onClick={() => setPage(item.key)}
                    >
                        <Icon
                            name={item.icon}
                            size={16}
                            color={page === item.key ? "#1e5631" : "#444"}
                        />
                        {item.label}
                    </li>
                ))}
            </ul>

            <div className="sidebar-footer">
                <div className="avatar">{initial}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sidebar-footer-name">{userName}</div>
                    <div className="sidebar-footer-role">Administrador</div>
                </div>
                <button className="btn-icon" onClick={onLogout} aria-label="Sair">
                    <Icon name="externalLink" size={16} color="#555555" />
                </button>
            </div>
        </aside>
    );
}

function App() {
    const [loggedIn, setLoggedIn] = useState(auth.isAuthenticated());
    const [page, setPage] = useState("painel");

    if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

    return (
        <AppProvider>
            <div className="app-shell">
                <Sidebar
                    page={page}
                    setPage={setPage}
                    onLogout={() => {
                        auth.logout();
                        setLoggedIn(false);
                    }}
                />
                <div className="main-area">
                    {page === "painel" && <Painel setPage={setPage} />}
                    {page === "nova" && <Nova setPage={setPage} />}
                    {page === "historico" && <Historico setPage={setPage} />}
                    {page === "modelos" && <Modelos setPage={setPage} />}
                    {page === "config" && <Configuracoes />}
                </div>
            </div>
        </AppProvider>
    );
}

export default App;
