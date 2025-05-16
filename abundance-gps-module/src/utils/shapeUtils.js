import React from 'react'; // Needed if SVGs are JSX components

/**
 * @typedef {{ id: string, component: React.FC<React.SVGProps<SVGSVGElement>>, name: string }} Shape
 */

// Example SVG components (can be more complex)
export const Circle = (props) => <svg viewBox="0 0 100 100" {...props}><circle cx="50" cy="50" r="40" /></svg>;
export const Square = (props) => <svg viewBox="0 0 100 100" {...props}><rect x="10" y="10" width="80" height="80" /></svg>;
export const Triangle = (props) => <svg viewBox="0 0 100 100" {...props}><polygon points="50,10 90,90 10,90" /></svg>;
export const Star = (props) => <svg viewBox="0 0 100 100" {...props}><polygon points="50,5 61,35 95,35 67,57 78,87 50,68 22,87 33,57 5,35 39,35" /></svg>;
export const Hexagon = (props) => <svg viewBox="0 0 100 100" {...props}><polygon points="25,10 75,10 95,50 75,90 25,90 5,50" /></svg>;
export const Cross = (props) => <svg viewBox="0 0 100 100" {...props}><polygon points="40,10 60,10 60,40 90,40 90,60 60,60 60,90 40,90 40,60 10,60 10,40 40,40" /></svg>;


/** @type {Shape[]} */
export const availableShapes = [
  { id: 'circle', component: Circle, name: 'Circle' },
  { id: 'square', component: Square, name: 'Square' },
  { id: 'triangle', component: Triangle, name: 'Triangle' },
  { id: 'star', component: Star, name: 'Star' },
  { id: 'hexagon', component: Hexagon, name: 'Hexagon' },
  { id: 'cross', component: Cross, name: 'Cross' },
];

/**
 * Generates data for the 3x3 Pattern Alignment Puzzle.
 * @returns {{grid: (Shape | null)[][], missingShape: Shape, candidates: Shape[]}}
 */
export function generatePatternAlignmentPuzzle() {
  // Shuffle shapes to get a random set for the puzzle
  const shuffledShapes = [...availableShapes].sort(() => 0.5 - Math.random());
  
  // For simplicity, let's make a puzzle where a row/column needs to be completed with a specific shape.
  // Example: Grid has 2 of one shape in a row, the 3rd is missing.
  // This logic can be much more complex for true "pattern alignment".
  // Here's a simpler version: a specific shape is missing from a 3x3 grid.
  
  const gridShapes = shuffledShapes.slice(0, 9); // Need 9 distinct shapes if all cells are unique, or allow repeats.
  if (gridShapes.length < 3) throw new Error("Not enough shapes for the puzzle");

  // Create a 3x3 grid, pick a random cell to be empty.
  /** @type {(Shape | null)[][]} */
  const grid = [[null,null,null],[null,null,null],[null,null,null]];
  let filledCells = 0;
  const tempShapes = [...gridShapes]; // Use a copy

  let emptyRow = Math.floor(Math.random() * 3);
  let emptyCol = Math.floor(Math.random() * 3);

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (r === emptyRow && c === emptyCol) {
        grid[r][c] = null; // This is the missing one
      } else {
        grid[r][c] = tempShapes[filledCells % tempShapes.length] || tempShapes[0]; // Cycle through shapes
        filledCells++;
      }
    }
  }
  
  const missingShape = tempShapes[filledCells % tempShapes.length] || tempShapes[0]; // The shape that should be in the empty cell

  // Candidates: the correct shape + 2 incorrect ones
  let otherShapes = availableShapes.filter(s => s.id !== missingShape.id);
  otherShapes = otherShapes.sort(() => 0.5 - Math.random());
  
  const candidates = [missingShape, otherShapes[0], otherShapes[1]].sort(() => 0.5 - Math.random());

  return { grid, missingShape, candidates, emptyCell: { row: emptyRow, col: emptyCol } };
}

/**
 * Generates data for the 4x4 Relief Pattern Micro-Puzzle.
 * Needs 3 sequential matches.
 * @returns {Array<{gridIcon: Shape, targetCell: {row: number, col: number}, candidates: Shape[], correctCandidate: Shape}>}
 */
export function generateReliefPuzzleSet() {
    const puzzles = [];
    const gridSize = 4;
    let usedShapes = []; // To ensure variety in correct answers across the 3 puzzles

    for (let i = 0; i < 3; i++) {
        // Select a correct shape that hasn't been the correct answer recently
        let correctShape;
        let attempts = 0;
        do {
            correctShape = availableShapes[Math.floor(Math.random() * availableShapes.length)];
            attempts++;
        } while (usedShapes.includes(correctShape.id) && attempts < availableShapes.length * 2);
        
        if (!usedShapes.includes(correctShape.id)) {
            usedShapes.push(correctShape.id);
            if (usedShapes.length > 2) usedShapes.shift(); // Keep track of last 2
        }

        const targetRow = Math.floor(Math.random() * gridSize);
        const targetCol = Math.floor(Math.random() * gridSize);

        let otherShapes = availableShapes.filter(s => s.id !== correctShape.id);
        otherShapes = otherShapes.sort(() => 0.5 - Math.random()).slice(0, 3); // 3 distractors

        const candidates = [correctShape, ...otherShapes].sort(() => 0.5 - Math.random());
        
        puzzles.push({
            gridIcon: correctShape, // The icon that should be in the target cell
            targetCell: { row: targetRow, col: targetCol },
            candidates,
            correctCandidate: correctShape,
        });
    }
    return puzzles;
} 