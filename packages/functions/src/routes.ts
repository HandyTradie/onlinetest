import { Express } from 'express';
import {
  addParticipantsToTestHandler,
  resendParticipantInviteHandler,
  sendParticipantResultsHandler
} from './handlers/participants';

import { createOnlineTestFromMockHandler } from './handlers/tests.handler';
import { requiresAuth } from './middleware/requiresAuth';
import { validate } from './middleware/validate';
import {
  addParticipantsToTestSchema,
  resendParticipantInviteSchema,
  sendParticipantResultsSchema
} from './validators/participants';
import { createOnlineTestFromMockSchema } from './validators/tests';
import timeSyncServer from 'timesync/server';

export const initRoutes = (app: Express) => {
  app.post(
    '/create-test',
    requiresAuth,
    validate(createOnlineTestFromMockSchema),
    createOnlineTestFromMockHandler
  );

  app.post(
    '/add-participants/:testID',
    requiresAuth,
    validate(addParticipantsToTestSchema),
    addParticipantsToTestHandler
  );

  app.post(
    '/resend-invite/',
    requiresAuth,
    validate(resendParticipantInviteSchema),
    resendParticipantInviteHandler
  );

  app.post(
    '/send-results/',
    requiresAuth,
    validate(sendParticipantResultsSchema),
    sendParticipantResultsHandler
  );

  app.use('/timesync', timeSyncServer.requestHandler);
};
