import express from 'express';
import { getAgents, getAgentSummary, createAgent, updateAgent, deleteAgent, getAgentsList } from '../controllers/agentController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/summary', getAgentSummary);
router.get('/list', getAgentsList);

router.route('/')
  .get(getAgents)
  .post(createAgent);

router.route('/:id')
  .put(updateAgent)
  .delete(deleteAgent);

export default router;