import { Share2, Pencil, BookOpen } from "lucide-react";
import { GospelCard } from "./GospelCard";
import { toPng } from "html-to-image";
import { useRef, useEffect } from "react";
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

  // referência do container que será capturado
  const shareRef = useRef<HTMLDivElement | null>(null);

  // arquivo pré-gerado
  const preGeneratedFileRef = useRef<File | null>(null);

  const isOrganizer = type === "organize";

  const buttonLabel =
    type === "organize"
      ? "Editar"
      : type === "verses"
      ? "Abrir a Bíblia"
      : "Compartilhar";

  /**
   * Pré-gera a imagem do evangelho assim que ele carregar.
   * Isso evita o erro do navegador bloquear o share.
   */
  useEffect(() => {
    let cancelled = false;

    async function generateImage() {
      preGeneratedFileRef.current = null;

      if (!gospel) return;
      if (!shareRef.current) return;

      try {
        // pequeno delay para garantir layout estável
        await new Promise((r) => setTimeout(r, 150));

        const dataUrl = await toPng(shareRef.current, {
          pixelRatio: 2.5,
          cacheBust: true,
          backgroundColor: "#ffffff",
          skipFonts: true,
        });

        if (cancelled) return;

        const blob = await (await fetch(dataUrl)).blob();

        const file = new File([blob], "evangelho-do-dia.png", {
          type: "image/png",
        });

        preGeneratedFileRef.current = file;
      } catch (error) {
        console.error("Erro ao gerar imagem do evangelho:", error);
      }
    }

    generateImage();

    return () => {
      cancelled = true;
    };
  }, [gospel]);

  /**
   * Compartilhar evangelho
   */
  const handleShareGospel = async () => {
    if (!gospel) return;

    try {
      const file = preGeneratedFileRef.current;

      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Evangelho do Dia",
          text: gospel.referencia,
        });

        return;
      }

      // fallback caso a imagem ainda não esteja pronta
      if (!shareRef.current) {
        alert("Não foi possível gerar a imagem.");
        return;
      }

      const dataUrl = await toPng(shareRef.current, {
        pixelRatio: 2.5,
        cacheBust: true,
        backgroundColor: "#ffffff",
        skipFonts: true,
      });

      const blob = await (await fetch(dataUrl)).blob();

      const fallbackFile = new File([blob], "evangelho.png", {
        type: "image/png",
      });

      if (
        navigator.canShare &&
        navigator.canShare({ files: [fallbackFile] })
      ) {
        await navigator.share({
          files: [fallbackFile],
          title: "Evangelho do Dia",
          text: gospel.referencia,
        });
      } else {
        await navigator.clipboard.writeText(
          `${gospel.referencia}\n\n${gospel.texto}`
        );

        alert(
          "Seu dispositivo não suporta compartilhamento de imagem. O texto foi copiado."
        );
      }
    } catch (error: any) {
      if (error?.name === "NotAllowedError") {
        alert(
          "O navegador bloqueou o compartilhamento. Tente novamente tocando no botão."
        );
      }

      console.error("Erro ao compartilhar evangelho:", error);
    }
  };

  /**
   * ação do botão principal
   */
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
          <div ref={shareRef}>
            <GospelCard
              gospel={gospel}
              loading={loading}
              error={error}
            />
          </div>
        )}

        {type === "verses" && (
          <div className="verses-image-container">
            <img src={recomendacao} alt="Versículos recomendados" />
          </div>
        )}

        {type === "organize" && (
          <div className="verses-image-container">
            <img src={organizacao} alt="Organizar versículos" />
          </div>
        )}

        {description && (
          <p className="feature-card-description">
            {description}
          </p>
        )}
      </div>

      <div className="feature-card-footer">
        <button
          onClick={buttonAction}
          className="share-button"
        >
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
