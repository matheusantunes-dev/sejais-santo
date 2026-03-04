import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export function VersododiaModal({ open, onClose, children }: Props) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "30px",
          maxWidth: "600px",
          width: "90%",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: "10px",
            top: "10px",
            fontSize: "20px",
          }}
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
}
