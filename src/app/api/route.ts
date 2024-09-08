import { type NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import OpenAI from "openai";
import { imageToMatrix, separateColors } from './snaebba';
import { getPattern, insertPattern, insertRow } from './db';
const openai = new OpenAI();

export async function POST(req: NextRequest, res: NextResponse) {
	let { name, message, vel_id } = await req.json()
	const response = await openai.images.generate({
		model: "dall-e-3",
		prompt: `White background, detailed outlines, ${message}`,
		n: 1,
		size: "1024x1024",
	});
	const image_url = response.data[0].url;
	// const image_url = 'https://ftp.cvut.cz/mirrors/ctan.org/macros/latex/contrib/mwe/example-image-1x1.jpg'
	if (image_url) {
		const s = await imageToMatrix(image_url, 100);
		const matrix = String(s.map(stak => String(stak) + ';')).replaceAll(',', '').replaceAll('{', '').replaceAll('}', '');
		// console.log(matrix)
		const result = await insertPattern(vel_id || 0, name || '', s.length, matrix)
		// const g = separateColors(s)
		// console.log(s, typeof s)
		// return NextResponse.json(g)
		// const matrix_db = g.map(stak => String(stak))
		// console.log(matrix_db, typeof matrix_db)
		// const result = await insertPattern(vel_id || 0, name || '', matrix_db.length)
		const id = result?.id;
		// console.log(await getPattern(id))
		if (!Number.isNaN(id)) {
			// 	// matrix_db.forEach((stak, i) => insertRow(id, stak, i)) // <--- !!!! SLEKK 'A ÞESSU TIL AÐ SETJA EKKI I DB !!!!
			return NextResponse.json({ id, message: `Munztur stófnað, kennimerki ${id}; url: ${image_url}` })
		}
		return NextResponse.json({ message: 'tókst ekki að stofna munstur' }, { status: 500 })
	} else {
		return NextResponse.json({ message: 'tókst ekki að stofna mynd' }, { status: 502 })
	}
	// return NextResponse.json(await req.json())
}