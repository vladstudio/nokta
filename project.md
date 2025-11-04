# Complete Implementation Plan for Space Chat Web Application

## Architecture Overview

**Deployment Strategy**: Separate backend and frontend deployments
- **Backend**: PocketBase server (standalone executable). Docs: docs/pocketbase
- **Frontend**: React SPA with TinyBase sync layer. Docs: docs/tinybase.org
- **UI Components**: 9ui component library: docs/9ui.md

## Tech Stack Analysis

**PocketBase** (Backend)
- ✅ Built-in authentication with OAuth2 support
- ✅ Real-time subscriptions via SSE
- ✅ Flexible collection-based data modeling
- ✅ REST API with access control rules

**TinyBase** (Sync Engine)
- ✅ MergeableStore for conflict resolution
- ✅ Real-time synchronization via WebSockets/BroadcastChannel
- ✅ React hooks and components
- ✅ Offline support with persistence

**9ui** (Components)
- ✅ Complete component library for chat UI
- ✅ Accessible, customizable components
- ✅ React-based with modern patterns

Use bun for everything, not npm.

## Database Schema Design

All db management is done using PocketBase.

### Collections

**users** (Auth Collection)
```
- id: primary key
- email: unique email
- name: first or full name
- avatar: file field
- created: datetime
- updated: datetime
```

**spaces** (Base Collection)
```
- id: primary key
- name: text
- created: datetime
- updated: datetime
```

**space_members** (Base Collection)
```
- id: primary key
- space: relation to spaces
- user: relation to users
- role: select (admin, member)
- joined_at: datetime
```

**chats** (Base Collection)
```
- id: primary key
- space: relation to spaces
- type: select (public: visible to all in space, private: visible only to participants)
- participants: relation to users (multiple)
- name: text (for space-wide chats)
- created: datetime
- updated: datetime
```

**messages** (Base Collection)
```
- id: primary key
- chat: relation to chats
- sender: relation to users (null if system message)
- type: select (text) // extensible for future: gif, file, audio, video
- content: text
- created: datetime
- updated: datetime
```

## Project Structure

```
talk/
├── backend/
│   ├── pb_data/          # PocketBase data
│   ├── pb_migrations/    # Schema migrations
│   └── pocketbase*       # Executable
└── frontend/
    ├── src/
    │   ├── components/   # UI components
    │   ├── stores/       # TinyBase stores
    │   ├── hooks/        # Custom React hooks
    │   ├── services/     # API services
    │   ├── utils/        # Utilities
    │   └── types/        # TypeScript types
    ├── package.json
    └── vite.config.ts    # Build configuration
```

## Implementation Phases

### Phase 1: Backend Setup & Core Authentication
1. **PocketBase Setup**
   - Initialize PocketBase server
   - Create initial collections and schema
   - Configure authentication settings
   - Set up access control rules

2. **User Management**
   - User login
   - Profile management

### Phase 2: Space Management  (from admin UI)
   - Create space
   - Many-to-many user-space relationships
   - Space-specific permissions

### Phase 3: Chat Infrastructure
1. **Chat Creation Logic**
   - Auto-generate space-wide chat on space creation
   - Auto-generate direct message chats between space members
   - Chat participant management

2. **Real-time Messaging**
   - TinyBase MergeableStore setup
   - PocketBase real-time subscriptions
   - Message synchronization

### Phase 4: Frontend Development
1. **Core UI Components**
   - Authentication forms (9ui)
   - Space management interface
   - Chat interface with message list
   - User profile management
   - Responsive design; layouts adapt to screen size.

2. **Real-time Features**
   - Live message updates
   - Online status indicators
   - Typing indicators

3. **State Management**
   - TinyBase stores for chat data
   - React hooks for UI state
   - Offline support with sync

### Phase 5: Advanced Features (Future)
1. **Media Support**
   - File uploads
   - Image/GIF support
   - Audio messages
   - Video messages

2. **Enhanced UX**
   - Push notifications
   - Message search
   - Message reactions
   - Read receipts

## Security & Access Control

### PocketBase Rules Examples

**messages collection (ListRule)**:
```
@request.auth.id != "" && chat.participants.id ?= @request.auth.id
```

**space_members collection (ViewRule)**:
```
@request.auth.id != "" && (user.id = @request.auth.id || space.members.user.id ?= @request.auth.id)
```

## Deployment Considerations

### Backend (PocketBase)
- Deploy as single binary on VPS/cloud
- Configure SSL/TLS
- Set up backup strategy for `pb_data`
- Environment variables for production settings

### Frontend (React)
- Build static assets with Vite
- Deploy to CDN/static hosting (Vercel, Netlify)
- Configure environment variables for PocketBase URL
- Implement proper error boundaries

## UI/UX Design Specification

### Design Principles
- **Space-First**: Warm, approachable design that feels safe and intimate
- **Simplicity**: Clean, uncluttered interface suitable for all ages
- **Accessibility**: Following WCAG guidelines with 9ui components
- **Responsive**: Mobile-first design that works across all devices

### Layout Structure

#### Main Application Layout
```
┌─────────────────────────────────────┐
│ Header (Navbar)                     │
├─────────────┬───────────────────────┤
│ Sidebar     │ Main Content Area     │
│             │                       │
│ - Spaces  │ - Chat Interface      │
│ - Chats     │ - Space Management   │
│ - Profile   │ - Settings            │
│             │                       │
└─────────────┴───────────────────────┘
```

### Screen Flows & Components

#### 1. Authentication Flow
**Login/Register Screen**
- **Components**: `Container`, `Dialog`, `Text Field`, `Button`
- **Layout**: Centered modal with space-themed illustration
- **Features**:
  - Email/password login
  - ~~OAuth options (Google, GitHub)~~
  - "Remember me" checkbox
  - Password reset link
  - Register toggle

#### 2. Space Management

**Space Dashboard**
- **Components**: `Container`, `Navbar`, `Sidebar`, `Badge`, `Button`
- **Layout**: 
  - Header with space name and member count
  - Grid of space members with avatars
  - settings
- **Features**:
  - Space member list with online status

**Space Creation Flow (Admin Only)**
- **Components**: `Dialog`, `Text Field`, `Textarea`, `Button`
- **Steps**:
  1. Create new space form (name, description)
  2. Add users to space manually

#### 3. Chat Interface

**Chat List (Sidebar)**
- **Components**: `Sidebar`, `List Box`, `Badge`, `Context Menu`
- **Layout**:
  ```
  Spaces
  ├── Space A
  │   ├── 👥 General Chat (3 unread)
  │   ├── 💬 Mom & Dad
  │   └── 💬 Kids Chat
  └── Space B
      ├── 👥 General Chat
      └── 💬 Uncle John
  ```
- **Features**:
  - Hierarchical space/chat structure
  - Unread message badges
  - Online status indicators
  - Right-click context menus

**Chat Window**
- **Components**: `Container`, `Text Field`, `Button`, `Loader`, `Toast`
- **Layout**:
  ```
  ┌─────────────────────────────────────┐
  │ Chat Header (participants, status)  │
  ├─────────────────────────────────────┤
  │ Message History                     │
  │ ┌─────────────────────────────────┐ │
  │ │ Avatar | Name | Timestamp       │ │
  │ │        | Message content        │ │
  │ └─────────────────────────────────┘ │
  │ [More messages...]                  │
  ├─────────────────────────────────────┤
  │ [Typing indicator]                  │
  ├─────────────────────────────────────┤
  │ Message Input + Send Button         │
  └─────────────────────────────────────┘
  ```
- **Features**:
  - Infinite scroll message history
  - Real-time message updates
  - Typing indicators
  - Message timestamps
  - Send on Enter, Shift+Enter for newline

**Message Components**
- **Own messages**: Right-aligned, different color
- **Others' messages**: Left-aligned with avatar
- **System messages**: Centered, muted styling
- **Message states**: Sending, sent, failed indicators

#### 4. User Profile

**Profile Management**
- **Components**: `Dialog`, `Text Field`, `File Trigger`, `Button`
- **Features**:
  - Avatar upload/change
  - Username editing
  - Email management
  - Password change
  - Account deletion

#### 5. Mobile Responsive Design

**Mobile Layout**
- **Navigation**: Bottom tab bar or hamburger menu
- **Chat List**: Full-screen overlay on mobile
- **Chat View**: Full-screen with back button
- **Transitions**: Slide animations between views

**Tablet Layout**
- **Split View**: Chat list + chat window side-by-side
- **Adaptive**: Collapses to mobile on smaller tablets

### Visual Design System

#### Color Palette
- **Primary**: Warm space-friendly blues/greens
- **Secondary**: Soft grays for backgrounds
- **Accent**: Friendly oranges for notifications
- **Success**: Green for online status
- **Warning**: Amber for pending states
- **Error**: Soft red for errors

#### Typography
- **Headings**: Clear hierarchy with 9ui defaults
- **Body**: Readable font sizes (16px+ base)
- **Chat**: Monospace option for code sharing

#### Spacing & Layout
- **Consistent**: 8px grid system
- **Generous**: Adequate touch targets (44px+)
- **Breathing room**: Proper content spacing

### Interaction Patterns

#### Real-time Updates
- **Message appearance**: Smooth fade-in animation
- **Typing indicators**: Pulsing dots with user name
- **Online status**: Green dot animation
- **New message**: Subtle notification sound (optional)

#### Loading States
- **Chat loading**: Skeleton placeholders for messages
- **Send message**: Button disabled state with spinner
- **Image upload**: Progress indicator

#### Error Handling
- **Connection lost**: Discrete banner notification
- **Message failed**: Retry button with error icon
- **Form errors**: Inline validation with clear messaging

#### Accessibility Features
- **Keyboard navigation**: Full app navigable via keyboard
- **Screen readers**: Proper ARIA labels and live regions
- **High contrast**: Support for OS high contrast mode
- **Font scaling**: Respect user font size preferences

### Future UI Enhancements
- **Message reactions**: Emoji picker and display
- **File sharing**: Drag-and-drop upload area
- **Voice messages**: Record/play controls
- **Video calls**: In-app calling interface
- **Dark mode**: Toggle in user preferences
- **Themes**: Space-specific color themes

## Development Workflow

1. **Backend First**: Set up PocketBase, define schema, test APIs
2. **Frontend Setup**: Initialize React app, install dependencies
3. **Integration**: Connect TinyBase with PocketBase real-time APIs
4. **UI Development**: Build components using 9ui
5. **Testing**: Unit tests, integration tests, E2E tests

This architecture provides a solid foundation for a performant space chat application with room for future expansion while keeping the initial implementation focused and maintainable.