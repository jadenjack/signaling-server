import { validatePayload } from './signaling_validations';
import { code } from './signaling_error';
import { findUsersInThisCallingAfterJoining } from './model/calling_service';

/**
 * ACCEPT 이벤트의 핸들러
 * Callee가 전화 요청에 수락한 직후 수행되며,
 * 해당 유저가 room에 참여하게된다.
 * 직후에 해당 유저를 제외한 나머지 유저들의 목록이
 * PARTICIPANTS 이벤트를 통해 전달된다.
 *
 * @param session
 * @returns {Function}
 */
const acceptFromCallee = session => async () => {
  const {
    user,
    room,
    socket,
  } = session;

  socket.join([room, `user:${user}`]);

  const users = await findUsersInThisCallingAfterJoining({
    roomId: room,
    userId: user,
  });

  const participantsPayload = {
    participants: users,
    length: users.length,
  };

  socket.emit('PARTICIPANTS', participantsPayload);
};

/**
 * OFFER 이벤트의 핸들러.
 *
 * @param session
 * @returns {Function}
 */
const offerFromCallee = session => (payload) => {
  validatePayload({
    payload,
    props: ['sdp', 'receiver'],
    options: { code: code.INVALID_OFFER_PAYLOAD },
  });

  const {
    sdp,
    receiver,
  } = payload;

  const {
    user: sender,
    socket,
  } = session;

  const relayOfferPayload = {
    sdp,
    sender,
  };

  socket.to(`user:${receiver}`).emit('RELAY_OFFER', relayOfferPayload);
};

/**
 * REJECT 이벤트 핸들러
 *
 * @param session
 * @returns {Function}
 */
const rejectFromCallee = session => (payload) => {
  validatePayload({
    payload,
    props: ['receiver'],
    options: { code: code.INVALID_REJECT_PAYLOAD },
  });

  const { receiver } = payload;

  const {
    user,
    socket,
  } = session;

  const notifyRejectPayload = {
    sender: user,
    receiver,
  };

  socket.to(`user:${receiver}`).emit('NOTIFY_REJECT', notifyRejectPayload);
};

/**
 * ANSWER 이벤트 핸들러
 *
 * @param session
 * @returns {Function}
 */
const answerFromClient = session => (payload) => {
  validatePayload({
    payload,
    props: ['sdp', 'receiver'],
    options: { code: code.INVALID_ANSWER_PAYLOAD },
  });

  const {
    sdp,
    receiver,
  } = payload;

  const {
    user,
    socket,
  } = session;

  const relayAnswerPayload = {
    sdp,
    sender: user,
  };

  socket.to(`user:${receiver}`).emit('RELAY_ANSWER', relayAnswerPayload);
};

/**
 * SEND_ICE_CANDIDATE 이벤트 핸들러
 *
 * @param session
 * @returns {Function}
 */
const iceCandidateFromClient = session => (payload) => {
  validatePayload({
    payload,
    props: ['iceCandidate', 'receiver'],
    options: { code: code.INVALID_SEND_ICE_CANDIDATE_PAYLOAD },
  });

  const {
    iceCandidate,
    receiver,
  } = payload;

  const {
    user,
    socket,
  } = session;

  const relayIceCandidatePayload = {
    iceCandidate,
    sender: user,
  };

  socket.to(`user:${receiver}`).emit('RELAY_ICE_CANDIDATE', relayIceCandidatePayload);
};

export {
  acceptFromCallee,
  offerFromCallee,
  rejectFromCallee,
  answerFromClient,
  iceCandidateFromClient,
};
