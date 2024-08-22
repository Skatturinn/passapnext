import { type NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promisify } from 'util';
import { spawn } from 'child_process';
import sharp from 'sharp';

async function imageToMatrix(path: string, stitches: number, numColors: 3 | 4 = 4): Promise<number[][]> {
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

function findNearestColor(value: number, colors: number[]): number {
	return colors.reduce((prev, curr) => Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
}

function separateColors(matrix: number[][]): number[][] {
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

export async function POST(req: NextRequest, res: NextResponse) {
	const elli = 'https://www.elli.vip/myndir/elias.jpg'
	const s = await imageToMatrix(elli, 90)
	const g = separateColors(s)
	return NextResponse.json({ g });
}