# GitHub Issue Creator

## Quick Setup

### 1. Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens/new
2. Note: `GetGood Issue Creator`
3. Expiration: `30 days` (or longer)
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)

### 2. Run the Script

**Windows (PowerShell):**
```powershell
cd C:\Users\Kevin\.claude\projects\GetGood
$env:GITHUB_TOKEN="your_token_here"
node scripts/create-issues.js
```

**Windows (CMD):**
```cmd
cd C:\Users\Kevin\.claude\projects\GetGood
set GITHUB_TOKEN=your_token_here
node scripts/create-issues.js
```

**Git Bash:**
```bash
cd /c/Users/Kevin/.claude/projects/GetGood
GITHUB_TOKEN=your_token_here node scripts/create-issues.js
```

## What It Does

The script will:
1. Create 20 labels (phase-1, phase-2, module, etc.)
2. Create 25 issues from PROJECT_BOARD.md
3. Close issue #1 (already completed)
4. Rate limit properly (1 second between requests)

## Output

You'll see:
```
======================================
GetGood - GitHub Issue Creator
======================================

Creating labels...
  ✓ Created label: documentation
  ✓ Created label: setup
  ...

Creating issues...
  [1/25] Creating: Project Setup & Documentation
    ✓ Created #1
    ✓ Closed #1
  [2/25] Creating: Account Monitor Module
    ✓ Created #2
  ...

======================================
Summary:
  Created: 25 issues
  Failed:  0 issues
======================================

✓ All issues created successfully!

View them at: https://github.com/ollyp2/GetGood/issues
```

## Troubleshooting

**Error: GITHUB_TOKEN not set**
- You forgot to set the environment variable
- Make sure there are no spaces around the `=`

**Error: 401 Unauthorized**
- Your token is invalid or expired
- Create a new token with `repo` scope

**Error: 403 Forbidden**
- Your token doesn't have the right permissions
- Make sure `repo` scope is checked

**Error: API rate limit**
- Wait an hour or use a different token
- The script already has 1s delays between requests
