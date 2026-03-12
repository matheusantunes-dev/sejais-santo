import { forwardRef } from "react";

interface GospelShareImageProps {
  referencia: string;
  texto: string;
  backgroundSrc: string;
  width?: number;
  height?: number;
}

export const GospelShareImage = forwardRef<HTMLDivElement, GospelShareImageProps>(
  (
    {
      referencia,
      texto,
      backgroundSrc,
      width = 900,
      height = 1600,
    },
    ref,
  ) => {
    const scale = width / 900;
    const textLength = texto.trim().length;
    const textSize = textLength > 820 ? 28 : textLength > 640 ? 30 : 34;

    return (
      <div
        ref={ref}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          position: "relative",
          overflow: "hidden",
          backgroundImage: `url(${backgroundSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxSizing: "border-box",
          borderRadius: `${34 * scale}px`,
          fontFamily: "Georgia, serif",
          color: "#2e1a0f",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255, 248, 236, 0.28) 0%, rgba(255, 248, 236, 0.14) 24%, rgba(71, 43, 17, 0.1) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            padding: `${92 * scale}px ${78 * scale}px`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              alignSelf: "flex-start",
              padding: `${14 * scale}px ${20 * scale}px`,
              borderRadius: `${999 * scale}px`,
              background: "rgba(255, 252, 246, 0.84)",
              border: `${2 * scale}px solid rgba(139, 26, 26, 0.18)`,
              fontSize: `${23 * scale}px`,
              fontWeight: 700,
              letterSpacing: `${1.4 * scale}px`,
              textTransform: "uppercase",
              color: "#6d2b20",
            }}
          >
            Evangelho do Dia
          </div>

          <div
            style={{
              background: "rgba(255, 248, 238, 0.9)",
              border: `${2 * scale}px solid rgba(162, 124, 84, 0.28)`,
              borderRadius: `${30 * scale}px`,
              padding: `${58 * scale}px ${54 * scale}px`,
              boxShadow: "0 24px 70px rgba(0, 0, 0, 0.14)",
            }}
          >
            <div
              style={{
                fontSize: `${44 * scale}px`,
                lineHeight: 1.2,
                fontWeight: 700,
                marginBottom: `${34 * scale}px`,
                color: "#6d2b20",
              }}
            >
              {referencia}
            </div>

            <div
              style={{
                fontSize: `${textSize * scale}px`,
                lineHeight: 1.72,
                textAlign: "justify",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {texto}
            </div>
          </div>

          <div
            style={{
              textAlign: "right",
              fontSize: `${24 * scale}px`,
              fontWeight: 600,
              letterSpacing: `${1.6 * scale}px`,
              textTransform: "uppercase",
              color: "#6b4a30",
            }}
          >
            Sejais Santo
          </div>
        </div>
      </div>
    );
  },
);

GospelShareImage.displayName = "GospelShareImage";
