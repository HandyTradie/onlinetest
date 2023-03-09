import { NextFunction, Request, Response } from 'express';
import * as firebase from 'firebase-admin';

import { admin } from '../firebase';
import { APIHTTPError } from '../middleware/errorHandler';
import {
  addParticipantInviteCodeToDoc,
  addParticipantsToTest,
  sendParticipantInvitations,
  sendTestResults
} from '../services/tests.service';
import {
  AddParticipantsToTestSchema,
  ResendParticipantInviteSchema,
  SendParticipantResultsSchema
} from '../validators/participants';

export const addParticipantsToTestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { participants, sendEmails } = req.body as AddParticipantsToTestSchema;
    const { testID } = req.params;

    // Verify user making request created said test
    const docSnapshot = await admin.firestore().collection('onlineTests').doc(testID).get();
    const docData = docSnapshot.data();

    if (!docData) {
      throw new APIHTTPError('NOT_FOUND', 'Test not found');
    }

    if (docData?.createdBy !== req.user!.uid) {
      throw new APIHTTPError(
        'FORBIDDEN',
        'You do not have permission to add participants to this test'
      );
    }

    // Add participants to test
    const { addedParticipants } = await addParticipantsToTest({ participants, testID });

    // Add invite codes to participants
    await addParticipantInviteCodeToDoc({
      testID,
      participantIDs: addedParticipants
    });

    // Get updated doc
    const updatedParticipants = (
      await admin
        .firestore()
        .collection('onlineTests')
        .doc(testID)
        .collection('participants')
        .where(firebase.firestore.FieldPath.documentId(), 'in', addedParticipants)
        .get()
    ).docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    // Send emails to participants
    if (sendEmails) {
      sendParticipantInvitations(
        testID,
        updatedParticipants.map((p) => p.id)
      );
    }

    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    return next(error);
  }
};

export const resendParticipantInviteHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { participantIDs, testID } = req.body as ResendParticipantInviteSchema;

    // Get test doc
    const testDoc = (await admin.firestore().collection('onlineTests').doc(testID).get()).data();

    if (!testDoc) {
      throw new APIHTTPError('NOT_FOUND', 'Test not found');
    }

    // Get participant docs
    const participantDocs = (
      await admin.firestore().collection('onlineTests').doc(testID).collection('participants').get()
    ).docs;

    // Get docs for participants to resend invites to
    const participantsToResend = participantDocs
      .filter((doc) => participantIDs.includes(doc.id))
      .map((doc) => doc.id);

    // Send emails to participants
    sendParticipantInvitations(testID, participantsToResend);

    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    return next(error);
  }
};

export const sendParticipantResultsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { participantIDs, testID } = req.body as SendParticipantResultsSchema;

    // Get test doc
    const testDoc = (await admin.firestore().collection('onlineTests').doc(testID).get()).data();

    if (!testDoc) {
      throw new APIHTTPError('NOT_FOUND', 'Test not found');
    }

    // Validate participant ids
    const _participantDocs = await admin
      .firestore()
      .collection('onlineTests')
      .doc(testID)
      .collection('participants')
      .where(admin.firestore.FieldPath.documentId(), 'in', participantIDs)
      .get();

    const participantDocs = _participantDocs.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    const participantsToResend = participantDocs.map((doc) => doc.id);

    // Send emails to participants
    await sendTestResults(testID, participantsToResend);

    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    return next(error);
  }
};
