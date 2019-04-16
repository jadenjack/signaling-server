import Server from './server';
import logger from './logger';
import {
    createRoom, createRoomErrorHandler, dialToCallee, accept, awaken, created, sendAnswer, sendIceCandidate,
} from './boyj/session_control_events';

const server = new Server({ port: 3000 });

server
  .setCreateSession(defaultSession => defaultSession)
  .setHookAfterSessionCreation(() => {})
  .setHookAfterSocketInitialization(() => {})
  .on('dummyEvent', session => (payload) => {
    logger.info(`${session}: ${payload}`);
    throw new Error('This is test error');
  }, (err, { session, payload }) => {
    logger.info(`${err}, ${session}, ${payload}`);
    throw err;
  })
  .on('errorEvent', () => () => {
    throw new Error('This is error in errorEvent');
  })
  .on('createRoom', createRoom, createRoomErrorHandler)
  .on('dialToCallee', dialToCallee)
  .on('accept', accept)
  .on('created', created)
  .on('awaken', awaken)
  .on('sendAnswer', sendAnswer)
  .on('sendIceCandidate', sendIceCandidate)
  .start();
