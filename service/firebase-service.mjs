import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import { doc, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

class FireBaseService {

    db = null;
    app = null;

    constructor(){
      // firebase config
      const firebaseConfig = {
        apiKey: "AIzaSyB75qyoyrANvqqou08X95W2yK56rp891xw",
        authDomain: "scrapyst-6c6f7.firebaseapp.com",
        projectId: "scrapyst-6c6f7",
        storageBucket: "scrapyst-6c6f7.appspot.com",
        messagingSenderId: "554006686592",
        appId: "1:554006686592:web:27717136a98ec5eb0d6f65"
      };

      // firebase init
      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
    }

    getApp(){
      return this.app;
    }

    getDB(){
      return this.db;
    }

    async getUsers(){
        const userQueryShot = await getDocs(collection(this.db,"users"));
        const usersList = [];
        userQueryShot.forEach((doc)=>{
          usersList.push(doc.data().email_id);
        });
        return usersList;
    }

}

const fireBaseService = new FireBaseService();

export default fireBaseService;
