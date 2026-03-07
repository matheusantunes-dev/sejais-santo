export function splitGospelText(text: string, maxChars = 700) {
  const words = text.split(" ");
  const slides: string[] = [];

  let current = "";

  for (const word of words) {
    if ((current + word).length > maxChars) {
      slides.push(current.trim());
      current = word + " ";
    } else {
      current += word + " ";
    }
  }

  if (current.trim()) {
    slides.push(current.trim());
  }

  return slides;
}
