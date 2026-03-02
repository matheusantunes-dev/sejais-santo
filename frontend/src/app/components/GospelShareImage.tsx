import { forwardRef } from "react";

interface GospelShareImageProps {
  referencia: string;
  texto: string;
}

export const GospelShareImage = forwardRef<
  HTMLDivElement,
  GospelShareImageProps
>(({ referencia, texto }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: "900px",
        minHeight: "1600px",
        padding: "120px 100px",
        backgroundImage: "url('/bible-paper.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "Georgia, serif",
        color: "#1c1c1c",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <span
        style={{
          fontSize: "24px",
          marginBottom: "60px",
          opacity: 0.7,
        }}
      >
        {referencia}
      </span>

      <div
        style={{
          fontSize: "32px",
          lineHeight: 1.8,
          textAlign: "justify",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {texto}
      </div>

      <div
        style={{
          marginTop: "80px",
          fontSize: "20px",
          opacity: 0.5,
          textAlign: "right",
        }}
      >
        gospelapp
      </div>
    </div>
  );
});

GospelShareImage.displayName = "GospelShareImage";
