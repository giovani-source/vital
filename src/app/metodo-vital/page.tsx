"use client";

import { motion } from "framer-motion";
import { ArrowRight, Target, Search, Route, Zap, Trophy } from "lucide-react";
import Link from "next/link";

export default function MetodoVitalPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const steps = [
    { 
      letter: "V", 
      title: "Visão", 
      desc: "Compreensão do seu cenário. Definimos objetivos precisos para focar no que realmente gera impacto na sua carreira.",
      icon: <Target size={32} />
    },
    { 
      letter: "I", 
      title: "Investigação", 
      desc: "Análise profunda do seu currículo e competências. Mapeamos as melhores oportunidades para o seu perfil.",
      icon: <Search size={32} />
    },
    { 
      letter: "T", 
      title: "Trajetória", 
      desc: "Desenho prático do seu projeto de pesquisa. Um passo a passo estratégico e sem pontas soltas.",
      icon: <Route size={32} />
    },
    { 
      letter: "A", 
      title: "Ação", 
      desc: "Execução orientada. Você nunca avança sozinho, garantimos acompanhamento rigoroso a cada nova decisão.",
      icon: <Zap size={32} />
    },
    { 
      letter: "L", 
      title: "Legado", 
      desc: "Independência científica. Você não aprende apenas a passar, aprende a produzir ciência de alto nível para sempre.",
      icon: <Trophy size={32} />
    },
  ];

  const depoimentos = [
    { nome: "Valesca", video: "/videos/valesca.mov" },
    { nome: "Eliane", video: "/videos/eliane.mov" },
    { nome: "Fabiane", video: "/videos/fabiane.mov" }
  ];

  return (
    <div style={{ paddingTop: '10rem', paddingBottom: '4rem' }}>
      {/* Hero */}
      <section className="container text-center" style={{ marginBottom: '2rem' }}>
        <div className="max-w-[900px] mx-auto">
          <motion.span className="font-bold tracking-widest uppercase text-sm mb-6 block" style={{ color: 'var(--accent)' }} initial="hidden" animate="visible" variants={fadeUp}>
            Método VITAL
          </motion.span>
          <motion.h1 className="text-h1 text-primary" style={{ marginBottom: '4rem' }} initial="hidden" animate="visible" variants={fadeUp}>
            Sua trajetória acadêmica precisa de estratégia, não de improviso.
          </motion.h1>
          
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}>
            <p className="text-large text-muted-foreground mb-6 max-w-[700px] mx-auto">
              Descubra o que está sabotando sua evolução e construa o seu próximo passo rumo a uma carreira acadêmica de sucesso.
            </p>
            <p className="text-large text-muted-foreground max-w-[700px] mx-auto">
              Mentoria premium com diagnóstico inicial, plano de ação individual e acompanhamento lado a lado para organizar seu currículo, projeto e produção científica para Mestrado e Doutorado.
            </p>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }} className="mt-12">
            <Link href="/contato" className="btn btn-primary text-large px-8 py-4 uppercase tracking-wider font-semibold">
              Aplicar para a Mentoria <ArrowRight className="inline ml-2" size={20} />
            </Link>
          </motion.div>
        </div>
      </section>


      {/* Case / Depoimento */}
      <section className="container" style={{ padding: '4rem 0', marginBottom: '6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem', marginBottom: '1rem', display: 'block' }}>
            Resultados que falam por si
          </span>
          <h2 className="text-h2 text-primary">Mais do que respostas, nós entregamos clareza.</h2>
        </div>
          
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          {/* Valesca */}
          <div className="flex flex-col">
            <div className="overflow-hidden rounded-2xl mb-6 shadow-sm hover:shadow-md transition-shadow" style={{ border: '1px solid var(--border)', aspectRatio: '9/16' }}>
              <iframe 
                src="https://drive.google.com/file/d/1q4DLK2rrEKGD3audfVKl2HGgUcVAKJo4/preview" 
                width="100%" 
                height="100%" 
                allow="autoplay" 
                style={{ border: 'none' }}
              ></iframe>
            </div>
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-primary">Valesca César</h3>
              <a href="http://lattes.cnpq.br/5698034475756319" target="_blank" rel="noopener noreferrer" title="Ver Lattes" className="flex items-center justify-center rounded-full transition-transform hover:scale-110" style={{ width: '36px', height: '36px', backgroundColor: 'var(--accent)', color: 'white' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              </a>
            </div>
          </div>

          {/* Eliane */}
          <div className="flex flex-col">
            <div className="overflow-hidden rounded-2xl mb-6 shadow-sm hover:shadow-md transition-shadow" style={{ border: '1px solid var(--border)', aspectRatio: '9/16' }}>
              <iframe 
                src="https://drive.google.com/file/d/1K1jpsmll4ZYnuUPxo-BaqN_qaAKP1ypG/preview" 
                width="100%" 
                height="100%" 
                allow="autoplay" 
                style={{ border: 'none' }}
              ></iframe>
            </div>
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-primary">Eliane Rabin</h3>
              <a href="http://lattes.cnpq.br/6674014338128429" target="_blank" rel="noopener noreferrer" title="Ver Lattes" className="flex items-center justify-center rounded-full transition-transform hover:scale-110" style={{ width: '36px', height: '36px', backgroundColor: 'var(--accent)', color: 'white' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              </a>
            </div>
          </div>

          {/* Fabiane */}
          <div className="flex flex-col">
            <div className="overflow-hidden rounded-2xl mb-6 shadow-sm hover:shadow-md transition-shadow" style={{ border: '1px solid var(--border)', aspectRatio: '9/16' }}>
              <iframe 
                src="https://drive.google.com/file/d/1Xr3DVYXIESWR38zf0nI35yfhDeJeiCN7/preview" 
                width="100%" 
                height="100%" 
                allow="autoplay" 
                style={{ border: 'none' }}
              ></iframe>
            </div>
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-primary">Fabiane Thompson</h3>
              <a href="http://lattes.cnpq.br/4132855167176596" target="_blank" rel="noopener noreferrer" title="Ver Lattes" className="flex items-center justify-center rounded-full transition-transform hover:scale-110" style={{ width: '36px', height: '36px', backgroundColor: 'var(--accent)', color: 'white' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}