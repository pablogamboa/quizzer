# Quizzer - Unified Full-Stack App

A complete quiz application deployed as a single Cloudflare Worker, serving both the frontend and API endpoints from the same domain.

## 🏗️ Architecture

This project combines the frontend and backend into a single Cloudflare Worker deployment:

- **Frontend**: Served as static files from the Worker
- **Backend**: Hono-powered API routes
- **Database**: Cloudflare D1 (SQLite) with Prisma ORM
- **Deployment**: Single command deployment with Wrangler

### Real-Time Multiplayer Architecture

The online multiplayer mode uses **Cap'n Web RPC** for bidirectional, type-safe communication:

- **Durable Objects**: Each game session is managed by a `GameSessionRpc` Durable Object that maintains state
- **Cap'n Web RPC**: Provides bidirectional RPC over WebSockets with full TypeScript support
- **Capability-based Security**: Players receive session capabilities that authorize their actions
- **Server-to-Client Callbacks**: The server can push updates to clients in real-time

**Key Implementation Details:**

- **Client RPC Target**: The `GameClient` class extends `RpcTarget` and implements `GameClientApi`, allowing the server to call methods on connected clients
- **Event Handlers**: Event handlers are stored as instance properties (not in a `WeakMap`) to ensure they work correctly with Cap'n Web's RPC proxying
- **Session Cleanup**: Components properly unsubscribe from event handlers on unmount to prevent memory leaks
- **Bidirectional Communication**: Clients pass their `GameClient` instance to the server during connection, enabling the server to broadcast state changes, player events, and game updates to all connected clients
- **Stub Lifecycle Management**: **Critical Fix** - The server must duplicate client stubs using `.dup()` before storing them. Cap'n Web automatically disposes RPC stubs passed as parameters when the RPC call completes. Without duplication, callbacks fail with "Attempted to use RPC stub after it has been disposed." The duplicated stubs must also be explicitly disposed when players leave using `[Symbol.dispose]()` to prevent memory leaks.

**RPC Flow:**

1. Client creates a `GameRpcClient` with a `GameClient` callback handler
2. Client connects via `joinGame(playerName, client)`, passing the callback handler
3. Server stores the client reference in the Durable Object
4. Server broadcasts events by calling methods on stored client references
5. Client methods emit local events that trigger UI updates

## 🚀 Features

### Game Modes

- **📱 Solo Mode**: Individual quiz experience with customizable settings
- **👥 Pass & Play**: Local multiplayer - take turns on the same device
- **🌐 Online Battle**: Real-time networked multiplayer with Cap'n Web RPC

### Frontend

- 🎨 Modern responsive design optimized for mobile
- ⚙️ Customizable quiz options (count, difficulty, category, themes)
- 📊 Real-time progress tracking
- ✅ Immediate feedback with detailed results
- 🎉 Celebration effects for high scores
- 📱 Mobile-first responsive design
- 🎮 Real-time multiplayer with Cap'n Web RPC
- 🔗 Shareable game codes for online battles

### Backend

- 🔒 Secure answer validation (server-side only)
- 🎲 Dynamic question selection with filtering
- 📂 Category and difficulty-based endpoints
- 📊 Quiz statistics and analytics
- 🌐 CORS configured for same-origin requests
- 🗄️ Type-safe database queries with Prisma ORM
- 🏆 Hall of Fame leaderboard system
- ⚡ Cloudflare Durable Objects for real-time multiplayer state
- 🔌 Cap'n Web RPC for type-safe real-time communication

## 🎨 Design System - "Neon Quiz Show"

The application features a stunning retro-futuristic design system combining 80s neon aesthetics with modern sophistication. The redesign creates a premium quiz show experience that stands out from generic quiz apps.

### Visual Philosophy

**Neon Quiz Show Aesthetic:**

- Retro-futuristic vibes with modern minimalism
- High-energy colors inspired by game shows and arcades
- Sophisticated animations with 3D depth effects
- Playful yet premium feeling throughout
- Distinctive visual identity that feels alive

### Color Palette

**Primary Colors - Game Show Energy:**

- **Coral Energy**: `#FF6B6B` → `#FF8787` - Warm, inviting, energetic red
- **Ocean Teal**: `#00CEC9` → `#81ECEC` - Fresh, vibrant cyan
- **Sunshine Yellow**: `#FDCB6E` → `#FFF176` - Bright, optimistic gold
- **Victory Green**: `#00D2A0` → `#55EFC4` - Success and achievement
- **Hot Pink**: `#FD79A8` → `#FFA7C4` - Playful accent color

**Background System:**

- **Deep Space Navy**: `#0F172A` - Primary dark background
- **Elevated Surface**: `#1E293B` - Rich charcoal for elevated UI
- **Pure White Cards**: `#FFFFFF` - High-contrast card surfaces

### Advanced Visual Features

**Particle Background System:**

- 50 floating particles with randomized drift animations
- Animated mesh gradients with organic movement
- Three large blur orbs in coral, teal, and yellow (NO purple!)
- Subtle noise texture overlay for depth
- All optimized for 60fps performance

**3D Effects & Depth:**

- Transform-style: preserve-3d for authentic 3D tilting
- Multiple layered gradients for holographic effects
- Radial gradient glows on hover states
- Shadow depth ranging from subtle (4px) to dramatic (32px)
- Perspective transforms on interactive elements

**Micro-interactions:**

- Staggered entrance animations with choreographed timing
- Magnetic button effects with 3D tilt following cursor
- Shimmer effects sweeping across surfaces
- Elastic easing for playful bounce effects
- Scale and rotate animations on interactions

**Progress & Feedback:**

- Animated gradient progress bars with glow effects
- Pulsing indicators for active states
- Circular SVG progress rings on results
- Real-time particle trails following progress
- Color-coded difficulty and category badges

### Typography

**Font Stack:**

- **Display Font**: Clash Display (headings, logo) - Distinctive and bold
- **Body Font**: DM Sans (body text, UI) - Superior readability
- **Monospace**: JetBrains Mono (scores, stats) - Technical aesthetic

**Typography Scale:**

- Mega titles: 6-8rem with tight tracking (-0.02em)
- Hero text: 3-4rem with animated gradient clip
- Questions: 2-2.5rem, bold, high contrast
- Body: 1-1.125rem, relaxed line-height (1.6)

### Animation System

**Keyframe Library:**

- `meshRotate` - Organic background movement
- `particleDrift` - Floating particle animations
- `orbFloat` - Large blur orb transformations
- `gradientShift` - Animated gradient text
- `progressGlow` - Progress bar shimmer
- `bounce` - Celebration icon animation
- `float` - Gentle floating motion
- `shimmer` - Loading skeleton effects
- `spin` - Rotation animations

**Timing Functions:**

- Fast: `0.15s cubic-bezier(0.4, 0, 0.2, 1)`
- Base: `0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Slow: `0.5s cubic-bezier(0.4, 0, 0.2, 1)`
- Bounce: `0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)`
- Elastic: `0.8s cubic-bezier(0.68, -0.6, 0.32, 1.6)`

### Component Highlights

**Start Screen:**

- Hero section with 7rem gradient text logo
- 3D mode cards with transform: preserve-3d
- Holographic glow effects on hover
- Shine sweeps across surfaces
- Rotating numbered buttons with gradient fills

**Question Screen:**

- Elevated card with dramatic shadows (shadow-2xl)
- Animated progress bar with glow trail
- Answer options with radial gradient glows
- Staggered entrance from alternating sides
- 3D lift effects on selection

**Results Screen:**

- SVG circular progress ring with gradient stroke
- Celebration icon with bounce animation
- Stats cards with gradient icon backgrounds
- Expandable results list with slide animations
- Color-coded correctness indicators

### Accessibility & Performance

**Accessibility:**

- WCAG AA contrast ratios maintained
- Respects `prefers-reduced-motion`
- All animations can be disabled
- Keyboard navigation with visible focus states
- Screen reader friendly

**Performance:**

- CSS animations over JavaScript
- GPU-accelerated transforms
- Optimized particle count (30 mobile, 50 desktop)
- Lazy-loaded heavy animations
- 60fps target maintained

## 📦 Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account
- Wrangler CLI

### Installation

1. **Install dependencies:**

```bash
npm install
```

This automatically runs `npm run generate:prisma` to generate the Prisma client.

2. **Login to Cloudflare:**

```bash
npx wrangler login
```

3. **Update wrangler.toml:**
   Update the `name` field in `wrangler.toml` with your desired worker name.

### Development

1. **Copy static files:**

```bash
npm run build
```

2. **Start development server:**

```bash
npm run dev
```

The app will be available at `http://localhost:8787` with both frontend and API.

### Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

Your app will be live at `https://your-worker-name.your-subdomain.workers.dev`

## 📁 Project Structure

```
quizzer/
├── src/
│   ├── index.ts                    # Main worker entry point
│   ├── routes/
│   │   ├── quiz.ts                 # Quiz API routes
│   │   └── multiplayer.ts          # Multiplayer API routes
│   ├── services/
│   │   └── database.ts             # Prisma database service
│   ├── durable-objects/
│   │   ├── GameSessionRpc.ts       # Cap'n Web RPC game state manager
│   │   └── types.ts                # Shared type definitions for multiplayer
│   ├── lib/
│   │   └── rpc-api.ts              # RPC API type definitions
│   └── frontend/                   # Svelte frontend components
│       ├── App.svelte
│       ├── components/
│       │   ├── StartScreen.svelte
│       │   ├── QuestionScreen.svelte
│       │   ├── ResultScreen.svelte
│       │   ├── NetworkedModeSelection.svelte
│       │   ├── CreateNetworkedGame.svelte
│       │   ├── JoinNetworkedGame.svelte
│       │   ├── MultiplayerLobby.svelte
│       │   ├── NetworkedQuestionScreen.svelte
│       │   └── NetworkedResultScreen.svelte
│       ├── stores/
│       │   └── quiz.svelte.js      # Svelte 5 state management
│       └── lib/
│           ├── rpc-client.ts       # Cap'n Web RPC client
│           └── api.js              # API client functions
├── prisma/
│   └── schema.prisma               # Database schema
├── migrations/                     # SQL migration files
├── tests/
│   ├── unit/                       # Vitest unit tests
│   └── e2e/                        # Playwright E2E tests
├── public/                         # Built frontend assets
├── package.json                    # Dependencies & scripts
├── wrangler.toml                   # Cloudflare Workers config
├── CLAUDE.md                       # Development instructions for Claude Code
└── README.md                       # This file
```

## 🎨 Themed Quizzes

The application supports specialized themed quizzes within categories for a more focused experience.

### Available Themes

- **Geography > Country Shapes** 🗺️ - Identify countries by their silhouette
- **Geography > City Skylines** 🌆 - Identify cities by their skyline
- **Geography > World Flags** 🚩 - Identify countries by their flags

### How Themes Work

1. Select a category (e.g., Geography)
2. Choose an optional theme or skip for general questions
3. Get questions filtered to that specific theme
4. Great for focused learning or themed competitions

### Adding New Themes

Themes are stored in the `quiz_themes` table:

```bash
# Create a new theme
npx wrangler d1 execute quizzer-db --local --command="
INSERT INTO quiz_themes (theme_key, theme_name, category, description, icon, is_active)
VALUES ('country-capitals', 'Country Capitals', 'Geography', 'Identify capital cities', '🏛️', 1)
"

# Add questions with the theme
npx wrangler d1 execute quizzer-db --local --command="
INSERT INTO questions (type, question, category, difficulty, theme)
VALUES ('trivia', 'What is the capital of Japan?', 'Geography', 'easy', 'country-capitals')
"
```

## 🌐 Online Battle Mode

The application supports real-time multiplayer quizzes using **Cloudflare Durable Objects** and **Cap'n Web RPC**.

### How It Works

1. **Host Creates Game**
    - Choose quiz settings (questions, category, difficulty, theme)
    - Enter player name
    - Get a unique 6-character game code
    - Share code with friends

2. **Players Join**
    - Enter the game code
    - Join the lobby and wait for host to start

3. **Live Gameplay**
    - All players see the same questions simultaneously
    - First correct answer wins the point (⚡ speed matters!)
    - Real-time score updates
    - Live feedback on who answered correctly

4. **Results**
    - Final leaderboard with all player scores
    - Winner celebration

### Technical Architecture

**Cap'n Web RPC** ([blog post](https://blog.cloudflare.com/capnweb-javascript-rpc-library/)):

- Type-safe TypeScript RPC protocol for real-time communication
- Bidirectional method calls between client and server
- Capability-based security model
- Full type checking from client to server

**Important Cap'n Web RpcTarget Rules**:

1. **RpcTarget classes must only contain serializable properties**:
    - ✅ Primitives (string, number, boolean, null, undefined)
    - ✅ Plain objects and arrays
    - ✅ Date, Uint8Array, bigint
    - ❌ Map, Set (not yet supported - use plain objects/arrays)
    - ❌ Custom class instances, Durable Objects

2. **Interface type signatures**:
    - Use plain interface types, NOT `RpcStub<T>`
    - Cap'n Web automatically converts RpcTarget to RpcStub
    - Example: `joinGame(client: GameClientApi)` not `joinGame(client: RpcStub<GameClientApi>)`

3. **Durable Objects with RPC**:
    - Don't pass the Durable Object itself to `newWorkersRpcResponse`
    - Create a thin RpcTarget wrapper class with no state
    - Wrapper delegates to the Durable Object via closure/reference

**Durable Objects** (`src/durable-objects/GameSessionRpc.ts`):

- Persistent game state per session
- RPC connection management via WebSocket upgrade
- Session recovery after hibernation
- First-correct-answer scoring logic
- Capability-based player sessions

**RPC API** (`src/lib/rpc-api.ts`):

Server methods (called by client):

- `joinGame(playerName, client)` - Player joins and receives PlayerSession capability
- `startGame()` - Host starts the quiz
- `submitAnswer(answer)` - Player submits an answer
- `getGameState()` - Get current game state
- `leaveGame()` - Player leaves the game

Client callbacks (called by server):

- `onQuestionStarted(question, number, total)` - New question broadcast
- `onAnswerSubmitted(playerId, playerName)` - Track who has answered
- `onQuestionEnded(results)` - Answer feedback and scores
- `onGameFinished(finalScores)` - Final results
- `onGameStateUpdated(state)` - Real-time state sync

**Session Persistence**:

- WebSocket-based RPC session with automatic reconnection
- Durable Object storage for game state
- Capability-based security (each player has unique session object)

### Local Development

Durable Objects require special setup for local testing:

```bash
# Start dev server (enables Durable Objects)
npm run dev
```

**Note**: Durable Objects have limited functionality in local development. For full testing, deploy to Cloudflare Workers:

```bash
npm run deploy
```

### Troubleshooting

**Database Issues (500 Errors)**:

If you encounter "no such table" or "no such column" errors after clearing Durable Object state, you need to reapply all migrations:

```bash
# Kill the dev server first
# Then apply all migrations in order
npx wrangler d1 execute quizzer-db --local --file=./migrations/001_create_questions_table.sql
npx wrangler d1 execute quizzer-db --local --file=./migrations/002_seed_questions.sql
npx wrangler d1 execute quizzer-db --local --file=./migrations/003_create_hall_of_fame.sql
npx wrangler d1 execute quizzer-db --local --file=./migrations/004_add_quiz_themes.sql
npx wrangler d1 execute quizzer-db --local --file=./migrations/005_seed_quiz_themes.sql
npx wrangler d1 execute quizzer-db --local --file=./migrations/006_create_multiplayer_tables.sql

# Restart dev server
npm run dev
```

The local D1 database is stored in `.wrangler/state/v3/d1/` - clearing this directory requires reapplying all migrations.

**RPC Callback Issues**:

If server callbacks aren't being received by clients:

1. Verify client stubs are duplicated using `.dup()` in `GameSessionRpc.ts`
2. Check event handlers are registered before the RPC call completes
3. Ensure event handlers are stored as instance properties (not WeakMap)
4. Check browser console logs for "Attempted to use RPC stub after it has been disposed" errors
5. **Verify event name consistency**: The event names used in `GameClient.emit()` must exactly match the names used in `rpcClient.on()`. Common mismatches:
    - `emit('questionStarted')` must match `on('questionStarted')` not `on('question')`
    - `emit('questionEnded')` must match `on('questionEnded')` not `on('questionResults')`
6. **Check event data format**: Events are emitted as objects, so listeners must receive a single object parameter, not multiple parameters:
    - ❌ `rpcClient.on('questionStarted', (question, number, total) => ...)`
    - ✅ `rpcClient.on('questionStarted', (data) => { data.question, data.questionNumber, data.totalQuestions })`

## 🔗 API Endpoints

### Quiz API

All quiz endpoints are prefixed with `/api/quiz`:

| Method | Endpoint                                         | Description                |
| ------ | ------------------------------------------------ | -------------------------- |
| GET    | `/api/quiz/questions`                            | Get all questions          |
| GET    | `/api/quiz/questions/random/:count`              | Get random questions       |
| GET    | `/api/quiz/questions/category/:category`         | Filter by category         |
| GET    | `/api/quiz/questions/difficulty/:level`          | Filter by difficulty       |
| GET    | `/api/quiz/questions/theme/:theme/random/:count` | Get themed questions       |
| POST   | `/api/quiz/submit`                               | Submit answers for scoring |
| GET    | `/api/quiz/categories`                           | Get available categories   |
| GET    | `/api/quiz/stats`                                | Get quiz statistics        |
| GET    | `/api/quiz/themes`                               | Get all themes             |
| GET    | `/api/quiz/themes/category/:category`            | Get themes for category    |
| GET    | `/api/quiz/hall-of-fame`                         | Get leaderboard entries    |
| POST   | `/api/quiz/hall-of-fame`                         | Save quiz attempt          |
| GET    | `/api/quiz/hall-of-fame/:id`                     | Get specific entry         |

### Multiplayer API

All multiplayer endpoints are prefixed with `/api/multiplayer`:

| Method | Endpoint                          | Description                      |
| ------ | --------------------------------- | -------------------------------- |
| POST   | `/api/multiplayer/create`         | Create new game session          |
| GET    | `/api/multiplayer/game/:gameCode` | Get game info                    |
| WS     | `/api/multiplayer/ws/:gameCode`   | WebSocket upgrade to RPC session |

## ⚙️ Configuration

### Database Management

The application uses Cloudflare D1 (SQLite) with Prisma ORM for type-safe database operations.

#### Database Schema

The Prisma schema (`prisma/schema.prisma`) defines:

- **Question** - Main questions table (trivia, text, picture types)
- **Answer** - Multiple choice answers
- **TextAnswer** - Correct answers for text questions
- **PictureMetadata** - Image URLs for picture questions
- **HallOfFame** - Quiz attempt records and leaderboard

#### Adding Questions

Use Wrangler CLI to add questions to the D1 database:

**Trivia Question (Multiple Choice):**

```bash
# Add question
npx wrangler d1 execute quizzer-db --local --command="
INSERT INTO questions (type, question, category, difficulty)
VALUES ('trivia', 'What is 2+2?', 'Mathematics', 'easy')
"

# Add answers (replace question_id with the actual ID)
npx wrangler d1 execute quizzer-db --local --command="
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
VALUES
(1, '3', 0, 0),
(1, '4', 1, 1),
(1, '5', 0, 2),
(1, '6', 0, 3)
"
```

**Text Question:**

```bash
# Add question
npx wrangler d1 execute quizzer-db --local --command="
INSERT INTO questions (type, question, category, difficulty)
VALUES ('question', 'What is the capital of France?', 'Geography', 'easy')
"

# Add text answer
npx wrangler d1 execute quizzer-db --local --command="
INSERT INTO text_answers (question_id, correct_answer, is_primary)
VALUES (2, 'Paris', 1)
"
```

**Picture Question:**

```bash
# Add question
npx wrangler d1 execute quizzer-db --local --command="
INSERT INTO questions (type, question, category, difficulty)
VALUES ('picture', 'What landmark is this?', 'Geography', 'medium')
"

# Add picture metadata
npx wrangler d1 execute quizzer-db --local --command="
INSERT INTO picture_metadata (question_id, image_url)
VALUES (3, 'https://example.com/image.jpg')
"

# Add answers
npx wrangler d1 execute quizzer-db --local --command="
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
VALUES
(3, 'Tower Bridge', 0, 0),
(3, 'Eiffel Tower', 1, 1),
(3, 'Golden Gate', 0, 2),
(3, 'Brooklyn Bridge', 0, 3)
"
```

#### Useful Database Commands

```bash
# View all questions
npx wrangler d1 execute quizzer-db --local --command="SELECT * FROM questions"

# Count questions by type
npx wrangler d1 execute quizzer-db --local --command="
SELECT type, COUNT(*) FROM questions GROUP BY type
"

# View categories
npx wrangler d1 execute quizzer-db --local --command="
SELECT DISTINCT category FROM questions ORDER BY category
"

# Get next question ID
npx wrangler d1 execute quizzer-db --local --command="
SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM questions
"
```

#### Prisma Client

After schema changes, regenerate the Prisma client:

```bash
npm run generate:prisma
# or
npx prisma generate
```

### Environment Configuration

Update `wrangler.toml` for different environments:

```toml
[env.development]
name = "quiz-app-dev"

[env.production]
name = "quiz-app-prod"
```

Deploy to specific environment:

```bash
wrangler deploy --env production
```

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build frontend with Vite
npm run deploy           # Build and deploy to Cloudflare
npm run preview          # Preview with remote Cloudflare environment
npm run format           # Format code with Prettier

# Database
npm run generate:prisma  # Generate Prisma client

# Testing
npm run test             # Run unit tests (watch mode)
npm run test:ci          # Run unit tests (CI mode)
npm run test:e2e         # Run E2E tests with Playwright
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:e2e:headed  # Run E2E tests in headed mode
```

## 🔧 Customization

### Frontend Styling

The frontend is built with **Svelte 5** with the new runes API. Components are in `src/frontend/components/`.

State management uses Svelte 5's `$state` runes with a centralized store in `src/frontend/stores/quiz.svelte.js`. The store exports a named `quiz` object that components import using:

```javascript
import { quiz } from '../stores/quiz.svelte.js'
```

This pattern ensures proper tree-shaking and compatibility with Svelte's module system.

**Event Handlers**: All components use Svelte 5's new event handler syntax:

- `onclick` instead of `on:click`
- `oninput` instead of `on:input`
- `onkeypress` instead of `on:keypress`
- For event modifiers like `stopPropagation`, use inline handlers: `onclick={(e) => { e.stopPropagation(); handler() }}`
- Custom events (dispatched via `createEventDispatcher`) still use the `on:eventName` syntax

### API Logic

Extend `src/routes/quiz.ts` for quiz endpoints or `src/routes/multiplayer.ts` for multiplayer features. Modify `src/index.ts` for middleware changes.

### Database Queries

Add new methods to `PrismaQuestionService` in `src/services/database.ts`:

```typescript
async getQuestionsByAuthor(author: string): Promise<Question[]> {
    const questions = await this.prisma.question.findMany({
        where: { author },
        include: {
            answers: { orderBy: { answerOrder: 'asc' } },
            textAnswers: true,
            pictureMetadata: true,
        },
    })
    return questions.map((q) => this.buildQuestion(q))
}
```

### Multiplayer Game Logic

Customize game rules in `src/durable-objects/GameSessionRpc.ts`:

```typescript
// Change scoring rules
private calculatePoints(isCorrect: boolean, isFirst: boolean): number {
    if (!isCorrect) return 0
    return isFirst ? 2 : 1  // 2 points for first correct, 1 for others
}

// Modify question timer
private async sendQuestion(questionIndex: number) {
    this.questionTimer = 30000  // Change to 30 seconds
    // Broadcast to all players via RPC
    for (const [playerId, session] of this.clients) {
        const client = session.getClient()
        client.onQuestionStarted(question, questionIndex + 1, this.totalQuestions)
    }
}

// Add new RPC methods to PlayerSessionApi
async requestHint(): Promise<string> {
    return this.gameSession.provideHint(this.playerId)
}
```

## 🚀 Deployment Benefits

- **Single Domain**: Frontend and API on the same origin (no CORS issues)
- **Global CDN**: Cloudflare's edge network for fast loading worldwide
- **Serverless**: No server management, automatic scaling
- **Real-time Multiplayer**: Durable Objects enable stateful WebSocket connections
- **Cost Effective**: Cloudflare Workers free tier is generous
- **Simple CI/CD**: Single command deployment
- **Type Safety**: Prisma ORM provides full type safety for database operations
- **Edge Computing**: Low-latency responses from nearest data center

## 📝 Adding Features

### Database Migrations

To deploy database changes to production:

```bash
# Apply migrations to remote database
npx wrangler d1 execute quizzer-db --remote --file=./migrations/001_create_questions_table.sql
npx wrangler d1 execute quizzer-db --remote --file=./migrations/002_seed_questions.sql

# Deploy the worker
npm run deploy
```

### Authentication

Add middleware in `src/index.ts` for user authentication.

### Analytics

Integrate Cloudflare Analytics or add custom tracking.

## 🔒 Security

- Server-side answer validation
- No sensitive data exposed to frontend
- CORS properly configured
- Input validation on all endpoints

## 📱 Mobile Optimization

- Touch-friendly interface
- Responsive design for all screen sizes
- Mobile-specific gestures and feedback
- Optimized for portrait and landscape modes

## 🧪 Testing

### Test Structure

- **Unit Tests**: Vitest tests in `tests/unit/` for API and service logic
- **E2E Tests**: Playwright tests in `tests/e2e/` for full user flows
- **Mock Database**: Tests use mock Prisma client for fast, isolated testing

### Running Tests

```bash
# Unit tests (watch mode)
npm run test

# Unit tests (CI mode)
npm run test:ci

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui

# All tests
npm run test && npm run test:e2e
```

### Test Coverage

- API endpoint functionality
- Question filtering and randomization
- Answer validation and scoring
- Hall of Fame leaderboard
- Mobile responsiveness
- Multi-player group quizzes (Pass & Play mode)
- Networked multiplayer with Cap'n Web RPC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test locally
4. Deploy to your Cloudflare account for testing
5. Submit a pull request

## 📄 License

MIT License - feel free to use for personal or commercial projects.
