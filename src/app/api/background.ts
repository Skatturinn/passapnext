type Matrix = number[][];
type Coordinate = [number, number];

function addBackground(
	matrix: Matrix,
	backgroundFilePath: string = "empty",
	matrixBackgroundColor: number = 1,
	backgroundStarts: Coordinate[] = [],
	border: boolean = true,
	borderColor: number = 1,
	backgroundColor0: number = 1,
	backgroundColor1: number = 4
): Matrix {
	const n = matrix.length;
	const m = matrix[0].length;

	function findFirstNotBackgroundFromCenter(matrix: Matrix, backgroundColor: number): Coordinate | null {
		const center: Coordinate = [Math.floor(n / 2), Math.floor(m / 2)];
		const visited = new Set<string>();
		const toVisit: Coordinate[] = [center];

		while (toVisit.length > 0) {
			const [x, y] = toVisit.shift()!;
			const key = `${x},${y}`;
			if (visited.has(key)) continue;
			visited.add(key);

			if (matrix[x][y] !== backgroundColor) {
				return [x, y];
			}

			const directions: Coordinate[] = [
				[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
				[x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1]
			];

			for (const [nx, ny] of directions) {
				if (nx >= 0 && ny >= 0 && nx < n && ny < m) {
					toVisit.push([nx, ny]);
				}
			}
		}

		return null;
	}

	function isValidCoord([x, y]: Coordinate): boolean {
		return x >= 0 && y >= 0 && x < n && y < m;
	}

	function floodFill(matrix: Matrix, starts: number[][], backgroundColor: number, borderColor: number, border: boolean): Matrix {
		const visited = new Set<string>();
		const toVisit: Coordinate[] = [...starts];
		let borderEncountered = false;

		while (toVisit.length > 0) {
			const [x, y] = toVisit.shift()!;
			const key = `${x},${y}`;
			if (visited.has(key)) continue;
			visited.add(key);

			if (matrix[x][y] === backgroundColor) {
				matrix[x][y] = border ? 13 : backgroundColor; // Temporary marker for border

				const directions: Coordinate[] = [
					[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
					[x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1]
				];

				for (const [nx, ny] of directions) {
					if (isValidCoord([nx, ny]) && !visited.has(`${nx},${ny}`)) {
						if (matrix[nx][ny] === backgroundColor) {
							toVisit.push([nx, ny]);
						} else if (![matrixBackgroundColor, 10, 11, 13].includes(matrix[nx][ny])) {
							borderEncountered = true;
						}
					}
				}
			} else if (border) {
				borderEncountered = true;
			}
		}

		if (border && borderEncountered) {
			matrix.forEach((row, i) => row.forEach((val, j) => {
				if (val === 13) {
					matrix[i][j] = borderColor;
				}
			}));
		}

		matrix.forEach((row, i) => row.forEach((val, j) => {
			if (val === 11) matrix[i][j] = backgroundColor1;
			if (val === 10) matrix[i][j] = backgroundColor0;
		}));

		return matrix;
	}

	// Step 1: Find the first non-background color
	const firstPixel = findFirstNotBackgroundFromCenter(matrix, matrixBackgroundColor);
	if (!firstPixel) {
		throw new Error("No non-background color found");
	}

	// Step 2: Flood fill to add background
	const starts = backgroundStarts.length ? backgroundStarts : [[0, 0], [n - 1, 0], [0, m - 1], [n - 1, m - 1]];
	return floodFill(matrix, starts, matrixBackgroundColor, borderColor, border);
}