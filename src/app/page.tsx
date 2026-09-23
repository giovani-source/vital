"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  const steps = [
    {
      title: "Escrever um artigo",
      subtitle: "Do Zero ao Seu Artigo",
      href: "/do-zero-ao-seu-artigo",
    },
    {
      title: "Fazer mestrado ou doutorado",
      subtitle: "Método VITAL",
      href: "/metodo-vital",
    },
    {
      title: "Produzir ciência continuamente",
      subtitle: "Círculo VITAL",
      href: "/circulo-vital",
    },
    {
      title: "Fazer uma pós-graduação",
      subtitle: "VITAL Formação",
      href: "/pos",
    },
    {
      title: "Criar um negócio em saúde",
      subtitle: "Saúde que Vira Negócio",
      href: "/saude-que-vira-negocio",
    },
    {
      title: "Desenvolver um produto",
      subtitle: "Da Prática ao Produto",
      href: "/da-pratica-ao-produto",
    },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <motion.div 
            className={styles.heroText}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span className={styles.brand} variants={fadeUp}>VITAL</motion.span>
            <motion.h1 className={`text-h1 ${styles.title}`} variants={fadeUp}>
              Conhecimento que vira trajetória.
            </motion.h1>
            <motion.p className={styles.description} variants={fadeUp}>
              Estratégia, evidência e direção para profissionais da saúde que querem produzir conhecimento, avançar academicamente e transformar ideias em negócios.
            </motion.p>
            <motion.div className={styles.ctas} variants={fadeUp}>
              <Link href="#proximopasso" className="btn btn-primary uppercase tracking-wider font-semibold">
                Encontre seu próximo passo
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            className={styles.heroImageContainer}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <img 
              src="/vinicius.jpg" 
              alt="Vinícius" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} 
            />
          </motion.div>
        </div>
      </section>

      {/* Destaque Lattes (Autoridade) */}
      <section style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', padding: '4rem 0' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
          <div style={{ flex: '1 1 500px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
              Construa sua base com quem já validou o caminho.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', lineHeight: '1.6' }}>
              O planejamento estratégico da VITAL é fundamentado na experiência internacional, docência e pesquisa conduzida por Vinícius e Giovani Basso.
            </p>
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <a href="http://lattes.cnpq.br/0317966427883862" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '1rem 2rem', backgroundColor: 'white', color: 'var(--primary)', borderRadius: '0.5rem', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em', textDecoration: 'none', transition: 'transform 0.2s' }}>
              Ver Currículo Lattes de Vinícius
            </a>
          </div>
        </div>
      </section>

      {/* Next Step Section */}
      <section id="proximopasso" className={`section ${styles.stepsSection}`}>
        <div className="container">
          <motion.div 
            className="mb-16 border-b border-border pb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block">O seu plano de ação</span>
            <h2 className="text-h2 text-primary">Qual é o seu próximo passo?</h2>
          </motion.div>

          <motion.div 
            className={styles.stepsGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {steps.map((step, index) => (
              <motion.div key={index} variants={fadeUp}>
                <Link href={step.href} className={styles.stepCard}>
                  <div>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepSubtitle}>{step.subtitle}</p>
                  </div>
                  <div className={styles.stepLink}>
                    Acessar <ArrowRight size={20} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
