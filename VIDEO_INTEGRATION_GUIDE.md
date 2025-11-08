# Video Call Integration Guide - Daily.co Implementation

## Overview
This guide covers integrating video calls into Talk using Daily.co. The implementation adds a "Call" button to every chat, creates a call item in the sidebar when active, and allows participants to join seamlessly without additional authentication steps.

**Documentation**: [Daily.co React SDK Reference](https://docs.daily.co/reference/daily-react)

---

## User Journeys

### 1. Starting a Call (Initiator)
- User clicks "Start Call" button (in header, sidebar, or action menu)
- System creates Daily.co room and call record
- Sidebar shows "Call" item (selected, above chat list)
- Main area switches to call view with Daily.co iframe
- User's camera/microphone activate (with permission)
- All space members receive call invitation notification

### 2. Receiving a Call Invitation
- User receives toast notification: "Incoming call in [Space Name]"
- Notification shows "Accept" and "Decline" buttons
- Notification auto-dismisses after 30 seconds if not answered
- User can see active call indicator in sidebar

### 3. Joining an Active Call
- User clicks "Accept" in notification, OR
- User clicks "Call" item in sidebar
- System adds user to call participants
- Main area switches to call view
- User's camera/microphone activate
- User sees all current participants' video streams
- Other participants see new user join

### 4. In-Call Controls
- **Mute/Unmute**: Toggle microphone on/off
- **Camera On/Off**: Toggle video stream
- **Screen Share**: Share screen with participants
- **View Participants**: See list of current call members
- **Settings**: Select camera/microphone device
- **Chat**: Use Talk's existing chat while in call (side panel)

### 5. Leaving a Call
- User clicks "Leave" button
- User's video/audio stops for all participants
- User removed from participants list
- User returns to normal chat view
- Call continues for remaining participants
- **Auto-end**: When last person leaves, call ends automatically
  - Call record deleted from database
  - Daily.co room deleted

### 6. Inviting During Call
- Participant clicks "Invite" button in call view
- Modal shows list of space members not in call
- Participant selects users to invite
- Selected users receive toast invitation
- Invited users can join active call immediately

### 7. Rejoining a Call
- User previously left call (call still active)
- Sidebar shows "Call" item (active indicator)
- User clicks "Call" item to rejoin
- User added back to participants
- User sees current state of call

### 8. Multiple Participants Scenario
- Up to 50 participants can join (Daily.co limit)
- Video grid adjusts layout automatically
- Dominant speaker highlighted (Daily.co feature)
- Audio/video quality adapts to bandwidth

### 9. Edge Cases Handled

**Permission Denied:**
- User blocks camera/microphone access
- Daily.co shows permission error message
- User can grant permissions and retry

**Network Issues:**
- Connection drops during call
- Daily.co attempts auto-reconnect
- User sees "Reconnecting..." indicator
- Falls back to audio-only if video fails

**No Devices Available:**
- User has no camera/microphone
- User can join audio-only or video-only
- Daily.co gracefully handles missing devices

**Browser Not Supported:**
- App detects WebRTC unavailable
- Show error: "Browser doesn't support video calls"
- Suggest modern browser (Chrome, Firefox, Safari, Edge)

**Call Already Active:**
- User tries to start new call while one active
- System shows error: "Call already in progress"
- User can join existing call instead

**Missed Call:**
- User didn't answer invitation
- No missed call history (out of MVP scope)
- Future: Add call history view

---

## Architecture Integration

### What Can Be Reused
```
✅ Authentication       - JWT tokens for participants
✅ Database schema      - Add new 'calls' collection
✅ Real-time hooks      - Subscribe to call state via PocketBase SSE
✅ UI components        - Base components wrap Daily.co iframe
✅ Presence tracking    - Know who's available for calls
✅ Service layer        - Add call methods to pocketbase.ts
```

### Daily.co Handles These Complexities
```
✅ WebRTC signaling     - Daily.co servers manage SDP/ICE exchange
✅ Media streams        - Camera, microphone, screen share
✅ Network traversal    - STUN/TURN infrastructure included
✅ Codec negotiation    - Optimized for quality and bandwidth
✅ Mobile support       - Works seamlessly on iOS/Android browsers
```

---

## Implementation Plan

### 1. Database Schema

Add a new `calls` collection to PocketBase:

```javascript
// pb_migrations/...timestamp...create_calls.js
const calls = new Collection({
  name: "calls",
  type: "base"
});

calls.fields.addAt(0, new Field({
  name: "space",
  type: "relation",
  required: true,
  collectionId: spaces.id
}));

calls.fields.addAt(1, new Field({
  name: "initiator",
  type: "relation",
  required: true,
  collectionId: users.id
}));

calls.fields.addAt(2, new Field({
  name: "participants",
  type: "relation",
  required: false,
  collectionId: users.id,
  maxSelect: 0  // unlimited
}));

calls.fields.addAt(3, new Field({
  name: "daily_room_url",
  type: "text",
  required: true
}));

calls.fields.addAt(4, new Field({
  name: "daily_room_name",
  type: "text",
  required: true
}));

calls.fields.addAt(5, new Field({
  name: "created",
  type: "autodate",
  onCreate: true
}));

app.save(calls);
```

**Index for performance:**
```sql
CREATE INDEX idx_calls_space ON calls(space);
```

---

### 2. PocketBase Access Rules

```javascript
// calls collection rules
listRule: "@request.auth.id != '' && space.members.user ?= @request.auth.id"
viewRule: "@request.auth.id != '' && space.members.user ?= @request.auth.id"
createRule: "@request.auth.id != '' && space.members.user ?= @request.auth.id"
updateRule: "@request.auth.id != '' && (initiator = @request.auth.id || space.members.user ?= @request.auth.id)"
deleteRule: "@request.auth.id != '' && initiator = @request.auth.id"
```

---

### 3. Frontend Setup

**Install Daily.co SDK and Jotai:**
```bash
cd frontend
npm install @daily-co/daily-react jotai
```

> Daily.co recommends using Jotai for state management with their React SDK.

**Add Daily.co service:**
```typescript
// src/services/daily.ts
const DAILY_API_KEY = import.meta.env.VITE_DAILY_CO_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

export const dailyAPI = {
  async createRoom(roomName: string) {
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          enable_screenshare: true,
          enable_chat: false, // Use Talk's chat
          enable_knocking: false,
          enable_prejoin_ui: false,
          max_participants: 50
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create Daily.co room');
    }

    return await response.json();
  },

  async deleteRoom(roomName: string) {
    await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`
      }
    });
  }
};
```

**Add calls service:**
```typescript
// src/services/calls.ts
import { pb } from './pocketbase';
import { dailyAPI } from './daily';
import type { RecordSubscription } from 'pocketbase';

export const callsAPI = {
  async create(spaceId: string) {
    const roomName = `talk-${spaceId}-${Date.now()}`;
    const dailyRoom = await dailyAPI.createRoom(roomName);

    return await pb.collection('calls').create({
      space: spaceId,
      initiator: pb.authStore.model?.id,
      daily_room_url: dailyRoom.url,
      daily_room_name: dailyRoom.name,
      participants: [pb.authStore.model?.id]
    });
  },

  async join(callId: string) {
    const call = await pb.collection('calls').getOne(callId);
    const currentUserId = pb.authStore.model?.id;

    if (!call.participants.includes(currentUserId)) {
      return await pb.collection('calls').update(callId, {
        participants: [...call.participants, currentUserId]
      });
    }

    return call;
  },

  async leave(callId: string) {
    const call = await pb.collection('calls').getOne(callId);
    const currentUserId = pb.authStore.model?.id;

    // Remove current user from participants
    const remainingParticipants = call.participants.filter(
      (id: string) => id !== currentUserId
    );

    // If last person leaving, delete the call
    if (remainingParticipants.length === 0) {
      // Clean up Daily.co room first
      await dailyAPI.deleteRoom(call.daily_room_name);

      // Delete call record from database
      await pb.collection('calls').delete(callId);
    } else {
      // Just remove user from participants
      await pb.collection('calls').update(callId, {
        participants: remainingParticipants
      });
    }
  },

  async getActiveBySpace(spaceId: string) {
    const calls = await pb.collection('calls').getFullList({
      filter: `space = "${spaceId}"`,
      sort: '-created'
    });

    return calls[0] || null;
  },

  subscribe(callback: (data: RecordSubscription<any>) => void) {
    return pb.collection('calls').subscribe('*', callback);
  },

  unsubscribe() {
    return pb.collection('calls').unsubscribe();
  }
};
```

**Add Jotai state atoms:**
```typescript
// src/store/callStore.ts
import { atom } from 'jotai';
import type { Call } from '../types';

// Active call state
export const activeCallAtom = atom<Call | null>(null);

// Whether the call view is shown (replaces chat)
export const showCallViewAtom = atom<boolean>(false);

// Derived atom: is user in a call
export const inCallAtom = atom(
  (get) => get(activeCallAtom) !== null && get(showCallViewAtom)
);
```

---

### 4. Request Permissions on App Mount

Update the main App component to request media permissions alongside notifications:

```typescript
// src/App.tsx
import { useEffect } from 'react';
import { Provider as JotaiProvider } from 'jotai';

function App() {
  useEffect(() => {
    requestPermissions();
  }, []);

  async function requestPermissions() {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Request camera and microphone permissions
    // This ensures permissions are granted before first call
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });

        // Stop tracks immediately - we only needed to request permission
        stream.getTracks().forEach(track => track.stop());

        console.log('Media permissions granted');
      } catch (error) {
        // User denied or devices unavailable - handle gracefully
        if (error instanceof Error && error.name === 'NotAllowedError') {
          console.warn('Media permissions denied - calls will prompt again');
        } else {
          console.warn('Media devices not available:', error);
        }
      }
    }
  }

  return (
    <JotaiProvider>
      {/* ... rest of app */}
    </JotaiProvider>
  );
}
```

---

### 5. UI Components

**Start Call button (can be placed anywhere in space UI):**
```typescript
// Example: In sidebar, header, or action menu
import { Phone } from 'lucide-react';
import { Button } from '../ui/Button';

interface StartCallButtonProps {
  onStartCall: () => void;
}

export default function StartCallButton({ onStartCall }: StartCallButtonProps) {
  return (
    <Button onClick={onStartCall} variant="ghost" size="sm">
      <Phone className="w-5 h-5" />
      Start Call
    </Button>
  );
}
```

**Active call view:**
```typescript
// src/components/CallView.tsx
import { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-react';
import { PhoneOff } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Call } from '../types';

interface CallViewProps {
  call: Call;
  onLeaveCall: () => void;
}

export default function CallView({ call, onLeaveCall }: CallViewProps) {
  const callFrame = useRef(null);

  return (
    <div className="relative w-full h-full bg-black">
      <DailyIframe
        ref={callFrame}
        url={call.daily_room_url}
        showLeaveButton={false}
        iframeStyle={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: 'none'
        }}
      />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <Button
          onClick={onLeaveCall}
          variant="destructive"
          size="lg"
          className="rounded-full"
        >
          <PhoneOff className="w-6 h-6 mr-2" />
          Leave
        </Button>
      </div>
    </div>
  );
}
```

**Call notification toast:**
```typescript
// src/components/IncomingCallNotification.tsx
import { Phone, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Call } from '../types';

interface IncomingCallNotificationProps {
  call: Call;
  spaceName: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCallNotification({
  call,
  spaceName,
  onAccept,
  onDecline
}: IncomingCallNotificationProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white border rounded-lg shadow-lg">
      <Phone className="w-6 h-6 text-green-600" />
      <div className="flex-1">
        <p className="font-semibold">Incoming call</p>
        <p className="text-sm text-gray-600">{spaceName}</p>
      </div>
      <Button onClick={onAccept} variant="default" size="sm">
        Accept
      </Button>
      <Button onClick={onDecline} variant="ghost" size="sm">
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
```

---

### 6. Integration with Space Layout

Add call handling to your main space/layout component:

```typescript
// src/components/SpaceLayout.tsx (or App.tsx)
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { callsAPI } from '../services/calls';
import { activeCallAtom, showCallViewAtom } from '../store/callStore';
import CallView from './CallView';
import IncomingCallNotification from './IncomingCallNotification';
import { toast } from 'sonner';

export default function SpaceLayout({ space, currentUser }) {
  const [activeCall, setActiveCall] = useAtom(activeCallAtom);
  const [showCallView, setShowCallView] = useAtom(showCallViewAtom);

  useEffect(() => {
    // Subscribe to call updates for current space
    const unsubscribe = callsAPI.subscribe((data) => {
      if (data.record.space === space.id) {
        if (data.action === 'create') {
          // Incoming call
          if (data.record.initiator !== currentUser.id) {
            showIncomingCallToast(data.record);
          } else {
            setActiveCall(data.record);
            setShowCallView(true);
          }
        } else if (data.action === 'delete') {
          // Call ended (deleted when last person leaves)
          setActiveCall(null);
          setShowCallView(false);
        }
      }
    });

    // Check for existing active call in current space
    callsAPI.getActiveBySpace(space.id).then(call => {
      if (call) setActiveCall(call);
    });

    return () => unsubscribe();
  }, [space.id, currentUser.id, setActiveCall, setShowCallView]);

  const handleStartCall = async () => {
    try {
      const call = await callsAPI.create(space.id);
      setActiveCall(call);
      setShowCallView(true);
    } catch (error) {
      toast.error('Failed to start call');
    }
  };

  const handleJoinCall = async () => {
    if (activeCall) {
      await callsAPI.join(activeCall.id);
      setShowCallView(true);
    }
  };

  const handleLeaveCall = async () => {
    if (activeCall) {
      await callsAPI.leave(activeCall.id);
      setActiveCall(null);
      setShowCallView(false);
    }
  };

  const showIncomingCallToast = (call) => {
    toast(
      <IncomingCallNotification
        call={call}
        spaceName={space.name}
        onAccept={handleJoinCall}
        onDecline={() => toast.dismiss()}
      />,
      { duration: 30000 }
    );
  };

  if (showCallView && activeCall) {
    return <CallView call={activeCall} onLeaveCall={handleLeaveCall} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sidebar with "Start Call" button and chat list */}
      {/* Main area shows chat or call view */}
      {/* ... rest of space UI */}
    </div>
  );
}
```

---

## Security Considerations

### Authentication
Daily.co rooms are created with `privacy: 'private'`, meaning only users with the room URL can join. Since URLs are stored in PocketBase with access rules enforcing space membership, only authorized users can access calls.

### PocketBase Security
Access rules ensure users can only:
- See calls in spaces where they're members
- Create calls in spaces where they're members
- Update calls they initiated or are participating in

### Browser Permissions
Media permissions (camera/microphone) are requested on app mount to provide a smooth call experience. Users can revoke these at any time via browser settings.

---

## Testing

### Manual Testing Checklist

**Test 1: Start Call**
- User A clicks "Start Call" button
- Verify call created in PocketBase with correct space
- Verify "Call" item appears in sidebar
- Verify Daily.co iframe loads in main area
- Verify camera/microphone work
- Verify local video appears

**Test 2: Join Call**
- User A starts call in space
- User B (in same space) receives toast notification
- Verify notification shows space name
- User B clicks "Accept"
- Verify both users see each other
- Verify audio works bidirectionally

**Test 3: Leave Call**
- User A clicks "Leave"
- Verify User A returns to normal view
- Verify User A removed from participants
- Verify "Call" item removed from User A's sidebar
- Call continues for remaining users

**Test 4: Auto-End Call**
- User A starts call (only participant)
- User A clicks "Leave"
- Verify call record deleted from PocketBase
- Verify Daily.co room deleted
- Verify "Call" item removed from all sidebars

**Test 5: Multiple Participants**
- User A starts call
- User B joins
- User C joins
- Verify all three see each other
- User B clicks "Leave"
- Verify call continues for A and C
- User C clicks "Leave"
- Verify call continues for A only
- User A clicks "Leave"
- Verify call auto-ends

**Test 6: Permissions Denied**
- Block camera/mic in browser
- Start call
- Verify Daily.co shows permission error
- Verify user can grant permissions and retry

---

## Cost Estimation

Daily.co pricing (as of 2024):
- **Free tier**: 10,000 participant minutes/month
- **Build plan**: $99/month for 100,000 minutes
- **Scale plan**: $499/month for 1,000,000 minutes

For typical usage:
- Family chat (5 users, 30 min/day): ~4,500 min/month = **FREE**
- Small team (20 users, 1 hr/day): ~36,000 min/month = **$99/mo**
- Medium org (100 users, 2 hr/week): ~80,000 min/month = **$99/mo**

---

## Monitoring & Analytics

Track call usage in your application:

```typescript
// src/utils/callAnalytics.ts
export function trackCallEvent(event: string, callId: string, data?: any) {
  console.log(`[Call ${event}]`, {
    call_id: callId,
    timestamp: new Date().toISOString(),
    ...data
  });

  // Send to your analytics service if needed
}

// Usage:
trackCallEvent('started', call.id, { initiator_id: userId });
trackCallEvent('joined', call.id, { participant_id: userId });
trackCallEvent('ended', call.id, { duration_seconds: duration });
```

---

## Getting Started

1. **Sign up for Daily.co**: https://dashboard.daily.co/signup (free tier available)
2. **Get API key**: Dashboard → Developers → API Keys
3. **Add to `.env`**: Already done ✅
4. **Install dependencies**: `npm install @daily-co/daily-react jotai`
5. **Create migration**: Add `calls` collection to PocketBase
6. **Add services**: `daily.ts`, `calls.ts`, and `callStore.ts`
7. **Wrap app**: Add `<JotaiProvider>` to App.tsx
8. **Build UI**: Components above
9. **Test**: Follow manual testing checklist

**Estimated integration time**: 2-3 days for MVP, 1 week for polish.

---

## Next Steps

After MVP is working:
- Add call history view
- Show active call indicator in sidebar
- Add ringing sound for incoming calls
- Support screen sharing (already enabled in Daily.co config)
- Add call recording (available in Daily.co paid plans)
- Show participant count in call UI
- Add "invite to call" feature for users not in chat
