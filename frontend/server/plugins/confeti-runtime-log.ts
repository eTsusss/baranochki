/**
 * Одна строка в логах при старте Nitro — быстро видно, видит ли процесс env с Render.
 */
export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV !== "production") return;
  const a = String(process.env.NUXT_PUBLIC_API_BASE || "").trim();
  const b = String(process.env.NUXT_API_UPSTREAM || "").trim();
  console.info(
    `[confeti] API env: NUXT_PUBLIC_API_BASE len=${a.length}, NUXT_API_UPSTREAM len=${b.length} (0+0 → прокси на localhost)`
  );
});
