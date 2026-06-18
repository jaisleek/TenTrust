import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const creds = await signInWithEmailAndPassword(auth, 'babajide.babalola@yahoo.com', 'Babalola32$');
    const userRef = doc(db, 'users', creds.user.uid);
    const newUser = {
        email: creds.user.email || '',
        firstName: 'Babajide',
        lastName: 'Babalola',
        role: 'landlord',
        verified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    
    await setDoc(userRef, newUser);
    console.log("SUCCESS");
  } catch(e) {
    console.error("Test failed:", e.message);
  }
}
run().then(() => process.exit(0));
