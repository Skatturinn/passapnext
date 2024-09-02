import Image from "next/image";
import styles from "./page.module.scss";
import { ContactForm } from "./form";

export default function Home() {
	return (
		<main className={styles.main}>
			<ContactForm />
		</main>
	);
}
