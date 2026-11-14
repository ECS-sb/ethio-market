import type { CSSProperties } from "react";

/**
 * የቴሌግራም Desktop "Night" ቀለሞች፤ ለቴሌግራም ገጹ ብቻ (ባለቤቱ ጠይቀዋል፣ 2026-11-14)።
 * የዌብሳይቱን የቀለም ቁልፎች (--card, --primary…) በዚህ ክፍል ውስጥ ብቻ ይተካሉ፤ ሌላው ዌብሳይት ወርቃማ/ጥቁር ሆኖ ይቀራል።
 * Portal ውስጥ የሚከፈቱ መስኮቶች (ለምሳሌ የደንበኛ ዝርዝር) ይህንኑ style በራሳቸው መውሰድ አለባቸው።
 */
export const telegramTheme = {
  "--background": "#0e1621",
  "--foreground": "#f5f5f5",
  "--card": "#17212b",
  "--card-foreground": "#f5f5f5",
  "--popover": "#17212b",
  "--popover-foreground": "#f5f5f5",
  "--primary": "#5288c1",
  "--primary-hover": "#5f96d0",
  "--primary-foreground": "#ffffff",
  "--secondary": "#182533",
  "--secondary-foreground": "#f5f5f5",
  "--muted": "#242f3d",
  "--muted-foreground": "#708499",
  "--accent": "#202b36",
  "--accent-foreground": "#f5f5f5",
  "--border": "#0e1621",
  "--input": "#242f3d",
  "--ring": "#5288c1",
  // የቴሌግራም የራሳቸው፦ የሰራተኛ መልዕክት አረፋ፣ የተመረጠ ቻት፣ ሊንክ/ቁጥር፣ የቀን መለያ
  "--tg-bubble-out": "#2b5278",
  "--tg-row-active": "#2b5278",
  "--tg-link": "#6ab3f3",
  "--tg-service": "#1e2c3a",
} as CSSProperties;
