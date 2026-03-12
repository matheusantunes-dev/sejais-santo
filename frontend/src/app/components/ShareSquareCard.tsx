import { forwardRef } from "react";

interface ShareSquareCardProps {
  headerLabel: string;
  text: string;
  reference?: string;
  footerLabel?: string;
  backgroundSrc: string;
  width?: number;
  height?: number;
}

export const ShareSquareCard = forwardRef<HTMLDivElement, ShareSquareCardProps>(
  (
    {
      headerLabel,
      text,
      reference,
      footerLabel = "Sejais Santo",
      backgroundSrc,
      width = 1080,
      height = 1080,
    },
    ref,
  ) => {
    const scale = width / 1080;
    const textLength = text.trim().length;

    const textSize =
      textLength > 230 ? 46 : textLength > 180 ? 52 : textLength > 130 ? 58 : 66;

    return (
      <div
        ref={ref}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          position: "relative",
          overflow: "hidden",
          borderRadius: `${36 * scale}px`,
          fontFamily: "Georgia, serif",
          color: "#fff",
          backgroundImage: `url(${backgroundSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(15, 23, 42, 0.18) 0%, rgba(15, 23, 42, 0.68) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            padding: `${88 * scale}px ${86 * scale}px`,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              alignSelf: "flex-start",
              padding: `${14 * scale}px ${20 * scale}px`,
              borderRadius: `${999 * scale}px`,
              background: "rgba(255, 248, 238, 0.2)",
              border: `${2 * scale}px solid rgba(255, 255, 255, 0.35)`,
              fontSize: `${22 * scale}px`,
              fontWeight: 700,
              letterSpacing: `${1.2 * scale}px`,
              textTransform: "uppercase",
            }}
          >
            {headerLabel}
          </div>

          <div
            style={{
              padding: `${58 * scale}px ${56 * scale}px`,
              borderRadius: `${34 * scale}px`,
              background: "rgba(10, 14, 25, 0.34)",
              border: `${2 * scale}px solid rgba(255, 255, 255, 0.18)`,
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.22)",
            }}
          >
            <div
              style={{
                fontSize: `${textSize * scale}px`,
                lineHeight: 1.28,
                fontWeight: 700,
                textAlign: "center",
                textShadow: "0 4px 18px rgba(0, 0, 0, 0.35)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              "{text}"
            </div>

            {reference ? (
              <div
                style={{
                  marginTop: `${34 * scale}px`,
                  fontSize: `${28 * scale}px`,
                  fontWeight: 700,
                  textAlign: "center",
                  color: "#F6E7B8",
                  letterSpacing: `${0.8 * scale}px`,
                }}
              >
                {reference}
              </div>
            ) : null}
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: `${24 * scale}px`,
              fontWeight: 600,
              letterSpacing: `${1.8 * scale}px`,
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            {footerLabel}
          </div>
        </div>
      </div>
    );
  },
);

ShareSquareCard.displayName = "ShareSquareCard";
