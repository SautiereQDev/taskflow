/**
 * Commitlint Configuration
 *
 * Enforces Conventional Commits specification
 * @see https://www.conventionalcommits.org/
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type enum - allowed commit types
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only changes
        'style', // Code style changes (formatting, missing semi colons, etc)
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'build', // Changes to build system or dependencies
        'ci', // CI/CD configuration changes
        'chore', // Other changes that don't modify src or test files
        'revert', // Reverts a previous commit
      ],
    ],
    // Scope enum - allowed scopes (optional, can be extended)
    'scope-enum': [
      2,
      'always',
      [
        'domain', // Domain layer
        'prisma', // Prisma/database
        'infra', // Infrastructure layer
        'app', // Application layer
        'api', // API/controllers
        'ui', // UI/views
        'auth', // Authentication
        'tasks', // Task features
        'users', // User features
        'i18n', // Internationalization
        'config', // Configuration
        'docker', // Docker setup
        'deps', // Dependencies
        'tests', // Testing
        'docs', // Documentation
      ],
    ],
    // Subject and body rules
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [2, 'always'],
    'header-max-length': [2, 'always', 100],
  },
};
