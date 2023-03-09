import { admin } from '../firebase';

export const FRONTEND_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://mockgen-online-test-prod.web.app'
    : 'http://localhost:5173';

export const sendTestInvitationMails = async (
  invites: {
    inviteCode: string;
    email: string;
    name: string;
    testName: string;
  }[]
) => {
  await Promise.all(
    invites.map(async (invite) => {
      const inviteURL = `${FRONTEND_URL}/test/i/${invite.inviteCode}`;

      admin
        .firestore()
        .collection('mail')
        .add({
          to: [invite.email],
          template: {
            name: 'testInvite',
            data: {
              name: invite.name,
              url: inviteURL,
              testname: invite.testName
            }
          }
        });
    })
  );
};

export const sendTestResultMails = async (
  results: {
    email: string;
    name: string;
    testName: string;
    percentageScore: string;
    correctlyAnswered: number;
    totalQuestions: number;
    dateFinished: string;
    grade: string;
  }[]
) => {
  await Promise.all(
    results.map(async (result) => {
      admin
        .firestore()
        .collection('mail')
        .add({
          to: [result.email],
          template: {
            name: 'testResult',
            data: {
              name: result.name,
              testName: result.testName,
              percentageScore: result.percentageScore,
              correctlyAnswered: result.correctlyAnswered,
              totalQuestions: result.totalQuestions,
              dateFinished: result.dateFinished,
              grade: result.grade
            }
          }
        });
    })
  );
};
