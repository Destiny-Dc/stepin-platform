// firestore.js
import { db } from './firebase.js';
import { collection, addDoc, getDocs } from "firebase/firestore";

// Add new announcement to Firestore
export const addAnnouncement = async (title, date) => {
  try {
    await addDoc(collection(db, "announcements"), {
      title,
      date,
    });
    alert("Announcement added!");
  } catch (error) {
    alert("Error adding announcement: " + error.message);
  }
};

// Get all announcements from Firestore
export const getAnnouncements = async () => {
  const querySnapshot = await getDocs(collection(db, "announcements"));
  const announcements = querySnapshot.docs.map(doc => doc.data());
  return announcements;
};
