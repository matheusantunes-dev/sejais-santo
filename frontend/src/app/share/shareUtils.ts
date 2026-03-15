// src/app/share/shareUtils.ts

/**
 * Chama o compartilhamento nativo com um array de arquivos.
 * Se o navegador não suportar, lança um erro.
 */
export async function shareFiles({
  files,
  title,
  text,
}: {
  files: File[];
  title?: string;
  text?: string;
}) {
  if (!files.length) return;

  if (!navigator.share) {
    throw new Error("Seu navegador não suporta compartilhamento.");
  }

  try {
    await navigator.share({
      files,
      title,
      text,
    });
  } catch (error) {
    console.error("Erro ao compartilhar:", error);
  }
}

/**
 * Aguarda dois ciclos de requestAnimationFrame, útil para garantir
 * que o DOM terminou de renderizar antes de capturar uma imagem.
 */
export function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

/**
 * Converte um Blob ou File em Data URL base64.
 */
export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
