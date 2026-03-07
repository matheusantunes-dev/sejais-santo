export async function shareImages(dataUrls: string[]) {
  const files: File[] = [];

  for (let i = 0; i < dataUrls.length; i++) {
    const res = await fetch(dataUrls[i]);
    const blob = await res.blob();

    const file = new File([blob], `evangelho-${i + 1}.png`, {
      type: "image/png",
    });

    files.push(file);
  }

  if (navigator.share && navigator.canShare({ files })) {
    await navigator.share({
      files,
      title: "Evangelho do Dia",
      text: "Evangelho do dia",
    });
  } else {
    alert("Compartilhamento não suportado neste dispositivo.");
  }
}
