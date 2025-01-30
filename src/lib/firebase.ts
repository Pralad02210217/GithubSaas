// Import the functions you need from the SDKs you need
import { error } from "console";
import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMPJhPmz44AgDiYOw4temWD1mpUnW6jwE",
  authDomain: "githubsaas-f7b1e.firebaseapp.com",
  projectId: "githubsaas-f7b1e",
  storageBucket: "githubsaas-f7b1e.firebasestorage.app",
  messagingSenderId: "941301468658",
  appId: "1:941301468658:web:952f08243130d59b132f6b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)

export async function uploadFile(file: File, setProgress?: (progress : number) => void){
    return new Promise((resolve, reject) =>{
        try {
            const storageRef = ref(storage, file.name)
            const uploadTask = uploadBytesResumable(storageRef, file)
            uploadTask.on('state_changed', snapshot => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                if(setProgress) setProgress(progress)
                switch(snapshot.state){
                    case 'paused':
                        console.log('upload is paused'); break;
                    case 'running':
                        console.log('upload is running'); break;
            }
            }, error =>{
                reject(error)   
            }, () =>{
                getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl =>{
                    resolve(downloadUrl)
                })
            })
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}