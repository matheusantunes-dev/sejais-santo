import { Cross, BookOpen, Sparkles, Home, User } from "lucide-react";
import "./BottomNav.css";

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

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação rápida">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className="bottom-nav-item"
          onClick={() => scrollToSection(id)}
          aria-label={label}
        >
          <Icon size={22} aria-hidden="true" />
          <span className="bottom-nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}