// src/app/components/FeatureCard.tsx
import { Share2, Pencil, BookOpen } from "lucide-react";
import { GospelCard } from "./GospelCard";
import "./FeatureCard.css";
import recomendacao from "@/assets/recomendação.png";
import organizacao from "@/assets/organizacao.png";
import { useAuth } from "../context/AuthContext";
import { useGospel } from "../services/useGospel";

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
  const isOrganizer = type === "organize";

  const buttonLabel =
    type === "organize"
      ? "Editar"
      : type === "verses"
        ? "Abrir a Bíblia"
        : "Compartilhar";

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

  const handleShareGospel = async () => {
    if (!gospel) return;

    const content = `${gospel.referencia}\n\n${gospel.texto}`;

    if (navigator.share) {
      await navigator.share({
        title: "Evangelho do Dia",
        text: content,
      });
    } else {
      await navigator.clipboard.writeText(content);
      alert("Texto copiado!");
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
    </div>
  );
}
