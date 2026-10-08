"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function PosPage() {
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
    <div className="pt-24 pb-16">
      {/* Hero */}
      <section className="container mb-16 max-w-[900px] mx-auto text-center">
        <motion.span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block" initial="hidden" animate="visible" variants={fadeUp}>
          VITAL Formação
        </motion.span>
        <motion.h1 className="text-h1 mb-6 text-primary" initial="hidden" animate="visible" variants={fadeUp}>
          Avanço Profissional em Oncologia
        </motion.h1>
        
        <motion.div className="editorial-block mx-auto" initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}>
          <p className="text-large text-muted-foreground mb-8">
            Escolha o caminho que melhor se adapta ao seu momento profissional. Aprenda com quem faz ciência e prática na vida real.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <img src="/selo-mec.webp" alt="Aprovado pelo MEC" style={{ height: '60px', width: 'auto' }} />
          </div>
        </motion.div>
      </section>

      {/* Escolha seu caminho */}
      <section className="container mb-24">
        <motion.div 
          className="grid md:grid-cols-2 gap-8 max-w-[1000px] mx-auto"
          initial="hidden" animate="visible" variants={staggerContainer}
        >
          {/* Card Capacitação */}
          <motion.a href="#capacitacao" className="bg-background border border-border p-8 rounded-2xl hover:border-primary hover:shadow-md transition-all flex flex-col" variants={fadeUp}>
            <span className="text-accent font-bold tracking-widest uppercase text-xs mb-2 block">Carga Rápida • 120h</span>
            <h3 className="text-2xl font-bold text-foreground mb-4">Curso de Capacitação</h3>
            <p className="text-muted-foreground text-sm mb-6 flex-grow">
              Formação ágil e focada na prática clínica oncológica, desenvolvida para capacitar profissionais com ferramentas diretas e baseadas em evidências.
            </p>
            <div className="text-primary font-bold text-sm uppercase tracking-wider flex items-center">
              Ver Detalhes <ArrowRight size={16} className="ml-2" />
            </div>
          </motion.a>

          {/* Card Pós */}
          <motion.a href="#pos-graduacao" className="bg-primary text-primary-foreground p-8 rounded-2xl hover:opacity-95 transition-all flex flex-col shadow-lg transform md:-translate-y-4" variants={fadeUp}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-primary-foreground/80 font-bold tracking-widest uppercase text-xs block">Especialização • 6 a 12 meses</span>
              <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Premium</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Pós-Graduação Lato Sensu</h3>
            <p className="text-primary-foreground/80 text-sm mb-6 flex-grow">
              Jornada do Paciente Oncológico. Uma especialização acadêmica de alto nível, estruturada com rigor científico e foco no mercado.
            </p>
            <div className="text-white font-bold text-sm uppercase tracking-wider flex items-center">
              Ver Detalhes <ArrowRight size={16} className="ml-2" />
            </div>
          </motion.a>
        </motion.div>
      </section>

      {/* Pós-Graduação Completa */}
      <section id="pos-graduacao" className="bg-muted py-24 border-y border-border">
        <div className="container">
          <div className="text-center mb-16">
            <span className="font-bold uppercase tracking-widest text-sm mb-2 block text-accent">Inscrições em Breve</span>
            <h2 className="text-h2 text-primary mb-6">Pós-Graduação: Jornada do Paciente Oncológico</h2>
            <Link href="/contato" className="btn btn-primary px-8 py-3 uppercase tracking-wider font-semibold text-sm inline-flex items-center">
              Entrar na Lista de Espera <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {/* Infos do Curso */}
            <div className="lg:col-span-1">
              <div className="bg-background border-t-2 border-primary p-8 shadow-sm h-full rounded-b-xl">
                <h3 className="font-bold text-xl mb-6 text-foreground">Detalhes do Curso</h3>
                
                <ul className="flex flex-col gap-6 text-sm uppercase tracking-wider font-semibold">
                  <li>
                    <span className="block text-muted-foreground mb-1 text-xs">Público Alvo</span>
                    <span className="text-foreground flex items-center"><CheckCircle2 size={16} className="mr-2 text-primary" /> Enfermeiros e Afins</span>
                  </li>
                  <li>
                    <span className="block text-muted-foreground mb-1 text-xs">Duração</span>
                    <span className="text-foreground flex items-center"><CheckCircle2 size={16} className="mr-2 text-primary" /> 6 a 12 meses</span>
                  </li>
                  <li>
                    <span className="block text-muted-foreground mb-1 text-xs">Modalidade</span>
                    <span className="text-foreground flex items-center"><CheckCircle2 size={16} className="mr-2 text-primary" /> 100% Online</span>
                  </li>
                  <li>
                    <span className="block text-muted-foreground mb-1 text-xs">Trabalho de Conclusão (TCC)</span>
                    <span className="text-foreground flex items-center"><CheckCircle2 size={16} className="mr-2 text-primary" /> Não Obrigatório</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Mentores */}
            <div className="lg:col-span-2">
              <div className="bg-background p-8 rounded-xl shadow-sm border border-border h-full">
                <h3 className="text-2xl font-bold mb-8 text-primary">Nossos Mentores</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Aline */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-primary">
                      <img src="/equipe/aline_crop.jpg" alt="Aline Moraes" className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-bold text-base mb-1">Aline Moraes</h4>
                    <p className="text-xs text-muted-foreground mb-3">Excelência e liderança na enfermagem oncológica.</p>
                    <a href="http://lattes.cnpq.br/3455731491863207" target="_blank" rel="noopener noreferrer" className="mt-auto text-accent text-[10px] font-bold uppercase tracking-wider hover:underline">Ver Lattes</a>
                  </div>

                  {/* Maryana */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-primary">
                      <img src="/equipe/maryana_crop.jpg" alt="Maryana De Matos" className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-bold text-base mb-1">Maryana De Matos</h4>
                    <p className="text-xs text-muted-foreground mb-3">Inovação na enfermagem e cuidado oncológico.</p>
                    <a href="http://lattes.cnpq.br/0557038265644489" target="_blank" rel="noopener noreferrer" className="mt-auto text-accent text-[10px] font-bold uppercase tracking-wider hover:underline">Ver Lattes</a>
                  </div>

                  {/* Vinicius */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-primary">
                      <img src="/equipe/vinicius_crop.jpg" alt="Vinícius Santos" className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-bold text-base mb-1">Vinícius Santos</h4>
                    <p className="text-xs text-muted-foreground mb-3">Transformar conhecimento em cuidado.</p>
                    <a href="http://lattes.cnpq.br/0317966427883862" target="_blank" rel="noopener noreferrer" className="mt-auto text-accent text-[10px] font-bold uppercase tracking-wider hover:underline">Ver Lattes</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Relatos dos Alunos (Testimonials) */}
          <div className="max-w-[1000px] mx-auto mt-24">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-primary mb-4">Experiência de quem já viveu a Pós</h3>
              <p className="text-muted-foreground">Confira os relatos reais dos nossos alunos sobre a transformação gerada pela Jornada do Paciente Oncológico.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Espaço para Vídeo 1 (Substituir URL do iframe pelo link real do YouTube não listado) */}
              <div className="bg-background rounded-xl overflow-hidden shadow-sm border border-border group cursor-pointer relative">
                <div className="aspect-video bg-black/5 flex items-center justify-center relative">
                  {/* Substitua esta div pelo iframe do YouTube quando tiver os links */}
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                     <PlayCircle size={64} className="text-primary opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground z-10 bg-background/80 px-4 py-2 rounded">
                    Vídeo Depoimento (Ex: Vinícius)
                  </span>
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-lg mb-2">"Uma virada de chave na minha carreira"</h4>
                  <p className="text-sm text-muted-foreground">— Aluno(a) da Turma 1</p>
                </div>
              </div>

              {/* Espaço para Vídeo 2 */}
              <div className="bg-background rounded-xl overflow-hidden shadow-sm border border-border group cursor-pointer relative">
                <div className="aspect-video bg-black/5 flex items-center justify-center relative">
                  {/* Substitua esta div pelo iframe do YouTube quando tiver os links */}
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                     <PlayCircle size={64} className="text-primary opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground z-10 bg-background/80 px-4 py-2 rounded">
                    Vídeo Depoimento (Ex: Aline)
                  </span>
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-lg mb-2">"Conhecimento prático e direto"</h4>
                  <p className="text-sm text-muted-foreground">— Aluno(a) da Turma 1</p>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-6">
              * Nota: Os vídeos completos serão disponibilizados em breve.
            </p>
          </div>

        </div>
      </section>

      {/* Curso de Capacitação */}
      <section id="capacitacao" className="container" style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
        <div className="bg-background shadow-md hover:shadow-lg transition-shadow" style={{ padding: '4rem', borderTop: '4px solid var(--primary)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', borderRadius: '1rem' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1">
              <span className="font-bold uppercase tracking-widest text-sm mb-3 block text-accent">Curso de Extensão</span>
              <h3 className="text-4xl font-bold text-foreground mb-6">Capacitação em Oncologia</h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-[700px]">
                Formação ágil e focada na prática clínica oncológica, desenvolvida para capacitar profissionais com ferramentas diretas e conhecimento baseado em evidências.
              </p>
              <div className="flex gap-8 flex-wrap text-sm uppercase tracking-wider font-semibold">
                <div>
                  <span className="block text-muted-foreground mb-1 text-xs">Carga Horária</span>
                  <span className="text-foreground flex items-center"><CheckCircle2 size={16} className="mr-2 text-primary" /> 120 horas</span>
                </div>
                <div>
                  <span className="block text-muted-foreground mb-1 text-xs">Modalidade</span>
                  <span className="text-foreground flex items-center"><CheckCircle2 size={16} className="mr-2 text-primary" /> Online</span>
                </div>
              </div>
            </div>
            <div className="flex-none">
              <a href="https://medaffection-plataforma-app.vercel.app/login" target="_blank" rel="noopener noreferrer" className="btn btn-primary uppercase tracking-wider font-semibold px-8 py-4 flex items-center shadow-md hover:-translate-y-1 transition-transform">
                Acessar Plataforma <ArrowRight size={18} className="ml-3" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}