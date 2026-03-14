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

  const hasNavigator =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function";

  const canShareFiles =
    hasNavigator &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files });

  // 1️⃣ Compartilhamento ideal
  if (canShareFiles) {
    try {
      await navigator.share({ files, title });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }
  }

  // 2️⃣ fallback melhor (sem download)
  if (hasNavigator) {
    try {
      await navigator.share({
        title,
        text: title,
      });
      return;
    } catch {}
  }

  // 3️⃣ último fallback
  downloadFiles(files);
}

      console.warn("Compartilhamento indisponivel, usando download.", error);
    }
  }

  downloadFiles(files);
}
