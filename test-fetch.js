import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const creds = await signInWithEmailAndPassword(auth, 'babajide.babalola@yahoo.com', 'Babalola32$');
    const userRef = doc(db, 'users', creds.user.uid);
    const snap = await getDoc(userRef);
    console.log("Exists:", snap.exists());
    if (snap.exists()) {
        console.log("Data:", snap.data());
    }
  } catch(e) {
    console.error("Test failed:", e.message);
  }
}
run().then(() => process.exit(0));
