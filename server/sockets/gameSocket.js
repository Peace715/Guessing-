import GameSession from '../models/GameSession.js';
import User from '../models/User.js';

export default function gameSocket(io) {
  const nsp = io.of('/game');

  nsp.on('connection', (socket) => {
    console.log('✅ Player connected', socket.id);

    socket.on('join_session', async ({ code, user }, cb) => {
      try {
        const session = await GameSession.findOne({ code });
        if (!session) return cb({ error: 'Session not found' });
        if (session.isActive) return cb({ error: 'Game already started' });

        if (!session.players.find((p) => String(p.userId) === String(user._id))) {
          session.players.push({
            userId: user._id,
            username: user.username,
            attemptsLeft: 3,
          });
          await session.save();
        }

        socket.join(code);
        nsp.to(code).emit(
          'player_list',
          session.players.map((p) => ({
            username: p.username,
            score: p.score || 0,
            attemptsLeft: p.attemptsLeft,
          }))
        );

        cb({ ok: true, userId: user._id });
      } catch (err) {
        console.error('join_session error:', err);
        cb({ error: 'Internal server error' });
      }
    });

    socket.on('start_game', async ({ code }, cb) => {
      try {
        const session = await GameSession.findOne({ code });
        if (!session) return cb({ error: 'Session not found' });
        if (session.players.length < 3)
          return cb({ error: 'Need at least 3 players' });

        session.isActive = true;
        await session.save();

        nsp.to(code).emit('game_started', {
          question: session.question,
          maxTime: session.maxTime,
        });

        
        setTimeout(async () => {
          const s = await GameSession.findOne({ code });
          if (s && s.isActive && !s.winner) {
            s.isActive = false;
            await s.save();
            nsp.to(code).emit('time_up', { answer: s.answer });
          }
        }, session.maxTime * 1000);

        cb({ ok: true });
      } catch (err) {
        console.error('start_game error:', err);
        cb({ error: 'Internal server error' });
      }
    });

    socket.on('submit_guess', async ({ code, userId, guess }, cb) => {
      try {
        const s = await GameSession.findOne({ code });
        if (!s || !s.isActive) return cb({ error: 'No active game' });

        const p = s.players.find((x) => String(x.userId) === String(userId));
        if (!p) return cb({ error: 'Player not in session' });
        if (p.attemptsLeft <= 0) return cb({ error: 'No attempts left' });

        p.attemptsLeft -= 1;
        await s.save();

        nsp.to(code).emit('guess_made', {
          username: p.username,
          guess,
          attemptsLeft: p.attemptsLeft,
        });

        if (
          String(guess).trim().toLowerCase() ===
          String(s.answer).trim().toLowerCase()
        ) {
          s.winner = p.userId;
          s.isActive = false;
          await s.save();

          const winnerUser = await User.findById(p.userId);
          winnerUser.score += 10;
          await winnerUser.save();

          nsp.to(code).emit('player_won', {
            winner: p.username,
            answer: s.answer,
            score: winnerUser.score,
          });
        }

        cb({ ok: true });
      } catch (err) {
        console.error('submit_guess error:', err);
        cb({ error: 'Internal server error' });
      }
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected', socket.id);
    });
  });
}
