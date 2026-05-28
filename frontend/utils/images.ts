export function productFallbackImage(category: string, id?: number) {
  const label =
    category === "candies"
      ? "Конфеты"
      : category === "baranochki"
        ? "Бараночки"
        : category === "cupcakes"
          ? "Капкейки"
          : "Десерты";
  const seed = id || 0;
  const hue = (seed * 29) % 360;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${hue},75%,92%)"/>
          <stop offset="100%" stop-color="hsl(${(hue + 28) % 360},70%,78%)"/>
        </linearGradient>
      </defs>
      <rect width="900" height="700" fill="url(#g)"/>
      <circle cx="220" cy="270" r="110" fill="rgba(255,255,255,0.35)"/>
      <circle cx="460" cy="360" r="130" fill="rgba(255,255,255,0.2)"/>
      <circle cx="670" cy="250" r="95" fill="rgba(255,255,255,0.25)"/>
      <text x="60" y="620" font-family="Inter, Arial" font-size="62" fill="#3e2723">${label}</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function isValidImageUrl(url: string) {
  if (!url) return false;
  if (url === "u") return false;
  if (url.includes("via.placeholder.com")) return false;
  if (url.startsWith("data:image/")) return true;
  if (url.startsWith("https://") || url.startsWith("http://")) return true;
  if (url.startsWith("/")) return true;
  if (url.startsWith("./") || url.startsWith("../")) return true;
  return false;
}
