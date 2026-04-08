<script setup lang="ts">
const auth = useAuthStore();
const route = useRoute();
const scrollProgress = ref(0);
let observer: IntersectionObserver | null = null;

function updateProgress() {
  if (!process.client) return;
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop;
  const scrollHeight = doc.scrollHeight - window.innerHeight;
  scrollProgress.value = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0;
}

function setupRevealObserver() {
  if (!process.client) return;
  if (observer) observer.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.14 }
  );
  document.querySelectorAll("[data-reveal]").forEach((node) => observer?.observe(node));
}

onMounted(() => {
  auth.load();
  updateProgress();
  setupRevealObserver();
  window.addEventListener("scroll", updateProgress, { passive: true });
});

watch(
  () => route.fullPath,
  async () => {
    await nextTick();
    setupRevealObserver();
    updateProgress();
  }
);

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateProgress);
  if (observer) observer.disconnect();
});
</script>

<template>
  <div class="app-shell">
    <div class="scroll-progress" :style="{ width: `${scrollProgress}%` }" />
    <AppHeader />
    <main class="app-main">
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>
