import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";
import { AuthProvider } from "./app/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// ── Service Worker ─────────────────────────────────────────────── //

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (reg) => {
        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (installing) {
            installing.addEventListener("statechange", () => {
              if (installing.state === "installed" && navigator.serviceWorker.controller) {
                console.log("Nova versao disponivel — recarregue para atualizar");
              }
            });
          }
        });
      },
      (err) => console.warn("Service Worker registration failed:", err),
    );
  });
}

// ── App ────────────────────────────────────────────────────────── //

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
  </React.StrictMode>
);
