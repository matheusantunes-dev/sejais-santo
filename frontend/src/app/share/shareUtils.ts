export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Nao foi possivel ler a imagem selecionada."));

    reader.readAsDataURL(file);
  });
}

export async function waitForNextPaint(): Promise<void> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

export function downloadFiles(files: File[]): void {
  files.forEach((file) => {
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = file.name;
    anchor.click();

    setTimeout(() => URL.revokeObjectURL(url), 0);
  });
}

export async function shareFilesOrDownload({
  files,
  title,
}: {
  files: File[];
  title: string;
}): Promise<void> {
  if (!files.length) return;

  const canShareFiles =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files });

  if (canShareFiles) {
    try {
      await navigator.share({ files, title });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.warn("Compartilhamento indisponivel, usando download.", error);
    }
  }

  downloadFiles(files);
}
