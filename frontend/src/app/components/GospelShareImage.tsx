import { forwardRef } from "react";
import biblePaper from "@/assets/bible-paper.jpeg";

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
        width: "1080px",
        height: "1920px",
        padding: "160px 120px",
        backgroundImage: `url(${biblePaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "Georgia, serif",
        color: "#1c1c1c",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <span
          style={{
            fontSize: "40px",
            opacity: 0.7,
            marginBottom: "40px",
            display: "block",
          }}
        >
          {referencia}
        </span>

        <div
          style={{
            fontSize: "42px",
            lineHeight: 1.9,
            textAlign: "justify",
            whiteSpace: "pre-wrap",
          }}
        >
          {texto}
        </div>
      </div>

      <div
        style={{
          fontSize: "22px",
          opacity: 0.6,
          textAlign: "right",
        }}
      >
        gospelapp
      </div>
    </div>
  );
});

GospelShareImage.displayName = "GospelShareImage";
