import type { Metadata } from "next";
import { readFilesFromDir } from "../get_sub_folders";
import Paths from "../Paths";
import styles from "./layout.module.scss"

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

// export default async function RootLayout({
// 	children,
// }: {
// 	children: React.ReactNode;
// }) {
// 	const files = (await readFilesFromDir(`./src/app/verkefni/vel608g`))
// 	return (<>
// 		<Paths files={files} image="/spil/joker.svg" />
// 		{children}
// 	</>
// 	);
// }

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// const files = (await readFilesFromDir(`./src/app/um_okkur`))
	return (
		<main>
			<section>
				{/* <Paths files={files} depth={1} /> */}
			</section>
			<section>{children}</section>
		</main>
	)
}

