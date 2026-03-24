// src/app/components/Header.tsx
import "./Header.css";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png?version=2";
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
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="header-title-wrapper">
            <h1 className="header-title">Sejais Santo</h1>
            <p className="header-subtitle">Porque Deus é Santo</p>
          </div>
          <img src={logo} alt="São Carlo Acutis" className="header-logo" />
        </div>

        <div className="header-right">
          {user ? (
            <div className="header-user">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.email ?? "Usuário"}
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar user-avatar-fallback">
                  {user.email?.charAt(0).toUpperCase() ?? "U"}
                </div>
              )}

              <button
                className="logout-button"
                onClick={logout}
                aria-label="Sair"
              >
                Sair
              </button>
            </div>
          ) : (
            <button className="login-button" onClick={login}>
              <span className="login-button__icon-wrapper">
                <img src={googleLogo} alt="" aria-hidden="true" />
              </span>

              <span className="login-text-full">Entrar com Google</span>
              <span className="login-text-short">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
