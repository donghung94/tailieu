import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, signOut 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
  getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyALblbqW_VrZh2r7sPJ8Q6XT2fGbk0dsFg",
  authDomain: "donghung-3208d.firebaseapp.com",
  projectId: "donghung-3208d",
  storageBucket: "donghung-3208d.firebasestorage.app",
  messagingSenderId: "753379492663",
  appId: "1:753379492663:web:baff34f2c0bac00e02d0b2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 👉 tạo ID thiết bị (đơn giản, đủ dùng)
function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = navigator.userAgent + "_" + Math.random().toString(36).slice(2);
    localStorage.setItem("device_id", id);
  }
  return id;
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  const deviceId = getDeviceId();
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      devices: [deviceId],
      lastLogin: Date.now()
    });
  } else {
    await updateDoc(ref, {
      devices: arrayUnion(deviceId),
      lastLogin: Date.now()
    });
  }

  location.href = "index.html";
}

export async function logout() {
  await signOut(auth);
  location.href = "login.html";
}
