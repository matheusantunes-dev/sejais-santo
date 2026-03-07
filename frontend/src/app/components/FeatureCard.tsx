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

  // referência para o container visual (o GospelCard que o usuário vê)
  const shareRef = useRef<HTMLDivElement | null>(null);

  // armazena arquivo pré-gerado para compartilhar rapidamente
  const preGeneratedFileRef = useRef<File | null>(null);

  const isOrganizer = type === "organize";

  const buttonLabel =
    type === "organize"
      ? "Editar"
      : type === "verses"
      ? "Abrir a Bíblia"
      : "Compartilhar";

  /**
   * Pré-gerar uma imagem quando o gospel mudar ou o shareRef ficar disponível.
   * Isso evita o problema do navegador bloquear navigator.share por não ser
   * mais um "gesture" do usuário (NotAllowedError).
   */
  useEffect(() => {
    let cancelled = false;

    async function preGenerate() {
      preGeneratedFileRef.current = null;

      if (!gospel || !shareRef.current) return;

      try {
        // pequeno delay para garantir layout estável (evita imagens cortadas)
        await new Promise((r) => setTimeout(r, 120));

        const dataUrl = await toPng(shareRef.current, {
          pixelRatio: 3,        // alta resolução para redes sociais
          cacheBust: true,
          backgroundColor: "#ffffff",
          skipFonts: true,      // evita erros CORS ao tentar embutir Google Fonts
        });

        if (cancelled) return;

        // converte dataURL p/ blob e cria File (rápido no clique depois)
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "evangelho-do-dia.png", {
          type: "image/png",
        });

        preGeneratedFileRef.current = file;
        // opcional: console.log("Pré-gerada imagem pronta");
      } catch (err) {
        console.error("Erro pré-gerando imagem:", err);
      }
    }

    preGenerate();

    return () => {
      cancelled = true;
    };
  }, [gospel]);

  const handleShareGospel = async () => {
    if (!gospel) return;

    try {
      // se já tem arquivo pré-gerado, tenta compartilhar imediatamente
      if (preGeneratedFileRef.current) {
        const files = [preGeneratedFileRef.current];

        if (navigator.canShare && navigator.canShare({ files })) {
          await navigator.share({
            files,
            title: "Evangelho do Dia",
            text: gospel.referencia,
          });
          return;
        }
      }

      // fallback: gerar na hora (tentar manter operação rápida)
      if (!shareRef.current) {
        alert("Elemento de compartilhamento não disponível.");
        return;
      }

      const dataUrl = await toPng(shareRef.current, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "#ffffff",
        skipFonts: true,
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "evangelho-do-dia.png", {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Evangelho do Dia",
          text: gospel.referencia,
        });
      } else {
        // fallback amigável: copia texto e alerta
        await navigator.clipboard.writeText(`${gospel.referencia}\n\n${gospel.texto}`);
        alert("Compartilhamento direto não disponível. Texto copiado para a área de transferência.");
      }
    } catch (err: any) {
      // se o navegador reclamar por não ser gesture, informe e peça ao usuário.
      if (err && err.name === "NotAllowedError") {
        alert("O compartilhamento foi bloqueado pelo navegador. Tente novamente pressionando o botão e mantendo a página ativa.");
      }
      console.error("Erro ao compartilhar:", err);
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
          // compartilhamos o próprio card visível: attach ref no container real
          <div ref={shareRef as any}>
            <GospelCard gospel={gospel} loading={loading} error={error} />
          </div>
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

        {description && <p className="feature-card-description">{description}</p>}
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
