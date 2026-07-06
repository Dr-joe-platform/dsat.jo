const admin = require('firebase-admin');
const fs = require('fs');

if (!fs.existsSync('e:/dsatuz/service-account.json')) {
  console.log("No service account found, using client SDK approach if possible or checking the current Next.js env.");
  process.exit(1);
}

const serviceAccount = require('e:/dsatuz/service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function main() {
  const snapshot = await db.collection('test_results')
    .orderBy('date', 'desc')
    .limit(5)
    .get();

  const results = [];
  snapshot.forEach(doc => {
    results.push({ id: doc.id, ...doc.data() });
  });

  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
