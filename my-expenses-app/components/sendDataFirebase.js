import { db } from './firebaseConfig.js';
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

// Function to create a new collection
const uploadTransaction = async ({ useremail, month, transaction, index, cost, isleaf, visible, isMap, key, values }) => {
    // console.log('Input parameters:', { transaction, index, cost, isleaf, visible, isMap, key, values });

    const userDocRef = doc(db, "users", useremail);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
        // Update the months array with the new month
        await updateDoc(userDocRef, {
          months: arrayUnion(month)
        });
    } else {
        // Create the document with the months array if it doesn't exist
        console.log('Creating user document with months array');
        await setDoc(userDocRef, {
            months: [month]
        }, { merge: true });
    }

    try {
        console.log(isMap ? 'Saving map on firebase' : 'Saving transaction on firebase');
        const collectionRef = collection(userDocRef, month);
        const documentRef = isMap ? doc(collectionRef, 'parentChildMap') : doc(collectionRef, transaction + String(index));
        const data = isMap ? { [key]: values } : { transaction, cost, index, isleaf, visible };
        await setDoc(documentRef, data, { merge: true });
        // console.log('Saved successfully!');
    } catch (error) {
        console.error('Error saving:', error);
    }
};

export default uploadTransaction;