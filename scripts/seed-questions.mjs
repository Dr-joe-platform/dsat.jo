#!/usr/bin/env node
/**
 * Seed script — uploads all questions from Dr.Joe's questions.js
 * into Firestore under the `tests` collection.
 *
 * Run: node scripts/seed-questions.mjs
 *
 * Requires: npm install firebase-admin
 * Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON.
 */

import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ── Init Admin SDK ──────────────────────────────────────────────────────────
// Uses Application Default Credentials or GOOGLE_APPLICATION_CREDENTIALS
initializeApp({
  credential: cert(JSON.parse(readFileSync('./service-account.json', 'utf8'))),
  projectId: 'dr-joe-for-sat',
});

const db = getFirestore();

// ── Load questions.js data ──────────────────────────────────────────────────
// We eval the legacy file in a sandboxed way
const src = readFileSync('D:/maaaain/Dr.Joe-main/js/data/questions.js', 'utf8');

// The file assigns to window.ALL_TEST_QUESTIONS, so mock window
const mockWindow = {};
const wrappedSrc = src
  .replace(/const M\d+[A-Z_]*_DATA_T\d+ = {/g, 'const $& ') // keep const definitions
  .replace(/window\.ALL_TEST_QUESTIONS/g, 'mockWindow.ALL_TEST_QUESTIONS');

// Execute in a vm context
import { createContext, runInContext } from 'vm';
const ctx = createContext({ mockWindow });
runInContext(wrappedSrc, ctx);

const ALL_TESTS = ctx.mockWindow.ALL_TEST_QUESTIONS;

if (!ALL_TESTS) {
  console.error('❌ Could not parse questions.js');
  process.exit(1);
}

// ── Upload to Firestore ─────────────────────────────────────────────────────
async function seed() {
  const testIds = Object.keys(ALL_TESTS);
  console.log(`📦 Found ${testIds.length} tests: ${testIds.join(', ')}`);

  for (const testId of testIds) {
    const test = ALL_TESTS[testId];
    console.log(`\n⬆️  Uploading ${testId} — "${test.name}"...`);

    // Write test metadata
    await db.collection('tests').doc(testId).set({
      name: test.name,
      testId,
      isPublic: true,
      subject: 'math',
      source: 'dr-joe-import',
      createdBy: 'system',
      createdAt: new Date(),
      modules: {
        M1: (test.M1 || []).length,
        M2H: (test.M2H || []).length,
        M2E: (test.M2E || []).length,
      },
      questionCount: (test.M1 || []).length + (test.M2H || []).length + (test.M2E || []).length,
    });

    // Write each module's questions as subcollection
    for (const [moduleName, questions] of Object.entries(test)) {
      if (moduleName === 'name') continue;
      if (!Array.isArray(questions)) continue;

      const batch = db.batch();
      for (const q of questions) {
        const ref = db.collection('tests').doc(testId)
          .collection('questions').doc(q.id);
        batch.set(ref, {
          ...q,
          module: moduleName,
          testId,
        });
      }
      await batch.commit();
      console.log(`  ✓ ${moduleName}: ${questions.length} questions`);
    }

    console.log(`✅ ${testId} uploaded!`);
  }

  console.log('\n🎉 All tests seeded to Firestore!');
}

seed().catch(err => {
  console.error('❌ Seeder failed:', err);
  process.exit(1);
});
