import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.col}>
            <h3>VITAL</h3>
            <p>Estratégia, evidência e direção para transformar carreiras e projetos em saúde.</p>
          </div>
          <div className={styles.col}>
            <h3>A Marca</h3>
            <div className={styles.links}>
              <Link href="/" className={styles.link}>Início</Link>
              <Link href="/sobre" className={styles.link}>Quem Somos</Link>
              <a href="http://lattes.cnpq.br/0317966427883862" target="_blank" rel="noopener noreferrer" className={styles.link}>Lattes do Vinícius</a>
            </div>
          </div>
          <div className={styles.col}>
            <h3>Programas</h3>
            <div className={styles.links}>
              <Link href="/metodo-vital" className={styles.link}>Método VITAL</Link>
              <Link href="/do-zero-ao-seu-artigo" className={styles.link}>Do Zero ao Seu Artigo</Link>
              <Link href="/pos" className={styles.link}>VITAL Formação (Pós)</Link>
              <Link href="/saude-que-vira-negocio" className={styles.link}>Saúde que Vira Negócio</Link>
            </div>
          </div>
          <div className={styles.col}>
            <h3>Contato</h3>
            <div className={styles.links}>
              <a href="mailto:giovani@medaffection.com" className={styles.link}>giovani@medaffection.com</a>
              <a href="https://wa.me/5551995661032" target="_blank" rel="noopener noreferrer" className={styles.link}>WhatsApp: (51) 99566-1032</a>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} VITAL. Todos os direitos reservados.</p>
          <div className={styles.legal}>
            <Link href="/privacidade" className={styles.link}>Política de Privacidade</Link>
            <Link href="/termos" className={styles.link}>Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
