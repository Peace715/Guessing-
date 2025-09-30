import GameSession from '../models/GameSession.js';
import shortid from 'shortid';

export const createSession = async (req, res) => {
  try {
    const code = shortid.generate();
    const session = new GameSession({
      code,
      players: [],
      question: null,
      answer: null,
      isActive: false,
      winner: null
    });

    await session.save();

    return res.status(201).json({
      message: 'Session created successfully',
      code
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

export const getSession = async (req, res) => {
  try {
    const { code } = req.params;
    const session = await GameSession.findOne({ code });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};
