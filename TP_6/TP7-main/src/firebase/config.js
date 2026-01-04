import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyD7wtFzTi30Jy-yzB7sgba29ZEGqtRtz8w",
  authDomain: "vote-app-cc475.firebaseapp.com",
  projectId: "vote-app-cc475",
  storageBucket: "vote-app-cc475.firebasestorage.app",
  messagingSenderId: "872299176790",
  appId: "1:872299176790:web:4da486cd84808955d32cf7"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }