const { async } = require('regenerator-runtime');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // Get tour data from collection
  const tours = await Tour.find();

  // Build template

  // Render that template using tour data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // Get the data for the requested tour (including reviews and guides)

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('This tour does not exist!', 404));
  }

  // Build template

  // Render template using data

  res.status(200).render('tour', {
    title: tour.name,
    tour
  });
});

exports.loginPage = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
});

exports.signUpPage = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Sign up'
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  const { user } = req;
  res.status(200).render('account', {
    title: 'Account Details',
    user
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    // new get updated document
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return next(new AppError('', 404));
  }

  res.status(200).render('account', {
    title: 'Account Details',
    user: updatedUser
  });
});
