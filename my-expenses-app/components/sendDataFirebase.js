import { db } from './firebaseConfig.js';
import { DEBUG_ENABLED } from "@/lib/debug";
import { doc, collection, setDoc, getDoc, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';

// Function to create a new collection
export const uploadTransaction = async ({ useremail, month, transaction, index, cost, isleaf, visible, isMap, key, values, date, location, file_source, bank }) => {
  // console.log('Input parameters:', { transaction, index, cost, isleaf, visible, isMap, key, values });

  const userDocRef = doc(db, "users", useremail);
  const userDocSnapshot = await getDoc(userDocRef);

  if (userDocSnapshot.exists()) {
    // Check if this month already exists in the months array
    const existingMonths = userDocSnapshot.data().months || [];
    if (!existingMonths.includes(month)) {
      // Update the months array with the new month
      await updateDoc(userDocRef, {
        months: arrayUnion(month)
      });

      // Store collection creation timestamp
      const monthMetadataRef = doc(userDocRef, month, 'meta');
      await setDoc(monthMetadataRef, {
        createdAt: new Date().toISOString(),
        createdTimestamp: Date.now()
      }, { merge: true });
    }
  } else {
    // Create the document with the months array if it doesn't exist
    await setDoc(userDocRef, {
      months: [month]
    }, { merge: true });

    // Store collection creation timestamp
    const monthMetadataRef = doc(userDocRef, month, 'meta');
    await setDoc(monthMetadataRef, {
      createdAt: new Date().toISOString(),
      createdTimestamp: Date.now()
    }, { merge: true });
  }

  try {
    if (DEBUG_ENABLED) console.log('[firestore] single write', { isMap, transaction, index });
    const collectionRef = collection(userDocRef, month);
    const documentRef = isMap ? doc(collectionRef, 'parentChildMap') : doc(collectionRef, transaction + String(index));
    // Default and sanitize fields to avoid undefined in Firestore
    const safeDate = date ?? new Date().toISOString();
    const safeLocation = location ?? "None";
    const safeFileSource = file_source ?? "Unknown";
    const safeBank = bank ?? "Unknown Bank";
    const data = isMap
      ? { [key]: values }
      : { transaction, cost, index, isleaf, visible, date: safeDate, location: safeLocation, file_source: safeFileSource, bank: safeBank };
    await setDoc(documentRef, data, { merge: true });

  } catch (error) {
    console.error('Error saving:', error);
  }
};

export const uploadTransactionsInBatch = async (batchData) => {
  try {
    // console.log("data: ", batchData);
    const userDocRef = doc(db, "users", batchData[0].useremail); // Use first item to get user email
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      // Check if this month already exists in the months array
      const existingMonths = userDocSnapshot.data().months || [];
      if (!existingMonths.includes(batchData[0].month)) {
        // Update the months array with the new month
        await updateDoc(userDocRef, {
          months: arrayUnion(batchData[0].month),
        });

        // Store collection creation timestamp
        const monthMetadataRef = doc(userDocRef, batchData[0].month, 'meta');
        await setDoc(monthMetadataRef, {
          createdAt: new Date().toISOString(),
          createdTimestamp: Date.now()
        }, { merge: true });
      }
    } else {
      // Create the document with the months array if it doesn't exist
      if (DEBUG_ENABLED) console.log('Creating user document with months array');
      await setDoc(
        userDocRef,
        {
          months: [batchData[0].month],
        },
        { merge: true }
      );

      // Store collection creation timestamp
      const monthMetadataRef = doc(userDocRef, batchData[0].month, 'meta');
      await setDoc(monthMetadataRef, {
        createdAt: new Date().toISOString(),
        createdTimestamp: Date.now()
      }, { merge: true });
    }

    // Initialize Firestore batch
    const batch = writeBatch(db);

    for (const data of batchData) {
      try {
        const collectionRef = collection(userDocRef, data.month);
        const documentRef = data.isMap
          ? doc(collectionRef, 'parentChildMap')
          : doc(collectionRef, `${data.transaction}_${data.index}`);

        // Default and sanitize fields to avoid undefined in Firestore
        const safeDate = data.date ?? new Date().toISOString();
        const safeLocation = data.location ?? "None";
        const safeFileSource = data.file_source ?? "Unknown";
        const safeBank = data.bank ?? "Unknown Bank";
        const docData = data.isMap
          ? { [data.key]: data.values }
          : {
            transaction: data.transaction,
            cost: data.cost,
            index: data.index,
            isleaf: data.isleaf,
            visible: data.visible,
            date: safeDate,
            location: safeLocation,
            file_source: safeFileSource,
            bank: safeBank,
          };

        // Add set operation to the batch
        batch.set(documentRef, docData, { merge: true });
        if (DEBUG_ENABLED && (data.index % 100 === 0)) console.log('[batch] queued', { index: data.index });
      } catch (error) {
        console.error('Error adding to batch:', error);
      }
    }

    // Commit the batch operation
    await batch.commit();
    if (DEBUG_ENABLED) console.log('Batch upload successful!');
  } catch (error) {
    console.error('Error during batch upload:', error);
    throw error;
  }
};
