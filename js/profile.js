import { auth, db, storage } from './firebase.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  doc,
  getDoc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

const userNameElem = document.querySelector('.user-name');
const userRoleElem = document.querySelector('.user-role');

const profileImage = document.querySelector('.profile-image');
const uploadBtn = document.querySelector('.upload-btn');

const profileFields = {
  email: document.querySelector('.value-email'),
  phone: document.querySelector('.value-phone'),
  programme: document.querySelector('.value-programme'),
  department: document.querySelector('.value-department'),
  level: document.querySelector('.value-level'),
  birthday: document.querySelector('.value-birthday'),
  gender: document.querySelector('.value-gender'),
  bio: document.querySelector('.value-bio')
};

const actionsDiv = document.querySelector('.actions');
const editBtn = actionsDiv.querySelector('button:first-child');
let cancelBtn = null;

let editing = false;
let userDocRef;
let currentUserData = null;

function createCancelButton() {
  const btn = document.createElement('button');
  btn.textContent = 'Cancel';
  btn.className = 'cancel-btn';
  btn.style.marginLeft = '10px';
  return btn;
}

// Enable editing mode with inputs and date picker for birthday
function enableEditing() {
  editing = true;
  editBtn.textContent = "Save Profile";

  // Add Cancel button if not exist
  if (!cancelBtn) {
    cancelBtn = createCancelButton();
    actionsDiv.insertBefore(cancelBtn, editBtn.nextSibling);
    cancelBtn.addEventListener('click', cancelEdits);
  }

  for (const key in profileFields) {
    const span = profileFields[key];
    const input = document.createElement('input');
    input.type = key === 'birthday' ? 'date' : 'text'; // Date picker for birthday
    input.value = (span.textContent === '...' || span.textContent === 'Fetching role...') ? '' : span.textContent;
    input.className = 'edit-input';
    input.dataset.field = key;

    span.replaceWith(input);
    profileFields[key] = input;
  }
}

// Cancel editing, revert to original data without saving
function cancelEdits() {
  editing = false;
  editBtn.textContent = "Edit Profile";

  // Remove cancel button
  if (cancelBtn) {
    cancelBtn.remove();
    cancelBtn = null;
  }

  // Revert inputs back to spans with original values
  for (const key in profileFields) {
    const input = profileFields[key];
    const span = document.createElement('span');
    span.className = `value value-${key}`;
    span.textContent = currentUserData[key] || 'Not provided';
    input.replaceWith(span);
    profileFields[key] = span;
  }
}

// Save updated profile data
async function saveEdits() {
  Swal.fire({
    title: 'Saving profile...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });
  editing = false;
  editBtn.textContent = "Edit Profile";

  if (cancelBtn) {
    cancelBtn.remove();
    cancelBtn = null;
  }

  let updatedData = {};
  for (const key in profileFields) {
    const input = profileFields[key];
    updatedData[key] = input.value.trim();
  }

  try {
    await updateDoc(userDocRef, updatedData);
    Swal.close();

    // Update local currentUserData so cancel can work next time
    Object.assign(currentUserData, updatedData);

    // Replace inputs back with spans showing updated data
    for (const key in profileFields) {
      const input = profileFields[key];
      const span = document.createElement('span');
      span.className = `value value-${key}`;
      span.textContent = updatedData[key] || '...';
      input.replaceWith(span);
      profileFields[key] = span;
    }

    Swal.fire({
      icon: 'success',
      title: 'Profile Updated',
      timer: 1500,
      showConfirmButton: false
    });
  } catch (error) {
    console.error("Update failed:", error);
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: error.message
    });
  }
}

// Upload profile picture function
async function uploadProfilePicture(file, uid) {
  try {
    // Show loading popup
    Swal.fire({
      title: 'Uploading profile picture...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    console.log("Uploading to Firebase Storage...");

    const storageRef = ref(storage, `profile_pictures/${uid}`);
    await uploadBytes(storageRef, file);
    console.log("Upload successful!");

    const downloadURL = await getDownloadURL(storageRef);
    console.log("Got download URL:", downloadURL);

    const userDocRef = doc(db, 'users', uid); // Ensure this is scoped correctly
    await updateDoc(userDocRef, { photoURL: downloadURL });
    console.log("Firestore updated with photoURL");

    // Update UI
    profileImage.src = downloadURL;
    currentUserData.photoURL = downloadURL;

    Swal.close(); // 💥 Close the loader
    console.log("Closed loading popup");

    Swal.fire({
      icon: 'success',
      title: 'Profile picture updated!',
      timer: 1500,
      showConfirmButton: false
    });

  } catch (error) {
    console.error("Upload failed:", error);
    Swal.close(); // 💥 Make sure this runs even on failure
    Swal.fire({
      icon: 'error',
      title: 'Upload Failed',
      text: error.message || "Something went wrong!"
    });
  }
}

// Load user data from Firestore
async function loadUserProfile(uid) {
  Swal.fire({
    title: 'Loading profile...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  userDocRef = doc(db, 'users', uid);

  const userSnap = await getDoc(userDocRef);
  Swal.close();

  if (userSnap.exists()) {
    currentUserData = userSnap.data();
    userNameElem.textContent = `${currentUserData.firstName} ${currentUserData.lastName}`;
    userRoleElem.textContent = currentUserData.role || 'N/A';

    for (const key in profileFields) {
      profileFields[key].textContent = currentUserData[key] || '...';
    }

    if (currentUserData.photoURL) {
      profileImage.src = currentUserData.photoURL;
    }
  } else {
    Swal.fire('Error', 'User data not found.', 'warning');
    userNameElem.textContent = "User data not found.";
  }
}

// Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadUserProfile(user.uid);

    // Upload picture event
    uploadBtn.addEventListener('click', () => {
      if (!editing) {
        Swal.fire({
          icon: 'info',
          title: 'Edit mode required',
          text: 'Please click "Edit Profile" before changing your picture.',
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }
    
      // Create hidden file input dynamically
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
    
      fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (file) {
          Swal.fire({
            title: 'Uploading...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
          });
    
          uploadProfilePicture(file, auth.currentUser.uid).then(() => {
            Swal.close(); // Close loading alert after success
          });
        }
      };
    
      fileInput.click();
    });
    

  } else {
    window.location.href = "/html/welcome.html";
  }
});

// Edit button handler
editBtn.addEventListener('click', async () => {
  if (!editing) {
    enableEditing();
  } else {
    await saveEdits();
  }
});


if (!userNameElem || !userRoleElem || !profileImage || !uploadBtn) {
  console.error("One or more required DOM elements are missing");
}
console.log("Profile fields found:", profileFields);
console.log("User data:", currentUserData);