# Backend Setup

## Quick Start (Reset Database & Create Test Data)

### Step 1: Reset Database
```bash
cd backend

# Stop PocketBase if running (Ctrl+C or kill the process)

# Delete the database
rm -rf pb_data

# Start PocketBase
./pocketbase serve
```

### Step 2: Create Admin Account

1. Visit http://127.0.0.1:8090/_/
2. You'll see a "Create your first admin" form
3. Enter:
   - **Email**: `vlad@vlad.studio`
   - **Password**: `1234567890`
4. Click "Create and Login"

### Step 3: Run Setup Script

In a new terminal:

```bash
cd backend

# Install dependencies (first time only)
npm install

# Run the setup script
npm run setup
```

This will:
- Create 2 test users (Alice and Bob)
- Create 2 spaces (Team Alpha and Team Beta)
- Add both users to both spaces
- Create 300 random messages in each space's General chat

## Credentials

**Admin (PocketBase Dashboard)**
- Email: vlad@vlad.studio
- Password: 1234567890
- URL: http://127.0.0.1:8090/_/

**Test Users (Frontend App)**
- Alice: a@test.com / 1234567890
- Bob: b@test.com / 1234567890
- URL: http://localhost:3000

## One-Line Reset (Automated)

Alternatively, use the automated script:

```bash
cd backend
./reset-and-setup.sh
```

Then create the admin account manually at http://127.0.0.1:8090/_/ and run `npm run setup`.
