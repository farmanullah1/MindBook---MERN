/**
 * CodeDNA
 * search.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { globalSearch } = require('../controllers/searchController');

router.get('/', auth, globalSearch);

module.exports = router;
