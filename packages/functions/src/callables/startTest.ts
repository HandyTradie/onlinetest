import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { isAfter } from 'date-fns';
// import type { Test } from '../../../client/src/api/tests';
import { ParticipantStatus } from '../handlers/tests.handler';
import { obfuscate } from '../utils';
import { getParticipantAndTestFromInviteCode } from '../services/tests.service';

/**
 * Callable called when a participant starts a test
 */

export const startTest = functions
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

    const { test, participantDoc, participant } = await getParticipantAndTestFromInviteCode(invite);

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

    // Update participant status
    await participantDoc.ref.update({
      status: ParticipantStatus.TAKEN,
      lastStartedAt: admin.firestore.Timestamp.now()
    });

    // Simple obfuscation
    // Returning invite and time so obfuscation string is varied
    return obfuscate(JSON.stringify({ invite, success: true, time: Date.now() }), 10204);
  });
