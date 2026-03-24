
import { forwardRef } from "react";

interface GospelShareImageProps {
  referencia: string;
  texto: string;
  backgroundSrc: string;
  width?: number;
  minHeight?: number;
}

export const GospelShareImage = forwardRef<HTMLDivElement, GospelShareImageProps>(
  ({ referencia, texto, backgroundSrc, width = 900, minHeight }, ref) => {
    const scale = width / 900;
    const computedMinHeight = minHeight ?? width * (1600 / 900);

    return (
      <div
        ref={ref}
        style={{
          width: `${width}px`,
          minHeight: `${computedMinHeight}px`,
          padding: `${120 * scale}px ${100 * scale}px`,
          backgroundImage: `url(${backgroundSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          fontFamily: "Georgia, serif",
          color: "#1c1c1c",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            fontSize: `${48 * scale}px`,
            marginBottom: `${60 * scale}px`,
            opacity: 0.7,
            fontWeight: 600,
          }}
        >
          {referencia}
        </span>

        <div
          style={{
            fontSize: `${32 * scale}px`,
            lineHeight: 1.8,
            textAlign: "justify",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            flex: 1,
          }}
        >
          {texto}
        </div>

        <div
          style={{
            marginTop: `${80 * scale}px`,
            fontSize: `${20 * scale}px`,
            opacity: 0.5,
            textAlign: "right",
          }}
        >
          gospelapp
        </div>
      </div>
    );
  },
);

GospelShareImage.displayName = "GospelShareImage";
