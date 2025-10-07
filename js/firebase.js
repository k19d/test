// Firebase initialization (your provided config)
const firebaseConfig = {
  apiKey: "AIzaSyDlix7qhcXumRLOd9Z0-hoKQCzX90RCFiQ",
  authDomain: "store-gh0st.firebaseapp.com",
  projectId: "store-gh0st",
  storageBucket: "store-gh0st.firebasestorage.app",
  messagingSenderId: "617542014023",
  appId: "1:617542014023:web:fadb67939faa10362f8d62",
  measurementId: "G-BGNGCF2FV1"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Ensure user document exists with isAdmin=false by default
async function ensureUserDoc(user) {
  if (!user) return null;
  const ref = db.collection('users').doc(user.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      isAdmin: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }
  return ref.get();
}

function onAuth(cb) { return auth.onAuthStateChanged(cb); }

async function signInWithGooglePopup() {
  const provider = new firebase.auth.GoogleAuthProvider();
  const res = await auth.signInWithPopup(provider);
  await ensureUserDoc(res.user);
  return res.user;
}

async function signUpWithEmail(email, password) {
  const res = await auth.createUserWithEmailAndPassword(email, password);
  try { await res.user.sendEmailVerification(); } catch (_) {}
  await ensureUserDoc(res.user);
  return res.user;
}

async function signInWithEmail(email, password) {
  const res = await auth.signInWithEmailAndPassword(email, password);
  await ensureUserDoc(res.user);
  return res.user;
}

function resetPassword(email) { return auth.sendPasswordResetEmail(email); }
function signOut() { return auth.signOut(); }

// Products
function productsQueryByCategory(category) {
  return db.collection('products').where('category', '==', category).orderBy('createdAt', 'desc');
}

// Orders
async function createOrder({ userId, product, method, senderNumber, contactNumber, amount }) {
  const ref = db.collection('orders').doc();
  await ref.set({
    userId,
    productName: product.name,
    productPrice: product.price,
    productCategory: product.category,
    method,
    senderNumber,
    contactNumber,
    amount: Number(amount),
    status: 'pending',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return ref.id;
}

// Admin helpers
async function requireAdmin(user) {
  if (!user) throw new Error('not-authenticated');
  const snap = await db.collection('users').doc(user.uid).get();
  const data = snap.data();
  if (!data || data.isAdmin !== true) throw new Error('not-authorized');
  return true;
}

async function addProduct({ name, price, imageUrl, category }) {
  await db.collection('products').add({
    name,
    price: Number(price),
    imageUrl,
    category, // 'android' | 'pc' | 'ios'
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

window._fb = { auth, db, onAuth, signInWithGooglePopup, signUpWithEmail, signInWithEmail, resetPassword, signOut, productsQueryByCategory, createOrder, requireAdmin, addProduct };