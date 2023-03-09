import express from 'express';
import cors from 'cors';
import * as functions from 'firebase-functions';
import * as bodyParser from 'body-parser';

import { initRoutes } from './routes';
import { deserializeToken } from './middleware/deserializeToken';
import { errorHandlingMiddleware } from './middleware/errorHandler';

// Init root app and middleware
export const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(deserializeToken);

// Init routes
initRoutes(app);

app.use(errorHandlingMiddleware);

// Deploy express app as cloud function
export const onlineTestAPI = functions
  .runWith({
    minInstances: 1
  })
  .https.onRequest(app);

// Export triggers
export * from './triggers';

// Export callables
export * from './callables';
