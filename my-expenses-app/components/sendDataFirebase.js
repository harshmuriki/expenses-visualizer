import { db } from './firebaseConfig.js';
import { collection, doc, setDoc } from 'firebase/firestore';

// Function to create a new collection
const uploadTransaction = async ({ month, transaction, index, cost, isMap, key, values }) => {

    try {
        console.log(isMap ? 'Saving map on firebase' : 'Saving transaction on firebase');
        const collectionRef = collection(db, month);
        const documentRef = isMap ? doc(collectionRef, 'parentChildMap') : doc(collectionRef, transaction + String(index));
        const data = isMap ? { [key]: values } : { transaction, cost, index };
        await setDoc(documentRef, data, { merge: true });
        console.log('Saved successfully!');
    } catch (error) {
        console.error('Error saving:', error);
    }
};

export default uploadTransaction;