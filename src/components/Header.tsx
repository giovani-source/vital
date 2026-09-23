import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          VITAL
        </Link>
        <nav className={styles.nav}>
          <Link href="/sobre" className={styles.link}>Sobre</Link>
          <Link href="/metodo-vital" className={styles.link}>Método VITAL</Link>

          <Link href="/pos" className={styles.link}>Pós-graduação</Link>
          <Link href="/contato" className={styles.link}>Contato</Link>
        </nav>
      </div>
    </header>
  );
}
