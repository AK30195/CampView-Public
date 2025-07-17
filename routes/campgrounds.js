const express = require('express');
const router = express.Router();

const multer  = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })
const joiSchemas = require('../joiSchemas');
const campController = require('../controllers/campgrounds');
const customError = require('../utils/customError');
const { isLoggedIn, isAuthor } = require('../checkLogin');

// Function for validating newly added or edited campgrounds
const validateCampground = (req, res, next) => {
    // Schema for validating form body
    const campSchema = joiSchemas.campSchema;
    // Error handling if form input incorrect
    const { error } = campSchema.validate(req.body);
    if (error) {
        const message = error.details.map(elem => elem.message).join(', ');
        throw new customError(message, 400);
    } else {
        next();
    }
};

// Route for index of campgrounds
router.get('/', campController.index);

// Get route to create new campground
router.get('/new', isLoggedIn, campController.renderNewForm);

// Post route to create new campground
router.post('/', isLoggedIn, upload.array('image'), validateCampground, campController.create);

// Route to show individual campgrounds
router.get('/:id', campController.showCampground);

// Route to edit page
router.get('/:id/edit', isLoggedIn, isAuthor, campController.renderEditForm);

// Put route to update campground after editing
router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, campController.update);

// Delete route for removing campground
router.delete('/:id', isLoggedIn, isAuthor, campController.delete);

module.exports = router;