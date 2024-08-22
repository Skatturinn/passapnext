import sharp from 'sharp';

type Matrix = number[][];
type Coordinate = [number, number];

export async function imageToMatrix(path: string, stitches: number, numColors: 3 | 4 = 4): Promise<number[][]> {
	// Fetch image from the provided URL
	const response = await fetch(path, { method: 'GET' });
	const imgBuffer = Buffer.from(await response.arrayBuffer());

	// Convert image to grayscale and resize it
	const image = sharp(imgBuffer).grayscale();
	const metadata = await image.metadata();
	const originalWidth = metadata.width!;
	const originalHeight = metadata.height!;
	const heightLengthRatio = originalHeight / originalWidth;
	const rows = Math.round(stitches * heightLengthRatio);

	// Resize image
	const resizedImage = await image.resize(stitches, rows, { kernel: sharp.kernel.lanczos2 }).raw().toBuffer();

	// Convert to a normalized array (grayscale between 0 and 1)
	let imgArray = Array.from(resizedImage).map((value: number) => value / 255);

	// Reshape the linear array to a 2D matrix
	const matrix: number[][] = [];
	for (let i = 0; i < rows; i++) {
		matrix.push(imgArray.slice(i * stitches, (i + 1) * stitches));
	}

	// Define the colors based on numColors
	const colors: number[] = numColors === 3 ? [0, 0.5, 1] : [0, 0.33, 0.66, 1];

	// Error diffusion dithering using the Floyd-Steinberg algorithm
	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < stitches; x++) {
			const oldPixel = matrix[y][x];
			const newPixel = findNearestColor(oldPixel, colors);
			matrix[y][x] = newPixel;
			const quantError = oldPixel - newPixel;

			if (x + 1 < stitches) {
				matrix[y][x + 1] += quantError * 7 / 16;
			}
			if (y + 1 < rows) {
				if (x - 1 >= 0) {
					matrix[y + 1][x - 1] += quantError * 3 / 16;
				}
				matrix[y + 1][x] += quantError * 5 / 16;
				if (x + 1 < stitches) {
					matrix[y + 1][x + 1] += quantError * 1 / 16;
				}
			}
		}
	}

	// Set knitting pattern colors
	if (numColors === 3) {
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < stitches; x++) {
				if (matrix[y][x] === 0.5) {
					matrix[y][x] = 2;
				} else if (matrix[y][x] === 0) {
					matrix[y][x] = 3;
				}
			}
		}
	} else {
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < stitches; x++) {
				if (matrix[y][x] === 0.66) {
					matrix[y][x] = 2;
				} else if (matrix[y][x] === 0.33) {
					matrix[y][x] = 3;
				} else if (matrix[y][x] === 0) {
					matrix[y][x] = 4;
				}
			}
		}
	}
	return matrix.map(row => row.map(Math.round).slice().reverse());
}

export function findNearestColor(value: number, colors: number[]): number {
	return colors.reduce((prev, curr) => Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
}

export function separateColors(matrix: number[][]): number[][] {
	const res: number[][] = [];
	// const numRows = matrix.length;
	const numCols = matrix[0].length;

	// Determine the maximum value in the matrix to know how many colors we have
	const max = Math.max(...matrix.flat());

	for (const row of matrix) {
		// Initialize an object to hold separate color lists
		const lists: { [key: number]: number[] } = {};
		for (let i = 1; i <= max; i++) {
			lists[i] = new Array(numCols).fill(0);
		}

		// Fill the color lists based on the row values
		for (let idx = 0; idx < numCols; idx++) {
			const value = row[idx];
			if (lists[value]) {
				lists[value][idx] = value;
			}
		}

		// Add each color list twice to the result
		for (let i = 1; i <= max; i++) {
			if (lists[i].some(val => val !== 0)) { // Only add if there's at least one non-zero value
				res.push([...lists[i]]);
				res.push([...lists[i]]);
			}
		}
	}

	return res;
}
export function addBackground(
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
		const toVisit = [...starts];
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