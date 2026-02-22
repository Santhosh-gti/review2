import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* ---------------- SIGNUP (EMAIL + PASSWORD) ---------------- */

export async function signUpUser(email, password, username) {

  // Check if username already exists
  const q = query(
    collection(db, "users"),
    where("username", "==", username)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    throw new Error("Username already exists");
  }

  // Create Firebase auth user
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  // Save user data
  await setDoc(doc(db, "users", user.uid), {
    username,
    email,
    provider: "password",
    created_at: serverTimestamp()
  });

  return user;
}



/* ---------------- LOGIN (EMAIL + PASSWORD) ---------------- */

export async function loginUser(identifier, password) {

  let emailToUse = identifier;

  // If user typed username instead of email
  if (!identifier.includes("@")) {
    const q = query(
      collection(db, "users"),
      where("username", "==", identifier)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error("Username not found");
    }

    emailToUse = snapshot.docs[0].data().email;
  }

  return await signInWithEmailAndPassword(auth, emailToUse, password);
}

/* ---------------- RESET PASSWORD ---------------- */

export async function resetPassword(email) {
  if (!email) throw new Error("Enter your email");

  await sendPasswordResetEmail(auth, email);
}

/* ---------------- AUTH STATE LISTENER ---------------- */

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docSnap = await getDoc(doc(db, "users", user.uid));

    if (docSnap.exists()) {
      const userData = docSnap.data();

      sessionStorage.setItem("currentUserName", userData.name);
      sessionStorage.setItem("currentUsername", userData.username);
    }

    location.hash = "#home";
  } else {
    sessionStorage.clear();
    location.hash = "#login";
  }
});


/* ---------------- LOGOUT ---------------- */

export async function logoutUser() {
  await signOut(auth);
}
