// src/app/components/VerseOrganizerIcon.tsx
import React from "react";

/**
 * VerseOrganizerIcon
 * - Exportamos COMO named export E default export.
 * - Isso evita problemas quando outros arquivos usam `import { VerseOrganizerIcon }` ou `import VerseOrganizerIcon`.
 */
export const VerseOrganizerIcon = () => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      role="img"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
};

// Export default também para compatibilidade com imports sem chaves.
export default VerseOrganizerIcon;
