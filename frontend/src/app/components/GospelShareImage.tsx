import { forwardRef } from "react";

interface Props {
  referencia: string;
  texto: string;
}

export const GospelShareImage = forwardRef<HTMLDivElement, Props>(
  ({ referencia, texto }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1080,
          padding: 80,
          backgroundColor: "#fdfcf8",
          fontFamily: "serif",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h2 style={{ marginBottom: 40 }}>{referencia}</h2>
        <p style={{ fontSize: 28, lineHeight: 1.5 }}>{texto}</p>
      </div>
    );
  }
);
