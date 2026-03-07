import { toPng } from "html-to-image";

export async function generateSlides(nodes: HTMLDivElement[]) {
  const images: string[] = [];

  for (const node of nodes) {
    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      cacheBust: true,
    });

    images.push(dataUrl);
  }

  return images;
}
