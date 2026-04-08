import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function run(command) {
  try {
    const output = execSync(command, { stdio: "pipe", encoding: "utf-8" });
    return { ok: true, output };
  } catch (error) {
    return {
      ok: false,
      output: error?.stdout?.toString?.() || error?.message || ""
    };
  }
}

const startedAt = Date.now();
const unit = run("npm run test:unit:coverage");
const e2e = run("npm run test:e2e:report");

let coverage = 0;
try {
  const summaryPath = resolve(process.cwd(), "coverage", "coverage-summary.json");
  const summary = JSON.parse(readFileSync(summaryPath, "utf-8"));
  coverage = Math.round(summary.total.lines.pct || 0);
} catch {
  coverage = 0;
}

let passed = 0;
let failed = 0;
let unitPassed = 0;
let unitFailed = 0;
let e2ePassed = 0;
let e2eFailed = 0;

if (unit.ok) {
  const unitPassMatches = unit.output.match(/\b(\d+)\s+passed\b/i);
  const unitFailMatches = unit.output.match(/\b(\d+)\s+failed\b/i);
  unitPassed = unitPassMatches ? Number(unitPassMatches[1]) : 1;
  unitFailed = unitFailMatches ? Number(unitFailMatches[1]) : 0;
  passed += unitPassed;
  failed += unitFailed;
} else {
  unitFailed += 1;
  failed += 1;
}

try {
  const start = e2e.output.indexOf("{");
  const end = e2e.output.lastIndexOf("}");
  const rawJson = start >= 0 && end > start ? e2e.output.slice(start, end + 1) : e2e.output;
  const e2eJson = JSON.parse(rawJson);
  const stats = e2eJson.stats || {};
  e2ePassed = Number(stats.expected || 0);
  e2eFailed = Number(stats.unexpected || 0);
  passed += e2ePassed;
  failed += e2eFailed;
} catch {
  if (e2e.ok) {
    e2ePassed = 1;
    passed += 1;
  } else {
    e2eFailed = 1;
    failed += 1;
  }
}

const report = {
  passed,
  failed,
  coverage,
  generatedAt: new Date().toISOString(),
  durationMs: Date.now() - startedAt,
  unitOk: unit.ok,
  e2eOk: e2e.ok,
  details: {
    unit: {
      command: "npm run test:unit:coverage",
      passed: unitPassed,
      failed: unitFailed,
      info: "Unit tests validate stores/components and generate coverage summary."
    },
    e2e: {
      command: "npm run test:e2e:report",
      passed: e2ePassed,
      failed: e2eFailed,
      info: "E2E verifies scenario: catalog -> add to cart -> checkout."
    },
    methodology: [
      "Run unit tests with coverage (Vitest).",
      "Run browser flow tests (Playwright).",
      "Merge results into one JSON report for educational view."
    ]
  }
};

const publicDir = resolve(process.cwd(), "public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(resolve(publicDir, "test-report.json"), JSON.stringify(report, null, 2), "utf-8");

console.log(`PASS ${report.passed} | FAIL ${report.failed} | Coverage: ${report.coverage}%`);
console.log("Report written to frontend/public/test-report.json");
