import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const creds = await createUserWithEmailAndPassword(auth, 'babajide.test2@yahoo.com', 'Babalola32$');
    console.log("Logged in:", creds.user.uid);
    
    const userRef = doc(db, 'users', creds.user.uid);
    const newUser = {
        email: creds.user.email || '',
        firstName: 'Babajide2',
        lastName: 'Babalola2',
        role: 'landlord',
        verified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    
    await setDoc(userRef, newUser);
    console.log("Write successful!");
    
  } catch(e) {
    console.error("Test failed:", e.message);
  }
}
run().then(() => process.exit(0));
