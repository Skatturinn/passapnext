function hexToRgb(hex: string): [number, number, number] {
	const h = hex.replace('#', '');
	const r = parseInt(h.substring(0, 2), 16);
	const g = parseInt(h.substring(2, 4), 16);
	const b = parseInt(h.substring(4, 6), 16);
	return [r, g, b];
}

function viewColoredMatrix(
	matrix: number[][],
	color1: string,
	color2: string,
	color3: string,
	color4: string
): void {
	const rgb1 = hexToRgb(color1);
	const rgb2 = hexToRgb(color2);
	const rgb3 = hexToRgb(color3);
	const rgb4 = hexToRgb(color4);

	const rgbColors = [rgb1, rgb2, rgb3, rgb4];

	// Create a new matrix with RGB values
	const rgbMatrix = matrix.map(row => row.map(val => rgbColors[val - 1]));

	// Convert to Uint8ClampedArray for use with canvas (since np.array is not available in JS/TS)
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	if (ctx) {
		const imageData = ctx.createImageData(rgbMatrix[0].length, rgbMatrix.length);
		let index = 0;
		for (const row of rgbMatrix) {
			for (const [r, g, b] of row) {
				imageData.data[index++] = r;
				imageData.data[index++] = g;
				imageData.data[index++] = b;
				imageData.data[index++] = 255; // Alpha channel set to fully opaque
			}
		}
		ctx.putImageData(imageData, 0, 0);
		document.body.appendChild(canvas); // Show the canvas on the page
	}
}