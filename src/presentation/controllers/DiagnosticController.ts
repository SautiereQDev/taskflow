import type { Request, Response } from 'express';
import { existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import type { IDiagnosticViewModel } from '@shared-types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

/**
 * Diagnostic Controller
 *
 * Provides comprehensive health checks and diagnostic information
 * about the application's frontend and backend components.
 */
export class DiagnosticController {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * GET /diagnostic
   *
   * Displays a comprehensive diagnostic page with all system checks
   */
  async getDiagnosticPage(req: Request, res: Response): Promise<void> {
    const checks = await this.runAllChecks();

    const viewData: IDiagnosticViewModel = {
      title: 'System Diagnostic',
      checks,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
      database: {
        status:
          checks.find((c) => c.name === 'Database Connection')?.status === 'pass'
            ? 'connected'
            : 'disconnected',
        message: checks.find((c) => c.name === 'Database Connection')?.message,
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
      },
    };

    res.render('pages/diagnostic', viewData);
  }

  /**
   * GET /diagnostic/json
   *
   * Returns diagnostic information as JSON (for scripts)
   */
  async getDiagnosticJson(_req: Request, res: Response): Promise<void> {
    const checks = await this.runAllChecks();

    const allPassed = checks.every((check) => check.status === 'pass');

    res.status(allPassed ? 200 : 500).json({
      status: allPassed ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
      checks,
    });
  }

  /**
   * Run all diagnostic checks
   */
  private async runAllChecks(): Promise<IDiagnosticCheck[]> {
    const checks: IDiagnosticCheck[] = [];

    // 1. Database connectivity
    checks.push(await this.checkDatabase());

    // 2. CSS files
    checks.push(await this.checkCssFiles());

    // 3. JavaScript files
    checks.push(this.checkJsFiles());

    // 4. EJS templates
    checks.push(this.checkEjsTemplates());

    // 5. Static file serving
    checks.push(this.checkStaticFiles());

    // 6. Environment configuration
    checks.push(this.checkEnvironment());

    // 7. Node.js version
    checks.push(this.checkNodeVersion());

    return checks;
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<IDiagnosticCheck> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        name: 'Database Connection',
        status: 'pass',
        message: 'PostgreSQL database is connected and responding',
        details: {
          url: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') ?? 'Not configured',
        },
      };
    } catch (error) {
      return {
        name: 'Database Connection',
        status: 'fail',
        message: 'Failed to connect to database',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Check CSS files existence and size
   */
  private async checkCssFiles(): Promise<IDiagnosticCheck> {
    const cssPath = join(process.cwd(), 'public/css/output.css');

    try {
      if (!existsSync(cssPath)) {
        return {
          name: 'CSS Files',
          status: 'fail',
          message: 'CSS output file not found',
          details: {
            path: cssPath,
            fix: 'Run: npm run css:build',
          },
        };
      }

      const stats = await stat(cssPath);
      const sizeKB = (stats.size / 1024).toFixed(2);

      if (stats.size < 10000) {
        return {
          name: 'CSS Files',
          status: 'warn',
          message: 'CSS file is suspiciously small',
          details: {
            path: cssPath,
            size: `${sizeKB} KB`,
            fix: 'Run: npm run css:build',
          },
        };
      }

      return {
        name: 'CSS Files',
        status: 'pass',
        message: 'CSS files are generated and ready',
        details: {
          path: cssPath,
          size: `${sizeKB} KB`,
        },
      };
    } catch (error) {
      return {
        name: 'CSS Files',
        status: 'fail',
        message: 'Error checking CSS files',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Check JavaScript files
   */
  private checkJsFiles(): IDiagnosticCheck {
    const jsFiles = ['public/js/alpine-components.js', 'public/js/theme-init.js'];

    const missingFiles: string[] = [];
    const existingFiles: string[] = [];

    for (const file of jsFiles) {
      const filePath = join(process.cwd(), file);
      if (existsSync(filePath)) {
        existingFiles.push(file);
      } else {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      return {
        name: 'JavaScript Files',
        status: 'fail',
        message: `${missingFiles.length} JavaScript file(s) missing`,
        details: {
          missing: missingFiles,
          existing: existingFiles,
        },
      };
    }

    return {
      name: 'JavaScript Files',
      status: 'pass',
      message: 'All JavaScript files present',
      details: {
        files: existingFiles,
      },
    };
  }

  /**
   * Check EJS templates
   */
  private checkEjsTemplates(): IDiagnosticCheck {
    const criticalTemplates = [
      'views/layouts/main.ejs',
      'views/partials/head.ejs',
      'views/partials/header.ejs',
      'views/partials/footer.ejs',
      'views/pages/tasks/list.ejs',
    ];

    const missingTemplates: string[] = [];
    const existingTemplates: string[] = [];

    for (const template of criticalTemplates) {
      const templatePath = join(process.cwd(), template);
      if (existsSync(templatePath)) {
        existingTemplates.push(template);
      } else {
        missingTemplates.push(template);
      }
    }

    if (missingTemplates.length > 0) {
      return {
        name: 'EJS Templates',
        status: 'fail',
        message: `${missingTemplates.length} critical template(s) missing`,
        details: {
          missing: missingTemplates,
          existing: existingTemplates,
        },
      };
    }

    return {
      name: 'EJS Templates',
      status: 'pass',
      message: 'All critical EJS templates present',
      details: {
        count: existingTemplates.length,
      },
    };
  }

  /**
   * Check static files serving
   */
  private checkStaticFiles(): IDiagnosticCheck {
    const publicDir = join(process.cwd(), 'public');

    if (!existsSync(publicDir)) {
      return {
        name: 'Static Files',
        status: 'fail',
        message: 'Public directory not found',
        details: {
          path: publicDir,
        },
      };
    }

    return {
      name: 'Static Files',
      status: 'pass',
      message: 'Public directory exists',
      details: {
        path: publicDir,
        accessible: 'http://localhost:3001/css/output.css',
      },
    };
  }

  /**
   * Check environment configuration
   */
  private checkEnvironment(): IDiagnosticCheck {
    const requiredVars = ['DATABASE_URL', 'SESSION_SECRET', 'NODE_ENV'];
    const missingVars: string[] = [];
    const configuredVars: string[] = [];

    for (const varName of requiredVars) {
      if (process.env[varName]) {
        configuredVars.push(varName);
      } else {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      return {
        name: 'Environment Variables',
        status: 'warn',
        message: `${missingVars.length} environment variable(s) not configured`,
        details: {
          missing: missingVars,
          configured: configuredVars,
        },
      };
    }

    return {
      name: 'Environment Variables',
      status: 'pass',
      message: 'All required environment variables configured',
      details: {
        port: process.env.PORT ?? '3001',
        host: process.env.HOST ?? 'localhost',
        nodeEnv: process.env.NODE_ENV ?? 'development',
      },
    };
  }

  /**
   * Check Node.js version
   */
  private checkNodeVersion(): IDiagnosticCheck {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0], 10);

    if (major < 20) {
      return {
        name: 'Node.js Version',
        status: 'warn',
        message: 'Node.js version is below recommended (v20+)',
        details: {
          current: version,
          recommended: 'v24.9.0+',
        },
      };
    }

    return {
      name: 'Node.js Version',
      status: 'pass',
      message: 'Node.js version is compatible',
      details: {
        version,
      },
    };
  }
}

/**
 * Diagnostic Check Result
 */
interface IDiagnosticCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: Record<string, unknown>;
}
