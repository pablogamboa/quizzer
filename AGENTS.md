# Repository Guidelines

This file provides guidance to AI agents when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev          # Start development server with Wrangler
npm run preview      # Preview with remote Cloudflare environment
npm run format       # Formats the codebase

# Build and Deploy
npm run build        # Copy static files from src/static/ to public/
npm run deploy       # Build and deploy to Cloudflare Workers

# Testing
npm run test:ci      # Unit tests
npm run test:e2e     # E2E tests
```

## Architecture Overview

This is a **full-stack quiz application** deployed as a single Cloudflare Worker that serves both the API and frontend assets.

### Technology Stack

- **Backend**: Hono framework (TypeScript) running on Cloudflare Workers
- **Frontend**: Svelte 5
- **Deployment**: Cloudflare Workers with wrangler CLI

### Key Architecture Pattern

The entire application (frontend + backend) is served from a single Worker:

1. `src/index.ts` - Main Hono app entry point with middleware setup
2. `src/routes/quiz.ts` - RESTful API endpoints under `/api/quiz/*`
3. `src/data/questions.ts` - In-memory question database with TypeScript interfaces
4. `src/frontend/` - Frontend components

### Important Implementation Details

**API Structure**: All quiz endpoints are prefixed with `/api/quiz/`:

- Questions are served without correct answers to the frontend
- Answer validation happens server-side in the POST `/api/quiz/submit` endpoint
- The `Question` and `QuestionResponse` interfaces in `src/data/questions.ts` define the data model

**Frontend-Backend Integration**:

- Frontend makes API calls to relative paths (e.g., `/api/quiz/questions`)
- No CORS issues since everything is served from the same origin
- Files in `src/frontend/` are compiled by vite to `public/` during build

**Security Considerations**:

- Correct answers are stored only in `src/data/questions.ts` and never sent to the client
- The `QuestionResponse` type explicitly excludes the `correctAnswer` field
- All answer validation happens server-side

**Development Workflow**:

1. Frontend changes: Edit files in `src/frontend/` and run `npm run build` to copy to `public/`
2. Backend changes: Edit TypeScript files in `src/` - Wrangler hot-reloads automatically
3. Run tests: `npm run test` Runs all the tests in the system
4. Format code: `npm run format` formats all the codebase with prettier
5. Deploy: `npm run deploy` builds and deploys to Cloudflare Workers

**Mobile Optimization**:
The frontend is heavily optimized for mobile devices with touch-friendly buttons, responsive design, and orientation change handling.

## Database Management

This application uses Cloudflare D1 database instead of hardcoded questions.

### Database Setup

The database is automatically configured when you run:

```bash
npm run dev
```

### Database Structure

**Tables**:

- **questions**: Main questions table with optional JSON `info` field for metadata
- **answers**: Multiple choice answers for trivia/picture questions
- **text_answers**: Correct answers and alternatives for text questions

**Question Types**:

1. **trivia**: Multiple choice with 4 options
2. **question**: Free text input
3. **picture**: Multiple choice with image

### Adding Questions

**Manual SQL Method (Recommended)**:

```bash
# Add a trivia question
npx wrangler d1 execute quizzer-dev --local --command="
INSERT INTO questions (type, question, category, difficulty)
VALUES ('trivia', 'What is 2+2?', 'Mathematics', 'easy')
"

# Add answers (assuming question ID is 12)
npx wrangler d1 execute quizzer-dev --local --command="
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
VALUES
(12, '3', 0, 0),
(12, '4', 1, 1),
(12, '5', 0, 2),
(12, '6', 0, 3)
"
```

**Text Question Example**:

```bash
# Add question
npx wrangler d1 execute quizzer-dev --local --command="
INSERT INTO questions (type, question, category, difficulty)
VALUES ('question', 'What is the capital of France?', 'Geography', 'easy')
"

# Add text answer (assuming question ID is 13)
npx wrangler d1 execute quizzer-dev --local --command="
INSERT INTO text_answers (question_id, correct_answer, is_primary)
VALUES (13, 'Paris', 1)
"
```

**Picture Question Example**:

```bash
# Add question with image URL in info JSON field (assuming next question ID is 126)
npx wrangler d1 execute quizzer-dev --local --command="
INSERT INTO questions (type, question, category, difficulty, info)
VALUES ('picture', 'What landmark is this?', 'Geography', 'easy', '{\"imageUrl\":\"https://example.com/image.jpg\"}')
"

# Add answers
npx wrangler d1 execute quizzer-dev --local --command="
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
VALUES
(126, 'Tower Bridge', 0, 0),
(126, 'Eiffel Tower', 1, 1),
(126, 'Golden Gate', 0, 2),
(126, 'Brooklyn Bridge', 0, 3)
"
```

### Useful Database Commands

```bash
# View all questions
npx wrangler d1 execute quizzer-dev --local --command="SELECT * FROM questions"

# Count questions by type
npx wrangler d1 execute quizzer-dev --local --command="SELECT type, COUNT(*) FROM questions GROUP BY type"

# View categories
npx wrangler d1 execute quizzer-dev --local --command="SELECT DISTINCT category FROM questions ORDER BY category"

# Get next question ID
npx wrangler d1 execute quizzer-dev --local --command="SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM questions"
```

### Deployment

To deploy the database to production:

```bash
# Apply migrations to remote database
npx wrangler d1 execute quizzer-dev --remote --file=./migrations/001_create_questions_table.sql
npx wrangler d1 execute quizzer-dev --remote --file=./migrations/002_seed_questions.sql

# Deploy the worker
npm run deploy
```

### Backup

```bash
# Export questions
npx wrangler d1 execute quizzer-dev --local --command="SELECT * FROM questions" > questions_backup.json
```

The local D1 database is stored in `.wrangler/state/v3/d1/`

### Troubleshooting

- **Foreign key errors**: Make sure question IDs exist before adding related records
- **No questions showing**: Check that migrations have been applied
- **Local vs Remote**: Remember to use `--local` for development and `--remote` for production

## Themed Quizzes

The application supports specialized themed quizzes within categories. When a user selects a category (e.g., Geography), they can optionally choose from available themed quizzes for a more focused experience.

### Available Themes

- **Geography > Country Shapes** (🗺️): Identify countries by their silhouette
- **Geography > City Skylines** (🌆): Identify cities by their skyline
- **Geography > World Flags** (🚩): Identify countries by their flags

### How Themes Work

1. **Theme Selection**: After selecting a category in the quiz configuration, users see available themes for that category
2. **Optional**: Users can skip theme selection to get general questions from the category
3. **Filtered Questions**: When a theme is selected, only questions tagged with that theme are included in the quiz

### Database Structure

Themes are stored in the `quiz_themes` table with the following fields:

- `theme_key`: Unique identifier (e.g., 'country-shapes')
- `theme_name`: Display name (e.g., 'Country Shapes')
- `category`: Associated category (e.g., 'Geography')
- `description`: Short description of the theme
- `icon`: Optional emoji/icon
- `is_active`: Boolean to enable/disable themes

Questions can optionally include a `theme` field that references a theme_key.

### Adding New Themes

**1. Create the theme:**

```bash
npx wrangler d1 execute quizzer-dev --local --command="
INSERT INTO quiz_themes (theme_key, theme_name, category, description, icon, is_active)
VALUES ('your-theme-key', 'Your Theme Name', 'Category Name', 'Description here', '📝', 1)
"
```

**2. Add themed questions:**

```bash
# Example: Add a trivia question with a theme
npx wrangler d1 execute quizzer-dev --local --command="
INSERT INTO questions (type, question, category, difficulty, theme)
VALUES ('trivia', 'Your question here?', 'Category Name', 'medium', 'your-theme-key')
"

# Add answers for the question (assuming ID is 200)
npx wrangler d1 execute quizzer-dev --local --command="
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
VALUES
(200, 'Wrong answer', 0, 0),
(200, 'Correct answer', 1, 1),
(200, 'Wrong answer', 0, 2),
(200, 'Wrong answer', 0, 3)
"
```

**3. For picture questions with themes:**

```bash
npx wrangler d1 execute quizzer-dev --local --command="
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES (
    'picture',
    'What is this?',
    'Category Name',
    'easy',
    'your-theme-key',
    '{\"imageUrl\":\"https://example.com/image.jpg\"}'
)
"
```

### Theme Management Commands

```bash
# View all themes
npx wrangler d1 execute quizzer-dev --local --command="SELECT * FROM quiz_themes"

# View themes for a specific category
npx wrangler d1 execute quizzer-dev --local --command="SELECT * FROM quiz_themes WHERE category='Geography'"

# Count questions per theme
npx wrangler d1 execute quizzer-dev --local --command="SELECT theme, COUNT(*) as count FROM questions WHERE theme IS NOT NULL GROUP BY theme"

# View all themed questions
npx wrangler d1 execute quizzer-dev --local --command="SELECT id, question, category, theme FROM questions WHERE theme IS NOT NULL"

# Disable a theme
npx wrangler d1 execute quizzer-dev --local --command="UPDATE quiz_themes SET is_active=0 WHERE theme_key='your-theme-key'"
```

### API Endpoints

- `GET /api/quiz/themes` - Get all active themes
- `GET /api/quiz/themes/category/:category` - Get themes for a specific category
- `GET /api/quiz/questions/theme/:theme/random/:count` - Get random questions for a theme

## Testing

### Test Structure

All tests are organized in the `tests/` directory:

```
tests/
├── unit/           # Unit and integration tests (Vitest)
│   ├── api.integration.test.ts
│   ├── http-client.test.ts
│   ├── mock-database.ts
│   └── fixtures/
│       └── questions.ts
└── e2e/            # End-to-end tests (Playwright)
    ├── quiz-start.spec.ts
    ├── quiz-questions.spec.ts
    ├── quiz-results.spec.ts
    ├── group-quiz.spec.ts
    └── mobile-responsiveness.spec.ts
```

### Unit Tests (Vitest)

**Configuration**:

- Config File: `vitest.config.ts`
- Test Pattern: `tests/unit/**/*.test.ts`
- Framework: Vitest with Cloudflare Workers pool

**Test Coverage**:

- **API Integration Tests** (`api.integration.test.ts`)
    - GET /api/quiz/questions - Returns questions without answers
    - GET /api/quiz/questions/random/:count - Random question selection
    - GET /api/quiz/questions/category/:category - Category filtering
    - GET /api/quiz/questions/difficulty/:level - Difficulty filtering
    - POST /api/quiz/submit - Answer validation and scoring
    - GET /api/quiz/categories - Category listing
    - GET /api/quiz/stats - Quiz statistics

- **HTTP Client Tests** (`http-client.test.ts`)
    - Request handling
    - Response parsing
    - Error handling

**Running Unit Tests**:

```bash
npm run test         # Run tests in watch mode
npm run test:ci      # Run tests once (CI mode)
npm run test:watch   # Run tests in watch mode
```

### E2E Tests (Playwright)

**Configuration**:

- Config File: `playwright.config.ts`
- Test Directory: `tests/e2e/`
- Browsers: Chromium, Firefox, WebKit
- Devices: Desktop, iPhone 12, Pixel 5, iPad

**Test Files**:

1. **quiz-start.spec.ts**: Initial landing page and game mode selection
2. **quiz-questions.spec.ts**: Question answering experience
3. **quiz-results.spec.ts**: Quiz completion and results display
4. **group-quiz.spec.ts**: Multiplayer functionality
5. **mobile-responsiveness.spec.ts**: Mobile and responsive design

**Running E2E Tests**:

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run specific test file
npm run test:e2e -- tests/e2e/quiz-start.spec.ts

# Run tests on specific browser
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
npm run test:e2e -- --project="Mobile Chrome"
npm run test:e2e -- --project="Mobile Safari"
```

### Test Scenarios

**Solo Quiz Flow**:

1. User lands on home page
2. Selects Solo mode (Individual)
3. Configures quiz settings
4. Answers questions (multiple choice or text)
5. Views results with score
6. Can restart quiz

**Group Quiz Flow**:

1. User selects Party mode (Group)
2. Configures quiz settings
3. Adds multiple players
4. Players take turns answering
5. Views group results with individual scores
6. Can restart with same or different players

**Error Handling**:

- API failures show error screen
- User can retry from error state
- Form validation prevents invalid submissions

**Mobile Experience**:

- Touch-optimized interactions
- Responsive layouts for all screen sizes
- Proper input handling (no zoom on focus)
- Landscape orientation support

### Test Data

**Mock Database**: Unit tests use a mock database (`tests/unit/mock-database.ts`) that simulates the Cloudflare D1 database with test fixtures.

**Test Questions**: Test questions are defined in `tests/unit/fixtures/questions.ts` and include:

- Multiple choice (trivia) questions
- Text input questions
- Picture questions with images
- Various difficulty levels
- Multiple categories

### Best Practices

1. **Test Isolation**: Each test is independent and doesn't rely on other tests
2. **Mock Data**: Unit tests use mock data to avoid external dependencies
3. **Parallel Execution**: Tests run in parallel for faster feedback
4. **Cross-browser Testing**: E2E tests run on multiple browsers
5. **Mobile Testing**: Dedicated tests for mobile responsiveness
6. **Error Scenarios**: Tests include error handling and edge cases
7. **CI/CD Ready**: Tests are optimized for continuous integration

### Debugging

**Unit Tests**:

```bash
# Debug with VS Code
# Add breakpoints and use the VS Code debugger with Vitest extension
```

**E2E Tests**:

```bash
# Debug mode with Playwright Inspector
npm run test:e2e:debug

# Run with headed browser to see what\'s happening
npm run test:e2e:headed

# Use UI mode for interactive debugging
npm run test:e2e:ui
```

- Do not run the whole e2e test suite to verify a bug unless explicitly told to. It\'s better to just run the chromium
  tests for a quick verification with `npm run test:e2e -- --project=chromium`
