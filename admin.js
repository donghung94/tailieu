import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
  getFirestore, collection, getDocs 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyALblbqW_VrZh2r7sPJ8Q6XT2fGbk0dsFg",
  authDomain: "donghung-3208d.firebaseapp.com",
  projectId: "donghung-3208d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const list = document.getElementById("userList");

// 🔴 BẮT BUỘC: chờ auth xong
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    list.innerHTML = "❌ Chưa đăng nhập. Vui lòng đăng nhập trước.";
    return;
  }

  try {
    const snap = await getDocs(collection(db, "users"));
    let users = [];

    snap.forEach(doc => {
      const data = doc.data();
      users.push({
        email: data.email || "(no email)",
        count: data.devices ? data.devices.length : 0
      });
    });

    // sắp xếp từ nhiều → ít
    users.sort((a, b) => b.count - a.count);

    list.innerHTML = "";
    users.forEach(u => {
      list.innerHTML += `
        <div style="border:1px solid #ccc;padding:8px;margin:6px">
          <b>${u.email}</b><br>
          📱 Thiết bị: <b>${u.count}</b>
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
    list.innerHTML = "🚨 Lỗi đọc dữ liệu Firestore";
  }
});
