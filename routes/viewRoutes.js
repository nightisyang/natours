const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/account', authController.protect, viewController.getAccount);

// middleware to determine if user is logged in - user object placed in res.locals.user
router.use(authController.isLoggedIn);

router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.loginPage);
router.get('/signup', viewController.signUpPage);
router.post('/submit-user-data', viewController.updateUserData);

module.exports = router;
