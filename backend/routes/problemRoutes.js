const express = require('express');
const router = express.Router();

const {
  getProblems,
  getDueProblems,
  addProblem,
  updateProblem,
  deleteProblem,
  reviewProblem
} = require('../controllers/problemController');

router.route('/').get(getProblems).post(addProblem);
router.get('/due', getDueProblems);
router.route('/:id')
  .put(updateProblem)
  .delete(deleteProblem);
router.post('/:id/review', reviewProblem);

module.exports = router;

