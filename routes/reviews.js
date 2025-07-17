const express = require('express');
const router = express.Router({ mergeParams: true});

const joiSchemas = require('../joiSchemas');
const reviewController = require('../controllers/reviews');
const customError = require('../utils/customError');
const { isLoggedIn, isReviewAuthor } = require('../checkLogin');

// Function for validating newly added reviews
const validateReview = (req, res, next) => {
    // Schema for validating form body
    const reviewSchema = joiSchemas.reviewSchema;
    // Error handling if form input incorrect
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const message = error.details.map(elem => elem.message).join(', ');
        throw new customError(message, 400);
    } else {
        next();
    }
};

// Route for adding a review
router.post('/', isLoggedIn, validateReview, reviewController.create);

// Route for deleting a review
router.delete('/:reviewId', isReviewAuthor, reviewController.delete);

module.exports = router;