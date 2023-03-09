import { admin, db } from '../firebase';
import * as functions from 'firebase-functions';
import { ParticipantStatus } from '../handlers/tests.handler';
import { APIHTTPError } from '../middleware/errorHandler';
import { generateUniqueParticipantInviteCodes } from './code.service';
import { sendTestInvitationMails, sendTestResultMails } from './mail.service';
import { Test } from '../types/Test';

interface AddParticipantsToTestArgs {
  participants: {
    email: string;
    name: string;
    phone: string;
  }[];
  testID: string;
}

export const addParticipantsToTest = async ({
  participants,
  testID
}: AddParticipantsToTestArgs) => {
  // Add participants to test
  // Batch writes have a limit of 500 writes per batch
  // So we need to split the participants array into batches of 500 and then write each batch in parallel
  const pBatches = [];
  const batchSize = 500;
  for (let i = 0; i < participants.length; i += batchSize) {
    pBatches.push(participants.slice(i, i + batchSize));
  }

  const docRef = await admin.firestore().collection('onlineTests').doc(testID);

  const ids = await Promise.all(
    pBatches.map(async (pBatch) => {
      const batch = db.batch();
      const ids = pBatch?.map((participant) => {
        const p = {
          ...participant,
          status: ParticipantStatus.PENDING,
          addedAt: new Date().toISOString(),
          inviteCode: null,
          emailInvitationDoc: null,
          lastInvitedAt: null,
          lastStartedAt: null
        };

        const newDocRef = docRef.collection('participants').doc();

        batch.set(newDocRef, p);

        return newDocRef.id;
      });
      await batch.commit();

      return ids;
    })
  );

  const addedParticipantIDs = ids.flat(2);

  const doc = await docRef.get();
  const allParticipants = docRef.collection('participants');

  return {
    ...doc.data(),
    participants: (await allParticipants.get()).docs.map((d) => ({ ...d.data(), id: d.id })),
    addedParticipants: addedParticipantIDs
  };
};

interface AddParticipantInviteCodeToDocArgs {
  testID: string;
  participantIDs: string[];
}

export const addParticipantInviteCodeToDoc = async ({
  testID,
  participantIDs
}: AddParticipantInviteCodeToDocArgs) => {
  try {
    const docRef = await admin.firestore().collection('onlineTests').doc(testID);
    const testInviteCode = (await docRef.get()).data()?.inviteCode;

    const batch = db.batch();

    // Generate unique invite codes for each participant
    const inviteCodes = await generateUniqueParticipantInviteCodes(testID, participantIDs?.length);

    participantIDs.forEach((participantID, idx) => {
      // Invite code is a string of the form:
      // <test invite>-<participant invite>
      // The invite code can then be split into the test invite and participant invite, and used to find the participant in the test
      // This can then be extended to support password protected tests by requiring a password to be entered before the test can be started
      const subCollRef = docRef.collection('participants').doc(participantID);

      batch.update(subCollRef, {
        inviteCode: `${testInviteCode}-${inviteCodes[idx]}`
      });
    });

    await batch.commit();
  } catch (error) {
    console.error(error);
  }
};

export const sendParticipantInvitations = async (testID: string, participantIDs?: string[]) => {
  const docRef = await admin.firestore().collection('onlineTests').doc(testID);
  const participantsRef = docRef.collection('participants');
  const test = (await docRef.get()).data();

  if (!test) {
    throw new APIHTTPError('NOT_FOUND', 'Test not found');
  }

  const participantsQuery = participantIDs
    ? participantsRef.where(admin.firestore.FieldPath.documentId(), 'in', participantIDs)
    : participantsRef;

  const participantsDocs = await participantsQuery.get();

  const batch = db.batch();

  // Filter out participants without email
  const participants = participantsDocs.docs.map((d) => d.data()).filter((e) => Boolean(e.email));

  if (participants.length < 1) {
    return;
  }

  const invites = participants.map((participant) => {
    return {
      email: participant.email,
      name: participant.name,
      inviteCode: participant.inviteCode,
      testName: test.testName
    };
  });

  await sendTestInvitationMails(invites);

  // Update the lastInvitedAt and status field for each participant
  participantsDocs.docs.forEach((participantDoc) => {
    batch.update(participantDoc.ref, {
      status: ParticipantStatus.INVITED,
      lastInvitedAt: new Date().toISOString()
    });
  });

  await batch.commit();
};

export const sendTestResults = async (testID: string, participantIDs?: string[]) => {
  const docRef = await admin.firestore().collection('onlineTests').doc(testID);
  const submissionsRef = docRef.collection('submissions');
  const participantsRef = docRef.collection('participants');
  const test = (await docRef.get()).data();

  if (!test) {
    throw new APIHTTPError('NOT_FOUND', 'Test not found');
  }

  const submissionsQuery = participantIDs
    ? submissionsRef.where(admin.firestore.FieldPath.documentId(), 'in', participantIDs)
    : submissionsRef;
  const participantsQuery = participantIDs
    ? participantsRef.where(admin.firestore.FieldPath.documentId(), 'in', participantIDs)
    : participantsRef;

  const participantsDocs = await participantsQuery.get();
  const submissionDocs = await submissionsQuery.get();

  const participantData = participantsDocs.docs.map((participantDoc) => ({
    ...participantDoc.data(),
    id: participantDoc.id
  })) as { id: string; name: string; email: string }[];

  const batch = db.batch();

  const results = submissionDocs.docs.map((submissionDoc) => {
    const submission = submissionDoc.data();

    const latestResult = submission.results[submission.results.length - 1];

    // Get participant data
    const participant = participantData.find((p) => p.id === submissionDoc.id);

    if (!participant) {
      throw new APIHTTPError('NOT_FOUND', 'Participant not found while sending results');
    }

    const percentage =
      ((latestResult.correctAnswers / latestResult.totalNumberOfQuestions) * 100).toFixed(2) + '%';

    return {
      name: participant.name,
      email: participant.email,
      testName: test.testName,
      percentageScore: percentage,
      correctlyAnswered: latestResult.correctAnswers,
      totalQuestions: latestResult.totalNumberOfQuestions,
      grade: latestResult.isPassed ? 'PASSED' : 'FAIL',
      dateFinished: new Date(latestResult.submittedAt.seconds * 1000).toLocaleString()
    };
  });

  await sendTestResultMails(results);

  // Update the lastInvitedAt and status field for each participant
  participantsDocs.docs.forEach((participantDoc) => {
    batch.update(participantDoc.ref, {
      status: ParticipantStatus.RESULTS_SENT,
      lastInvitedAt: new Date().toISOString()
    });
  });

  await batch.commit();
};

export const getParticipantAndTestFromInviteCode = async (invite: string) => {
  if (!invite) {
    throw new functions.https.HttpsError('invalid-argument', 'No invite code provided');
  }

  const [testInvite, participantInvite] = invite.split('-');
  if (!testInvite || !participantInvite) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid invite code');
  }

  // Get test document
  const testDoc = (
    await admin.firestore().collection('onlineTests').where('inviteCode', '==', testInvite).get()
  )?.docs[0];
  if (!testDoc?.exists) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid invite code');
  }

  // Get participant document
  const participantDoc = (
    await testDoc.ref.collection('participants').where('inviteCode', '==', invite).get()
  )?.docs[0];
  if (!participantDoc?.exists) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid invite code');
  }

  const test = { ...(testDoc.data() as Test), id: testDoc.id };
  const participant = {
    ...participantDoc.data(),
    id: participantDoc.id
  } as Test['participants'][0];

  return { test, participant, testDoc, participantDoc };
};

export const getTestFromInviteCode = async (invite: string) => {
  if (!invite) {
    throw new functions.https.HttpsError('invalid-argument', 'No invite code provided');
  }

  // Get test document
  const testDoc = (
    await admin.firestore().collection('onlineTests').where('inviteCode', '==', invite).get()
  )?.docs[0];
  if (!testDoc?.exists) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid invite code');
  }

  const test = { ...(testDoc.data() as Test), id: testDoc.id };
  return { test, testDoc };
};
