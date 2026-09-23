"use client";

import { motion } from "framer-motion";
import { Link as LinkIcon, GraduationCap, Lightbulb, Rocket } from "lucide-react";

export default function SobrePage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div style={{ paddingTop: '10rem', paddingBottom: '4rem' }}>
      {/* Hero / Missão */}
      <section className="container text-center" style={{ marginBottom: '6rem' }}>
        <motion.span className="font-bold tracking-widest uppercase text-sm mb-6 block" style={{ color: 'var(--accent)' }} initial="hidden" animate="visible" variants={fadeUp}>
          A Marca
        </motion.span>
        <motion.h1 className="text-h1 mb-10 text-primary" initial="hidden" animate="visible" variants={fadeUp}>
          Transformar conhecimento em trajetória.
        </motion.h1>
        
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}>
          <p className="text-large text-muted-foreground mb-6 max-w-[700px] mx-auto">
            A VITAL existe para ajudar profissionais da saúde a dar o próximo passo.
          </p>
          <p className="text-large text-muted-foreground max-w-[700px] mx-auto">
            Não apenas ensinamos conteúdos. Nossa verdadeira entrega é ajudar você a construir ciência de alto nível, uma carreira sólida, negócios rentáveis e produtos escaláveis na saúde.
          </p>
        </motion.div>
      </section>

      {/* Frentes da VITAL */}
      <section style={{ backgroundColor: 'var(--secondary)', padding: '6rem 0', marginBottom: '8rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            
            {/* Ciência */}
            <div className="contact-card hover:-translate-y-2 transition-transform duration-300">
              <div className="mb-6 p-4 rounded-full inline-block" style={{ backgroundColor: 'rgba(87, 94, 207, 0.1)', color: 'var(--accent)' }}>
                <GraduationCap size={32} />
              </div>
              <h3 className="text-h3 mb-4 text-primary">VITAL Ciência</h3>
              <p className="text-large text-muted-foreground">
                Pesquisa e carreira acadêmica através de métodos validados para Mestrado, Doutorado e produção contínua.
              </p>
            </div>

            {/* Formação */}
            <div className="contact-card hover:-translate-y-2 transition-transform duration-300">
              <div className="mb-6 p-4 rounded-full inline-block" style={{ backgroundColor: 'rgba(87, 94, 207, 0.1)', color: 'var(--accent)' }}>
                <Lightbulb size={32} />
              </div>
              <h3 className="text-h3 mb-4 text-primary">VITAL Formação</h3>
              <p className="text-large text-muted-foreground">
                Extensão e Pós-graduação focadas na aplicação clínica, estruturadas com a robustez que o mercado exige.
              </p>
            </div>

            {/* Inovação */}
            <div className="contact-card hover:-translate-y-2 transition-transform duration-300">
              <div className="mb-6 p-4 rounded-full inline-block" style={{ backgroundColor: 'rgba(87, 94, 207, 0.1)', color: 'var(--accent)' }}>
                <Rocket size={32} />
              </div>
              <h3 className="text-h3 mb-4 text-primary">VITAL Inovação</h3>
              <p className="text-large text-muted-foreground">
                O ambiente para desenvolver negócios lucrativos e soluções tecnológicas na saúde sem depender apenas da teoria.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Fundadores */}
      <section className="container py-16">
        <div className="mb-24 text-center">
          <span className="font-bold uppercase tracking-widest text-sm mb-4 block" style={{ color: 'var(--accent)' }}>
            Quem está por trás da VITAL
          </span>
          <h2 className="text-h2 text-primary">A experiência por trás do método.</h2>
        </div>

        <div className="space-y-32">
          
          {/* Vinícius (PRIMEIRO) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4rem' }}>
            <div style={{ flex: '1 1 500px', paddingRight: '2rem' }}>
              <div className="flex items-center gap-4 mb-2">
                <h3 className="text-h2 text-primary m-0">Vinícius Souza dos Santos</h3>
                <a href="http://lattes.cnpq.br/0317966427883862" target="_blank" rel="noopener noreferrer" title="Ver Lattes" className="flex items-center justify-center rounded-full transition-transform hover:scale-110" style={{ width: '40px', height: '40px', backgroundColor: 'var(--accent)', color: 'white' }}>
                  <LinkIcon size={20} />
                </a>
              </div>
              <p className="font-bold uppercase tracking-wider mb-8 text-sm text-muted-foreground">Carreira Acadêmica e Metodologia</p>
              
              <div className="text-large text-muted-foreground space-y-6 mb-12">
                <p>Pesquisador e professor com trajetória avançada, reunindo excelência em formação acadêmica, pesquisa e produção científica.</p>
                <p>Doutor e Pós-doutor, carrega vasta experiência com formação internacional e passagens pela <strong>Harvard Medical School</strong>.</p>
                <p>Vinícius é a mente e o criador original do <strong>Método VITAL</strong>, uma metodologia testada e comprovada no mercado para estruturar estratégias de desenvolvimento acadêmico, gerar autonomia real em pesquisadores e pavimentar caminhos científicos de sucesso.</p>
              </div>
              
              <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1.5rem' }}>
                <h4 className="font-bold mb-4 uppercase tracking-wider text-sm" style={{ color: 'var(--primary)' }}>Áreas de Domínio</h4>
                <div className="flex flex-wrap gap-4 font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  <span>Carreira Acadêmica</span> &bull; <span>Mestrado e Doutorado</span> &bull; <span>Metodologia Científica</span>
                </div>
              </div>
            </div>
            
            <div style={{ flex: '1 1 400px', overflow: 'hidden', borderRadius: '1.5rem', border: '1px solid var(--border)', aspectRatio: '4/5' }}>
              <img src="/vinicius.jpg" alt="Vinícius Souza dos Santos" className="w-full h-full" style={{ objectFit: 'cover', objectPosition: 'center top' }} />
            </div>
          </div>

          <div style={{ padding: '6rem 0' }}>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', maxWidth: '200px', margin: '0 auto' }} />
          </div>

          {/* Giovani Basso (SEGUNDO) */}
          <div style={{ display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'center', gap: '4rem' }}>
            <div style={{ flex: '1 1 400px', overflow: 'hidden', borderRadius: '1.5rem', border: '1px solid var(--border)', aspectRatio: '4/5' }}>
              <img src="/giovani.jpg" alt="Giovani Basso da Silva" className="w-full h-full" style={{ objectFit: 'cover', objectPosition: 'center top' }} />
            </div>

            <div style={{ flex: '1 1 500px', paddingLeft: '2rem' }}>
              <div className="flex items-center gap-4 mb-2">
                <h3 className="text-h2 text-primary m-0">Giovani Basso da Silva</h3>
                <a href="http://lattes.cnpq.br/7609164826213472" target="_blank" rel="noopener noreferrer" title="Ver Lattes" className="flex items-center justify-center rounded-full transition-transform hover:scale-110" style={{ width: '40px', height: '40px', backgroundColor: 'var(--accent)', color: 'white' }}>
                  <LinkIcon size={20} />
                </a>
              </div>
              <p className="font-bold uppercase tracking-wider mb-8 text-sm text-muted-foreground">Inovação, Ciência e Empreendedorismo</p>
              
              <div className="text-large text-muted-foreground space-y-6 mb-12">
                <p>Enfermeiro com atuação em assistência, pesquisa, educação e inovação em saúde.</p>
                <p>Sua trajetória combina experiência clínica real, produção científica, desenvolvimento de tecnologias, Inteligência Artificial aplicada à saúde e empreendedorismo agressivo.</p>
                <p>Participa da criação e desenvolvimento direto de projetos como o <strong>MedAffection</strong> e o <strong>Fixe</strong>. Além disso, traz a perspectiva da internacionalização para nossos projetos, operando no ecossistema Brasil e Portugal.</p>
              </div>
              
              <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1.5rem' }}>
                <h4 className="font-bold mb-4 uppercase tracking-wider text-sm" style={{ color: 'var(--primary)' }}>Áreas de Domínio</h4>
                <div className="flex flex-wrap gap-4 font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  <span>Produção Científica</span> &bull; <span>Empreendedorismo em Saúde</span> &bull; <span>Desenvolvimento de Produtos</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}