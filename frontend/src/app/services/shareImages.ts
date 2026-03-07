export async function shareImages(dataUrls: string[]) {
  try {
    const files: File[] = [];

    // Converte cada dataURL (base64) em File real
    for (let i = 0; i < dataUrls.length; i++) {
      const response = await fetch(dataUrls[i]);
      const blob = await response.blob();

      const file = new File(
        [blob],
        `evangelho-${i + 1}.png`,
        { type: "image/png" }
      );

      files.push(file);
    }

    // Verifica se o navegador suporta compartilhamento de múltiplos arquivos
    if (navigator.canShare && navigator.canShare({ files })) {
      await navigator.share({
        files,
        title: "Evangelho do Dia",
        text: "Evangelho do dia",
      });
    } else {
      alert("Seu dispositivo não suporta compartilhamento de múltiplas imagens.");
    }

  } catch (error) {
    console.error("Erro ao compartilhar imagens:", error);
    alert("Erro ao compartilhar o evangelho.");
  }
}
