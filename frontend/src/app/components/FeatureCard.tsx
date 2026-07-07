import { Share2, Pencil, BookOpen } from "lucide-react";
import { GospelCard } from "./GospelCard";
import { GospelShareModal } from "./GospelShareModal";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import "./FeatureCard.css";
import recomendacao from "@/assets/recomendacao.webp";
import organizacao from "@/assets/organizacao.webp";
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

  const { gospel, liturgical, loading, error } = useGospel();
  const [showGospelModal, setShowGospelModal] = useState(false);

  const isOrganizer = type === "organize";

  const buttonLabel =
    type === "organize"
      ? "Editar"
      : type === "verses"
        ? "Abrir a Biblia"
        : "Compartilhar";

  const buttonAction = () => {
    if (isOrganizer) {
      if (!user) {
        toast.error("Faça login com Google para organizar versículos.");
        return;
      }

      onEdit?.();
      return;
    }

    if (type === "gospel") {
      if (!gospel) {
        toast.error("O evangelho ainda está carregando.");
        return;
      }

      setShowGospelModal(true);
      return;
    }

    onShare();
  };

  return (
    <>
      <Card interactive>
        <Card.Icon>
          <h3 className="feature-card-title">{title}</h3>
        </Card.Icon>

        <Card.Content className="feature-card-content">
          {type === "gospel" && (
            <GospelCard gospel={gospel} liturgical={liturgical} loading={loading} error={error} />
          )}

          {type === "verses" && (
            <div className="verses-image-container">
              <img src={recomendacao} alt="Ilustração de versículos bíblicos" />
            </div>
          )}

          {type === "organize" && (
            <div className="verses-image-container">
              <img src={organizacao} alt="Ilustração de organização de versículos" />
            </div>
          )}

          {description && (
            <p className="feature-card-description">{description}</p>
          )}
        </Card.Content>

        <Card.Actions>
          <Button
            variant="primary"
            onClick={buttonAction}
            aria-label={`${title}: ${buttonLabel}`}
            endIcon={isOrganizer ? Pencil : type === "verses" ? BookOpen : Share2}
            fullWidth
          >
            {buttonLabel}
          </Button>
        </Card.Actions>
      </Card>

      <GospelShareModal
        open={showGospelModal}
        onClose={() => setShowGospelModal(false)}
        gospel={gospel}
      />
    </>
  );
}

