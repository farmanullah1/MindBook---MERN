# MindBook – Antigravity Agent Prompt Playbook
> **Purpose:** This file is the single source of truth for all development instructions for the **MindBook** social media application (a Facebook clone built with the MERN stack and a yellow `#F7B928` brand theme). Each section is a self-contained, executable prompt. To run any prompt, simply tell Antigravity: **"Run PROMPT-[ID]"** and the agent will execute it autonomously.

---

## How to Use This File

| Command | Action |
|---|---|
| `Run PROMPT-01` | Scaffold the full project from scratch |
| `Run PROMPT-02` | Add features and fix all existing ones |
| `Run PROMPT-03` | Improve SEO, favicon, and site-wide polish |
| `Run PROMPT-04` | Build the full user profile management system |
| `Run PROMPT-05` | Add more Facebook-like features progressively |
| `Run PROMPT-06` | Improve the Stories section completely |
| `Run PROMPT-07` | Check for errors and fix them |
| `Run PROMPT-08` | Update README, SEO, favicon, logo, and branding |
| `Run PROMPT-09` | Build the full Facebook-like News Feed (Home Page) |
| `Run PROMPT-10` | Build the full Messaging / Chat system |
| `Run PROMPT-11` | Build the full Groups system + rename app to MindBook |
| `Run PROMPT-12` | Add new chat suggestions and direct message button on profiles |
| `Run PROMPT-13` | Add story reactions, rich media chat, group improvements, friends section |
| `Run PROMPT-14` | Full style, animations, and responsiveness upgrade |
| `Run PROMPT-15` | Full code analysis, browser testing, and error fixing |
| `Run PROMPT-16` | Fix left sidebar overlap on desktop/laptop |
| `Run PROMPT-17` | Comprehensive bug fixes, UI improvements (friends, messages, stories, settings, signup) |
| `Run PROMPT-18` | Fix messenger sidebar, discover groups UI, login/signup UI |
| `Run PROMPT-19` | Implement complete media sharing in chat |
| `Run PROMPT-20` | Fix all broken media messaging features |

---
---

## PROMPT-01 — Project Scaffold: MindBook MERN Stack (Yellow Theme)

**Trigger command:** `Run PROMPT-01`

You are an expert Full-Stack MERN Developer and UI/UX implementation specialist. Your task is to build a web application called **"MindBook"**. This application must serve as a functional clone of Facebook's core mechanics and UI structure, but with a completely modified brand color palette — yellow instead of blue. Provide the complete code, including configuration files, `package.json` files, and instructions for running the application.

### Project Architecture

Create a root folder named `MindBook`. Inside, strictly separate the stack:
- `MindBook/frontend` — React.js application (Vite)
- `MindBook/backend` — Node.js & Express.js application

Each subfolder must have its own `package.json` and dependencies.

### Backend Specifications

- **Database:** `mongodb://localhost:27017/minds_books`
- **Port:** `5000`

#### Mongoose Models

**User Model:** name (required), email (required, unique), password (hashed with bcrypt), profilePicture (URL/default), friends (array of ObjectIds), createdAt.

**Post Model:** user (ref User), content (required), imageUrl (optional), likes (array of ObjectIds), comments (array: user ObjectId, text, createdAt), createdAt.

#### Authentication

- JWT-based authentication for register and login.
- Passwords hashed with `bcrypt`.
- Protected routes via JWT verification middleware.

#### API Routes

**Auth (`/api/auth`):** `POST /register`, `POST /login`, `GET /me` (protected).

**Users (`/api/users`):** `GET /:id`, `PUT /:id`, `POST /:id/friend`.

**Posts (`/api/posts`):** `GET /` (feed), `POST /`, `PUT /:id`, `DELETE /:id`, `POST /:id/like`, `POST /:id/comment`.

**Additional:** Use `cors`, `express.json()`, `dotenv`. Provide `.env` template with `JWT_SECRET` and `PORT`. Include error handling middleware. All controllers must have full implementation — no placeholder comments.

### Frontend Specifications

- **Framework:** Vite + React
- **State Management:** React Context API or Redux Toolkit
- **Routing (React Router):** `/login`, `/` (feed), `/profile/:id`, `/register`

#### Components Required (full implementation)

Navbar, Left Sidebar, Right Sidebar, Feed, PostCard, PostCreator, Profile Page.

#### API Integration

Use `axios` to connect to `http://localhost:5000/api`. Store JWT in `localStorage`. Attach `Authorization: Bearer <token>` headers. Handle loading states and errors.

### Design Tokens — Yellow Theme (CRITICAL)

```css
:root {
  --main-background: #ffffff;
  --text-primary: #111112;
  --text-secondary: #666a72;
  --input-border-color: #ced0d4;
  --disabled-button-text: #bcc0c4;
  --badge-background-color-gray: #9fa4ab;
  --progress-ring-on-color-button-track: #d0d3d6;
  --brand-primary: #F7B928;
  --brand-primary-hover: #E4A11B;
  --link-color: #D99A1C;
  --toast-text-link: #FAEBA4;
}
```

- **Font:** `system-ui, -apple-system, BlinkMacSystemFont, .SFNSText-Regular, sans-serif`
- **Base font size:** 15px, line-height 1.33
- **Border-radius (cards):** 22px
- Primary buttons: `--brand-primary` background, white text, `border-radius: 22px`

### Deliverables

Provide terminal commands for setup, then complete code for: `server.js`, `config/db.js`, all models, all routes and controllers, `middleware/auth.js`, `.env` template, `App.jsx`, `main.jsx`, context/store, all components, all pages, `services/api.js`, and `styles/globals.css`.

---
---

## PROMPT-02 — Add Features & Fix All Existing Ones

**Trigger command:** `Run PROMPT-02`

I have a web application (MindBook). Please improve the site by adding more features. Additionally, ensure that all existing and new features are fully functional and working correctly. Provide the updated code and a brief explanation of the features you added and any fixes you made to ensure everything works properly.

---
---

## PROMPT-03 — SEO, Favicon & Site-Wide Polish

**Trigger command:** `Run PROMPT-03`

I have a web application (MindBook, a Facebook-like site). Please perform the following tasks:

1. **Update SEO** — Add/improve meta tags (description, keywords, viewport, Open Graph, Twitter Card), ensure semantic HTML, add a descriptive title.
2. **Update the favicon** — Create or update the favicon to match MindBook's branding.
3. **Create a proper Facebook clone** — Ensure the site accurately replicates Facebook's core layout and UX with the yellow color scheme.
4. **Check for errors** — Thoroughly test for broken UI, JS errors, backend failures, console warnings.
5. **Fix all errors found** — Provide corrected code with explanation.
6. **Improve the whole site** — Performance, responsiveness, styling, UX, code quality.

Provide fully updated code and a brief explanation of everything fixed and improved.

---
---

## PROMPT-04 — Full User Profile Management System

**Trigger command:** `Run PROMPT-04`

I have MindBook (a Facebook clone with yellow theme). Implement a **complete user profile management system** allowing users to view, edit, and customize their profiles.

### Features to Implement

#### View Profile (`/profile/:id`)
Display: cover photo, profile picture, name, bio, location, work & education, friends count, mutual friends (on other users' profiles), posts.

#### Edit Profile (logged-in user only)
"Edit Profile" button → modal/page to update: profile picture (upload/remove/crop), cover photo (upload/reposition/remove), bio (max 150 chars), location (city, country), work entries (job title, company, start/end year), education entries (school, degree, year), email (display/editable), phone (optional).

#### Profile Picture & Cover Photo Upload

**Backend:** Use **Multer**. Store in `/uploads/profile_pics/` and `/uploads/covers/`. Generate unique filenames. Update User model with `profilePicture`, `coverPhoto`, `bio`, `location`, `work`, `education`, `friends`.

**Mongoose schema extension:**
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '/uploads/default-avatar.png' },
  coverPhoto: { type: String, default: '/uploads/default-cover.jpg' },
  bio: { type: String, maxlength: 150 },
  location: { city: String, country: String },
  work: [{ title: String, company: String, startYear: Number, endYear: Number }],
  education: [{ school: String, degree: String, year: Number }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
```

**Frontend:** Image upload component with file picker (JPG, PNG, GIF), preview before upload, loading spinner, success/error toasts.

#### API Routes
`PUT /api/users/profile`, `POST /api/users/upload-profile-pic`, `POST /api/users/upload-cover-photo`, `DELETE /api/users/remove-profile-pic`, `DELETE /api/users/remove-cover-photo`, `GET /api/users/:id/mutual-friends`.

#### Components
`ProfilePage.jsx`, `EditProfileModal.jsx`, `ImageUploader.jsx`, `FriendsList.jsx`, `WorkEducationSection.jsx`.

#### Additional Actions
- **Change Password** — current password, new password, confirm.
- **Delete Account** — confirmation modal, removes all user data.

**Styling:** Yellow theme, responsive profile layout (cover spans full width, profile pic overlaps cover). Provide terminal commands for new deps (`multer`, `react-image-crop`).

---
---

## PROMPT-05 — Progressive Facebook-Like Feature Roadmap

**Trigger command:** `Run PROMPT-05`

I have MindBook (a Facebook-like site with yellow theme). Continue adding more features and improvements to make it increasingly similar to Facebook. Add features progressively, prioritize the most impactful first. For each feature, provide complete working code (frontend and backend) and a brief explanation.

### Feature Roadmap (in priority order)

1. **Friend Requests System** — Send, accept, decline, cancel; show pending requests.
2. **Notifications** — Real-time or polling-based; friend requests, likes, comments.
3. **Post Interactions** — Like, unlike, comment, delete comments.
4. **Image/Video Uploads** — Upload with posts.
5. **Stories Feature** — 24-hour disappearing photo/video stories.
6. **Groups** — Create, join, post in groups.
7. **Events** — Create and RSVP.
8. **Messaging / Chat** — Real-time private messaging between friends.
9. **Search** — Users, posts, groups.
10. **News Feed Algorithm** — Relevance/recency-based feed.

After each feature, explain what was added and how it works. Provide all necessary code — frontend components, backend routes, controllers, models, and new dependencies.

---
---

## PROMPT-06 — Stories Section: Full Improvement

**Trigger command:** `Run PROMPT-06`

I have MindBook. Please improve the **story section** in every aspect: functionality, style, and features. Ensure users can create, view, and interact with stories (24-hour disappearing photo/video posts). Add visual improvements — circular progress indicators, smooth transitions, responsive design. Provide complete updated frontend and backend code and a brief explanation of improvements made.

---
---

## PROMPT-07 — Error Check & Fix

**Trigger command:** `Run PROMPT-07`

I have MindBook. After making changes:

1. **Check for new problems or errors** — Broken UI, JS errors, backend failures, console warnings.
2. **Fix all errors** — Identify root causes; provide corrected code. Focus on browser console, terminal output, and server logs.
3. **Improve the whole site** — Performance, responsiveness, styling, UX, code quality.

Provide fully updated code and a brief explanation of errors fixed and improvements made.

---
---

## PROMPT-08 — README, SEO, Favicon, Logo & Branding Update

**Trigger command:** `Run PROMPT-08`

I have MindBook. Perform the following tasks:

### 1. Update README (`README.md`)
Include: project description, features, tech stack (MERN), install deps, set up `.env`, run locally (frontend + backend), build for production.

### 2. Update SEO
Add/improve: meta description, keywords, viewport, Open Graph, Twitter Card. Semantic HTML. Descriptive title.

### 3. Update Favicon and Logo
- Resemble the **Facebook logo** but with the letter **'F' replaced by 'M'**.
- Blue color replaced with **yellow (`#F7B928`)**.
- Provide favicon in multiple sizes (16×16, 32×32, 180×180).
- Update logo in navbar and all visible locations.

### 4. Update Site Name & Style
- Consistent display of **"MindBook"** everywhere (title bar, navbar, headers, etc.).
- Maintain Facebook-like layout with yellow color scheme.

### 5–7. Test, Fix Errors, and Improve
Check for broken UI, JS errors, backend failures, favicon/logo display. Fix root causes. Make general improvements.

**Deliverables:** Updated `README.md`, SEO HTML, favicon/logo files or generation instructions, updated code files, brief explanation.

---
---

## PROMPT-09 — Full Facebook-Like Home Page (News Feed)

**Trigger command:** `Run PROMPT-09`

I have MindBook. Implement a **complete, fully functional home page (news feed)** that replicates Facebook's home page.

### Layout (Three Columns)

| Column | Content |
|---|---|
| Left Sidebar | Navigation shortcuts, user avatar/name, quick links |
| Center Feed | Create Post section + scrolling post feed |
| Right Sidebar | Friend suggestions, birthdays, contacts |

### Center Feed — Create Post
- "What's on your mind, [Name]?" text input
- Photo/Video, Tag Friends, Feelings/Activity icons
- Post Button (text or image required)
- Text up to 5000 chars, image upload (JPG/PNG/GIF, max 5MB), optional location
- New post appears at top without page reload

### Post Component (each post displays)
User info (avatar, name, timestamp, privacy icon), content + image, Like button (with count), Comment button (expand section), Share button, optional Reaction Picker, Comment Section (list + add new), Delete/Edit dropdown (owner only).

### Right Sidebar
Friend suggestions (avatar + name + Add Friend), birthdays, contacts list.

### Infinite Scroll
Load first 10 posts. Load next batch via IntersectionObserver on scroll. Loading spinner while fetching.

### API Endpoints
`GET /api/posts/feed` (paginated, populated), `POST /api/posts`, `PUT /api/posts/:id`, `DELETE /api/posts/:id`, `POST /api/posts/:id/like`, `POST /api/posts/:id/comment`, `DELETE /api/comments/:id`, `GET /api/users/suggestions`.

### Components
`HomePage.jsx`, `LeftSidebar.jsx`, `RightSidebar.jsx`, `CreatePost.jsx`, `Feed.jsx`, `PostCard.jsx`, `CommentSection.jsx`, `FriendSuggestionCard.jsx`.

### Styling
Yellow Facebook-style theme. Flexbox/Grid for three columns. Responsive: desktop (3 cols), tablet (collapse right), mobile (center only + hamburger). Post cards: white background, border-radius 12px, box shadow. Like/Comment buttons yellow on hover/active.

---
---

## PROMPT-10 — Full Messaging / Chat System

**Trigger command:** `Run PROMPT-10`

I have MindBook. Implement a **complete, fully functional messaging system** replicating Facebook Messenger's core mechanics.

### Messaging Rules
- Friends: full chat access
- Non-friends: message goes to "Message Request" folder
- Blocked users: cannot message each other
- No self-chat

### Core Features

**One-on-One Chat:** Send messages (max 2000 chars), message status (sent ✓ / delivered ✓✓ / read blue ✓✓), timestamps, read receipts, typing indicator ("[Name] is typing..."), online/offline status (green dot), delete for me, delete for everyone (within 10 min), reply to message (quote), forward message, copy message, report/block.

**Group Chats:** Create group (2–50 friends), group name & icon, invite members, remove members, leave group, admin role, @mentions, group media tab, group description.

**Message Requests:** Non-friend messages go to request folder. Recipient can accept (moves to inbox), delete, or block.

**Media Sharing:** Images (JPG/PNG/GIF, 10MB), videos (MP4, 50MB), voice messages (max 2 min), files (PDF/DOC, 25MB), GIFs (Giphy API).

**Notifications:** Browser push notifications, in-app bell icon with unread count.

### Database Models

**Conversation:**
```javascript
{ participants, isGroup, groupName, groupIcon, groupAdmin, groupMembers, lastMessage, lastMessageTime, updatedAt }
```

**Message:**
```javascript
{ conversation, sender, text, mediaUrl, mediaType, isDeleted, deletedFor, readBy, repliedTo, sentAt, deliveredAt, readAt }
```

### Socket.IO Events
`join`, `send-message` / `receive-message`, `typing-start` / `user-typing`, `typing-stop` / `user-stopped-typing`, `mark-read` / `message-read`, `update-status` / `status-updated`.

### REST API
`GET /api/conversations`, `GET /api/conversations/:id/messages`, `POST /api/conversations`, `POST /api/conversations/:id/messages`, `DELETE /api/messages/:id`, `PUT /api/messages/:id/delete-for-everyone`, `POST /api/conversations/:id/read`, `POST /api/users/:id/block`, `DELETE /api/users/:id/unblock`, `GET /api/message-requests`, `POST /api/message-requests/:id/accept`, `DELETE /api/message-requests/:id/decline`.

### Components
`ChatList.jsx`, `ChatWindow.jsx`, `Message.jsx`, `GroupInfoModal.jsx`, `MessageRequests.jsx`, `MediaPreview.jsx`.

### Styling
Yellow theme. Left panel: chat list. Center: active conversation. Right (optional): contact info drawer. Mobile: full screen chat, drawer list. Message bubbles: sender yellow, receiver gray.

---
---

## PROMPT-11 — Groups System + Rename to MindBook

**Trigger command:** `Run PROMPT-11`

I have MindBook. Implement a **complete, fully functional Groups system** and rename the app from "Minds Books" to **"MindBook"** everywhere.

### Group Privacy Levels
- **Public:** Anyone can see and join instantly.
- **Private (Visible):** Anyone can find it; posts hidden; must request/be invited to join.
- Implement both for MVP.

### Pages
- `/groups` — Dashboard: your groups, suggested groups, invites, Create Group button.
- `/groups/:id` — Group page: cover, name, description, member count, join/leave, feed.
- `/groups/:id/about` — Description, rules, members, creation date.
- `/groups/:id/members` — Searchable member list with roles.
- `/groups/:id/media` — Photos/videos grid.

### Group Feed
Create post, like/react, comment, share, pin post (admin), delete/edit post (owner or admin), hide post, report post.

### Roles & Permissions
- **Admin:** Full control — settings, approve requests, remove/ban/promote, delete posts, pin, change group name/cover.
- **Moderator:** Approve requests, remove members, delete posts.

### Group Model
```javascript
{ name, slug, description, coverPhoto, privacy, rules, creator, admins, moderators, members, bannedMembers, joinRequests[{user, requestedAt}], pinnedPosts, createdAt }
```

### Group Post Model
```javascript
{ group, author, content, imageUrl, videoUrl, likes, comments[{user, text, createdAt}], isPinned, isDeleted, createdAt }
```

### API Endpoints
`GET /api/groups`, `GET /api/groups/:id`, `GET /api/groups/:id/feed`, `POST /api/groups`, `PUT /api/groups/:id`, `DELETE /api/groups/:id`, `POST /api/groups/:id/join`, `POST /api/groups/:id/leave`, `POST /api/groups/:id/approve-request`, `POST /api/groups/:id/decline-request`, `POST /api/groups/:id/remove-member`, `POST /api/groups/:id/ban-member`, `POST /api/groups/:id/unban-member`, `POST /api/groups/:id/promote`, `POST /api/groups/:id/demote`, `POST /api/groups/:id/posts`, `PUT /api/groups/:id/posts/:postId/pin`, `DELETE /api/groups/:id/posts/:postId`, `POST /api/groups/:id/report`.

### Rename Application
Update in: `<title>`, navbar logo, favicon, README, footer ("© 2025 MindBook"), meta tags ("MindBook – Connect with friends and the world around you.").

### Components
`GroupsHome.jsx`, `GroupPage.jsx`, `CreateGroupModal.jsx`, `GroupCard.jsx`, `GroupPost.jsx`, `GroupMembersList.jsx`, `GroupManage.jsx`, `GroupJoinRequests.jsx`, `InviteFriendModal.jsx`.

---
---

## PROMPT-12 — New Chat Suggestions & Direct Message Button on Profiles

**Trigger command:** `Run PROMPT-12`

I have MindBook. Implement two specific messaging features:

### 1. New Chat Suggestions (in Messages section)

In the Messages inbox, add a **"New Chat"** section showing friends the user hasn't recently chatted with.

**Location:** Horizontal scrollable row at top of chat list ("Start a new chat").

**Suggestion Logic:** Prioritize friends with no recent conversation → friends with oldest last message → random. Exclude: users in active conversations, blocked users, self.

**API:** `GET /api/messages/suggestions` — returns up to 20 suggested friends (excluding recent chats and blocked users).

**Behavior:** Clicking suggestion — if conversation exists, navigate to it; if not, create new conversation and navigate.

### 2. Direct Message Button on User Profiles

On every other user's profile page, show a **"Message"** button next to "Add Friend".

**Button States:**
- Friends → enabled, opens existing or new conversation
- Not friends → enabled, message goes to Message Request
- Either user blocked → hidden/disabled
- Own profile → hidden

**Navigation:** Click → call `GET /api/conversations/with/:userId` (get or create) → navigate to `/messages/:conversationId`.

**API:** `GET /api/conversations/with/:userId` — returns existing conversation or creates new one.

### Components
`NewChatSuggestions.jsx`, `SuggestedChatCard.jsx`, modified `ProfilePage.jsx`, `useConversation.js` (custom hook).

---
---

## PROMPT-13 — Stories Reactions, Rich Media Chat, Group Navbar, Friends Section

**Trigger command:** `Run PROMPT-13`

I have MindBook. Implement the following features across the platform.

### 1. Stories — Reply & React with Emojis

**Reactions:** Emoji row (❤️ 😂 😮 😢 😡 👍) while viewing story. Tap to react. Creator sees who reacted + which emoji. Notification sent.

**Replies:** "Send message" input while viewing story. Reply sent as direct message to creator's chat. Special story reply bubble in chat.

**Story Model additions:** `reactions[{user, emoji, createdAt}]`, `replies[{user, message, createdAt}]`.

**New API:** `POST /api/stories/:id/react`, `POST /api/stories/:id/reply`.

### 2. Messenger Chat — Rich Media Support

**Supported:** Images (JPG/PNG/GIF/WEBP, 10MB), Videos (MP4/MOV, 50MB), Audio (MP3/M4A/OGG, 5MB), Voice messages (recorded in-app), Documents (PDF/DOC/XLS/TXT, 25MB).

**Voice Recorder UI:** Press-hold to record, release to send, swipe left to cancel, 2-minute max.

**Message Model additions:** `mediaUrl`, `mediaType (image|video|audio|document)`, `mediaMetadata{fileName, fileSize, duration}`.

**Upload API:** `POST /api/messages/upload` (Multer, returns mediaUrl + metadata).

### 3. Message Requests — One Message Limit

Non-friend can send **only one message** before acceptance. After that: input disabled, banner shown: "Waiting for [Name] to accept your message request."

**Conversation Model addition:** `messageRequestStatus (pending|accepted|declined)`.

**API:** `POST /api/conversations/:id/accept-request`.

### 4. Groups — Add Sticky Navbar

Add a sticky tab navbar to groups section:

**`/groups` navbar:** Your Groups, Discover, Create Group (button), Group Invites (badge).

**`/groups/:id` navbar:** Feed, About, Members, Media, Manage (admins only). Active tab highlighted in yellow.

### 5. Friends Section — Find New Friends

**Tabs at `/friends`:** My Friends, Friend Requests (incoming/outgoing), Find Friends, Suggestions.

**Discovery logic:** Mutual friends (2+), friends of friends, users in same groups. Search by name/email. Random fallback.

**Friend Request flow:** Send → Pending in recipient's tab → Accept/Decline → Notification on both sides.

**API:** `GET /api/users/friends`, `GET /api/users/friend-requests`, `POST /api/users/friend-request/:userId`, `POST /api/users/friend-request/:requestId/accept`, `DELETE /api/users/friend-request/:requestId/decline`, `DELETE /api/users/friend-request/:requestId/cancel`, `GET /api/users/suggestions`, `GET /api/users/search?q=`.

### Components
`StoryViewer.jsx`, `StoryReplyNotification.jsx`, `MessageInput.jsx` (enhanced), `VoiceRecorder.jsx`, `MediaGallery.jsx`, `GroupNavbar.jsx`, `FriendsPage.jsx`, `UserSuggestionCard.jsx`, `FindFriendsTab.jsx`.

---
---

## PROMPT-14 — Full Style, Animations & Responsiveness Upgrade

**Trigger command:** `Run PROMPT-14`

I have MindBook. Perform a **complete style overhaul** to make the site modern, visually stunning, highly animated, fully responsive, and smooth to interact with.

### Global CSS Variables

```css
:root {
  --brand-primary: #F7B928;
  --brand-primary-hover: #E4A11B;
  --brand-gradient: linear-gradient(135deg, #F7B928, #FFD700);
  --bg-body: #f8f9fa;
  --bg-card: rgba(255, 255, 255, 0.95);
  --text-primary: #111112;
  --text-secondary: #666a72;
  --border-color: #e4e6eb;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
  --shadow-md: 0 8px 32px rgba(0,0,0,0.08);
  --shadow-lg: 0 16px 48px rgba(0,0,0,0.12);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 400ms ease;
}

body.dark {
  --bg-body: #0F172A;
  --bg-card: rgba(30, 41, 59, 0.95);
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --border-color: #334155;
}
```

**Typography:** Use **Inter** or **Poppins** (Google Fonts). Base 16px, rem units. Heading scale: h1 32px, h2 24px, h3 20px, h4 18px. All semibold. Body line-height 1.5.

### Animations & Micro-Interactions

**Enter/Exit:** Page load (fade + slideY 10px → 0, 300ms), modal open (scale 0.95→1 + fade), dropdown (fade + scale 0.9→1, 150ms), toast (slide from right, 300ms).

**Hover/Focus:** Button (scale 1.02, glow), card (translateY -4px, shadow deepens), link (underline slide), avatar (scale 1.05, ring), icon button (scale 1.1 + background).

**Scroll Animations (IntersectionObserver):** Posts fade-up staggered (50ms), story rings pulse, sidebar sections fade from left.

**Loading & Skeletons:** Shimmer effect (moving gradient) on feed, profile, chat. Top progress bar (YouTube style) on page transition.

**Interactive Feedback:** Click ripple effect. Like button pop (scale 1→1.5→1). Send message — paper airplane flies out. Theme toggle — sun/moon rotates 360°.

### Responsive Breakpoints

| Device | Breakpoint | Layout |
|---|---|---|
| Mobile small | max 480px | Single column, sidebars hidden, bottom nav |
| Mobile large | 481–768px | Single column, sidebars as drawers |
| Tablet | 769–1024px | Two columns, left sidebar compact |
| Desktop | 1025–1440px | Three columns (Facebook style) |
| Widescreen | >1440px | Centered max-width 1400px |

**Mobile-Specific:** Bottom navigation bar (Home, Groups, Friends, Messages, Profile — active yellow). Hamburger menu drawer. Touch targets min 44×44px. Pull-to-refresh on feed.

### Dark Mode
Moon/sun toggle in navbar. Smooth 300ms color transition. Persist in `localStorage`. Every component uses CSS variables — no hardcoded light colors.

### Performance
Use `transform` and `opacity` for animations (GPU accelerated). Lazy load images. `React.memo`, `useCallback`, `useMemo`. Virtual scrolling for long feeds (`react-window`). Code splitting with `React.lazy`. Debounce search (300ms). Throttle scroll (100ms).

### Section-Specific Upgrades
- **Feed:** Glass/white cards, like/comment/share with hover, comment nesting.
- **Profile:** Parallax cover photo, circular avatar with border, yellow underline active tabs.
- **Messages:** Yellow bubbles (sent), gray (received), animated typing dots, attachment input area.
- **Groups:** Grid cards with cover image, privacy badge, member count.
- **Friends:** Card layout, yellow Accept button, search bar with animated focus.

---
---

## PROMPT-15 — Full Code Analysis, Browser Testing & Error Fixing

**Trigger command:** `Run PROMPT-15`

You are an expert full-stack developer and QA engineer. Analyze the entire MindBook codebase, identify all errors and non-functional features, then test every function in a browser (using Puppeteer/Playwright or step-by-step manual instructions), and fix all discovered issues.

### Phase 1 — Static Code Analysis

**Backend:** syntax errors, logic errors, DB issues, missing error handling, security (bcrypt, JWT expiry, input validation), performance (pagination, inefficient queries), API design, file upload security.

**Frontend:** syntax errors, runtime errors (undefined props, missing keys, infinite useEffect loops), state management (stale closures, missing deps), API integration (no loading states, no error handling), routing, event handling, accessibility, console errors.

**Styling:** CSS typos, layout overlap, overflow, responsiveness, dark mode hardcoded colors, animation issues.

### Phase 2 — Browser Testing

**Test Account:** Navigate to `/register`, create `TestUser_[random]` with `testuser_[random]@example.com` / `Test@123456`. Confirm creation. Log in.

**Feature Test Checklist:** Authentication (register, login, logout, protected routes), Profile (view, edit, upload pic/cover), Posts (create text+image, like, comment, delete, pagination), Stories (create, view, react, reply), Messaging (1-on-1 text, image/video/document/voice, real-time, typing, read receipt, delete), Message Requests (non-friend → request folder → accept, one-message limit), Groups (create, join, post, admin actions), Friends (send/accept/decline/cancel requests, friends list), Notifications (friend request, message, story reply), Search, Dark Mode, Responsiveness (375px/768px/1024px).

### Phase 3 — Error Fixing

**Priority:** P0 (app crash) → P1 (major feature broken) → P2 (minor feature/style) → P3 (typos/alignment).

For each fix provide: file path + line, original code, corrected code, explanation.

**Common Issues to Check First:** Infinite feed loading, Socket.IO connection/event mismatch, stories not expiring (TTL index), friend request notification missing, dark mode not persisting, image upload Multer config, mobile menu not opening.

### Deliverables
Test Report (✅/❌/⚠️ per feature), Bug List (severity, description, steps to reproduce, root cause, fix applied), Fixed Code (all modified files), Testing Instructions, Performance Metrics, Remaining Known Issues.

---
---

## PROMPT-16 — Fix Left Sidebar Overlap (Desktop/Laptop)

**Trigger command:** `Run PROMPT-16`

I have MindBook. On **desktop and laptop screens (≥1024px)**, the left sidebar is **overlapping the main feed and story cards**, making text unreadable. Fix this completely.

### Expected Layout After Fix

| Column | Width |
|---|---|
| Left Sidebar | 280px (fixed) |
| Main Feed | 1fr (remaining space) |
| Right Sidebar | 320px (fixed, optional) |

### Required CSS Fix

```css
/* Desktop layout */
.app-container {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.left-sidebar {
  grid-column: 1 / 2;
  position: sticky;
  top: 60px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.main-feed {
  grid-column: 2 / 3;
  min-width: 0; /* CRITICAL: prevents flex overflow */
  overflow-x: hidden;
}

.right-sidebar {
  grid-column: 3 / 4;
  position: sticky;
  top: 60px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

@media (max-width: 1023px) {
  .app-container { grid-template-columns: 280px 1fr; }
  .right-sidebar { display: none; }
}

@media (max-width: 767px) {
  .app-container { grid-template-columns: 1fr; }
  .left-sidebar, .right-sidebar { display: none; }
}
```

Also add global reset:
```css
*, *::before, *::after { box-sizing: border-box; }
body { overflow-x: hidden; }
```

**Remove:** any `position: absolute`, `float`, negative margins, or hardcoded `margin-left` values on the main feed.

**Verify:** No overlap at 1440px, 1024px, 768px, 375px. No horizontal scrollbar. Sticky sidebars work.

---
---

## PROMPT-17 — Comprehensive Bug Fixes & UI Improvements

**Trigger command:** `Run PROMPT-17`

I have MindBook. Fix the following issues found during manual testing.

### 1. Friends Section — Add Navbar & Improve UI
Add tab bar to `/friends`: **My Friends**, **Friend Requests**, **Find Friends**, **Suggestions**. Card-based layout for suggestions. Hover effects, yellow active tab. Full dark mode support.

### 2. Message Section — Improve Styling
Chat list: avatar (50×50px), name, last message preview, timestamp, unread badge (yellow), hover effect. Message bubbles: own = yellow, others = gray, 18px radius. Date separators. Animated typing indicator (three bouncing dots). Input area: attachment, voice, emoji, multiline text input, send button. Add missing send button to story reply input.

### 3. Story Creation — Add Confirmation Modal
Before publishing: show preview (thumbnail of photo/video), optional caption field, "Post to Story" button, "Cancel" button. After confirmation: story published, modal closes, success toast.

### 4. Comment Like & Reply
Heart icon next to each comment → like/unlike with count. "Reply" button under comment → opens nested input, replies indented.

### 5. Share Button — Add Functionality
Click share → modal: "Share to Feed", "Share to Friend's Timeline", "Share in Group", "Copy Link". Implement "Share to Feed" for MVP (new post quoting original).

### 6. Remove All Transparency/Glassmorphism Effects
Remove all `backdrop-filter: blur()` and `rgba()` transparency. Replace with solid backgrounds: `#ffffff` (light mode cards), `#1e293b` (dark mode cards). Keep shadows and border-radius.

### 7. Animations — Improve
Add: button hover scale (1.02), card hover lift (translateY -4px), like button pop (scale 1→1.5→1), modal fade-in. Page transitions (Framer Motion or React Transition Group). Skeleton loaders for feed, chat, friend suggestions.

### 8. Settings Section (`/settings`)
Create full settings page accessible from navbar. Sections:
- **Account:** Edit full name, email, mobile.
- **Password:** Current password, new password, confirm.
- **Profile:** Profile pic, cover photo, bio, location, gender, date of birth.
- **Privacy:** Who can message you, who can send friend requests.
- **Notifications:** Toggle for messages, friend requests, story replies, group invites.
- **Theme:** Dark mode toggle.
- **Delete Account:** Confirmation modal, removes all user data.

**New API:** `PUT /api/users/settings/account`, `PUT /api/users/settings/privacy`, `PUT /api/users/settings/notifications`, `DELETE /api/users/account`.

### 9. Signup Page — Required Fields
Redesign `/register` with fields: Full Name (required), Date of Birth (optional), Gender dropdown (optional), Mobile/Email (optional), Confirm Mobile/Email (optional), Notifications opt-in checkbox (optional), Password (required, min 8 chars), Confirm Password (required).

**Legal text (must display):**
> "People who use our service may have uploaded your contact information to MindBook."
> "By tapping Submit, you agree to create an account and to MindBook's Terms, Privacy Policy, and Cookies Policy."
> "The Privacy Policy describes the ways we can use the information we collect when you create an account."

Submit button enabled only when required fields are filled.

---
---

## PROMPT-18 — Messenger UI Fixes, Discover Groups UI, Login/Signup UI

**Trigger command:** `Run PROMPT-18`

I have MindBook. Fix the following UI/UX issues found during testing.

### 1. Message Section — Full UI Redesign
Modern layout similar to Facebook Messenger. Chat list: avatar (50×50px), name, last message truncated, timestamp, unread badge (yellow), hover effect. Chat window: yellow/gray bubbles, date separators, animated typing dots. Input area: attachment icon, voice icon, emoji picker (optional), multiline input, send button. Input expands as user types.

### 2. Messenger Sidebar — Fix Overlap & CSS

```css
.messenger-container {
  display: flex;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.chat-list {
  width: 360px;
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  flex-shrink: 0;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 1024px) { .chat-list { width: 280px; } }

@media (max-width: 768px) {
  .chat-list {
    position: fixed;
    left: -100%;
    transition: left 0.3s ease;
    z-index: 1000;
    background: var(--bg-card);
  }
  .chat-list.open { left: 0; }
  .chat-window { width: 100%; }
}
```

Independent scrollbars on both panels (`overflow-y: auto`). Back button on mobile to return to chat list.

### 3. Discover Groups — Improve UI
Grid layout: 3 columns desktop, 2 tablet, 1 mobile. Group card: cover image/placeholder, name, privacy badge, member count, short description, Join button. Add search bar (by name) and filter dropdown (All/Public/Private/My Groups). Skeleton cards while loading. Empty state with "No groups found. Be the first to create one!" + Create Group button.

### 4. Login Page — Redesign
Centered card (max-width 400px), solid background (no transparency). MindBook logo ('M' yellow) prominently above form. Fields: email/username, password, "Remember Me" checkbox, "Forgot Password?" link. Full-width yellow Login button. Clear red error messages for invalid credentials. Footer: "Don't have an account? Sign up" → `/register`. Optional demo credentials hint.

### 5. Signup Page — Redesign
Centered card (max-width 500px). Required fields: Full Name, Email, Password (min 8), Confirm Password. Optional fields: Date of birth, Gender, Mobile. Legal checkboxes (required). Full-width yellow Submit button with loading spinner. Footer: "Already have an account? Log in" → `/login`. Client-side validation: email format, password match, min length. Inline error messages.

---
---

## PROMPT-19 — Complete Media Sharing in Chat (Files, Photos, Video, Audio, Voice)

**Trigger command:** `Run PROMPT-19`

I have MindBook. Add **complete media sharing** in chat (one-on-one and group) allowing users to send photos, videos, audio, voice messages, and documents.

### Supported Types

| Type | Formats | Max Size |
|---|---|---|
| Images | JPG, PNG, GIF, WEBP | 10 MB |
| Videos | MP4, MOV, AVI | 50 MB |
| Audio | MP3, M4A, OGG | 5 MB |
| Voice (recorded) | WebM/OGG | 5 MB, max 2 min |
| Documents | PDF, DOC, DOCX, XLS, TXT | 25 MB |

### Attachment Picker UI
Paperclip icon → menu: Photo/Video, Document, Voice Message.

### Upload Flow
Select file → preview modal (thumbnail for images/videos, file icon for docs) → optional caption → Send button → upload progress per file → media appears in chat bubble → real-time delivery via Socket.IO.

### Voice Recording
Press-hold microphone to record → release to send → swipe left to cancel → max 2 min → countdown warning at 10s remaining → request microphone permission on first use.

### Media Display in Chat

| Type | Display | Click Action |
|---|---|---|
| Image | Thumbnail (max 200×200px) | Lightbox fullscreen |
| Video | First-frame thumbnail + play icon + duration | Inline video player |
| Audio/Voice | Waveform + play/pause + duration | Plays inline |
| Document | File icon + name + size + download button | Download |

### Backend — Upload API
`POST /api/messages/upload` (Multer, multipart/form-data). Returns `{ mediaUrl, mediaType, metadata: { fileName, fileSize, mimeType, width, height, duration } }`.

**Multer config:** Disk storage → `/uploads/messages/`. Unique filenames. MIME-type validation. 50MB limit.

**Message Model additions:** `mediaUrl`, `mediaType (image|video|audio|voice|document)`, `mediaMetadata{fileName, fileSize, mimeType, width, height, duration}`, `thumbnailUrl`.

**Static files:** `app.use('/uploads', express.static('uploads'))`.

### Socket.IO
`send-message` payload includes: `{ conversationId, text, mediaUrl, mediaType, mediaMetadata }`. Server saves to DB and emits `receive-message` to all participants.

### Security
MIME validation on backend. File size limits enforced. Authenticated upload (JWT required). Rate limit (10 files/min). Files not publicly accessible without auth.

### Components
`AttachmentMenu.jsx`, `MediaPreviewModal.jsx` (with upload progress), `VoiceRecorder.jsx` (press-hold, waveform, swipe to cancel), `MediaMessageBubble.jsx` (conditional per mediaType), `MediaGallery.jsx` (lightbox for images).

**Install:** `multer`, `fluent-ffmpeg` (video thumbnails), `node-cron` (file cleanup), optionally `multer-s3` (production).

---
---

## PROMPT-20 — Fix All Broken Media Messaging Features

**Trigger command:** `Run PROMPT-20`

I have MindBook. Text messaging works but **all media features are broken**: file sending, image preview, voice messages, emoji picker, document sharing, and video sharing. Diagnose and fix every issue.

### Phase 1 — Diagnose Root Causes

**Backend:** Check upload route exists and is correct. Multer config (storage, fileFilter, limits, destination folder exists and is writable). Message model has mediaUrl/mediaType/mediaMetadata fields. Socket.IO payload includes media fields. Static file serving configured. Error handling in place.

**Frontend:** Attachment file input has correct `accept` and `multiple` attributes, `onChange` fires. `URL.createObjectURL()` called correctly. Axios upload request uses `Content-Type: multipart/form-data` and FormData with file appended. Socket emit happens after upload completes. Emoji picker installed, imported, rendering, and appending to input. Voice recorder using `navigator.mediaDevices`, MediaRecorder initialized, blob converted to File. Message bubble conditionally renders based on `mediaType`.

**Browser Console:** Check for 404s, CORS errors, Socket.IO disconnect. Network tab: upload request status (200? 500?). Is file included in payload?

### Phase 2 — Apply Fixes

#### Backend Fix — Upload Route

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const uploadDir = 'uploads/messages';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg','image/png','image/gif','image/webp','video/mp4','video/quicktime','audio/mpeg','audio/mp4','audio/webm','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('File type not allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const mediaType = req.file.mimetype.startsWith('image') ? 'image' : req.file.mimetype.startsWith('video') ? 'video' : req.file.mimetype.startsWith('audio') ? 'audio' : 'document';
  res.json({ success: true, mediaUrl: `/uploads/messages/${req.file.filename}`, mediaType, metadata: { fileName: req.file.originalname, fileSize: req.file.size, mimeType: req.file.mimetype } });
});

module.exports = router;
```

In `server.js`: `app.use('/api/messages', messageRoutes)` and `app.use('/uploads', express.static(path.join(__dirname, 'uploads')))`.

#### Fix — Socket.IO Media Handling

Ensure `send-message` handler saves `mediaUrl`, `mediaType`, `mediaMetadata` to DB and includes them in `receive-message` emit to all participants.

#### Fix — Frontend Upload

Build FormData correctly: `formData.append('file', file)`. Use axios with `headers: { 'Content-Type': 'multipart/form-data' }`. Emit socket event only after upload resolves. Include `mediaUrl`, `mediaType`, `mediaMetadata` in socket payload.

#### Fix — Emoji Picker

```bash
npm install emoji-picker-react
```
Import, render on toggle, append `emojiObject.emoji` to text state.

#### Fix — Voice Recorder

```bash
npm install react-mic
```
Use `ReactMic` component. `onStop` converts blob to File and calls upload + send.

#### Fix — Media Message Bubble

Use `switch(message.mediaType)` to render: `<img>` for image, `<video controls>` for video, `<audio controls>` for audio/voice, file icon + download link for document.

### Phase 3 — Verify

Test: send image (thumbnail + lightbox), send video (inline player), send document (download button), record + send voice (plays inline), send emoji (displays in bubble), receive media in real time. Upload progress shows. Error message on failure.

### Common Mistakes Checklist
- [ ] `express.json()` added before upload route
- [ ] CORS configured with correct origin
- [ ] Socket emits to all participants (not just sender)
- [ ] Media URL is absolute or proxy is configured
- [ ] `accept` attribute set on file input
- [ ] Multer `fileSize` limit high enough
- [ ] Uploads folder has write permission

---

## Notes for Antigravity Agents

- All prompts assume the **MindBook** MERN project is already open in Antigravity.
- Each prompt is self-contained. Agents should read the relevant PROMPT section fully before writing any code.
- Always run the backend and frontend together to test (MongoDB on port 27017, backend on 5000, frontend on 5173 via Vite).
- The yellow brand color is always `#F7B928`. Never replace it with any other color.
- After completing any prompt, run **PROMPT-07** to verify no new errors were introduced.
- If a prompt depends on features from a previous prompt, check that those features exist before implementing new ones.

---

*Last updated: 2026 | Application: MindBook | Stack: MongoDB, Express.js, React (Vite), Node.js | Brand: Yellow `#F7B928`*