"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CirculoVitalPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const beneficios = [
    { title: "Encontros ao vivo", desc: "Sessões online recorrentes [Frequência a definir] com a comunidade." },
    { title: "Discussão de Projetos", desc: "Espaço para debater ideias, metodologias e receber feedback dos colegas e mentores." },
    { title: "Momentos de Escrita", desc: "Sessões focadas na produção conjunta, garantindo a constância que você nunca teve sozinho." },
    { title: "IA na Pesquisa", desc: "Como aplicar Inteligência Artificial de forma ética e produtiva na ciência." },
    { title: "Acompanhamento de Evolução", desc: "Veja a evolução do seu projeto e compartilhe suas conquistas." },
    { title: "Networking Acadêmico", desc: "Troca genuína entre profissionais que também estão produzindo ciência." },
  ];

  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <section className="container mb-24 max-w-[900px] mx-auto">
        <motion.span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block" initial="hidden" animate="visible" variants={fadeUp}>
          Círculo VITAL
        </motion.span>
        <motion.h1 className="text-h1 mb-8 text-primary" initial="hidden" animate="visible" variants={fadeUp}>
          Sair da produção científica isolada.
        </motion.h1>
        
        <motion.div className="editorial-block" initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}>
          <p className="text-impact mb-4">
            Não estude e produza sozinho.
          </p>
          <p className="text-large text-muted-foreground">
            O Círculo VITAL é o ambiente focado em garantir acompanhamento e constância para que sua produção científica e acadêmica nunca pare.
          </p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }} className="mt-12">
          <Link href="/contato" className="btn btn-primary text-large px-8 py-4 uppercase tracking-wider font-semibold">
            Fazer Parte do Círculo <ArrowRight className="inline ml-2" size={20} />
          </Link>
        </motion.div>
      </section>





      {/* Produção Real - Exemplos */}
      <section className="container py-24 border-t border-border">
        <div className="text-center mb-16">
          <span className="font-bold uppercase tracking-widest text-sm mb-4 block" style={{ color: 'var(--accent)' }}>Produção Real</span>
          <h2 className="text-h2 text-primary">A ciência sai do papel.</h2>
          <p className="text-large text-muted-foreground mt-4 max-w-[700px] mx-auto">
            Mais do que teoria, nós geramos resultados palpáveis. Veja materiais e artigos reais, construídos do zero junto com nossos alunos.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          {/* Card E-book */}
          <div className="bg-background rounded-2xl shadow-xl overflow-hidden hover:-translate-y-2 transition-transform duration-500 border border-border flex flex-col">
            <div style={{ height: '300px', overflow: 'hidden', backgroundColor: '#f4f4f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src="/materiais/capa-ebook.jpg" alt="Capa do E-book" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="font-bold text-xl mb-2 text-foreground">E-book Científico</h3>
              <p className="text-muted-foreground mb-6 flex-grow">E-book acadêmico com ficha catalográfica, construído e publicado em conjunto com os alunos do Círculo.</p>
              <a href="/materiais/ebook-exemplo.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-secondary font-bold text-sm w-full py-3 text-center border border-border">
                Baixar E-book
              </a>
            </div>
          </div>

          {/* Card Artigo */}
          <div className="bg-background rounded-2xl shadow-xl overflow-hidden hover:-translate-y-2 transition-transform duration-500 border border-border flex flex-col">
            <div style={{ height: '300px', overflow: 'hidden', backgroundColor: '#f4f4f5', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
              <img src="/materiais/artigo.png" alt="Artigo Publicado" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="font-bold text-xl mb-2 text-foreground">Artigo Publicado</h3>
              <p className="text-muted-foreground mb-6 flex-grow">Artigo científico publicado em revista, desenvolvido em conjunto com os alunos da Mentoria.</p>
              <a href="https://www.revistaenfermagematual.com.br/index.php/revista/article/view/2466" target="_blank" rel="noopener noreferrer" className="btn btn-primary font-bold text-sm w-full py-3 text-center" style={{ color: 'var(--primary-foreground)' }}>
                Ler Artigo Completo
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}