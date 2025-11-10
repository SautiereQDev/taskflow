/**
 * Pages Routes
 *
 * Routes for static/informational pages
 */

import { Router } from 'express';
import { PagesController } from '../controllers/pages.controller.js';
import { attachUser } from '../middleware/authentication.middleware.js';

const router = Router();
const pagesController = new PagesController();

// All pages are public but should attach user if logged in
router.use(attachUser);

/**
 * About page
 */
router.get('/about', (req, res) => {
  pagesController.getAbout(req, res);
});

/**
 * FAQ page
 */
router.get('/faq', (req, res) => {
  pagesController.getFaq(req, res);
});

/**
 * Licenses page
 */
router.get('/licenses', (req, res) => {
  pagesController.getLicenses(req, res);
});

/**
 * Changelog page
 */
router.get('/changelog', (req, res) => {
  pagesController.getChangelog(req, res);
});

/**
 * Contact page (redirects to FAQ)
 */
router.get('/contact', (req, res) => {
  pagesController.getContact(req, res);
});

export default router;
