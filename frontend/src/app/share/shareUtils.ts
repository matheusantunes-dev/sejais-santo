// src/app/share/shareUtils.ts

/**
 * Compartilha arquivos usando Web Share API.
 * Se o navegador não suportar compartilhamento de arquivos,
 * tenta compartilhar texto/url como fallback.
 */
export async function shareFiles({
  files,
  title,
  text,
  url,
}: {
  files: File[];
  title?: string;
  text?: string;
  url?: string;
}) {
  if (!files.length) return;

  try {
    const canCheck = typeof navigator.canShare === "function";
    const canShareFiles = canCheck ? navigator.canShare({ files }) : true;

    if (typeof navigator.share === "function" && canShareFiles) {
      await navigator.share({
        files,
        title,
        text,
        url,
      });

      return;
    }

    // fallback: compartilhar texto
    if (typeof navigator.share === "function") {
      await navigator.share({
        title,
        text,
        url,
      });
    }
  } catch (error) {
    console.error("Erro ao compartilhar:", error);
    throw error;
  }
}

/**
 * Aguarda dois ciclos de renderização do navegador.
 * Isso garante que o DOM esteja pronto antes de capturar a imagem.
 */
export function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

/**
 * Converte Blob/File para base64 (DataURL)
 */
export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}
