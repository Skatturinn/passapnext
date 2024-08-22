'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Paths.module.scss"
import { PathString } from "react-hook-form";
import Image from "next/image";

export default function Paths({ files, depth }: { files: Array<string | null>, depth: number}) {
	const pathname = usePathname();
	const isCurrent = (href: string): boolean => {
		return pathname.split('/').includes(href) ? true : false
	}
	const ff = files.filter(e => e);
	const p = ff[0]?.includes('\\') ? ff.map(stak => stak?.split('\\')) : ff.map(stak => stak?.split('/'));
	console.log(p)
	// const active = p.map(stak => stak && isCurrent(stak.splice(-1)[0]))
	const active = p.map(stak => stak && isCurrent(stak[4]))
	const stada = active.some(stak => stak)
	return <nav className={styles.nav}>
		<ol className={styles.ol}>
			{p.filter(subStringArray => !subStringArray?.includes('api')).map(
				(stak, nr) => {
					const href = stak && stak.splice(stada ? -1 : depth +1).join('/')
					return (href &&
						<li key={nr} className={active[nr] ? styles.active : ""}>
							<Link href={href}>
								{href.split('/').splice(-1)[0]}
							</Link></li>)
				}
			)}
		</ol>
	</nav>
}