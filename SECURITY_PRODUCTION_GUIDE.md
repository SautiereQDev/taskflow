# Production Security Guide

## Environment Setup

### 1. Generate Production Secrets

Use the provided script to generate cryptographically secure secrets:

```bash
node scripts/generate-secrets.js > .env.production
```

This creates:
- Strong SESSION_SECRET (64+ characters)
- Secure JWT_SECRET (64+ characters)
- Random database passwords
- Production-optimized settings

### 2. Environment Variables

Copy `.env.production.example` to `.env.production` and configure:

```bash
# Required for production
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"
SESSION_SECRET="your-64-char-secret-here"
JWT_SECRET="your-64-char-jwt-secret-here"

# Security settings
ENABLE_HSTS=true
LOG_LEVEL=warn
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Database Security

- Use managed PostgreSQL (AWS RDS, Google Cloud SQL, Azure Database)
- Enable SSL connections (`sslmode=require`)
- Use strong, unique passwords
- Restrict database access to application servers only

## Docker Production Deployment

### Secure Docker Compose

For production, create `docker-compose.prod.yml`:

```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - SESSION_SECRET=${SESSION_SECRET}
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=${DATABASE_URL}
    env_file:
      - .env.production  # Load from file, not compose
```

### Build Optimization

```dockerfile
# Use multi-stage build for smaller images
FROM node:24.9-alpine AS builder
# Build stage...

FROM node:24.9-alpine AS production
# Only copy necessary files
# No dev dependencies
```

## Security Headers & Features

### Already Implemented ✅

- **Helmet**: Comprehensive security headers
- **Rate Limiting**: Global (100/15min), Auth (5/15min), API (50/15min)
- **CSRF Protection**: SameSite cookies
- **CORS**: Configured for production origins
- **Input Validation**: XSS prevention, length limits
- **Secure Logging**: Sensitive data masking
- **HSTS**: Force HTTPS in production
- **Content Security Policy**: Restricts resource loading

### Additional Recommendations

1. **SSL/TLS Certificate**
   - Use Let's Encrypt or commercial certificates
   - Configure reverse proxy (nginx) for SSL termination

2. **Reverse Proxy Configuration**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;

       # SSL configuration
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       # Security headers
       add_header X-Frame-Options DENY;
       add_header X-Content-Type-Options nosniff;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Monitoring & Logging**
   - Set up centralized logging (ELK stack, CloudWatch)
   - Monitor for security events
   - Regular log analysis

4. **Dependency Security**
   ```bash
   npm audit
   npm audit fix
   # Use tools like Snyk or Dependabot
   ```

## Testing Security

### Automated Security Tests

Run security tests before deployment:

```bash
# Run all tests including security
npm test

# Check for vulnerabilities
npm audit --audit-level=moderate

# Security headers check (use online tools)
# https://securityheaders.com
# https://observatory.mozilla.org
```

### Penetration Testing

Consider professional security assessment:
- OWASP ZAP scanning
- Burp Suite testing
- Manual security review

## Incident Response

### Security Breach Procedure

1. **Immediate Actions**
   - Rotate all secrets (SESSION_SECRET, JWT_SECRET, DB passwords)
   - Change database credentials
   - Review access logs for suspicious activity

2. **Investigation**
   - Analyze logs for breach indicators
   - Check for unauthorized data access
   - Review recent code changes

3. **Recovery**
   - Deploy security patches
   - Restore from clean backups
   - Notify affected users if necessary

## Maintenance

### Regular Security Tasks

- **Weekly**: Review npm audit reports
- **Monthly**: Update dependencies
- **Quarterly**: Security headers testing
- **Annually**: Full security assessment

### Monitoring

Set up alerts for:
- Failed login attempts
- Rate limit violations
- Unusual traffic patterns
- Security header violations

## Compliance

Depending on your use case:
- **GDPR**: Data protection compliance
- **SOC 2**: Security controls
- **ISO 27001**: Information security management

---

## Quick Production Checklist

- [ ] `.env.production` configured with strong secrets
- [ ] SSL certificate installed
- [ ] Database SSL enabled
- [ ] Rate limiting configured
- [ ] Security headers tested
- [ ] Dependencies audited
- [ ] Monitoring set up
- [ ] Backup strategy in place