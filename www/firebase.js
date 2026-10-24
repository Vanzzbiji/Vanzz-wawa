// Isi apiKey, messagingSenderId, appId dari Project settings > Your apps > Web app
import{initializeApp}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import{getDatabase}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
const firebaseConfig={apiKey:"AIzaSyDPYPmCd2XFbXtoLuprBQz_5jiF-tMHyJo",authDomain:"chat-shop-f08fe.firebaseapp.com",databaseURL:"https://chat-shop-f08fe-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"chat-shop-f08fe",storageBucket:"chat-shop-f08fe.firebasestorage.app",messagingSenderId:"109605074987",appId:"1:109605074987:web:1ac9857ad646ab83f6d26e"};
const app=initializeApp(firebaseConfig);
export const auth=getAuth(app),db=getDatabase(app);
export const OWNER="vanzzid15@gmail.com"; // email owner (pemilik Panel Owner)
