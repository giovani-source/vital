"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PosPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <section className="container mb-24 max-w-[900px] mx-auto">
        <motion.span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block" initial="hidden" animate="visible" variants={fadeUp}>
          VITAL Formação
        </motion.span>
        <motion.h1 className="text-h1 mb-8 text-primary" initial="hidden" animate="visible" variants={fadeUp}>
          Pós-Graduação Lato Sensu
        </motion.h1>
        
        <motion.div className="editorial-block" initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}>
          <p className="text-impact mb-4">
            Aprenda com quem faz ciência e prática na vida real.
          </p>
          <p className="text-large text-muted-foreground mb-6">
            Especializações acadêmicas de alto nível, estruturadas com evidência e foco no mercado. Nossos cursos são validados e reconhecidos pelo rigor científico.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <img src="/selo-mec.webp" alt="Aprovado pelo MEC" style={{ height: '60px', width: 'auto' }} />
          </div>
        </motion.div>
      </section>

      {/* Curso 1 - Onco */}
      <section className="bg-muted py-24 border-y border-border">
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem', marginBottom: '4rem' }}>
            <div>
              <span className="font-bold uppercase tracking-widest text-sm mb-2 block" style={{ color: 'var(--accent)' }}>Inscrições em Breve</span>
              <h2 className="text-h2 text-primary">Jornada do Paciente Oncológico</h2>
            </div>
            <Link href="/contato" className="btn btn-primary px-8 py-3 uppercase tracking-wider font-semibold text-sm">
              Entrar na Lista de Espera <ArrowRight size={16} className="inline ml-2" />
            </Link>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem' }}>
            
            {/* Infos do Curso */}
            <div style={{ flex: '1 1 300px' }}>
              <div className="bg-background" style={{ borderTop: '2px solid var(--primary)', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h3 className="font-bold text-xl mb-6 text-foreground">Detalhes do Curso</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="text-sm uppercase tracking-wider font-semibold">
                  <div>
                    <span style={{ display: 'block', color: 'var(--muted-foreground)', marginBottom: '0.25rem', fontSize: '0.75rem' }}>Público Alvo</span>
                    <span className="text-foreground">Enfermeiros e Afins</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--muted-foreground)', marginBottom: '0.25rem', fontSize: '0.75rem' }}>Duração</span>
                    <span className="text-foreground">6 a 12 meses</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--muted-foreground)', marginBottom: '0.25rem', fontSize: '0.75rem' }}>Modalidade</span>
                    <span className="text-foreground">100% Online</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--muted-foreground)', marginBottom: '0.25rem', fontSize: '0.75rem' }}>Trabalho de Conclusão (TCC)</span>
                    <span className="text-foreground">Não Obrigatório</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mentores */}
            <div style={{ flex: '2 1 600px' }}>
              <h3 className="text-2xl font-bold mb-8 text-primary">Aprenda com quem faz (Nossos Mentores)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                
                {/* Aline */}
                <div className="bg-background border border-border p-6 rounded-xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform shadow-sm">
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', marginBottom: '1.5rem', border: '3px solid var(--primary)' }}>
                    <img src="/equipe/aline_crop.jpg" alt="Aline Moraes" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                  </div>
                  <h4 className="font-bold text-lg mb-1">Aline Moraes</h4>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">Excelência e liderança na enfermagem oncológica e na gestão do cuidado integrado.</p>
                  <a href="http://lattes.cnpq.br/3455731491863207" target="_blank" rel="noopener noreferrer" className="mt-auto text-accent text-sm font-bold uppercase tracking-wider hover:underline">
                    Ver Lattes
                  </a>
                </div>

                {/* Maryana */}
                <div className="bg-background border border-border p-6 rounded-xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform shadow-sm">
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', marginBottom: '1.5rem', border: '3px solid var(--primary)' }}>
                    <img src="/equipe/maryana_crop.jpg" alt="Maryana De Matos" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                  </div>
                  <h4 className="font-bold text-lg mb-1">Maryana De Matos</h4>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">Profissional dedicada à excelência no cuidado oncológico e inovação na enfermagem.</p>
                  <a href="http://lattes.cnpq.br/0557038265644489" target="_blank" rel="noopener noreferrer" className="mt-auto text-accent text-sm font-bold uppercase tracking-wider hover:underline">
                    Ver Lattes
                  </a>
                </div>

                {/* Vinicius */}
                <div className="bg-background border border-border p-6 rounded-xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform shadow-sm">
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', marginBottom: '1.5rem', border: '3px solid var(--primary)' }}>
                    <img src="/equipe/vinicius_crop.jpg" alt="Vinícius Santos" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                  </div>
                  <h4 className="font-bold text-lg mb-1">Vinícius Santos</h4>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">Transformar conhecimento em cuidado é o que move a jornada acadêmica e prática.</p>
                  <a href="http://lattes.cnpq.br/0317966427883862" target="_blank" rel="noopener noreferrer" className="mt-auto text-accent text-sm font-bold uppercase tracking-wider hover:underline">
                    Ver Lattes
                  </a>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Curso Secundário / Extensão */}
      <section className="container" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        <div className="bg-background shadow-sm" style={{ padding: '3rem', borderTop: '2px solid var(--primary)', border: '1px solid var(--border)', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '3rem' }}>
            <div style={{ flex: '1 1 500px' }}>
              <span className="font-bold uppercase tracking-widest text-sm mb-2 block" style={{ color: 'var(--accent)' }}>Curso de Extensão</span>
              <h3 className="text-h3 text-foreground mb-4">Capacitação em Oncologia</h3>
              <p className="text-large text-muted-foreground mb-6" style={{ maxWidth: '700px' }}>
                Formação ágil e focada na prática clínica oncológica, desenvolvida para capacitar profissionais com ferramentas diretas e conhecimento baseado em evidências.
              </p>
              <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }} className="text-sm uppercase tracking-wider font-semibold">
                <div>
                  <span style={{ display: 'block', color: 'var(--muted-foreground)', marginBottom: '0.25rem', fontSize: '0.75rem' }}>Carga Horária</span>
                  <span className="text-foreground">120 horas</span>
                </div>
                <div>
                  <span style={{ display: 'block', color: 'var(--muted-foreground)', marginBottom: '0.25rem', fontSize: '0.75rem' }}>Modalidade</span>
                  <span className="text-foreground">Online</span>
                </div>
              </div>
            </div>
            <div style={{ flex: '0 0 auto' }}>
              <a href="https://medaffection-plataforma-app.vercel.app/login" target="_blank" rel="noopener noreferrer" className="btn btn-primary uppercase tracking-wider font-semibold text-sm" style={{ padding: '1rem 2rem', display: 'inline-block' }}>
                Acessar Plataforma <ArrowRight size={16} className="inline ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}