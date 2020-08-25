import React, { useState, useCallback, useRef } from 'react';
import './App.css';
import produce from 'immer';

// SECTION Global Variables
const numRows = 35;
const numCols = 35;

const operations = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1],
	[1, 1],
	[1, -1],
	[-1, 1],
	[-1, -1],
];

// SECTION Helper Functions
const generateEmptyGrid = () => {
	const rows = [];

	for (let i = 0; i < numRows; i++) {
		rows.push(Array.from(Array(numCols), () => 0));
	}

	return rows;
};

const generateRandomGrid = () => {
	const rows = [];

	for (let i = 0; i < numRows; i++) {
		rows.push(Array.from(Array(numCols), () => (Math.random() > 0.8 ? 1 : 0)));
	}

	return rows;
};

const checkIfEmptyGrid = (grid) => {
	// sum all rows of the grid
	let total = 0;

	grid.forEach((row) => {
		// sum each row add it to total
		row.reduce((acc, currentValue) => {
			return (total += acc + currentValue);
		});
	});

	// Check if empty
	if (total == 0) {
		// if sum == 0 return true
		return true;
	} else if (total > 0) {
		// if sum > 0 return false
		return false;
	}
};
//////////////////////////////////////////////////////////////////////////////

// SECTION Application
function App() {
	const [grid, setGrid] = useState(() => {
		return generateEmptyGrid();
	});

	const [running, setRunning] = useState(false);
	const [generation, setGeneration] = useState(0);

	// running/generation value changes but our runSim fnx does not
	// keeps our running/generation value updated in our callback below
	const runningRef = useRef(running);
	runningRef.current = running;

	const generationRef = useRef(generation);
	generationRef.current = generation;

	const gridRef = useRef(grid);
	gridRef.current = grid;

	const runSimulation = useCallback(() => {
		// base case
		if (!runningRef.current) {
			return;
		}

		setGrid((g) => {
			return produce(g, (gridCopy) => {
				// loop through all cells in the grid
				for (let i = 0; i < numRows; i++) {
					for (let k = 0; k < numCols; k++) {
						// find out how many neighbors each cells have
						let neighbors = 0;

						// check all operations for neighbors
						operations.forEach(([x, y]) => {
							const newI = i + x;
							const newK = k + y;

							// increment neighbors based off these bounds
							if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
								neighbors += g[newI][newK];
							}
						});

						// Game Rules logic
						if (neighbors < 2 || neighbors > 3) {
							// any live cell with fewer than two live neighbours dies, as if by underpopulation.
							// Any live cell with more than three live neighbours dies, as if by overpopulation.
							gridCopy[i][k] = 0;
						} else if (g[i][k] === 0 && neighbors === 3) {
							// If cell is empty && any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction
							gridCopy[i][k] = 1;
						}
					}
				}
			});
		});

		// recursive call
		setTimeout(runSimulation, 1000);

		// track the generation of the cells if there are alive cells
		if (checkIfEmptyGrid(gridRef.current) === false) {
			setGeneration(generationRef.current + 1);
		}
	}, []);

	return (
		<React.Fragment>
			<button
				onClick={() => {
					// toggle running
					setRunning(!running);
					// if running is true start simulation
					if (!running) {
						runningRef.current = true;
						runSimulation();
					}
				}}
				disabled={checkIfEmptyGrid(grid) ? true : false}
			>
				{running ? 'Stop Simulation' : 'Begin Simulation'}
			</button>
			<button
				onClick={() => {
					setGrid(generateEmptyGrid);
					// If the sim is running, reset will stop the sim and reset the grid
					if (running) {
						setRunning(!running);
					}
					setGeneration(0);
				}}
			>
				Reset
			</button>
			<button
				onClick={() => {
					setGrid(generateRandomGrid());
				}}
			>
				Randomize
			</button>
			<div>Current Generation: {generation}</div>
			<div
				style={{
					border: '1px solid black',
					width: '56.1%',
				}}
			>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: `repeat(${numCols}, 20px)`,
					}}
				>
					{grid.map((rows, i) =>
						rows.map((col, k) => (
							<div
								key={`${i}-${k}`}
								onClick={() => {
									// generates an immutable change
									const newGrid = produce(grid, (gridCopy) => {
										// allows us to toggle alive and dead
										gridCopy[i][k] = grid[i][k] ? 0 : 1;
									});

									setGrid(newGrid);
								}}
								style={{
									width: 20,
									height: 20,
									backgroundColor: grid[i][k] ? 'black' : undefined,
									border: running ? 'none' : 'solid 1px black',
									cursor: 'pointer',
									pointerEvents: running ? 'none' : 'auto',
								}}
							></div>
						))
					)}
				</div>
			</div>
		</React.Fragment>
	);
}

export default App;
