# Badminton Manager - Production Grade Architecture

## 🏗️ Architecture Overview

This is a **production-ready** React application with clean architecture, following industry best practices for scalability, maintainability, and code organization.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Generic UI components (Button, Input, Modal, etc.)
│   ├── court/          # Court-specific components (CourtCard, ScoreBoard, etc.)
│   ├── player/         # Player-specific components (PlayerCard, PlayerList, etc.)
│   ├── schedule/       # Schedule/calendar components
│   └── expense/        # Expense calculation components
├── pages/              # Page-level components (Auth, Group, Setup, Game)
├── hooks/              # Custom React hooks for state management
├── utils/              # Utility functions (matchmaking, ELO system, helpers)
├── services/           # API service layer (REST API calls)
├── constants/          # Application constants (config, translations, themes)
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
└── index.css           # Tailwind CSS and global styles
```

## 🎨 Design System

### Tailwind CSS Configuration
- **Primary colors**: Dark green theme (#006400)
- **Accent colors**: Lime green (#32CD32)
- **Court colors**: Natural grass green gradients
- **Dark mode**: Fully supported with custom color palette

### Component Library
All UI components are built with:
- Consistent prop APIs
- Accessibility in mind
- Responsive design
- Dark mode support
- Smooth animations and transitions

## 🧩 Key Features

### 1. **Enhanced Matchmaking System**
- **Composite Skill Calculation**: Combines base skill (manual rating) with ELO rating
- **Weight-based System**: New players rely more on base skill, experienced players on ELO
- **Fair Team Balancing**: Generates all possible team combinations and selects the most balanced
- **Rest Priority**: Tracks consecutive games and ensures fair rest periods

### 2. **Advanced ELO Rating System**
- Dynamic K-factor (32 for new players, 24 for experienced)
- Expected score calculation using standard ELO formula
- Team-based rating updates
- Normalized ratings (1100-1900 range)

### 3. **Smart Player Queue**
- Sorts by play count (least played first)
- Secondary sort by last rest time
- Visual indicators for playing/resting status
- Leaderboard view with win statistics

### 4. **Court Management**
- Real-time score tracking
- Serving player indication with visual cues
- Manual and automatic player assignment
- Court visualization with player photos
- Beautiful badminton-themed court graphics

### 5. **Statistics & Analytics**
- Win rate calculation
- Games played tracking
- ELO progression
- Play count monitoring
- Win/loss records

## 🔧 Technical Highlights

### State Management
- **Custom Hooks**: `useAuth`, `useTheme`, `usePlayers`, `useCourts`
- **Separation of Concerns**: Business logic separated from UI
- **Optimized Re-renders**: Proper use of `useCallback` and `useMemo`

### API Integration
- **Axios instance** with interceptors
- **Service layer** abstracting all API calls
- **Error handling** and user feedback
- **Token-based authentication**

### Code Quality
- **Clean Code Principles**: Single Responsibility, DRY, KISS
- **Modular Architecture**: Easy to test and maintain
- **Type Safety**: Consistent prop validation
- **Error Boundaries**: Graceful error handling

### Performance Optimizations
- **Lazy Loading**: Code splitting where applicable
- **Memoization**: Expensive calculations cached
- **Debouncing**: User input optimizations
- **Efficient Re-renders**: Proper React patterns

## 🎮 Game Logic Improvements

### Matchmaking Fairness
```javascript
// Before: Random assignment
// After: Skill-balanced team generation with all combinations tested
```

### ELO System
```javascript
// Before: Basic win/loss tracking
// After: Professional ELO system with dynamic K-factors and composite skills
```

### Rest Management
```javascript
// Before: No rest tracking
// After: Consecutive game tracking and rest priority system
```

### Score Tracking
```javascript
// Before: Manual score only
// After: Score with serve indication, target tracking, and match point alerts
```

## 🌐 Multi-language Support
- Thai (TH) - Default
- English (EN)
- Easy to add more languages via `constants/translations.js`

## 🎯 Game Modes
- **Doubles** (2 vs 2) - Standard badminton doubles
- **Singles** (1 vs 1) - One-on-one matches
- Configurable courts (1-4 courts)
- Customizable target scores

## 📱 Responsive Design
- Mobile-first approach
- Tablet optimized
- Desktop enhanced
- Touch-friendly interactions

## 🔐 Authentication & Authorization
- Google OAuth integration
- JWT token management
- Automatic token refresh
- Secure API communication

## 🚀 Getting Started

### Installation
```bash
pnpm install
```

### Development
```bash
pnpm dev
```

### Build
```bash
pnpm build
```

### Environment Variables
Create a `.env` file:
```
VITE_API_BASE=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 📊 Component Hierarchy

```
App
├── AuthPage (unauthenticated)
├── GroupSelectPage (group selection)
├── SetupPage (game configuration)
│   ├── PlayerCard (multiple)
│   ├── Input components
│   └── Settings cards
└── GamePage (active game)
    ├── CourtCard (multiple)
    │   ├── ScoreBoard
    │   ├── CourtVisualization
    │   └── Action buttons
    ├── PlayerList
    │   └── PlayerCard (multiple)
    └── Stats cards
```

## 🛠️ Utility Functions

### ELO System (`utils/eloSystem.js`)
- `calculateCompositeSkill()` - Combines base skill and ELO
- `calculateExpectedScore()` - ELO-based win probability
- `updateEloRating()` - Updates rating after match
- `updateMatchRatings()` - Batch update for all players

### Matchmaking (`utils/matchmaking.js`)
- `generateFairMatchup()` - Creates balanced teams
- `getPlayerQueue()` - Sorted player queue
- `calculateTeamBalance()` - Team skill difference
- `getPlayersNeedingRest()` - Rest priority calculation

### Helpers (`utils/helpers.js`)
- `debounce()`, `throttle()` - Performance utilities
- `formatCurrency()` - Expense formatting
- `getInitials()` - Avatar generation
- `shuffleArray()` - Randomization

## 📈 Performance Metrics

- **Initial Load**: Optimized with code splitting
- **Re-renders**: Minimized with proper memoization
- **API Calls**: Batched and cached where possible
- **Bundle Size**: Tree-shaking enabled

## 🎨 Styling Approach

### Tailwind CSS Benefits
- **No CSS conflicts**: Utility-first approach
- **Consistent spacing**: Standardized spacing scale
- **Responsive design**: Built-in breakpoints
- **Dark mode**: First-class support
- **Performance**: Purges unused styles in production

### Custom Animations
- Pulse effects for serving player
- Bounce animations for badges
- Smooth transitions for all interactions
- Gradient backgrounds for depth

## 🐛 Error Handling

- User-friendly error messages
- Graceful degradation
- Console logging for debugging
- API error interceptors

## 🔄 Data Flow

```
User Action → Event Handler → Service Layer → API
                ↓
            State Update
                ↓
        Component Re-render
```

## 📝 Best Practices Implemented

1. **Component Composition**: Small, focused components
2. **Props Validation**: Consistent prop interfaces
3. **Code Reusability**: Shared utilities and hooks
4. **Separation of Concerns**: Logic separate from UI
5. **Immutable State**: Proper state updates
6. **Error Boundaries**: Graceful error handling
7. **Accessibility**: ARIA labels and keyboard navigation
8. **Performance**: Optimized re-renders and memoization

## 🎓 Learning Resources

- [React Best Practices](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ELO Rating System](https://en.wikipedia.org/wiki/Elo_rating_system)
- [Component-Driven Development](https://www.componentdriven.org/)

## 📄 License

MIT

---

**Built with ❤️ and 🏸 by the Badminton Manager Team**
