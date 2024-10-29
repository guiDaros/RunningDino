// Importa o Firebase e Firestore
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCxPk_ukQTi8Fc6E2oR3VT64RlSWcTo4f0",
  authDomain: "dinorun-asbr.firebaseapp.com",
  projectId: "dinorun-asbr",
  storageBucket: "dinorun-asbr.appspot.com",
  messagingSenderId: "361989507064",
  appId: "1:361989507064:web:6ca48c070f22e94d5f780d",
  measurementId: "G-HGPL42DGNW" // Opcional, pode deixar ou remover
};

// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
