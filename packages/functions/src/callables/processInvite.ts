import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { isAfter } from 'date-fns';
// import type { Test } from '../../../client/src/api/tests';
import { ParticipantStatus } from '../handlers/tests.handler';
import { obfuscate } from '../utils';
import { getParticipantAndTestFromInviteCode } from '../services/tests.service';

export const processInvite = functions
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

    // Get the invite code
    const invite = String(data.invite);

    const { test, participant } = await getParticipantAndTestFromInviteCode(invite);

    // Check if participant has already taken the test
    if (
      (participant.status === ParticipantStatus.TAKEN ||
        participant.status === ParticipantStatus.GRADED) &&
      !test.allowMultipleAttempts
    ) {
      throw new functions.https.HttpsError('invalid-argument', 'You have already taken this test');
    }

    // Check if test end date has passed
    if (isAfter(admin.firestore.Timestamp.now().toDate(), new Date(test.testEndDate))) {
      throw new functions.https.HttpsError('unavailable', 'This test has ended');
    }

    // Check if test is done processing
    if (test.processingStatus === 'pending') {
      throw new functions.https.HttpsError(
        'unavailable',
        'This test is still processing and not ready to be taken yet'
      );
    }

    if (test.processingStatus === 'failed') {
      throw new functions.https.HttpsError(
        'unavailable',
        'This test failed to process and cannot be taken. Contact the test creator.'
      );
    }

    // Simple obfuscation
    return obfuscate(JSON.stringify({ invite, participant, test }), 10204);
  });
