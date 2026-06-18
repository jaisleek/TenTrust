import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);

async function run() {
  try {
    const creds = await createUserWithEmailAndPassword(auth, 'babajide.babalola@yahoo.com', 'Babalola32$');
    console.log("Logged in:", creds.user.uid);
  } catch(e) {
    console.error("Login failed:", e.message);
  }
}
run().then(() => process.exit(0));
