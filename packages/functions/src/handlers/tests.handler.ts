import { NextFunction, Request, Response } from 'express';
import { admin, db } from '../firebase';
import { APIHTTPError } from '../middleware/errorHandler';
import { generateUniqueTestInviteCode } from '../services/code.service';
import {
  addParticipantInviteCodeToDoc,
  addParticipantsToTest,
  sendParticipantInvitations
} from '../services/tests.service';
import { Test } from '../types/Test';
import { CreateOnlineTestFromMockSchema } from '../validators/tests';

export enum ParticipantStatus {
  PENDING = 'PENDING', // default status for new participants
  INVITED = 'INVITED', // status for invited participants
  TAKEN = 'TAKEN', // status for when participant takes test
  GRADED = 'GRADED', // status for when participant's test is graded
  RESULTS_SENT = 'RESULTS_SENT' // status for when participant's results are sent
}

export enum TestProcessingStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  FAILED = 'failed'
}

export const createOnlineTestFromMockHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body as CreateOnlineTestFromMockSchema;

    // Verify user making request created said mock
    const docSnapshot = await admin
      .firestore()
      .collection('examConfiguration')
      .doc(data.mockID)
      .get();
    const docData = docSnapshot.data() as Test['mockData'];

    if (!docData) {
      throw new APIHTTPError('NOT_FOUND', 'Mock not found');
    }

    if (docData?.status !== 'paid' || docData?.userId !== req.user!.uid) {
      throw new APIHTTPError('FORBIDDEN', 'You do not have permission to create this test');
    }

    // Get question count
    const numberOfQuestions =
      docData.questions
        ?.filter((q) => q.questionType === 'multiple')
        ?.map((e) => e.questionIDs)
        ?.flat()?.length || 0;

    // Extract participants array from mock
    const participants = data?.participants;
    delete data.participants;

    // Generate unique test invite code
    const inviteCode = await generateUniqueTestInviteCode();

    // Create test document in tests collection
    const docRef = await db.collection('onlineTests').add({
      ...data,
      createdBy: req.user!.uid,
      createdAt: new Date().toISOString(),
      processingStatus: TestProcessingStatus.PENDING,
      mockData: docData,
      numberOfQuestions,
      inviteCode
    });

    if (participants && participants?.length > 0) {
      // Add participants to test
      const { addedParticipants } = await addParticipantsToTest({
        participants,
        testID: docRef.id
      });

      // Add invite codes to participants
      await addParticipantInviteCodeToDoc({
        testID: docRef.id,
        participantIDs: addedParticipants
      });

      // Send invitations to participants
      sendParticipantInvitations(docRef.id);
    }

    const doc = {
      ...(await docRef.get()).data(),
      id: docRef.id
    };

    return res.status(200).send(doc);
  } catch (error) {
    return next(error);
  }
};
