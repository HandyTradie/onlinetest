// Trigger that runs on addition to 'onlineTests' collection and
// fetches questions from the sql db, processes them and adds them to the test

import * as functions from 'firebase-functions';
import mysql from 'mysql';
import TurndownService from 'turndown';
import * as turndownPluginGfm from 'turndown-plugin-gfm';

import { TestProcessingStatus } from '../handlers/tests.handler';
import { Test, TopicPercentage } from '../types/Test';
import { getUtfFixed } from '../utils/utfFix';

export const debug = functions.firestore
  .document('onlineTests/{testID}')
  .onUpdate(async (change) => {
    // const testData = change.after.data() as Test;
    // const mockData = testData.mockData;
    // const numberOfQuestions =
    //   mockData.questions
    //     .filter((q) => q.questionType === 'multiple')
    //     .map((e) => e.questionIDs)
    //     ?.flat()?.length || 0;
    // console.log('num', numberOfQuestions);
  });

export const processTestQuestions = functions.firestore
  .document('onlineTests/{testID}')
  .onCreate(async (snap) => {
    const test = snap.data() as Test;
    const { mockData } = test;
    const turndownService = new TurndownService();
    turndownService.use(turndownPluginGfm.gfm);

    // Ignore super and subscripts
    turndownService.keep(['sup', 'sub']);

    // Get multiple choice sections and questions
    const sectionsWithQuestions = mockData.sectionBlock.flatMap((section, idx: string | number) => {
      if (section.questionType === 'multiple') {
        return {
          ...section,
          questions: mockData.questions[Number(idx)]
        };
      } else {
        return [];
      }
    });

    try {
      // Fetch questions from db
      const _sectionsWithFetchedQuestions = await Promise.all(
        sectionsWithQuestions.map(async (section) => {
          const fetchedQuestions = await fetchQuestionsFromSQLDB<DBQuestion>(
            section.questions.questionIDs
          );

          // Create table of topics for quick lookup
          const topicsTable = section.topicPercentages.reduce((acc, topic) => {
            if (topic.value > 0) {
              acc[topic.topicId] = topic;
            }
            return acc;
          }, {} as Record<string, TopicPercentage>);

          // Group questions by id
          const groupedQuestions = fetchedQuestions.reduce((acc, question) => {
            const { id } = question;

            if (acc[id]) {
              acc[id].push(question);
            } else {
              acc[id] = [question];
            }

            return acc;
          }, {} as Record<string, DBQuestion[]>);

          // Normalize db records into question with answers array
          const normalizedQuestions = Object.values(groupedQuestions).map((group, idx) => {
            // Question text, id and type are same across group
            // HTML is converted to markdown
            const { text, id, qtype, resource, topic_id } = group[0];
            const answerOptions = group.map((q) => {
              return {
                option: turndownService.turndown(getUtfFixed(q.answer)),
                id: q.answer_id
              };
            });

            return {
              questionNumber: idx + 1,
              id,
              text: turndownService.turndown(getUtfFixed(text)),
              qtype,
              resource: resource ? turndownService.turndown(getUtfFixed(resource)) : '',
              answerOptions,
              topic: {
                id: topicsTable[String(topic_id)].topicId,
                name: topicsTable[String(topic_id)].topic
              }
            };
          });

          // Reuse groupedQuestions to create answerMap
          const answerMap = Object.keys(groupedQuestions).reduce((acc, questionID) => {
            // Get answers for questionID
            const answerOptions = groupedQuestions[questionID];

            answerOptions.forEach((q) => {
              if (q.value === 1) {
                acc[questionID] = {
                  id: q.answer_id,
                  solution: turndownService.turndown(getUtfFixed(q.solution)),
                  option: turndownService.turndown(getUtfFixed(q.answer))
                };
              }
            });

            return acc;
          }, {} as Record<string, QuestionAnswer>);

          return {
            ...section,
            questions: normalizedQuestions,
            answerMap
          };
        })
      );

      // Remove answerMap from sections
      const sectionsWithFetchedQuestions = _sectionsWithFetchedQuestions.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ answerMap, ...section }) => section
      );

      const answersGroupedBySection = _sectionsWithFetchedQuestions.map(
        ({ answerMap }) => answerMap
      );

      // Create subcollection with answers
      await Promise.all(
        answersGroupedBySection.map(async (answerMap, idx) => {
          await snap.ref.collection('sectionAnswers').doc(String(idx)).set(answerMap);
        })
      );

      // Update test with fetched questions
      await snap.ref.update({
        sectionQuestions: sectionsWithFetchedQuestions,
        processingStatus: TestProcessingStatus.PROCESSED
      });
      return true;
    } catch (error) {
      functions.logger.error('Error fetching questions from SQL DB', error);
      // Update test with status
      await snap.ref.update({
        processingStatus: TestProcessingStatus.FAILED
      });
      return false;
    }
  });
interface QuestionAnswer {
  id: number;
  solution: string;
  option: string;
}

export const fetchQuestionsFromSQLDB = <T>(questionIDs: number[]) =>
  new Promise<T[]>((resolve, reject) => {
    // fetch questions from sql db
    const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '0')
    });

    connection.connect();

    const query = `
    SELECT questions.id,questions.text,questions.resource,questions.qtype,questions.topic_id,
    answers.text AS answer,answers.id AS answer_id,answers.value,answers.solution 
    FROM questions,answers 
    WHERE questions.id IN (${questionIDs.join(',')})
    AND questions.id=answers.question_id`;

    connection.query(query, (err, results) => {
      if (err) {
        functions.logger.error('Error fetching questions from SQL DB', err);
        reject(err);
      }
      resolve(results);
      connection.end();
    });
  });

export function replaceLatexDelimiters(str: string) {
  return str.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
}

interface DBQuestion {
  id: number;
  text: string;
  resource: string;
  qtype: string;
  answer: string;
  answer_id: number;
  value: number;
  solution: string;
  topic_id: number;
}
