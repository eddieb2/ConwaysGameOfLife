import React, { useState, useCallback, useRef } from 'react';
import './App.css';
import produce from 'immer';
import { Button, Switch } from '@material-ui/core';

// SECTION Global Variables
// FIXME Have the user pick the grid size?
const numRows = 25;
const numCols = 25;

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
	const [speed, setSpeed] = useState(1000);
	// running/generation value changes but our runSim fnx does not
	// keeps our running/generation value updated in our callback below
	const runningRef = useRef(running);
	runningRef.current = running;

	const generationRef = useRef(generation);
	generationRef.current = generation;

	const gridRef = useRef(grid);
	gridRef.current = grid;

	const speedRef = useRef(speed);
	speedRef.current = speed;

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
						// FIXME
						/*
						 * Does something well-documented with the edge of the grid. (e.g. wraparound to the far side--most fun!--or assumes all edge cells are permanently dead.)
						 */

						// if cell touch edge, they die

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
		setTimeout(runSimulation, speedRef.current);

		// track the generation of the cells if there are alive cells
		if (checkIfEmptyGrid(gridRef.current) === false) {
			setGeneration(generationRef.current + 1);
		}
	}, []);

	return (
		<React.Fragment>
			<Button
				variant='contained'
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
			</Button>
			<Button
				variant='contained'
				color='secondary'
				onClick={() => {
					setGrid(generateEmptyGrid);
					// If the sim is running, reset will stop the sim and reset the grid
					if (running) {
						setRunning(!running);
					}
					setGeneration(0);
					setSpeed(1000);
				}}
			>
				Reset
			</Button>
			<Button
				variant='contained'
				color='primary'
				onClick={() => {
					setGrid(generateRandomGrid());
				}}
			>
				Randomize
			</Button>
			<Button
				onClick={() => {
					if (speed > 0) {
						setSpeed(speed - 100);
					}
				}}
			>
				Increase Speed <br />
				<i class='fas fa-plus'></i>
			</Button>
			<Button
				onClick={() => {
					if (speed < 1000) {
						setSpeed(speed + 100);
					}
				}}
			>
				Decrease Speed <br />
				<i class='fas fa-minus'></i>
			</Button>
			<div>Current Generation: {generation}th</div>
			<div>
				Speed:
				{(function () {
					switch (speed) {
						case 1000:
							return 1;
						case 900:
							return 2;
						case 800:
							return 3;
						case 700:
							return 4;
						case 600:
							return 5;
						case 500:
							return 6;
						case 400:
							return 7;
						case 300:
							return 8;
						case 200:
							return 9;
						case 100:
							return 10;
						case 0:
							return 11;
					}
				})()}
			</div>
			<div
				style={{
					// FIXME Change width/border to be dynmaic to the size of the grid
					display: 'grid',
					gridTemplateColumns: `repeat(${numCols}, 20px)`,
					// border: '1px solid black',
					// width: '80.1%',
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
								// border: running ? 'none' : 'solid 1px black',
								border: 'solid 1px black',
								cursor: 'pointer',
								pointerEvents: running ? 'none' : 'auto',
							}}
						></div>
					))
				)}
			</div>
		</React.Fragment>
	);
}

export default App;
