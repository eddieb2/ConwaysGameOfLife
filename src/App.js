import React, { useState, useCallback, useRef, useEffect } from 'react';
import './App.css';
import produce from 'immer';
import { Button, Select, MenuItem, InputLabel, FormControl, makeStyles } from '@material-ui/core';
import styled from 'styled-components';

// TODO
/*
1. implement a feature involving the grid edge
2. implement custom features
	- speed control [x]
	- grid randomization [x]
	- sample cell configurations []
*/

////////////////////////////////////////////////////////////////////

// SECTION Global Variables
// FIXME Have the user pick the grid size?
// const numRows = 25;
// const numCols = 25;

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

////////////////////////////////////////////////////////////////////

// SECTION Helper Functions
const generateEmptyGrid = (gridSize) => {
	const rows = [];
	let numRows = gridSize;
	let numCols = gridSize;

	for (let i = 0; i < numRows; i++) {
		rows.push(Array.from(Array(numCols), () => 0));
	}

	return rows;
};

const generateRandomGrid = (gridSize) => {
	const rows = [];
	let numRows = gridSize;
	let numCols = gridSize;

	for (let i = 0; i < numRows; i++) {
		rows.push(Array.from(Array(numCols), () => (Math.random() > 0.8 ? 1 : 0)));
	}

	return rows;
};

const checkIfEmptyGrid = (grid) => {
	// sum all rows of the grid
	// console.log(grid);
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

// SECTION Preset Cell Configurations
const presetConfiguration1 = (gridSize) => {
	const rows = [];
	let numRows = gridSize;
	let numCols = gridSize;

	for (let i = 0; i < numRows; i++) {
		rows.push(Array.from(Array(numCols), () => 0));
	}

	let arr = [
		[0, 0, 1, 1, 0, 0],
		[0, 0, 0, 1, 1, 0],
		[1, 0, 0, 1, 0, 1],
		[1, 1, 1, 0, 1, 1],
		[0, 1, 0, 1, 0, 1],
		[0, 0, 1, 1, 1, 0],
	];

	for (let i = 0; i < rows.length; i++) {
		if (i < 6) {
			Array.prototype.splice.apply(rows[i], [0, arr[i].length].concat(arr[i]));
			Array.prototype.splice.apply(rows[i], [11, arr[i].length].concat(arr[i]));
			Array.prototype.splice.apply(rows[i], [22, arr[i].length].concat(arr[i]));
			Array.prototype.splice.apply(rows[i], [33, arr[i].length].concat(arr[i]));
			Array.prototype.splice.apply(rows[i], [44, arr[i].length].concat(arr[i]));
		}
	}

	return rows;
};

const presetConfiguration2 = (gridSize) => {
	const rows = [];
	let numRows = gridSize;
	let numCols = gridSize;

	for (let i = 0; i < numRows; i++) {
		rows.push(Array.from(Array(numCols), () => 0));
	}

	let arr = [
		[0, 1, 1, 1, 0, 0],
		[0, 0, 0, 1, 1, 1],
		[0, 0, 0, 0, 0, 0],
		[1, 1, 1, 0, 1, 1],
		[0, 1, 0, 1, 0, 1],
		[0, 0, 1, 1, 1, 0],
	];

	for (let i = 0; i < rows.length; i++) {
		if (i < 6) {
			Array.prototype.splice.apply(rows[i], [0, arr[i].length].concat(arr[i]));
			Array.prototype.splice.apply(rows[i], [11, arr[i].length].concat(arr[i]));
			Array.prototype.splice.apply(rows[i], [22, arr[i].length].concat(arr[i]));
			Array.prototype.splice.apply(rows[i], [33, arr[i].length].concat(arr[i]));
			Array.prototype.splice.apply(rows[i], [44, arr[i].length].concat(arr[i]));
		}
	}

	return rows;
};

const presetConfiguration3 = (gridSize) => {
	const rows = [];
	let numRows = gridSize;
	let numCols = gridSize;

	for (let i = 0; i < numRows; i++) {
		rows.push(Array.from(Array(numCols), () => 0));
	}

	let arr = [
		[0, 0, 1, 1, 0, 0],
		[0, 0, 0, 1, 1, 0],
		[1, 0, 0, 1, 0, 1],
		[1, 1, 1, 0, 1, 1],
		[0, 1, 0, 1, 0, 1],
		[0, 0, 1, 1, 1, 0],
	];

	for (let i = 0; i < rows.length; i++) {
		if (i < 6) {
			Array.prototype.splice.apply(rows[i], [0, arr[i].length].concat(arr[i]));
			Array.prototype.splice.apply(rows[i], [11, arr[i].length].concat(arr[i]));
			Array.prototype.splice.apply(rows[i], [22, arr[i].length].concat(arr[i]));
			Array.prototype.splice.apply(rows[i], [33, arr[i].length].concat(arr[i]));
			Array.prototype.splice.apply(rows[i], [44, arr[i].length].concat(arr[i]));
		}
	}

	return rows;
};

////////////////////////////////////////////////////////////////////

// SECTION Styles
const useStyles = makeStyles((theme) => ({
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
	selectEmpty: {
		marginTop: theme.spacing(2),
	},
	root: {
		'& > *': {
			margin: theme.spacing(1),
		},
	},
}));

const MainWrapper = styled.div`
	height: 100vh;
	/* border: 1px solid black; */
	padding: 15px;
	background: lightgray;
`;

const GameControl = styled.div`
	display: flex;
	justify-content: center;
`;
const GridContainer = styled.div`
	display: flex;
	justify-content: center;
`;

const Display = styled.div`
	display: flex;
	justify-content: space-evenly;
	margin: 1%;
`;

// SECTION Application
function App() {
	// SECTION Styles
	const classes = useStyles();

	// SECTION State
	/* 
		this is here for the use to pick the grid size. 
		had trouble with the grid changing after the grid is selected
	*/
	const [gridSize, setGridSize] = useState(50);

	const [grid, setGrid] = useState(() => {
		return generateEmptyGrid(gridSize);
	});

	console.log(grid, gridSize);

	const [running, setRunning] = useState(false);
	const [generation, setGeneration] = useState(0);
	const [speed, setSpeed] = useState(1000);

	// SECTION Refs
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

	const gridSizeRef = useRef(gridSize);
	gridSizeRef.current = gridSize;

	// SECTION Simulation
	const runSimulation = useCallback(() => {
		// base case
		if (!runningRef.current) {
			return;
		}

		setGrid((g) => {
			return produce(g, (gridCopy) => {
				let numRows = gridSizeRef.current;
				let numCols = gridSizeRef.current;
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

	// used for user grid selection. handles changes from the select in game control
	const handleGridChanges = (e) => {
		// console.log(e.target.value);
		setGridSize(e.target.value);
		// generateEmptyGrid(gridSize);
	};

	return (
		<MainWrapper>
			<GameControl>
				<Button
					className={classes.formControl}
					variant='outlined'
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
					className={classes.formControl}
					variant='outlined'
					onClick={() => {
						setGrid(generateEmptyGrid(gridSize));
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
					className={classes.formControl}
					variant='outlined'
					onClick={() => {
						setGrid(generateRandomGrid(gridSize));
					}}
				>
					Randomize
				</Button>
				<Button
					className={classes.formControl}
					variant='outlined'
					onClick={() => {
						if (speed > 0) {
							setSpeed(speed - 200);
						}
					}}
				>
					Increase Speed <br />
					<i className='fas fa-plus'></i>
				</Button>
				<Button
					className={classes.formControl}
					variant='outlined'
					onClick={() => {
						if (speed < 1000) {
							setSpeed(speed + 200);
						}
					}}
				>
					Decrease Speed <br />
					<i className='fas fa-minus'></i>
				</Button>
				{/* <FormControl variant='outlined' className={classes.formControl}>
					<InputLabel htmlFor='outlined-age-native-simple'>Grid</InputLabel>
					<Select onChange={handleGridChanges} label='Grid Size'>
						<MenuItem value={10}>10x10</MenuItem>
						<MenuItem value={25}>25x25</MenuItem>
						<MenuItem value={50}>50x50</MenuItem>
					</Select>
				</FormControl> */}
			</GameControl>
			<GameControl>
				<h1>Preset Shapes</h1>
			</GameControl>
			<GameControl>
				<Button
					className={classes.formControl}
					variant='outlined'
					onClick={() => {
						setGrid(presetConfiguration1(gridSize));
					}}
				>
					Shape 1
				</Button>
				<Button
					className={classes.formControl}
					variant='outlined'
					onClick={() => {
						setGrid(presetConfiguration2(gridSize));
					}}
				>
					Shape 2
				</Button>
				<Button
					className={classes.formControl}
					variant='outlined'
					onClick={() => {
						setGrid(presetConfiguration3(gridSize));
					}}
				>
					Shape 3
				</Button>
			</GameControl>
			<Display>
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
			</Display>
			<GridContainer>
				<div>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: `repeat(${gridSizeRef.current}, 20px)`,
							backgroundColor: 'pink',
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
										border: 'solid 1px gray',
										cursor: 'pointer',
										pointerEvents: running ? 'none' : 'auto',
									}}
								></div>
							))
						)}
					</div>
				</div>
			</GridContainer>
		</MainWrapper>
	);
}

export default App;
