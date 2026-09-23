"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PraticaAoProdutoPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const atendidos = [
    "Profissionais de Saúde", "Pesquisadores", "Universidades",
    "Hospitais & Clínicas", "Startups em Saúde", "Empresas"
  ];

  const jornada = [
    "Problema clínico", "Pesquisa", "Requisitos", "Solução", "Protótipo", "Validação", "Produto"
  ];

  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <section className="container mb-24 max-w-[900px] mx-auto">
        <motion.span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block" initial="hidden" animate="visible" variants={fadeUp}>
          VITAL Inovação
        </motion.span>
        <motion.h1 className="text-h1 mb-8 text-primary" initial="hidden" animate="visible" variants={fadeUp}>
          Da Prática ao Produto
        </motion.h1>
        
        <motion.div className="editorial-block" initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}>
          <p className="text-impact mb-4">
            Consultoria especializada para transformar um problema observado na prática em uma solução de mercado.
          </p>
          <p className="text-large text-muted-foreground">
            Entendemos que inovar na saúde exige rigor científico. Estruturamos desde a pesquisa clínica até o modelo de negócio da sua solução de saúde.
          </p>
        </motion.div>
        
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }} className="mt-12">
          <Link href="/contato" className="btn btn-primary text-large px-8 py-4 uppercase tracking-wider font-semibold">
            Solicitar Consultoria <ArrowRight className="inline ml-2" size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Para Quem Atendemos */}
      <section style={{ backgroundColor: 'var(--background)', padding: '6rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ marginBottom: '4rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-h2 text-primary">Para quem é a consultoria?</h2>
            <p className="text-large text-muted-foreground mt-4">Atendemos iniciativas individuais e estruturas institucionais complexas.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', maxWidth: '1000px' }}>
            {atendidos.map((item, idx) => (
              <div key={idx} style={{ borderTop: '2px solid var(--primary)', paddingTop: '1rem', color: 'var(--foreground)', fontWeight: '500', fontSize: '1.125rem' }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jornada */}
      <section className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
        <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem', marginBottom: '1rem', display: 'block' }}>A Evolução da Ideia</span>
        <h2 className="text-h2 text-primary" style={{ marginBottom: '4rem' }}>Nossa metodologia de validação.</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '1.5rem' }}>
          {jornada.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--foreground)' }}>
                {step}
              </div>
              {idx < jornada.length - 1 && <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.5rem' }}>/</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Case Real - Fixe */}
      <section style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', padding: '8rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4rem' }}>
            <div style={{ flex: '1 1 500px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                <img src="/cases/fixe-premio.jpg" alt="Equipe Fixe recebendo premiação UFRGS SEDETEC" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            </div>
            <div style={{ flex: '1 1 500px' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'block' }}>
                Case Real em Destaque
              </span>
              
              <div style={{ marginBottom: '2.5rem' }}>
                <img src="/fixe-logo.svg" alt="Fixe" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
              </div>
              
              <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
                A Fixe é um dispositivo inovador nascido de uma necessidade real e diária na prática clínica. 
              </p>
              
              <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', marginBottom: '3rem', lineHeight: '1.7' }}>
                Acompanhe a nossa evolução: desde a ideação do problema, pesquisa aprofundada de requisitos, até chegar na modelagem, <strong>prototipagem 3D</strong> e fabricação do produto. Entenda como transformamos um problema hospitalar em uma solução física, tecnológica e rigorosamente validada.
              </p>
              <Link href="/contato" style={{ display: 'inline-block', padding: '1.25rem 3rem', backgroundColor: 'white', color: 'var(--primary)', borderRadius: '0.75rem', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em', textDecoration: 'none', transition: 'transform 0.2s' }}>
                Agendar uma conversa
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}