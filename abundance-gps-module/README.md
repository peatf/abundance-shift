# Abundance GPS – Perception Alignment Module

A standalone React component library designed to guide users through a structured flow of exercises for reframing perceptions related to abundance.

## Features

*   **Sequential Flow:** Guides users through Willingness Calibration, Openness Primer, Active Perception Reframing, Clarity Reflection, Immediate Relief, and Reinforcement.
*   **Conditional Branching:** Flow adapts based on user input (e.g., willingness score).
*   **Interactive Exercises:** Includes sliders, pattern puzzles, sequence memory tasks, reflective inputs, and audio-guided practices.
*   **State Management:** Uses Zustand for robust global state, with persistence for journal entries and theme.
*   **Styling:** Styled with Tailwind CSS, supporting dark and light modes.
*   **Accessibility:** Designed with ARIA attributes, keyboard navigation, and focus management in mind.
*   **Modern JavaScript:** Written in ES2020+ JavaScript.

## Installation

```bash
npm install abundance-gps-module prop-types zustand
# or
yarn add abundance-gps-module prop-types zustand
```
(Note: abundance-gps-module is a hypothetical package name. You'll use the local path during development.)

Also, ensure your project has react and react-dom as dependencies.

Setup
1. Tailwind CSS
This library uses Tailwind CSS classes for styling. Ensure your host application is set up with Tailwind CSS.
Add the path to this library's components in your tailwind.config.js:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Your application's files
    "./node_modules/abundance-gps-module/src/**/*.{js,jsx}", // Path to the library
    // or if you copy the src directly: "./path/to/abundance-gps-module/src/**/*.{js,jsx}"
  ],
  darkMode: 'class', // Recommended for theme toggle
  theme: {
    extend: {
        // You can extend theme here if needed
        // The library uses some keyframes for animations:
        // pulseRing, fadeIn, slideUp
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
```
2. Root Styling (Optional but Recommended)
For the best experience, especially with fullscreen elements and dark mode, apply some base styles to your index.html or main CSS file:

```css
/* styles.css or index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50 dark:bg-slate-900 transition-colors duration-300;
}
```
Usage
Import and render the main AbundanceGPS component in your React application:

```jsx
// App.js
import React from 'react';
import AbundanceGPS, { useAbundanceStore } from 'abundance-gps-module'; // Adjust path if local
// If you installed @heroicons/react for better icons:
// import '@heroicons/react/24/outline'; // Or specific icons

function App() {
  const handleModuleComplete = () => {
    console.log("Abundance GPS module journey completed and reset!");
    // You can navigate away or show a summary here
  };

  return (
    <div className="App">
      {/* Other application content */}
      <AbundanceGPS 
        onModuleComplete={handleModuleComplete} 
        initialTheme="light" /* Optional: 'light' or 'dark' */
      />
      {/* Other application content */}
    </div>
  );
}

export default App;
```
Props for `<AbundanceGPS />`
onModuleComplete: `() => void` (Optional)
A callback function that is invoked when the user completes the entire module flow and it resets.
initialTheme: `'light' | 'dark'` (Optional)
Sets the initial theme for the module. If not provided, it defaults to 'light' or the persisted theme from a previous session.
Interacting with the Store (Advanced)
The module uses Zustand for state management. You can import the store for advanced use cases, like programmatically resetting the module or clearing the journal.

```jsx
import { useAbundanceStore } from 'abundance-gps-module';

// To reset the module from outside:
// useAbundanceStore.getState().finishModuleAndReset();

// To clear the journal:
// useAbundanceStore.getState().clearJournal();
```
Component Breakdown
The module consists of several stages:

Willingness Calibration: User sets their readiness to reframe.
Openness Primer (Conditional): Micro-puzzles (Pattern Alignment, Sequence Memory Tap) to increase openness if readiness is moderate.
Active Perception Reframing Workshop:
Identify Current Interpretation
Evidence Inventory
Alternative Frame Generation & Resonance Rating
Commit & Anchor chosen frame (optional audio breath loop)
Contrast & Clarity Reflection: Capture new insights (text or audio).
Immediate Relief Practice: Choice of a quick pattern puzzle or an audio-guided breathing exercise.
Reinforcement of Becoming: A final reflective message upon exiting the module (either completion or premature exit).
Accessibility
The module aims for WCAG AA compliance:

Keyboard navigable interactive elements.
ARIA attributes for semantic meaning and dynamic updates.
Focus management for modal dialogs and stage transitions.
Semantic HTML.
Text alternatives for non-text content where appropriate.
Considerate use of color and contrast (leveraging Tailwind's defaults).
Audio Features
Web Audio API: Used for tones in SequenceMemoryTap and chimes in AudioBreatheCue.
Speech Synthesis API: Used for verbal prompts in AudioBreatheCue (chime-only mode) and potentially for reading anchored statements.
MediaRecorder API (Web Audio Recorder): Used for audio note capture in ContrastClarityReflection.
Ensure the user's browser supports these APIs for full functionality. Fallbacks or graceful degradation should be considered for unsupported features.

Development
(For contributors to this library)

Prerequisites
Node.js and npm/yarn.
Setup
Clone the repository.
Install dependencies: `npm install` or `yarn install`.
Scripts
`npm run lint` or `yarn lint`: Lints the codebase using ESLint.
`npm run format` or `yarn format`: Formats code using Prettier.
`npm test` or `yarn test`: Runs Jest tests.
`npm run build` or `yarn build`: (You'll need to set up a build process using Rollup, esbuild, or Webpack to package the library for distribution).
Testing
Tests are written using Jest and React Testing Library. Place component tests in `tests/components` and store tests in `tests/store`.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```
This provides a good starting point. The full implementation of every sub-component, audio feature, and detailed puzzle logic is extensive but the structure and key parts are here. 