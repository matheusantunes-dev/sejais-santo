// src/app/components/Header.tsx
import "./Header.css";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.webp?version=2";
import { useAuth } from "../context/AuthContext";
import googleLogo from "@/assets/google.svg";

export function Header() {
  const [isMobile, setIsMobile] = useState(false);
  const { session, login, logout } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const user = session?.user;
  
  return (
    <header className="header" role="banner">
      <div className="header-container">
        <div className="header-left">
          <div className="header-title-wrapper">
            <h1 className="header-title">Sejais Santo</h1>
            <p className="header-subtitle">Porque Deus é Santo</p>
          </div>
          <img src={logo} alt="Ícone de São Carlo Acutis" className="header-logo" width="64" height="64" />
        </div>

        <nav className="header-right" aria-label="Autenticação">
          {user ? (
            <div className="header-user">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={`Avatar de ${user.email ?? "usuário"}`}
                  className="user-avatar"
                  width="36"
                  height="36"
                />
              ) : (
                <div className="user-avatar user-avatar-fallback" aria-hidden="true">
                  {user.email?.charAt(0).toUpperCase() ?? "U"}
                </div>
              )}

              <button
                className="logout-button"
                onClick={logout}
                aria-label={`Sair da conta de ${user.email ?? "usuário"}`}
              >
                Sair
              </button>
            </div>
          ) : (
            <button className="login-button" onClick={login} aria-label="Entrar com Google">
              <span className="login-button__icon-wrapper">
                <img src={googleLogo} alt="" aria-hidden="true" />
              </span>

              <span className="login-text-full">Entrar com Google</span>
              <span className="login-text-short">Login</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
