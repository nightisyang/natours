const Review = require('./../models/reviewModel');
// const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// exports.getReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findById(req.params.id);

//   if (!review) {
//     return next(new AppError('Review not found!', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: review
//   });
// });

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.deleteReivew = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.createReview = factory.createOne(Review);

// exports.createReview = catchAsync(async (req, res, next) => {
//   // Allow nested routes
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user.id;

//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     message: 'Review created!',
//     data: {
//       review: newReview
//     }
//   });
// });

// exports.updateReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   });

//   if (!review) {
//     return next(new AppError('No review found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     message: 'Review updated!',
//     data: {
//       review: review
//     }
//   });
// });

// exports.deleteReivew = catchAsync(async (req, res, next) => {
//   const review = await Review.findOneAndDelete(req.params.id);

//   if (!review) {
//     return next(new AppError('No review found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });
