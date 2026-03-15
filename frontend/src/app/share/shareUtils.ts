// src/utils/shareUtils.ts
// Utilitários para compartilhar arquivos com Web Share API
// Quando não for possível compartilhar arquivos, NÃO executamos o download automático.
// Em vez disso retornamos URLs (object URLs) para a camada de UI exibir como fallback.

export type ShareResult = {
  didShare: boolean;           // true se o navegador abriu o diálogo de compartilhamento
  fallbackUrls?: string[];     // array de object URLs (usar pela UI). Caller deve revogar quando não precisar.
};

type ShareFilesOrDownloadArgs = {
  files: File[];
  title?: string;
  text?: string;
  url?: string;
};

/**
 * Cria object URLs para os arquivos informados.
 * Retorna o array de URLs e fornece função para revogá-las (caller responsável por chamar).
 */
function createObjectURLs(files: File[]): { urls: string[]; revokeAll: () => void } {
  const urls = files.map((f) => URL.createObjectURL(f));
  const revokeAll = () => urls.forEach((u) => URL.revokeObjectURL(u));
  return { urls, revokeAll };
}

/**
 * Tenta compartilhar arquivos via Web Share API.
 * Ordem de tentativa:
 *  1) Se navigator.canShare({ files }) => navigator.share({ files, ... })
 *  2) Se navigator.share existe => navigator.share({ title, text, url })  // sem arquivos
 *  3) Fallback: retorna object URLs para a UI exibir links (NUNCA força download aqui)
 *
 * Retorna ShareResult:
 *  - didShare: true se algum navigator.share foi bem-sucedido (ou ao menos aberto)
 *  - fallbackUrls: se não foi possível compartilhar, array de object URLs (a UI deve mostrar e revogar quando limpar)
 */
export async function shareFilesOrDownload({
  files,
  title,
  text,
  url,
}: ShareFilesOrDownloadArgs): Promise<ShareResult> {
  // Segurança: se não houver arquivos, nada faz
  if (!files || files.length === 0) {
    return { didShare: false };
  }

  const hasNavigator = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const canShareFn = typeof navigator !== "undefined" ? (navigator as any).canShare : undefined;

  // 1) tentar compartilhar arquivos (se suportado)
  try {
    const canShareFiles =
      hasNavigator &&
      typeof canShareFn === "function" &&
      // navigator.canShare pode lançar em alguns browsers. Envelopamos.
      (() => {
        try {
          return (navigator as any).canShare({ files });
        } catch (err) {
          // se canShare falhar, não consideramos suportado
          console.warn("navigator.canShare threw", err);
          return false;
        }
      })();

    if (canShareFiles) {
      try {
        // Tenta abrir a folha de compartilhamento com os arquivos
        await navigator.share({ files, title, text, url });
        console.log("[shareUtils] shared files via navigator.share");
        return { didShare: true };
      } catch (err) {
        // Pode ocorrer AbortError se usuário cancelar, ou outra exceção.
        console.warn("[shareUtils] navigator.share(files) failed:", err);
        // Continuamos para tentar share sem arquivos antes de fallback
      }
    }
  } catch (err) {
    // Protege contra browsers estranhos
    console.warn("[shareUtils] error while checking canShare:", err);
  }

  // 2) tentar compartilhar apenas texto/url (sem arquivos) — evita o download automático em muitos WebViews
  if (hasNavigator) {
    try {
      // Se o usuário não passou texto, usamos o título como texto.
      await navigator.share({ title, text: text ?? title, url });
      console.log("[shareUtils] shared title/text via navigator.share");
      return { didShare: true };
    } catch (err) {
      console.warn("[shareUtils] navigator.share(text) failed:", err);
      // segue para fallback
    }
  }

  // 3) fallback: gerar object URLs e devolver para a UI mostrar (NÃO ACIONAMOS DOWNLOAD AUTOMÁTICO)
  const { urls } = createObjectURLs(files);

  // Log para debug
  console.info("[shareUtils] falling back to object URLs (no automatic download)", urls);

  return { didShare: false, fallbackUrls: urls };
}
