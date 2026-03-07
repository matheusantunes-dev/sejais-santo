import { Share2, Pencil, BookOpen } from "lucide-react";
import { GospelCard } from "./GospelCard";
import { GospelShareImage } from "./GospelShareImage";
import { toPng } from "html-to-image";
import { useRef, useState } from "react";
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

  const shareRef = useRef<HTMLDivElement>(null);

  const [renderText, setRenderText] = useState("");

  const isOrganizer = type === "organize";

  const buttonLabel =
    type === "organize"
      ? "Editar"
      : type === "verses"
      ? "Abrir a Bíblia"
      : "Compartilhar";

  /**
   * Divide o texto em frases
   */
  const splitSentences = (text: string) => {
    const sentences =
      text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()) || [];

    return sentences;
  };

  /**
   * Agrupa frases em blocos para cada imagem
   */
  const buildChunks = (text: string) => {
    const sentences = splitSentences(text);

    const chunks: string[] = [];
    let current = "";

    const MAX_CHARS = 420;

    for (const sentence of sentences) {
      if ((current + sentence).length > MAX_CHARS) {
        chunks.push(current.trim());
        current = sentence + " ";
      } else {
        current += sentence + " ";
      }
    }

    if (current.trim()) chunks.push(current.trim());

    return chunks;
  };

  /**
   * Gera imagens
   */
  const generateImages = async (chunks: string[]) => {
    const files: File[] = [];

    for (let i = 0; i < chunks.length; i++) {
      setRenderText(chunks[i]);

      // espera React renderizar
      await new Promise((resolve) => setTimeout(resolve, 120));

      const dataUrl = await toPng(shareRef.current!, {
        pixelRatio: 2,
        skipFonts: true,
      });

      const blob = await (await fetch(dataUrl)).blob();

      const file = new File([blob], `evangelho-${i + 1}.png`, {
        type: "image/png",
      });

      files.push(file);
    }

    return files;
  };

  /**
   * Compartilhar evangelho
   */
  const handleShareGospel = async () => {
    if (!gospel || !shareRef.current) return;

    try {
      const chunks = buildChunks(gospel.texto);

      const files = await generateImages(chunks);

      if (navigator.share && navigator.canShare?.({ files })) {
        await navigator.share({
          files,
          title: "Evangelho do Dia",
        });
      } else {
        await navigator.clipboard.writeText(
          `${gospel.referencia}\n\n${gospel.texto}`
        );

        alert("Compartilhamento de imagem não suportado. Texto copiado.");
      }
    } catch (error) {
      console.error("Erro ao gerar imagens:", error);
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

      {gospel && (
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <GospelShareImage
            ref={shareRef}
            referencia={gospel.referencia}
            texto={renderText || gospel.texto}
          />
        </div>
      )}
    </div>
  );
}
