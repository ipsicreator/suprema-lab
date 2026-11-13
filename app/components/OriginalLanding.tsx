import Image from "next/image";
import Link from "next/link";
import styles from "./OriginalLanding.module.css";

type Hotspot = { label: string; href: string; left: number; top: number; width: number; height: number };
type Props = { src: string; alt: string; width: number; height: number; links: Hotspot[] };

export default function OriginalLanding({ src, alt, width, height, links }: Props) {
  return <main className={styles.page}>
    <div className={styles.image} style={{ width: "min(95vw, " + (90 * width / height) + "svh)", aspectRatio: width + " / " + height }}>
      <Image src={src} alt={alt} width={width} height={height} priority unoptimized className={styles.artwork} />
      <nav aria-label="화면 메뉴">{links.map(link => <Link key={link.label} href={link.href} aria-label={link.label} className={styles.hotspot}
        style={{ left: link.left + "%", top: link.top + "%", width: link.width + "%", height: link.height + "%" }}><span className={styles.label}>{link.label}</span></Link>)}</nav>
    </div>
  </main>;
}
