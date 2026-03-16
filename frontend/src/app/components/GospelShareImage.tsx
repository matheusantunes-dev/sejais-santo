// src/app/components/GospelShareImage.tsx
import React, { forwardRef } from "react";

type Props = {
  referencia: string;
  texto: string;
  backgroundSrc?: string;
  width?: number;
  layoutVariant?: "evangelho" | "versiculo" | string | null;
};

/**
 * GospelShareImage
 *
 * Componente responsável por renderizar o layout que será capturado em imagem.
 * - forwardRef para permitir que html-to-image capture o elemento real.
 * - layoutVariant controla pequenas variações de UI (tipografia, padding, posição de referência).
 *
 * OBS: o CSS define a maior parte do visual. Use classes `.gsi--evangelho` e `.gsi--versiculo`
 * no seu arquivo ShareComposer.css para ajustar tipografias e espaçamentos.
 */
export const GospelShareImage = forwardRef<HTMLDivElement, Props>(
  ({ referencia, texto, backgroundSrc, width = 252, layoutVariant = "evangelho" }, ref) => {
    const variantClass = layoutVariant === "versiculo" ? "gsi--versiculo" : "gsi--evangelho";

    return (
      <div
        ref={ref}
        className={`gospel-share-image ${variantClass}`}
        style={{ width: typeof width === "number" ? `${width}px` : width }}
      >
        <div
          className="gsi__background"
          style={{
            backgroundImage: backgroundSrc ? `url("${backgroundSrc}")` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="gsi__overlay" />

        <div className="gsi__content">
          {/* texto principal — controle via CSS por variant */}
          <div className="gsi__texto" aria-hidden>
            {texto}
          </div>

          {/* referência — geralmente menor, posicionada segundo variant */}
          <div className="gsi__referencia" aria-hidden>
            {referencia}
          </div>

          {/* crédito fixo (opcional) */}
          <div className="gsi__credit" aria-hidden>
            SEJAIS SANTO
          </div>
        </div>
      </div>
    );
  }
);
GospelShareImage.displayName = "GospelShareImage";
