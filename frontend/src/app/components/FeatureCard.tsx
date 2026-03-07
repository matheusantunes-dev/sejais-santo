import { Share2, Pencil, BookOpen } from "lucide-react";
import { GospelCard } from "./GospelCard";
import { GospelShareImage } from "./GospelShareImage";
import { toPng } from "html-to-image";
import { useRef } from "react";
import "./FeatureCard.css";
import recomendacao from "@/assets/recomendação.png";
import organizacao from "@/assets/organizacao.png";
import { useAuth } from "../context/AuthContext";
import { useGospel } from "../services/useGospel";
import { splitGospelText } from "../services/splitGospelText";

interface FeatureCardProps {
  title: string;
  description?: string;
  type: "gospel" | "verses" | "organize";
  onShare: () => void;
  onEdit?: () => void;
}

export function FeatureCard({
  title,
  description,
  type,
  onShare,
  onEdit,
}: FeatureCardProps) {
  const { session } = useAuth();
  const user = session?.user;
  const { gospel, loading, error } = useGospel();

  const slideRefs = useRef<HTMLDivElement[]>([]);

  const isOrganizer = type === "organize";

  const buttonLabel =
    type === "organize"
      ? "Editar"
      : type === "verses"
      ? "Abrir a Bíblia"
      : "Compartilhar";

  const slides = gospel ? splitGospelText(gospel.texto) : [];

  const handleShareGospel = async () => {
  if (!gospel) return;

  try {
    // força render completo antes de capturar
    await new Promise((resolve) => setTimeout(resolve, 300));

    const files: File[] = [];

    for (let i = 0; i < slideRefs.current.length; i++) {
      const node = slideRefs.current[i];

      if (!node) continue;

      const dataUrl = await toPng(node, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });

      const blob = await (await fetch(dataUrl)).blob();

      const file = new File(
        [blob],
        `evangelho-${i + 1}.png`,
        { type: "image/png" }
      );

      files.push(file);
    }

    if (files.length === 0) {
      alert("Erro ao gerar imagens.");
      return;
    }

    if (navigator.canShare && navigator.canShare({ files })) {
      await navigator.share({
        files,
        title: "Evangelho do Dia",
      });
    } else {
      alert("Seu dispositivo não suporta compartilhar múltiplas imagens.");
    }

  } catch (error) {
    console.error("Erro ao compartilhar:", error);
  }
};

  const buttonAction = () => {
    if (isOrganizer) {
      if (!user) {
        alert("Faça login com Google para organizar versículos.");
        return;
      }

      onEdit?.();
    } else if (type === "gospel") {
      handleShareGospel();
    } else {
      onShare();
    }
  };

  return (
    <div className="feature-card">
      <div className="feature-card-header">
        <h3 className="feature-card-title">{title}</h3>
      </div>

      <div className="feature-card-content">
        {type === "gospel" && (
          <GospelCard gospel={gospel} loading={loading} error={error} />
        )}

        {type === "verses" && (
          <div className="verses-image-container">
            <img src={recomendacao} alt="Versículos" />
          </div>
        )}

        {type === "organize" && (
          <div className="verses-image-container">
            <img src={organizacao} alt="Organizar" />
          </div>
        )}

        {description && (
          <p className="feature-card-description">{description}</p>
        )}
      </div>

      <div className="feature-card-footer">
        <button onClick={buttonAction} className="share-button">
          <span>{buttonLabel}</span>

          {isOrganizer ? (
            <Pencil className="share-icon" />
          ) : type === "verses" ? (
            <BookOpen className="share-icon" />
          ) : (
            <Share2 className="share-icon" />
          )}
        </button>
      </div>

      {/* Slides invisíveis para gerar as imagens */}
      {gospel && (
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          {slides.map((text, index) => (
            <GospelShareImage
              key={index}
              ref={(el) => {
                if (el) slideRefs.current[index] = el;
              }}
              referencia={gospel.referencia}
              texto={text}
            />
          ))}
        </div>
      )}
    </div>
  );
}
