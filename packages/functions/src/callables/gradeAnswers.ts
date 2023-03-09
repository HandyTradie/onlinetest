import * as functions from 'firebase-functions';
import { obfuscate } from '../utils';
import { firestore } from 'firebase-admin';
import { ParticipantStatus } from '../handlers/tests.handler';
import { getParticipantAndTestFromInviteCode, sendTestResults } from '../services/tests.service';

export const gradeAnswers = functions
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

    // Data shold be of the form { invite: string, answers: { questionID: string, answerID: string }[] }
    if (data.invite == undefined || data.answers == undefined) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with an invite and answers.'
      );
    }

    const invite = data.invite as string;
    const submittedAnswers = data.answers as { questionID: string; answerID: string }[];

    const [testInvite, participantInvite] = invite.split('-');
    if (!testInvite || !participantInvite) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid invite code');
    }

    const submitTime = firestore.Timestamp.now();

    const { test, testDoc, participant, participantDoc } =
      await getParticipantAndTestFromInviteCode(invite);

    // Get results
    const answersDoc = await testDoc.ref.collection('sectionAnswers').get();
    const sectionAnswers = answersDoc.docs.map((doc) => doc.data()).flat();
    // Merge section answers
    const answers = Object.assign({}, ...sectionAnswers);

    // Merge section questions
    const questions = (test?.sectionQuestions || []).map((section) => section.questions).flat();

    // For each answer, check if it is correct
    const gradedAnswers = submittedAnswers.map((answer) => {
      const isCorrect = answers[answer.questionID]?.id === answer.answerID;

      return {
        questionID: answer.questionID,
        answerID: answer.answerID ?? null,
        isCorrect,
        correctAnswer: answers[answer.questionID] ?? null,
        question: questions.find((q) => q?.id === Number(answer.questionID)) ?? null
      };
    });

    const correctAnswers = gradedAnswers.filter((answer) => answer.isCorrect).length;
    const totalNumberOfQuestions = gradedAnswers.length;

    const percentageScore = (correctAnswers / totalNumberOfQuestions) * 100;
    const passingScore = test?.passingScore ?? 0;

    const timeTaken = participant.lastStartedAt
      ? submitTime.toMillis() - participant.lastStartedAt?.toMillis()
      : 0;

    const isPassed = percentageScore >= passingScore;

    const participantResultDoc = {
      correctAnswers,
      totalNumberOfQuestions,
      isPassed,
      passingScore,
      submissions: gradedAnswers,
      submittedAt: submitTime,
      timeTaken
    };
    // CHeck if participant submissions doc exists
    const submissionsDocRef = await testDoc.ref.collection('submissions').doc(participant.id);

    if ((await submissionsDocRef.get()).exists) {
      // Save the result
      await submissionsDocRef.update({
        results: firestore.FieldValue.arrayUnion(participantResultDoc)
      });
    } else {
      // Create doc
      await submissionsDocRef.set({ results: [participantResultDoc] });
    }

    // Update the participant status
    await participantDoc.ref.update({ status: ParticipantStatus.GRADED });

    const isShowScoreToStudentsAllowed = Boolean(test.showScore);
    const isTestReviewAllowed = Boolean(test.allowReview);

    const clientReturn = {
      success: true,
      // If show score is allowed, return the score
      score: isShowScoreToStudentsAllowed
        ? {
            correct: participantResultDoc.correctAnswers,
            total: participantResultDoc.totalNumberOfQuestions
          }
        : undefined,
      isPassed: isShowScoreToStudentsAllowed ? participantResultDoc.isPassed : undefined,
      passingScore: isShowScoreToStudentsAllowed ? participantResultDoc.passingScore : undefined,
      // If review is allowed, return the answers
      answers: isTestReviewAllowed ? gradedAnswers : undefined
    };

    if (test.emailScores) {
      // Send email
      sendTestResults(test.id, [participant.id]);
    }

    return obfuscate(JSON.stringify(clientReturn), 10204);
  });
