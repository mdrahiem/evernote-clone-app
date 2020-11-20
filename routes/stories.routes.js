const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');

const Story = require('../models/Story');


// @desc    Add Story
// @route   GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
    res.render('story/addStory')
})

// @desc    process add form
// @route   POST /stories
router.post('/', ensureAuth, (req, res) => {
    try {
        req.body.user = req.user.id;
        Story.create(req.body);
        res.redirect('/dashboard')
    } catch(err) {
        console.log(err);
        res.render('error/500')
    }
})

// @desc    show all stories
// @route   GET /stories
router.get('/', async (req, res) => {
    try {
        const stories = await Story.find({ status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean();

        res.render('story/index', {
            stories
        })
    } catch(err) {
        console.log(err);
        res.render('error/404');
    }
})

// @desc    Edit story
// @route   GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const story = await Story.findOne({ _id: req.params.id }).lean()
        if (!story) {
            return res.render('error/404');
        }
        if (story.user.toString() !== req.user.id.toString()) {
            res.redirect('/stories')
        } else {
            res.render('story/editStory', {
                story
            })
        }
    } catch(err) {
        return res.render('error/500')
    }
 })

// @desc    update Story
// @route   GET /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean()

        if(!story) {
            return res.render('error/404');
        }
        if (story.user.toString() !== req.user.id.toString()) {
            res.redirect('/stories')
        } else {
            story = await Story.findOneAndUpdate({ _id: req.params.id}, req.body, {
                new: true,
                runValidators: true
            })
            res.redirect('/dashboard')
        }
    } catch(err) {
        console.log(err);
        return res.render('error/500')
    }
})

// @desc    delete Story
// @route   GET /stories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Story.remove({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch(err) {
        console.log(err);
        return res.render('error/500')
    }
});

// @desc    story details
// @route   GET /stories/:id
router.get('/:id', async (req, res) => {
    try {
        const story = await Story.findOne({ _id: req.params.id }).populate('user').lean();
        res.render('story/storyDetails', {
            story
        })
    } catch(err) {
        res.render('error/404')
    }
})

// @desc    user stories
// @route   GET /stories/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const stories = await Story.find({
            user: req.params.userId,
            status: 'public'
        })
        .populate('user')
        .lean();
        res.render('story/index', {
            stories
        })
    } catch(err) {
        res.render('error/404')
    }
})

module.exports = router