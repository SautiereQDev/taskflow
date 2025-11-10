import { execSync } from 'node:child_process';

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
 * Changelog Service
 *
 * Generates changelog from git commits using conventional commit format
 */
export class ChangelogService {
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
   * Get git commits
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
