# 🚀 Ultimate Competitive Programming AI Extension

**World's Best DSA Problem Solver & Competitive Programming Assistant**

A Chrome extension that transforms into the ultimate competitive programming and DSA problem-solving tool. Solve the hardest algorithmic problems with AI-powered assistance, complexity analysis, and multi-language support.

## ✨ Features

### 🎯 **DSA Problem Solver**
- **Optimal Solutions**: Get the most efficient algorithms for any DSA problem
- **Multi-Language Support**: C++, Python, Java, JavaScript with competitive programming templates
- **Complexity Analysis**: Detailed time and space complexity breakdown
- **Test Case Generation**: Comprehensive test cases for edge case coverage
- **Approach Explanation**: Step-by-step algorithm explanations

### 🏆 **Competitive Programming Modes**
- **DSA Solver**: Specialized for algorithmic problem solving
- **Competitive**: Advanced competitive programming features
- **Interview Prep**: Coding interview practice and preparation
- **Optimization**: Code performance analysis and optimization

### 🔧 **Advanced Features**
- **Real-time Code Execution**: Test your solutions instantly
- **Complexity Visualization**: Visual representation of algorithm efficiency
- **Edge Case Detection**: Automatic identification of corner cases
- **Performance Profiling**: Detailed performance analysis
- **Multi-language Templates**: Pre-built competitive programming templates

## 🆕 What's New in v1.1.0 — ZeroTrace Study & Quiz

This release adds privacy-first, local-first study workflows and a multi-model aggregated answering path:

- New side-panel modes: `Study` and `Quiz` (left `Sidebar` → book icon for Study, clipboard icon for Quiz)
- First-run guided help modals for both modes
- Local-only storage for study artifacts; session-only storage for quizzes
- Multi-model answering path: backend endpoint `POST /prompt-sequential` synthesizes replies from five providers (GPT‑4, Claude‑4, GPT‑4o, Gemini, DeepSeek)

### Study Utilities (Local‑first)

Access: Sidebar → Study. First click shows a quick “How it works” modal. Four sub‑tabs:

1) Flashcards
- Source: current page selection or webpage text you allowed via the “Allow Page Context” button
- Generate Cards: creates Q/A pairs from selected text on‑device (no network). You can also add cards manually.
- Scheduling: SM‑2 lite spaced repetition (interval/ease updated on Again/Good/Easy)
- Keyboard: ⌘/Ctrl+K to add the current Q/A inputs
- Storage: `chrome.storage.local` under key `zt_study_flashcards_v1`

2) Timer (Pomodoro)
- Defaults 25/5 minutes; editable
- Persisted running state with local notifications on session change (requires `notifications` permission)
- Storage: `chrome.storage.local` key `zt_pomodoro_state_v1`

3) Notes (Markdown)
- Markdown text area with autosave
- “Ephemeral” toggle: when ON, content is not written to disk
- Storage (when not ephemeral): `chrome.storage.local` key `zt_notes_md_v1`

4) Music (Local/URL)
- Play a local audio file via file picker (stays on device) or paste a public URL
- Persists volume and loop
- Storage: `chrome.storage.local` key `zt_music_prefs_v1`

First‑run modal strings (Study):
- Flashcards: “Select any text (problem statement/hints) → Generate.” “Use ⌘/Ctrl+K to add a card manually.” “Spaced repetition schedules your next review automatically.”
- Timer: “Pomodoro defaults to 25/5; customize in Settings.” “Enable notifications to get end‑of‑session alerts.”
- Notes: “Markdown supported. Toggle Ephemeral to avoid saving to disk.”
- Music: “Load a local MP3 (stays on your device) or paste a URL.”

Implementation details:
- UI: `src/panels/study/*`
- SRS: SM‑2 lite implemented inline in `Flashcards.tsx`
- Storage: `chrome.storage.local` only; no network calls
- Notifications: MV3 `notifications` permission; data‑URI icon to respect CSP

### Local Auto‑Assessment — Quiz (MCQ + Coding)

Access: Sidebar → Quiz. Two tabs and a first‑run modal.

MCQ Generator & Grader
- Inputs: topic, difficulty, number of questions
- Output: MCQs with 4 options and rationales (local generation heuristic)
- Grading: runs locally and computes a score; results stay in session storage
- Export: “Export Encrypted (.zeroquiz)”, AES‑GCM with PBKDF2 via Web Crypto; password never stored
- Import: decrypts bundle back into the session store
- Storage: `chrome.storage.session` key `zt_quiz_mcq_session_v1`

Coding Generator & Runner
- Languages: JavaScript runner in a restricted scope (no DOM/process/network); Python runner is disabled under strict MV3 CSP (see Note)
- Test cases: editable list; results shown with pass/fail and expected vs got
- Storage: `chrome.storage.session` key `zt_quiz_code_session_v1`

Note on Python (Pyodide):
- For MV3 with strict CSP (`script-src 'self'`), remote script loading is not allowed. If you need Python execution, bundle Pyodide locally inside the extension and whitelist it in the manifest, or self-host in `public/` and reference it as `self`.

First‑run modal strings (Quiz):
- MCQ: “Enter a topic + #questions → Generate. Answers and rationales appear after ‘Submit’.”
- Coding: “Pick Python/JS → write solution → Run Tests. Code runs in a sandbox; we only store results in session.”

Implementation details:
- UI: `src/panels/quiz/*`
- MCQ store: `chrome.storage.session`
- Encryption: `src/utils/crypto.ts` (AES‑GCM 256 with PBKDF2‑SHA‑256)
- JS runner: safe wrapper function with banned API tokens

### Multi‑Model Answering (5‑Model Aggregation)

Backend route: `POST /prompt-sequential`
- Takes `{ prompt, conversationId, webpageContent?, selectedText? }`
- Queries adapters in parallel: GPT‑4, Claude‑4, GPT‑4o, Gemini, DeepSeek
- Chooses a preferred answer (priority: GPT‑4 → GPT‑4o → Claude‑4 → Gemini → DeepSeek) and appends a small provenance footer

Environment variables (backend):
- `GPT4_API_KEY`, `CLAUDE4_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`, `GPT4O_API_KEY`
- Optional base URLs/model IDs via existing model adapter envs

Frontend wiring:
- `src/hooks/useAI.ts` posts to `/prompt-sequential` for normal chat
- Web search only triggers if “Web Access” is toggled ON

### UI/UX Adjustments

- Auto‑scroll behavior: stops auto‑scrolling if you scroll up, so long messages don’t jump
- “Show Tools” button: extra panels (Hints, Interview Prep, Recommendations, ITS, Visualizer, mini Quiz, Export/Import) are hidden by default to keep the chat view readable

### Storage Keys (added)

- Local (`chrome.storage.local`):
  - `zt_study_first_run_seen` (boolean)
  - `zt_study_flashcards_v1` (Card[])
  - `zt_pomodoro_state_v1` (PomodoroState)
  - `zt_notes_md_v1` (markdown string)
  - `zt_music_prefs_v1` ({ sourceType, url?, volume, loop })
- Session (`chrome.storage.session`):
  - `zt_quiz_first_run_seen` (boolean)
  - `zt_quiz_mcq_session_v1` (MCQ session)
  - `zt_quiz_code_session_v1` (Coding session)

### Manifest & Permissions

- MV3, strict CSP for extension pages (`script-src 'self'`)
- Permissions: `storage`, `activeTab`, `scripting`, `tabs`, `sidePanel`, `notifications`
- No host permission expansion beyond backend localhost

### How to Access Each Feature

- Study: Sidebar → Study → choose sub‑tab; allow page context if you want Flashcards to use selection/current page
- Quiz: Sidebar → Quiz → MCQ or Coding; Export/Import for MCQ uses encrypted bundles (`.zeroquiz`)
- Multi‑model chat: just ask in chat; backend must be running; “Web Access” only for search queries


## 🚀 Quick Start

### 1. Install the Extension
```bash
# Clone the repository
git clone <repository-url>
cd futuregpt-main/futuregpt-main\ frontend

# Install dependencies
npm install

# Build the extension
npm run build
```

### 2. Start the Backend Server
```bash
# Navigate to backend directory
cd ../gpt-backend

# Install dependencies
npm install

# Start the server
node server.js
```

### 3. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder from the frontend build

## 🎯 Usage Examples

### DSA Problem Solving
```
Problem: Maximum Subarray Sum
Description: Find the contiguous subarray with the largest sum
Difficulty: Medium
Language: C++

AI Response:
- Optimal solution using Kadane's Algorithm
- Time Complexity: O(n)
- Space Complexity: O(1)
- Complete code with edge case handling
- Test cases and explanations
```

### Complexity Analysis
```
Input: Your algorithm code
Output:
- Time Complexity: O(n log n)
- Space Complexity: O(n)
- Detailed explanation
- Optimization suggestions
- Edge case considerations
```

### Test Case Generation
```
Input: Problem description
Output:
- Normal test cases
- Edge cases (empty input, single element)
- Boundary conditions
- Stress test cases
- Corner cases
```

## 🛠️ Backend API Endpoints

### Core Endpoints
- `POST /prompt` - General AI chat with context awareness
- `POST /solve-dsa` - DSA problem solving with optimal solutions
- `POST /analyze-complexity` - Algorithm complexity analysis
- `POST /generate-testcases` - Test case generation
- `POST /web-search` - Real-time web search
- `POST /function-call` - Function execution

### DSA Solver Features
```javascript
// Solve DSA problem
POST /solve-dsa
{
  "problem": {
    "title": "Maximum Subarray Sum",
    "description": "Find contiguous subarray with largest sum",
    "difficulty": "medium",
    "constraints": ["1 ≤ n ≤ 10^5", "1 ≤ arr[i] ≤ 10^9"]
  },
  "language": "cpp"
}

// Analyze complexity
POST /analyze-complexity
{
  "code": "your algorithm code",
  "language": "cpp"
}

// Generate test cases
POST /generate-testcases
{
  "problemDescription": "problem description",
  "count": 5
}
```

## 🎨 UI Components

### DSASolver Component
- **Problem Input**: Title, description, constraints, difficulty
- **Language Selection**: C++, Python, Java, JavaScript
- **Solution Display**: Code, complexity, approach, explanation
- **Test Cases**: Input/output pairs with descriptions
- **Complexity Analysis**: Time/space complexity breakdown

### Enhanced Sidebar
- **Mode Switching**: Chat, Vision, DSA Solver, Interview, Gamification
- **Quick Actions**: New chat, settings, local Analyze Page, hints, visualize

### Welcome Screen
- **Mode-specific Content**: Focused on Chat, Vision, DSA Solver, Interview
- **DSA & Career Advisor**: Personalized practice flows and privacy badges

## 🔧 Configuration

### Environment Variables
```bash
# Backend configuration
OPENAI_API_KEY=your_openai_api_key
PORT=3000

# Frontend configuration
VITE_API_URL=http://localhost:3000
```

### Supported Programming Languages
- **C++**: STL, fast I/O, competitive programming templates
- **Python**: Built-in libraries, list comprehensions, efficient algorithms
- **Java**: Efficient data structures, StringBuilder for strings
- **JavaScript**: Modern ES6+ features, efficient array methods

## 🏆 Competitive Programming Features

### Algorithm Categories
- **Binary Search**: Variations and applications
- **Dynamic Programming**: 1D, 2D, state compression
- **Graph Algorithms**: DFS, BFS, Dijkstra, Floyd-Warshall
- **Tree Algorithms**: LCA, segment trees, binary lifting
- **String Algorithms**: KMP, Z-function, suffix arrays
- **Advanced Data Structures**: Trie, Segment Tree, Fenwick Tree
- **Greedy Algorithms**: Optimization strategies
- **Number Theory**: Combinatorics and mathematical algorithms

### Problem Difficulty Levels
- **Easy**: Basic algorithms and data structures
- **Medium**: Advanced algorithms and optimizations
- **Hard**: Complex algorithmic challenges
- **Expert**: Cutting-edge competitive programming problems

## 🔒 Privacy & Security

- **Privacy-First Design**: All processing in-memory
- **Zero Data Storage**: No persistent logging or tracking
- **Local Processing**: Sensitive data never leaves your device
- **Secure Communication**: Encrypted API calls to backend

## 🚀 Performance Features

### Optimization Techniques
- **Algorithm Optimization**: Best practices for competitive programming
- **Memory Management**: Efficient memory usage patterns
- **Time Complexity**: Optimal algorithm selection
- **Space Complexity**: Minimal memory footprint

### Real-time Features
- **Live Code Execution**: Instant feedback on solutions
- **Complexity Visualization**: Real-time complexity analysis
- **Performance Profiling**: Detailed performance metrics
- **Edge Case Detection**: Automatic corner case identification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🎯 Roadmap

### Phase 1: Core DSA Solver ✅
- [x] Multi-language support
- [x] Complexity analysis
- [x] Test case generation
- [x] Basic UI components

### Phase 2: Advanced Features 🚧
- [ ] Real-time code execution
- [ ] Performance profiling
- [ ] Advanced algorithm visualization
- [ ] Contest mode

### Phase 3: Community Features 📋
- [ ] Problem sharing
- [ ] Solution comparison
- [ ] Leaderboards
- [ ] Collaborative solving

---

**Transform your Chrome extension into the world's best competitive programming AI assistant!** 🚀 