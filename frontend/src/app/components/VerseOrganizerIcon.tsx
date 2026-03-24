// src/app/components/VerseOrganizerIcon.tsx
import React from "react";

/**
 * VerseOrganizerIcon
 * - Exportamos COMO named export E default export.
 * - Isso evita problemas quando outros arquivos usam `import { VerseOrganizerIcon }` ou `import VerseOrganizerIcon`.
 */
export const VerseOrganizerIcon = () => {
  return (
    <span className="verse-organizer-text">
      Organize seus Versículos favoritos!
    </span>
  );
};

// Export default também para compatibilidade com imports sem chaves.
export default VerseOrganizerIcon;
