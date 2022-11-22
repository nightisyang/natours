const express = require('express');

const router = express.Router({ mergeParams: true });

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

router.use(authController.protect);

// get all reviews and create
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user', 'admin'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

// get specific review, update and delete
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReivew
  );

module.exports = router;
