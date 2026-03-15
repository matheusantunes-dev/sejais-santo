// src/app/share/shareUtils.ts
/**
 * Helpers para compartilhar arquivos com robustez.
 * - canShareFiles: verifica com segurança navigator.canShare({ files })
 * - shareFilesRobust: tenta compartilhar os arquivos; se falhar,
 *   tenta compartilhar individualmente e por fim tenta compartilhar
 *   apenas texto/url como fallback.
 *
 * Retorna boolean: true se o diálogo nativo de compartilhar foi aberto com sucesso.
 */

export async function canShareFilesSafely(files: File[]): Promise<boolean> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    console.info("[shareUtils] navigator.share não disponível");
    return false;
  }

  // Se navigator.canShare existe, use-o com try/catch (alguns browsers lançam)
  // Se não existe, assumimos “possível” — alguns browsers implementam share sem canShare.
  const canShareFn = (navigator as any).canShare;
  if (typeof canShareFn === "function") {
    try {
      const result = Boolean((navigator as any).canShare({ files }));
      console.info("[shareUtils] navigator.canShare result:", result);
      return result;
    } catch (err) {
      console.warn("[shareUtils] navigator.canShare lançou erro:", err);
      return false;
    }
  }

  // canShare não existe — conservadoramente assume true (tentar na prática)
  console.info("[shareUtils] navigator.canShare não existe — vamos tentar share diretamente");
  return true;
}

/**
 * Tenta compartilhar um array de arquivos de forma robusta.
 * Estratégia:
 * 1) checa canShareFilesSafely -> se true, tenta navigator.share({ files })
 * 2) se falhar, tenta compartilhar os arquivos um-a-um (abrindo múltiplos share sheets)
 * 3) se ainda falhar, tenta navigator.share({ title, text, url }) como último recurso
 *
 * Retorna true se algum share nativo foi aberto com sucesso.
 */
export async function shareFilesRobust({
  files,
  title,
  text,
  url,
}: {
  files: File[];
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> {
  if (!files || files.length === 0) {
    console.warn("[shareUtils] nenhum arquivo para compartilhar");
    return false;
  }

  // 1) tentar compartilhar todos os arquivos de uma vez
  try {
    const canShareAll = await canShareFilesSafely(files);

    if (canShareAll) {
      try {
        console.info("[shareUtils] tentando navigator.share com todos os arquivos");
        await (navigator as any).share({ files, title, text, url });
        console.info("[shareUtils] shared: todos os arquivos");
        return true;
      } catch (err) {
        console.warn("[shareUtils] navigator.share(files) falhou:", err);
        // continua para tentar outros caminhos
      }
    } else {
      // canShareAll false -> ainda assim tentamos, porque alguns browsers ignoram canShare
      try {
        console.info("[shareUtils] canShare retornou false — tentando navigator.share(files) mesmo assim");
        await (navigator as any).share({ files, title, text, url });
        console.info("[shareUtils] shared (apesar de canShare=false): todos os arquivos");
        return true;
      } catch (err) {
        console.warn("[shareUtils] tentativa direta navigator.share(files) falhou:", err);
      }
    }
  } catch (err) {
    console.warn("[shareUtils] erro ao avaliar canShareFilesSafely:", err);
  }

  // 2) Compartilhar arquivos um-a-um como fallback prático (abre share sheet várias vezes).
  //    Não é ideal UX, mas aumenta a chance do usuário conseguir compartilhar pelo menos.
  if (typeof navigator !== "undefined" && typeof (navigator as any).share === "function") {
    console.info("[shareUtils] tentando compartilhar arquivos individualmente");
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        await (navigator as any).share({
          files: [file],
          title,
          text: `${title ?? ""} (imagem ${i + 1} de ${files.length})`,
          url,
        });
        console.info(`[shareUtils] shared single file ${file.name}`);
        // retornamos true porque o diálogo foi aberto (mesmo que só uma das imagens)
        return true;
      } catch (err) {
        console.warn(`[shareUtils] share single file ${file.name} falhou:`, err);
        // continua pro próximo
      }
    }
  }

  // 3) fallback: compartilhar só texto/url (garante abrir o share sheet)
  if (typeof navigator !== "undefined" && typeof (navigator as any).share === "function") {
    try {
      console.info("[shareUtils] tentando fallback: navigator.share(title/text/url)");
      await (navigator as any).share({
        title: title ?? "Compartilhar",
        text: text ?? title ?? "Evangelho",
        url,
      });
      console.info("[shareUtils] shared: texto/url fallback");
      return true;
    } catch (err) {
      console.warn("[shareUtils] fallback de texto/url falhou:", err);
    }
  }

  // nada funcionou
  console.warn("[shareUtils] nenhum método de share funcionou");
  return false;
}

/**
 * Util helpers
 */
export function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
