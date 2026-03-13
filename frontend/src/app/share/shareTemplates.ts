/* Import do evanvelho */
import biblePaperImage1 from "@/assets/templates/biblePaperImage1.jpeg";
import biblePaperImage2 from "@/assets/templates/biblePaperImage2.jpg";
import biblePaperImage3 from "@/assets/templates/biblePaperImage3.jpg";
import biblePaperImage4 from "@/assets/templates/biblePaperImage4.jpg";
import biblePaperImage5 from "@/assets/templates/biblePaperImage5.avif";

/* Import do Versículo */
import verseBackgroundImage from "@/assets/versiculobg.jpg";
import Campos from "@/assets/templates/campos.avif";
import Paisagem from "@/assets/templates/paisagem.avif";
import PorDoSol from "@/assets/templates/por do sol.avif";
import Montanhas from "@/assets/templates/montanhas.avif";



export interface ShareTemplate {
  id: string;
  name: string;
  src: string;
}

export const gospelShareTemplates: ShareTemplate[] = [
  { id: "gospel-template-1", name: "Bíblico Normal", src: biblePaperImage1 },
  { id: "gospel-template-2", name: "Bíblico Escuro", src: biblePaperImage2 },
  { id: "gospel-template-3", name: "Bíblico Fosco", src: biblePaperImage3 },
  { id: "gospel-template-4", name: "Bíblico Claro", src: biblePaperImage4 },
  { id: "gospel-template-5", name: "Bíblico Original", src: biblePaperImage5 },
];

export const verseShareTemplates: ShareTemplate[] = [
  { id: "verse-template-1", name: "Biblia Aberta", src: verseBackgroundImage },
  { id: "verse-template-2", name: "Campos", src: Campos },
  { id: "verse-template-3", name: "Paisagem", src: Paisagem },
  { id: "verse-template-4", name: "Pôr do Sol", src: PorDoSol },
  { id: "verse-template-5", name: "Montanhas", src: Montanhas },
];
