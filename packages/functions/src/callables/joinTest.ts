import * as functions from 'firebase-functions';
import _ from 'lodash';
import { obfuscate } from '../utils';
import {
  addParticipantInviteCodeToDoc,
  addParticipantsToTest,
  getTestFromInviteCode
} from '../services/tests.service';

export const getTestDetails = functions.https.onCall(async (data, context) => {
  // App Check protection
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called from Quizmine - Online.'
    );
  }

  // Get the invite code
  const invite = String(data.invite);

  const { test } = await getTestFromInviteCode(invite);

  const testReturn = _.omit(test, ['sectionQuestions', 'mockData']);

  return obfuscate(JSON.stringify({ test: testReturn, time: Date.now() }), 10204);
});

export const joinTest = functions
  .runWith({
    minInstances: 1
  })
  .https.onCall(async (data, context) => {
    // App Check protection
    if (context.app == undefined) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'The function must be called from Quizmine - Online.'
      );
    }

    let { name, email, phone, invite } = data;
    name = String(name);
    email = String(email);
    phone = String(phone);
    invite = String(invite);

    const { test, testDoc } = await getTestFromInviteCode(invite);

    if (!name || !phone) {
      throw new functions.https.HttpsError('invalid-argument', 'A name and phone is required.');
    }

    // Add participant to test
    const { addedParticipants } = await addParticipantsToTest({
      testID: test.id,
      participants: [
        {
          name,
          email,
          phone
        }
      ]
    });

    // Generate invite
    await addParticipantInviteCodeToDoc({
      testID: test.id,
      participantIDs: addedParticipants
    });

    // Get updated participant doc
    const participantDoc = await (
      await testDoc.ref.collection('participants').doc(addedParticipants[0])
    ).get();
    const participantData = participantDoc.data();

    const participantInviteCode = String(participantData?.inviteCode);

    if (!participantInviteCode) {
      throw new functions.https.HttpsError('internal', 'Failed to add participant');
    }

    // Return invite code
    return obfuscate(JSON.stringify({ invite: participantInviteCode, time: Date.now() }), 10204);
  });
