# Security Guidelines

## 🔐 API Keys and Secrets Management

### Never Commit Secrets
This project uses a comprehensive `.gitignore` file to prevent accidentally committing sensitive information. The following types of files are automatically ignored:

- `.env` files (except `.env.example` files)
- API keys and credentials
- Database connection strings
- Service account files
- Private keys and certificates

### Environment Variables Setup

#### Backend Environment Variables
Copy the example file and add your actual values:
```bash
cp backend/.env.example backend/.env
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key (server-side only)

#### Frontend Environment Variables
Copy the example file for production:
```bash
cp frontend/.env.production.example frontend/.env.production
```

### OpenAI API Keys
This application requires users to provide their own OpenAI API keys for AI features:

1. Users configure their API keys through the application UI
2. Keys are stored in browser session storage (not persistent)
3. Keys are transmitted securely via HTTPS
4. Keys are never stored on the server

### Database Security
- All database operations use Supabase Row Level Security (RLS)
- User authentication is handled by Supabase Auth
- API endpoints require proper authentication

### Deployment Security

#### Production Environment
- Use environment variables for all secrets
- Never hardcode API keys in source code
- Use HTTPS in production
- Set proper CORS policies

#### Docker Security
- Secrets are passed via environment variables
- Production Dockerfiles exclude development files
- Multi-stage builds reduce attack surface

### Security Checklist

Before deploying:
- [ ] All `.env` files are listed in `.gitignore`
- [ ] No hardcoded secrets in source code
- [ ] HTTPS is configured
- [ ] Database RLS policies are enabled
- [ ] Authentication is properly implemented
- [ ] CORS is configured correctly

### Reporting Security Issues
If you discover a security vulnerability, please report it privately to the project maintainers.

## 🚫 What NOT to do

❌ **Never commit these files:**
- `.env`
- `config.json` with secrets
- API key files
- Database credentials
- Private keys or certificates

❌ **Never hardcode secrets in source code:**
```javascript
// DON'T DO THIS
const apiKey = "sk-1234567890abcdef";

// DO THIS INSTEAD
const apiKey = process.env.OPENAI_API_KEY;
```

❌ **Never share sensitive environment files:**
- Don't send `.env` files via email or chat
- Don't store them in shared folders
- Don't commit them to version control

## ✅ Best Practices

✅ **Use environment variables:**
```javascript
const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
};
```

✅ **Validate environment variables:**
```javascript
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL environment variable is required');
}
```

✅ **Use example files for documentation:**
```bash
# .env.example
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_anon_key_here
```

✅ **Implement proper error handling:**
```javascript
// Don't expose sensitive information in error messages
catch (error) {
  console.error('Database connection failed');
  res.status(500).json({ error: 'Internal server error' });
}
```