# Talk Admin UI

Simple admin interface for managing spaces and users.

## Tech Stack

- **Vite + React + TypeScript** - Fast build and modern React
- **wouter** - Minimal routing (1.3KB)
- **Tailwind CSS** - Utility-first styling
- **PocketBase SDK** - Backend API integration

## Features

- **Authentication**: Email/password login
- **Space Management**: Create and edit spaces
- **Member Management**: Add users to spaces and assign roles (admin/member)
- **Protected Routes**: Automatic redirect to login for unauthenticated users

## Development

```bash
# Install dependencies
bun install

# Start dev server (port 5173)
bun dev

# Build for production
bun run build
```

## Usage

1. Start PocketBase backend at http://127.0.0.1:8090
2. Start admin UI at http://localhost:5173
3. Login with your PocketBase user credentials
4. Manage spaces and members

## Routes

- `/` - Spaces list
- `/login` - Login page
- `/spaces/new` - Create new space
- `/spaces/:id/edit` - Edit space
- `/spaces/:id` - Manage space members

## Note

This is a simple admin UI without 9ui components (for simplicity). All basic functionality is implemented with Tailwind CSS utility classes.
