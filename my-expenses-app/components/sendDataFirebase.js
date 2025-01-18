import { db } from './firebaseConfig.js';
import { doc, collection, setDoc, getDoc, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';

// Function to create a new collection
export const uploadTransaction = async ({ useremail, month, transaction, index, cost, isleaf, visible, isMap, key, values }) => {
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

export const uploadTransactionsInBatch = async (batchData) => {
    try {
      console.log('Uploading batch data to Firestore:');
      const userDocRef = doc(db, "users", batchData[0].useremail); // Use first item to get user email
      const userDocSnapshot = await getDoc(userDocRef);
  
      // Initialize Firestore batch
      const batch = writeBatch(db);
  
      for (const data of batchData) {
        const collectionRef = collection(userDocRef, data.month);
        const documentRef = data.isMap
          ? doc(collectionRef, 'parentChildMap')
          : doc(collectionRef, `${data.transaction}_${data.index}`);
        
        const docData = data.isMap
          ? { [data.key]: data.values }
          : {
              transaction: data.transaction,
              cost: data.cost,
              index: data.index,
              isleaf: data.isleaf,
              visible: data.visible,
            };
  
        // Add set operation to the batch
        batch.set(documentRef, docData, { merge: true });
      }
  
      // Commit the batch operation
      await batch.commit();

      if (userDocSnapshot.exists()) {
        // Update the months array with the new month
        await updateDoc(userDocRef, {
          months: arrayUnion(batchData[0].month),
        });
      } else {
        // Create the document with the months array if it doesn't exist
        console.log('Creating user document with months array');
        await setDoc(
          userDocRef,
          {
            months: [batchData[0].month],
          },
          { merge: true }
        );
      }

      console.log('Batch upload successful!');
    } catch (error) {
      console.error('Error during batch upload:', error);
      throw error;
    }
  };
