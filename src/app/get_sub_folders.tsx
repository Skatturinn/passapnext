import {
	readFile as fsReadFile,
	writeFile as fsWriteFile,
	mkdir,
	readdir,
	stat
} from 'fs/promises';
import path, { join } from 'path';
import { PathString } from 'react-hook-form';


export async function readFilesFromDir(dir: PathString) {
	let files = [];
	try {
		files = await readdir(dir);
	} catch (e) {
		return [];
	}
	const mapped = files.map(async (file) => {
		const path = join(dir, file);
		const info = await stat(path);

		if (info.isDirectory()) {
			return path;
		}

		if (info.isFile()) {
			return null;
		}

		return path;
	});

	return Promise.all(mapped)

}