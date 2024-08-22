import { type NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import { spawn } from 'child_process';

const exec = promisify(execCallback);

export async function GET(req: NextRequest, res: NextResponse) {
	const inputString = 'test';
	// Execute the Python script
	const pythonScriptPath = path.join(__dirname, 'scriptTest.py');
	// const pythonScriptPath = `C:/Users/Notandi/Documents/24vor/passapnext/src/app/api/scriptTest.py`;
	// const { stdout, stderr } = 
	// await (exec(`python ${pythonScriptPath}`).then(s => console.log(s)));
	const result = await new Promise((resolve, reject) => {
		const pythonProcess = spawn('python3', [pythonScriptPath]);

		let output = '';
		let error = '';

		// Write the input string to the Python script
		pythonProcess.stdin.write(inputString);
		pythonProcess.stdin.end();

		// Collect output from stdout
		pythonProcess.stdout.on('data', (data) => {
			output += data.toString();
		});

		// Collect errors from stderr
		pythonProcess.stderr.on('data', (data) => {
			error += data.toString();
		});

		// When the process exits, resolve or reject the promise
		pythonProcess.on('close', (code) => {
			if (code !== 0) {
				reject(`Python script exited with code ${code}: ${error}`);
			} else {
				resolve(output.trim());
			}
		});
	});

	// Send the result back to the client
	return NextResponse.json({ output: result });
	// const pythonProcess = exec(`python ${pythonScriptPath}`, (error, stdout, stderr) => {
	// 	if (error) {
	// 		console.error(`Error: ${error.message}`);
	// 		return NextResponse.json({ error: 'Internal Server Error' });
	// 	}
	// 	if (stderr) {
	// 		console.error(`Stderr: ${stderr}`);
	// 		return NextResponse.json({ error: 'Internal Server Error' });
	// 	}

	// 	// Send the output of the Python script back to the client
	// 	NextResponse.json({ output: stdout.trim() });
	// });
	// if (!pythonProcess.stdin) {
	// 	return NextResponse.json({ g: 'g' })
	// }
	// return NextResponse.json({ g: 'g' })
	// Write input to stdin
	// pythonProcess.stdin.write(inputString);
	// pythonProcess.stdin.end();
}