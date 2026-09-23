"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SaudeNegocioPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const processo = [
    { title: "Identificação do Problema Real", desc: "Não comece pela solução. Mergulhamos no cenário para entender a verdadeira dor clínica ou operacional." },
    { title: "Definição do Público", desc: "Mapeamento preciso de quem sofre com o problema e de quem pagará pela solução." },
    { title: "Estruturação e Proposta de Valor", desc: "Transformando ideias abstratas em um modelo de negócio tangível." },
    { title: "Modelo e MVP", desc: "Desenvolvimento do Produto Viável Mínimo para validação rápida e eficiente." },
    { title: "Posicionamento", desc: "Estratégia de mercado e comunicação assertiva para o nicho de saúde." },
    { title: "Mercado e Crescimento", desc: "Validação final, estruturação comercial e escala sustentável." }
  ];

  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <section className="container mb-24 max-w-[900px] mx-auto">
        <motion.span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block" initial="hidden" animate="visible" variants={fadeUp}>
          VITAL Inovação
        </motion.span>
        <motion.h1 className="text-h1 mb-8 text-primary" initial="hidden" animate="visible" variants={fadeUp}>
          Saúde que vira negócio.
        </motion.h1>
        
        <motion.div className="editorial-block" initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}>
          <p className="text-impact mb-4">
            Transforme um problema ou conhecimento da área da saúde em uma proposta de negócio sólida e estruturada.
          </p>
          <p className="text-large text-muted-foreground">
            Não ensinamos empreendedorismo apenas pela teoria. Abrimos os bastidores e os métodos validados de empresas construídas na prática clínica e acadêmica.
          </p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }} className="mt-12">
          <Link href="/contato" className="btn btn-primary text-large px-8 py-4 uppercase tracking-wider font-semibold">
            Falar sobre meu negócio <ArrowRight className="inline ml-2" size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Para quem é */}
      <section className="container py-24 border-y border-border">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem' }}>
          <div style={{ flex: '1 1 400px' }}>
            <h2 className="text-h2 mb-6 text-primary">Para quem é?</h2>
            <p className="text-large text-muted-foreground mb-12">
              Desenvolvido para visionários que possuem vivência na área da saúde e desejam transformar seu conhecimento em uma solução ou negócio escalável.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {["Profissionais da Saúde", "Pesquisadores", "Professores", "Médicos e Enfermeiros", "Nutricionistas e Fisioterapeutas", "Especialistas do Setor"].map((p, idx) => (
                <div key={idx} className="border-b border-border pb-3 text-foreground font-medium">
                  {p}
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: '1 1 400px' }}>
            <h2 className="text-h2 mb-8 text-primary">A Jornada do Negócio</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {processo.map((step, idx) => (
                <div key={idx} className="group">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors text-foreground">
                    {idx + 1}. {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Case Real - MedAffection */}
      <section style={{ backgroundColor: 'var(--background)', padding: '8rem 0', marginTop: '4rem', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5rem' }}>
            <div style={{ flex: '1 1 500px' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'block' }}>
                Case Real e Bastidores
              </span>
              
              <div style={{ marginBottom: '3rem' }}>
                <img src="/medaffection-logo.png" alt="MedAffection" style={{ height: '160px', width: 'auto', objectFit: 'contain' }} />
              </div>
              
              <p style={{ fontSize: '1.125rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
                Acompanhe os bastidores de uma empresa construída na prática clínica e acadêmica. A MedAffection atua no cuidado interativo e no desenvolvimento de inteligência artificial (Stitch AI) para o setor da saúde.
              </p>
              
              <p style={{ fontSize: '1.125rem', color: 'var(--muted-foreground)', lineHeight: '1.7' }}>
                Veja a evolução de perto: do problema inicial na oncologia, passando pelo desenvolvimento da ideia, até a validação de mercado, captação de projetos e crescimento da empresa.
              </p>

              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '3rem' }}>
                <a href="https://www.medaffection.com/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem 3rem', backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: '0.75rem', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em', textDecoration: 'none', transition: 'transform 0.2s', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)' }}>
                  Site MedAffection
                </a>
                <a href="https://stitchai.medaffection.com/stitchai" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem 3rem', backgroundColor: 'transparent', border: '2px solid var(--primary)', color: 'var(--primary)', borderRadius: '0.75rem', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em', textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer' }}>
                  Plataforma Stitch AI
                </a>
              </div>
            </div>
            
            <div style={{ flex: '1 1 500px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}>
                <iframe 
                  src="https://drive.google.com/file/d/11QkTaQKYwU2cFLrH_eJ_YxRQxpTNgVLj/preview" 
                  width="100%" 
                  height="100%" 
                  allow="autoplay" 
                  style={{ border: 'none' }}
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}