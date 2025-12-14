# Case Clicker Orchestrator

Node.js orchestrator for automating case-clicker.com accounts from creation to Global rank.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Account
Edit `config/accounts.json` with your test account credentials:
```json
{
  "accounts": [
    {
      "id": "acc_001",
      "username": "your_username",
      "password": "your_password",
      "sessionToken": ""
    }
  ]
}
```

### 3. Run Orchestrator
```bash
npm start acc_001
```

Or with auto-reload during development:
```bash
npm run dev acc_001
```

## Architecture

```
orchestrator/
├── src/
│   ├── core/              # Core infrastructure
│   │   ├── apiClient.js       # case-clicker.com API wrapper
│   │   ├── accountManager.js  # Account state management
│   │   ├── stateManager.js    # Persistent state (LowDB)
│   │   ├── logger.js          # Winston logger
│   │   └── config.js          # Configuration loader
│   │
│   ├── modules/           # Automation modules
│   │   ├── clickFarmer.js     # Phase 1: Click freeze
│   │   ├── caseOpener.js      # Buy & open cases
│   │   ├── missionSystem.js   # Mission evaluator & completer
│   │   ├── rewardCollector.js # Collect rewards tab
│   │   ├── skillmapManager.js # Skillmap progression
│   │   └── inventoryScanner.js# Inventory scanning
│   │
│   ├── phases/            # Phase coordinators
│   │   ├── phase1.js          # Click freeze (2 days)
│   │   ├── phase2.js          # Level to MG1
│   │   └── phase3.js          # Level to Global
│   │
│   ├── orchestrator.js    # Main state machine
│   └── index.js           # Entry point
│
├── config/                # Configuration files
│   ├── accounts.json      # Account credentials
│   └── settings.json      # Global settings
│
├── db/                    # State database
│   └── state.json         # LowDB state file
│
└── logs/                  # Log files
    └── orchestrator.log   # Winston logs
```

## Automation Flow

### Phase 1: Click Freeze (2 days)
- Continuously click for tokens
- MoneyClickBonus active for first 2 days
- Max 3 accounts simultaneously

### Phase 2: Level to MG1
1. Buy & open Dreams & Nightmares cases
2. Auto-sell items (Custom Sell: 100,000)
3. Auto-favorite patterns & low floats
4. Complete daily/weekly missions
5. Auto-favorite terminals
6. Collect rewards
7. Repeat until MG1 rank

### Phase 3: Level to Global
- Same as Phase 2
- PLUS: Progress skillmap in optimal order
- Continue until Global Elite rank

## API Endpoints

### Known (Implemented)
- `GET /api/me` - User stats
- `POST /api/cases` - Buy cases
- `GET /api/cases` - Owned cases
- `POST /api/open/case` - Open cases (with auto-sell/favorite config)
- `DELETE /api/inventory` - Bulk sell for money
- `PATCH /api/inventory` - Bulk sell for tokens

### To Discover
- [ ] Missions API (get, claim)
- [ ] Rewards API (get, claim)
- [ ] Skillmap API (get, set points)
- [ ] Click API (home page token clicking)
- [ ] Trading API (create, add items, confirm)
- [ ] Chat API (send, read messages)
- [ ] Inventory API (get items, favorite)

## Development

### Adding a New Module
1. Create file in `src/modules/`
2. Export async functions
3. Import in phase coordinator
4. Test with single account

### Discovering New API Endpoint
1. Open case-clicker.com with DevTools
2. Perform the action (e.g., claim mission)
3. Check Network tab for API call
4. Document in `src/core/apiClient.js`
5. Test with Postman/Insomnia

### Testing
```bash
npm test
```

## Scaling to Multi-Account

Once single-account works, scale to 10+ accounts:

```bash
# Run 3 accounts in parallel
npm start acc_001 &
npm start acc_002 &
npm start acc_003 &
```

Or use PM2 for production:
```bash
pm2 start src/index.js --name "acc_001" -- acc_001
pm2 start src/index.js --name "acc_002" -- acc_002
pm2 start src/index.js --name "acc_003" -- acc_003
```

## Troubleshooting

### Session expired
If you see authentication errors, you need to refresh the session token:
1. Login to case-clicker.com manually
2. Copy session token from browser cookies
3. Update `config/accounts.json`

### Rate limiting
If you see 429 errors, the orchestrator will automatically retry with exponential backoff.

## License

MIT
