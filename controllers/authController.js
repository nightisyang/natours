const crypto = require('crypto');
const { promisify } = require('util');

const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSentToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true,
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // remove password from the output
  user.password = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: { user }
  });
};

exports.signup = catchAsync(async function(req, res, next) {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  createSentToken(newUser, 201, res);
});

exports.login = catchAsync(async function(req, res, next) {
  const { email, password } = req.body;

  // email and password exist
  if (!email || !password) {
    const message = 'Please enter both email and password!';
    return next(new AppError(message, 400));
  }

  // check if user exist && password is correct
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email and password', 401));
  }

  // if everything is ok, send token to client
  createSentToken(user, 200, res);
});

exports.logout = (req, res) => {
  // sending the same jwt token back with a short expiration 10ms
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success'
  });
};

exports.protect = catchAsync(async function(req, res, next) {
  let token;
  // Getting token and check if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  //   console.log(token);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access', 401)
    );
  }
  // Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // console.log(decoded);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return next(new AppError('User no longer exist', 401));

  // Check if user changed password after the token was issued at
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password! Please log in with the updated password',
        401
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ["admin", "lead-guide"] role = "user"
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not ahve permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  // Generate random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passworkConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 mins)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired!', 400));
  }

  // Set the new password, only if token has not expired and user is valid, set new password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // Update changedPasswordAt property for the current user
  //   user.changedPasswordAfter = Date.now();

  // Log the user in, send JWT
  createSentToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from collection

  // Getting token and check if it's there

  //   const decoded = promisify(jwt.verify)((token, process.env.JWT_SECRET));

  const user = await User.findById(req.user.id).select('+password');

  // check if POSTED current password is correct
  if (
    !(await user.correctPassword(req.body.passwordCurrent, user.password))
    // !user.changedPasswordAfter(decoded.iat)
  )
    return next(
      new AppError('Password is incorrect, please enter a valid password!', 401)
    );

  // if password is corect, update password

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();

  // log user in, send JWT (with new password)

  createSentToken(user, 200, res);
});

// Only for rendered pages, there will be no error
exports.isLoggedIn = async function(req, res, next) {
  if (req.cookies.jwt) {
    try {
      // Getting token and check if it's there
      const token = req.cookies.jwt;

      // Verification of token
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      // Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      // Check if user changed password after the token was issued at
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      // pug has access to res.locals - passing data through response object
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      next();
    }
  }
  next();
};
