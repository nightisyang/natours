const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: { type: String, required: [true, 'Review cannot be empty!'] },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'A reivew must have ratings!']
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user']
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// QUERY MIDDLEWARE
reviewSchema.pre(/^find/, function(next) {
  // this is essentially two queries, hitting both user and tour collections
  //   this.populate({
  //     path: 'tour',
  //     select: 'name'
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo'
  //   });

  // don't need to populate information abour tours in review, especially when retrieving review about tours - don't need to have duplicate data
  // just having user data is sufficient
  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post('save', function() {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  // pre hooks only gets access to query, not to the review document - solution is just to find it again
  // save it back into the query object
  this.r = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne() does not work here, query has already executed
  // retrieve document back from query object to get tour id and access to calcAverageRatings method
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
