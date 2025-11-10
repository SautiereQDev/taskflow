/**
 * Pages Controller
 *
 * Handles static and informational pages (about, FAQ, licenses, changelog, contact)
 */

import type { Request, Response } from 'express';
import { ChangelogService } from '../../application/services/ChangelogService.js';

export class PagesController {
  private readonly changelogService: ChangelogService;

  constructor() {
    this.changelogService = new ChangelogService();
  }

  /**
   * Show About page
   */
  getAbout(req: Request, res: Response): void {
    res.render('pages/about', {
      title: 'About - TaskFlow',
      user: (req as { user?: unknown }).user,
      locale: req.session.locale ?? 'fr',
    });
  }

  /**
   * Show FAQ page
   */
  getFaq(req: Request, res: Response): void {
    res.render('pages/faq', {
      title: 'FAQ - TaskFlow',
      user: (req as { user?: unknown }).user,
      locale: req.session.locale ?? 'fr',
    });
  }

  /**
   * Show Licenses page
   */
  getLicenses(req: Request, res: Response): void {
    res.render('pages/licenses', {
      title: 'Licenses - TaskFlow',
      user: (req as { user?: unknown }).user,
      locale: req.session.locale ?? 'fr',
    });
  }

  /**
   * Show Changelog page
   */
  getChangelog(req: Request, res: Response): void {
    const commits = this.changelogService.getCommits(100);
    const groupedCommits = this.changelogService.groupCommitsByType(commits);

    // Get unique authors
    const authors = new Set(commits.map((c) => c.author));

    // Get type labels for rendering
    const typeLabels = new Map<string, { label: string; icon: string; color: string }>();
    for (const type of groupedCommits.keys()) {
      typeLabels.set(type, this.changelogService.getTypeLabel(type));
    }

    res.render('pages/changelog', {
      title: 'Changelog - TaskFlow',
      user: (req as { user?: unknown }).user,
      locale: req.session.locale ?? 'fr',
      commits,
      groupedCommits,
      authors,
      typeLabels,
    });
  }

  /**
   * Show Contact page (placeholder - redirect to FAQ for now)
   */
  getContact(_req: Request, res: Response): void {
    res.redirect('/faq');
  }
}
