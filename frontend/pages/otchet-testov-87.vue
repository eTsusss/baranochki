<script setup lang="ts">
definePageMeta({ middleware: "auth" });

type Report = {
  passed: number;
  failed: number;
  coverage: number;
  generatedAt?: string;
  durationMs?: number;
  details?: {
    unit?: { command: string; passed: number; failed: number; info: string };
    e2e?: { command: string; passed: number; failed: number; info: string };
    methodology?: string[];
  };
};

const report = ref<Report>({ passed: 0, failed: 0, coverage: 0, generatedAt: "" });
const loading = ref(true);
const loadError = ref("");

onMounted(async () => {
  try {
    const data = await $fetch<Report>("/test-report.json");
    report.value = data || { passed: 0, failed: 0, coverage: 0 };
  } catch {
    loadError.value = "Сначала запустите npm run test:ui в frontend";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="container page">
    <section class="card">
      <h1>Служебный отчёт тестов</h1>
      <p v-if="loading">Загрузка...</p>
      <p v-else-if="loadError" class="err-text">{{ loadError }}</p>
      <template v-else>
        <div class="report-grid">
          <article class="report-item">
            <h3>Успешно</h3>
            <p>{{ report.passed }}</p>
          </article>
          <article class="report-item">
            <h3>Падения</h3>
            <p>{{ report.failed }}</p>
          </article>
          <article class="report-item">
            <h3>Покрытие</h3>
            <p>{{ report.coverage }}%</p>
          </article>
        </div>

        <div class="report-details mt-8">
          <h3>Что проверялось</h3>
          <ul>
            <li v-for="step in report.details?.methodology || []" :key="step">{{ step }}</li>
          </ul>

          <h3>Unit тесты</h3>
          <p><b>Команда:</b> {{ report.details?.unit?.command }}</p>
          <p><b>Результат:</b> {{ report.details?.unit?.passed }} passed / {{ report.details?.unit?.failed }} failed</p>
          <p>{{ report.details?.unit?.info }}</p>

          <h3>E2E тесты</h3>
          <p><b>Команда:</b> {{ report.details?.e2e?.command }}</p>
          <p><b>Результат:</b> {{ report.details?.e2e?.passed }} passed / {{ report.details?.e2e?.failed }} failed</p>
          <p>{{ report.details?.e2e?.info }}</p>
        </div>

        <p v-if="report.generatedAt">Сформирован: {{ report.generatedAt }}</p>
        <p v-if="report.durationMs">Длительность: {{ Math.round(report.durationMs / 1000) }} сек.</p>
      </template>
    </section>
  </main>
</template>
