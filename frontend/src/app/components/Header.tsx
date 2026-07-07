import "./Header.css";
import { useState, useEffect } from "react";
import { Cross, BookOpen, Sparkles, Home, User, LogOut } from "lucide-react";
import logo from "@/assets/logo.webp?version=2";
import { useAuth } from "../context/AuthContext";
import googleLogo from "@/assets/google.svg";

const NAV_ITEMS = [
  { id: "inicio", label: "Início", icon: Home },
  { id: "evangelho", label: "Evangelho", icon: Cross },
  { id: "santos", label: "Santos", icon: Sparkles },
  { id: "sobre", label: "Sobre", icon: User },
  { id: "pilares", label: "Pilares", icon: BookOpen },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Header() {
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { session, login, logout } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);

    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const user = session?.user;

  const navLinks = (
    <nav className="header-nav" aria-label="Navegação principal">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className="header-nav-link"
          onClick={() => { scrollToSection(id); setMenuOpen(false); }}
          aria-label={`Ir para ${label}`}
        >
          <Icon size={16} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <header className={`header${scrolled ? " header--scrolled" : ""}`} role="banner">
      <div className="header-container">
        <div className="header-left">
          <div className="header-title-wrapper">
            <h1 className="header-title">Sejais Santo</h1>
            <p className="header-subtitle">Porque Deus é Santo</p>
          </div>
          <img src={logo} alt="Ícone de São Carlo Acutis" className="header-logo" width="64" height="64" loading="lazy" />
        </div>

        {!isMobile && navLinks}

        <div className="header-right">
          <button
            className="header-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            <span className={`hamburger ${menuOpen ? "hamburger--open" : ""}`} />
          </button>

          {user ? (
            <div className="header-user">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={`Avatar de ${user.email ?? "usuário"}`}
                  className="user-avatar"
                  width="36"
                  height="36"
                  loading="lazy"
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
                <LogOut size={16} aria-hidden="true" />
                <span className="logout-text">Sair</span>
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
        </div>
      </div>

      {isMobile && menuOpen && (
        <div className="header-mobile-menu">
          {navLinks}
        </div>
      )}
    </header>
  );
}
