import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { app } from "./firebase-config.js"; // Adjust if needed

const auth = getAuth(app);
const db = getFirestore(app);

export function checkAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;
      callback(user, userData);
    } else {
      callback(null, null);
    }
  });
}
