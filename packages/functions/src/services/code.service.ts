import { admin } from '../firebase';
import { generateRandomString } from '../utils';

export const generateUniqueTestInviteCode = async () => {
  // Hashmap for recording codes already in use
  const usedCodes = {} as Record<string, boolean>;

  const workers = [...Array(20)].map(() =>
    (async () => {
      for (;;) {
        // Generate a code, ensure it's not in already used register
        let code = '';
        do {
          code = generateRandomString(4);
        } while (usedCodes[code]);

        // Push to register
        usedCodes[code] = true;

        // Check if code is used in a test on firebase
        const query = admin.firestore().collection('onlineTests').where('inviteCode', '==', code);
        const querySnapshot = await query.get();
        const testWithCode = querySnapshot.docs[0]?.exists;

        // If code is not used, return it
        if (!testWithCode) {
          return code;
        }
      }
    })()
  );

  // Race workers
  const uniqueTestCode = await Promise.race(workers);

  return uniqueTestCode;
};

export const generateUniqueParticipantInviteCodes = async (testID: string, count: number) => {
  // Hashmap for recording codes already in use
  const usedCodes = {} as Record<string, boolean>;

  const docRef = await admin.firestore().collection('onlineTests').doc(testID);

  const workers = [...Array(count)].map(() =>
    (async () => {
      for (;;) {
        // Generate a code, ensure it's not in already used register
        let code = '';
        do {
          code = generateRandomString(4);
        } while (usedCodes[code]);

        // Check if code is used in a test on firebase
        const query = docRef.collection('participants').where('inviteCode', '==', code);
        const querySnapshot = await query.get();
        const participantWithCode = querySnapshot.docs[0]?.exists;

        // If code is not used, return it
        if (!participantWithCode && !usedCodes[code]) {
          // Push to register
          usedCodes[code] = true;

          return code;
        }
      }
    })()
  );

  const uniqueTestCodes = await Promise.all(workers);

  return uniqueTestCodes;
};
