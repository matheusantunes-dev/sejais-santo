// src/app/share/shareUtils.ts

export type ShareResult = {
  didShare: boolean;
  fallbackUrls?: string[];
};

/**
 * Espera o próximo paint do navegador.
 * Usado para garantir que o DOM terminou de renderizar antes de capturar imagem.
 */
export function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * Converte File ou Blob para DataURL
 */
export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

/**
 * Tenta compartilhar arquivos usando Web Share API.
 * Se não for possível, retorna URLs para fallback.
 */
export async function shareFilesOrDownload({
  files,
  title,
  text,
  url,
}: {
  files: File[];
  title?: string;
  text?: string;
  url?: string;
}): Promise<ShareResult> {
  if (!files.length) {
    return { didShare: false };
  }

  const hasShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const canShareFiles =
    hasShare &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files });

  try {
    if (canShareFiles) {
      await navigator.share({
        files,
        title,
        text,
        url,
      });

      return { didShare: true };
    }
  } catch (err) {
    console.warn("Erro ao compartilhar arquivos", err);
  }

  try {
    if (hasShare) {
      await navigator.share({
        title,
        text: text ?? title,
        url,
      });

      return { didShare: true };
    }
  } catch (err) {
    console.warn("Erro ao compartilhar texto", err);
  }

  // fallback → gerar links
  const urls = files.map((file) => URL.createObjectURL(file));

  return {
    didShare: false,
    fallbackUrls: urls,
  };
}
