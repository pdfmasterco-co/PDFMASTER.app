import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    signOut,
    updateProfile,
    sendEmailVerification,
    User
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy
} from 'firebase/firestore';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from 'firebase/storage';
import { StoredPdf } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyCIzLvXwP2BCjOq2CLloq-1hPZspe5q1-g",
  authDomain: "pdfmaster-co.firebaseapp.com",
  projectId: "pdfmaster-co",
  storageBucket: "pdfmaster-co.firebasestorage.app",
  messagingSenderId: "417873277222",
  appId: "1:417873277222:web:d47e7ff8594a47d77051e7",
  measurementId: "G-FM2JR4GNB5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

// --- AUTHENTICATION ---

export const createUserProfileDocument = async (userAuth: User, additionalData: { displayName?: string } = {}) => {
    if (!userAuth) return;

    const userRef = doc(db, 'users', userAuth.uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
        const { email, photoURL, uid } = userAuth;
        const displayName = additionalData.displayName || userAuth.displayName;
        const createdAt = new Date();

        try {
            await setDoc(userRef, {
                uid,
                displayName,
                email,
                photoURL,
                createdAt
            });
        } catch (error) {
            console.error('Error creating user profile in Firestore:', error);
            throw new Error("Could not create user profile. Please try again.");
        }
    }
    return userRef;
};

export const signInWithGoogle = async () => {
    const { user } = await signInWithPopup(auth, googleProvider);
    await createUserProfileDocument(user);
};

export const signUpWithEmail = async (name: string, email: string, password: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(user); // Send verification email
    await updateProfile(user, { displayName: name });
    await createUserProfileDocument(user, { displayName: name });
};

export const resendVerificationEmail = async () => {
    const user = auth.currentUser;
    if (user) {
        await sendEmailVerification(user);
    } else {
        throw new Error("No user is currently signed in.");
    }
};

export const logInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => signOut(auth);

export const onAuthUserChanged = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// --- STORAGE & FIRESTORE ---

export const uploadPdfToStorage = async (user: User, file: Blob, fileName: string) => {
    if (!user) throw new Error("User must be logged in to upload files.");
    
    const storagePath = `userPdfs/${user.uid}/${Date.now()}_${fileName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Now, save file metadata to Firestore
    const pdfsCollectionRef = collection(db, `users/${user.uid}/pdfs`);
    await addDoc(pdfsCollectionRef, {
        name: fileName,
        url: downloadURL,
        storagePath: storagePath,
        size: file.size,
        createdAt: serverTimestamp()
    });
};

export const getUserPdfs = async (userId: string): Promise<StoredPdf[]> => {
    const pdfsCollectionRef = collection(db, `users/${userId}/pdfs`);
    const q = query(pdfsCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as StoredPdf));
};

export const deletePdf = async (userId: string, pdfId: string, storagePath: string) => {
    // Delete from Firestore
    const pdfDocRef = doc(db, `users/${userId}/pdfs`, pdfId);
    await deleteDoc(pdfDocRef);

    // Delete from Storage
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
};