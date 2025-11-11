import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Git commit entry
 */
export interface IGitCommit {
  hash: string;
  shortHash: string;
  author: string;
  date: Date;
  message: string;
  type?: string;
  scope?: string;
  description?: string;
}

/**
 * Changelog version entry
 */
export interface IChangelogVersion {
  version: string;
  date?: string;
  sections: Map<string, IChangelogCommit[]>;
}

/**
 * Changelog commit entry
 */
export interface IChangelogCommit {
  type: string;
  scope?: string;
  description: string;
  hash?: string;
  breaking?: boolean;
}

/**
 * Changelog Service
 *
 * Generates and parses changelog from CHANGELOG.md file
 * The CHANGELOG.md is generated using conventional-changelog-cli
 */
export class ChangelogService {
  private readonly changelogPath = join(process.cwd(), 'CHANGELOG.md');

  /**
   * Generate CHANGELOG.md file using conventional-changelog-cli
   */
  generateChangelog(): void {
    try {
      // Generate changelog with all commits
      execSync('npx conventional-changelog -p angular -i CHANGELOG.md -s -r 0', {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
    } catch (error) {
      console.error('Error generating changelog:', error);
      throw new Error('Failed to generate changelog');
    }
  }

  /**
   * Parse CHANGELOG.md file
   */
  parseChangelog(): IChangelogVersion[] {
    if (!existsSync(this.changelogPath)) {
      return [];
    }

    try {
      const content = readFileSync(this.changelogPath, 'utf-8');
      const versions: IChangelogVersion[] = [];

      // Split by version headers (## x.x.x)
      const versionRegex = /^## (\d+\.\d+\.\d+)(?: \(([^)]+)\))?$/gm;
      const sections = content.split(versionRegex).filter((s) => s.trim());

      // Process versions (groups of 3: version, date, content)
      for (let i = 0; i < sections.length; i += 3) {
        const version = sections[i];
        const date = sections[i + 1];
        const versionContent = sections[i + 2];

        if (!versionContent) continue;

        const sectionMap = this.parseVersionCommits(versionContent);

        versions.push({
          version,
          date,
          sections: sectionMap,
        });
      }

      return versions;
    } catch (error) {
      console.error('Error parsing changelog:', error);
      return [];
    }
  }

  /**
   * Parse commits from a version section
   */
  private parseVersionCommits(versionContent: string): Map<string, IChangelogCommit[]> {
    const sectionMap = new Map<string, IChangelogCommit[]>();
    const lines = versionContent.split('\n');
    const commitRegex = /^\* (\w+)(?:\(([^)]+)\))?: (.+?)(?: ([a-f0-9]{7,}))?$/;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('*')) continue;

      const match = commitRegex.exec(trimmed);

      if (match) {
        const [, type, scope, description, hash] = match;
        const commitType = type ?? 'other';

        if (!sectionMap.has(commitType)) {
          sectionMap.set(commitType, []);
        }

        sectionMap.get(commitType)!.push({
          type: commitType,
          scope,
          description: description.trim(),
          hash,
        });
      }
    }

    return sectionMap;
  }

  /**
   * Parse conventional commit message
   * Format: type(scope): description
   */
  private parseCommitMessage(message: string): {
    type?: string;
    scope?: string;
    description: string;
  } {
    const conventionalCommitRegex = /^(\w+)(?:\(([^)]+)\))?: (.+)$/;
    const match = conventionalCommitRegex.exec(message);

    if (match) {
      return {
        type: match[1],
        scope: match[2],
        description: match[3],
      };
    }

    return {
      description: message,
    };
  }

  /**
   * Get git commits (fallback if CHANGELOG.md doesn't exist)
   */
  getCommits(limit = 100): IGitCommit[] {
    try {
      // Git log format: hash|author|date|message
      const format = '%H|%an|%aI|%s';
      const command = `git log --pretty=format:"${format}" -n ${limit}`;

      const output = execSync(command, {
        encoding: 'utf-8',
        cwd: process.cwd(),
      });

      const commits = output
        .trim()
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => {
          const [hash, author, date, ...messageParts] = line.split('|');
          const message = messageParts.join('|'); // In case message contains |

          const parsed = this.parseCommitMessage(message);

          return {
            hash,
            shortHash: hash.substring(0, 7),
            author,
            date: new Date(date),
            message,
            ...parsed,
          };
        });

      return commits;
    } catch (error) {
      console.error('Error fetching git commits:', error);
      return [];
    }
  }

  /**
   * Group commits by type
   */
  groupCommitsByType(commits: IGitCommit[]): Map<string, IGitCommit[]> {
    const grouped = new Map<string, IGitCommit[]>();

    for (const commit of commits) {
      const type = commit.type ?? 'other';
      if (!grouped.has(type)) {
        grouped.set(type, []);
      }
      grouped.get(type)!.push(commit);
    }

    return grouped;
  }

  /**
   * Get commit type label
   */
  getTypeLabel(type: string): { label: string; icon: string; color: string } {
    const types: Record<string, { label: string; icon: string; color: string }> = {
      feat: { label: 'Features', icon: '✨', color: 'badge-primary' },
      fix: { label: 'Bug Fixes', icon: '🐛', color: 'badge-error' },
      docs: { label: 'Documentation', icon: '📝', color: 'badge-info' },
      style: { label: 'Styles', icon: '💎', color: 'badge-secondary' },
      refactor: { label: 'Code Refactoring', icon: '♻️', color: 'badge-accent' },
      perf: { label: 'Performance', icon: '⚡', color: 'badge-warning' },
      test: { label: 'Tests', icon: '✅', color: 'badge-success' },
      build: { label: 'Build System', icon: '🔧', color: 'badge-neutral' },
      ci: { label: 'CI/CD', icon: '🚀', color: 'badge-neutral' },
      chore: { label: 'Chores', icon: '🔨', color: 'badge-ghost' },
      revert: { label: 'Reverts', icon: '⏪', color: 'badge-warning' },
      other: { label: 'Other Changes', icon: '📦', color: 'badge-ghost' },
    };

    return types[type] ?? types.other;
  }
}
