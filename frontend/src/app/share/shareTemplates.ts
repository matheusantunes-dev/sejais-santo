import adventoImage from "@/assets/advento.png";
import biblePaperImage from "@/assets/bible-paper.jpeg";
import pascalImage from "@/assets/pascal.png";
import quaresmaImage from "@/assets/quaresma.png";
import tempoComumImage from "@/assets/tempo comum.png";
import verseBackgroundImage from "@/assets/versiculobg.jpg";

export interface ShareTemplate {
  id: string;
  name: string;
  src: string;
}

export const gospelShareTemplates: ShareTemplate[] = [
  { id: "gospel-template-1", name: "Papel Biblico", src: biblePaperImage },
  { id: "gospel-template-2", name: "Advento", src: adventoImage },
  { id: "gospel-template-3", name: "Pascal", src: pascalImage },
  { id: "gospel-template-4", name: "Quaresma", src: quaresmaImage },
  { id: "gospel-template-5", name: "Tempo Comum", src: tempoComumImage },
];

export const verseShareTemplates: ShareTemplate[] = [
  { id: "verse-template-1", name: "Biblia Aberta", src: verseBackgroundImage },
  { id: "verse-template-2", name: "Advento", src: adventoImage },
  { id: "verse-template-3", name: "Pascal", src: pascalImage },
  { id: "verse-template-4", name: "Quaresma", src: quaresmaImage },
  { id: "verse-template-5", name: "Tempo Comum", src: tempoComumImage },
];
