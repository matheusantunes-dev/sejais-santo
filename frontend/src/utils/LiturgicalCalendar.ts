export type LiturgicalSeason = "Advento" | "Tempo do Natal" | "Quaresma" | "Tempo Pascal" | "Tempo Comum";

export function getLiturgicalSeason(date: Date): LiturgicalSeason {
  const year = date.getFullYear();

  // 🔒 Criar datas sempre ao meio-dia (evita bug de timezone)
  function createDate(y: number, m: number, d: number): Date {
    return new Date(y, m, d, 12);
  }

  const today = createDate(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  // 📅 Cálculo da Páscoa (Computus - válido para calendário gregoriano)
  function calculateEaster(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return createDate(year, month - 1, day);
  }

  const easter = calculateEaster(year);

  // ✝️ Quaresma começa 46 dias antes da Páscoa (Quarta-feira de Cinzas)
  const lentStart = new Date(easter);
  lentStart.setDate(lentStart.getDate() - 46);

  // 🔥 Pentecostes (49 dias após Páscoa)
  const pentecost = new Date(easter);
  pentecost.setDate(pentecost.getDate() + 49);

  // 🎄 Natal (25 de dezembro)
  const christmas = createDate(year, 11, 25);

  // 🌿 Advento (4 semanas antes do Natal)
  const adventStart = new Date(christmas);
  adventStart.setDate(adventStart.getDate() - 28);

  // 🕊️ Ordem correta de verificação

  // Advento
  if (today >= adventStart && today < christmas) {
    return "Advento";
  }

  // Tempo do Natal (simplificado: 25/12 até antes da Quaresma)
  if (today >= christmas && today < lentStart) {
    return "Tempo do Natal";
  }

  // Quaresma
  if (today >= lentStart && today < easter) {
    return "Quaresma";
  }

  // Tempo Pascal
  if (today >= easter && today <= pentecost) {
    return "Tempo Pascal";
  }

  // Tempo Comum (restante do ano)
  return "Tempo Comum";
}
