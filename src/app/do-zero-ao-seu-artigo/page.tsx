"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, XCircle, FileText, Check, Layout, Search, PenTool, Send } from "lucide-react";
import Link from "next/link";

export default function DoZeroAoArtigoPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const dores = [
    { title: "Trava na introdução", desc: "Não sabe como começar o texto." },
    { title: "Desorganização", desc: "Não sabe organizar método e resultados." },
    { title: "Dificuldade na discussão", desc: "Não consegue conectar os achados." },
    { title: "Escolha do periódico", desc: "Não sabe onde ou como submeter." },
  ];

  const entregaveis = [
    "Definição da pergunta científica",
    "Estratégia de busca na literatura",
    "Estruturação completa do artigo",
    "Escolha inicial de periódico",
    "Adequação às normas da revista",
    "Compreensão do processo de submissão"
  ];


  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <section className="container mb-24 max-w-[900px] mx-auto text-center md:text-left">
        <motion.span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block" initial="hidden" animate="visible" variants={fadeUp}>
          Do Zero ao Seu Artigo
        </motion.span>
        <motion.h1 className="text-h1 mb-8 text-primary" initial="hidden" animate="visible" variants={fadeUp}>
          Transforme sua pesquisa em um manuscrito pronto para submissão.
        </motion.h1>
        
        <motion.div className="editorial-block" initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}>
          <p className="text-impact mb-4">
            Pare de travar na escrita.
          </p>
          <p className="text-large text-muted-foreground">
            Um acompanhamento prático para quem tem dados, mas encontra dificuldade para transformá-los em um artigo com a estrutura exigida pelas revistas científicas.
          </p>
        </motion.div>
        
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }} className="mt-12">
          <Link href="/contato" className="btn btn-primary text-large px-8 py-4 uppercase tracking-wider font-semibold">
            Quero escrever meu artigo <ArrowRight className="inline ml-2" size={20} />
          </Link>
        </motion.div>
      </section>

      {/* A Dor e A Solução (Minimalista e Editorial) */}
      <section style={{ backgroundColor: 'white', padding: '6rem 0', borderTop: '1px solid #e4e4e7', borderBottom: '1px solid #e4e4e7' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem' }}>
            
            {/* Dores */}
            <div style={{ flex: '1 1 400px' }}>
              <h2 className="text-3xl font-semibold text-zinc-900 tracking-tight" style={{ marginBottom: '2rem' }}>Onde você está travando?</h2>
              <ul className="space-y-6">
                <li className="text-lg text-zinc-600 flex items-start gap-4">
                  <span className="text-red-500 font-bold text-xl leading-none pt-1">✕</span>
                  <span>Não sabe como começar o texto e trava na introdução.</span>
                </li>
                <li className="text-lg text-zinc-600 flex items-start gap-4">
                  <span className="text-red-500 font-bold text-xl leading-none pt-1">✕</span>
                  <span>Tem dificuldade em organizar método e conectar os resultados.</span>
                </li>
                <li className="text-lg text-zinc-600 flex items-start gap-4">
                  <span className="text-red-500 font-bold text-xl leading-none pt-1">✕</span>
                  <span>Não consegue aprofundar a discussão dos achados.</span>
                </li>
                <li className="text-lg text-zinc-600 flex items-start gap-4">
                  <span className="text-red-500 font-bold text-xl leading-none pt-1">✕</span>
                  <span>Não sabe qual periódico escolher ou como submeter.</span>
                </li>
              </ul>
            </div>

            {/* O que desenvolve */}
            <div style={{ flex: '1 1 400px' }}>
              <h2 className="text-3xl font-semibold text-zinc-900 tracking-tight" style={{ marginBottom: '2rem' }}>O que nós vamos construir juntos:</h2>
              <ul className="space-y-6 mb-10">
                <li className="text-lg text-zinc-900 font-medium flex items-start gap-4">
                  <span className="text-accent font-bold text-xl leading-none pt-1">✓</span>
                  <span>Definição cirúrgica da pergunta científica.</span>
                </li>
                <li className="text-lg text-zinc-900 font-medium flex items-start gap-4">
                  <span className="text-accent font-bold text-xl leading-none pt-1">✓</span>
                  <span>Estratégia de busca assertiva na literatura.</span>
                </li>
                <li className="text-lg text-zinc-900 font-medium flex items-start gap-4">
                  <span className="text-accent font-bold text-xl leading-none pt-1">✓</span>
                  <span>Estruturação de ponta a ponta do artigo.</span>
                </li>
                <li className="text-lg text-zinc-900 font-medium flex items-start gap-4">
                  <span className="text-accent font-bold text-xl leading-none pt-1">✓</span>
                  <span>Escolha estratégica do periódico ideal.</span>
                </li>
                <li className="text-lg text-zinc-900 font-medium flex items-start gap-4">
                  <span className="text-accent font-bold text-xl leading-none pt-1">✓</span>
                  <span>Domínio de todo o processo de submissão.</span>
                </li>
              </ul>
              <div className="bg-zinc-50 border border-zinc-100 p-5 rounded-lg text-sm text-zinc-500 italic">
                * O programa foca na estruturação do manuscrito e compreensão do processo. Não garantimos aceite ou publicação, garantimos excelência científica.
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Publicações Reais (Cards Originais com Imagens) */}
      <section style={{ backgroundColor: '#fafafa', padding: '8rem 0', borderTop: '1px solid #e4e4e7' }}>
        <div className="container">
          <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem', marginBottom: '1rem', display: 'block' }}>Autoridade Comprovada</span>
            <h2 className="text-h2 text-zinc-900">Nós publicamos onde importa.</h2>
            <p className="text-large mt-4 max-w-[800px] mx-auto text-zinc-600">
              Nossa equipe acumula publicações nas maiores e mais exigentes revistas científicas do mundo. Veja algumas de nossas publicações reais.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* Paper 1 */}
            <a href="https://www.sciencedirect.com/science/article/pii/S0749208126002378?via%3Dihub" target="_blank" rel="noopener noreferrer" className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-accent hover:shadow-lg transition-all group flex flex-col">
              <div className="h-48 bg-white relative border-b border-zinc-100 overflow-hidden">
                <img src="/papers/media_1790150602785.png" alt="ScienceDirect Paper" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col grow">
                <span className="text-xs font-bold uppercase tracking-wider text-accent mb-3 block">Seminars in Oncology Nursing</span>
                <h3 className="text-md font-medium text-zinc-900 leading-snug mb-4 group-hover:text-accent transition-colors">
                  Nurses' Experiences of Caring for Children with Cancer: A Descriptive Phenomenological Study
                </h3>
              </div>
            </a>

            {/* Paper 2 */}
            <a href="https://www.scielo.br/j/rlae/a/dzSQCgTgNPTXdr4rQxP3KNP/?lang=pt" target="_blank" rel="noopener noreferrer" className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-accent hover:shadow-lg transition-all group flex flex-col">
              <div className="h-48 bg-white relative border-b border-zinc-100 overflow-hidden">
                <img src="/papers/media_1790150646329.png" alt="RLAE Paper" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col grow">
                <span className="text-xs font-bold uppercase tracking-wider text-accent mb-3 block">Rev. Latino-Am. Enfermagem</span>
                <h3 className="text-md font-medium text-zinc-900 leading-snug mb-4 group-hover:text-accent transition-colors">
                  Construção e validação de vídeo sobre a inserção de sondas gástrica e enteral em crianças
                </h3>
              </div>
            </a>

            {/* Paper 3 */}
            <a href="https://www.scielo.br/j/csc/a/KkyBCzjmK8nGdLgcWXPNCNv/?lang=pt" target="_blank" rel="noopener noreferrer" className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-accent hover:shadow-lg transition-all group flex flex-col">
              <div className="h-48 bg-white relative border-b border-zinc-100 overflow-hidden">
                <img src="/papers/media_1790150675227.png" alt="Ciência & Saúde Paper" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col grow">
                <span className="text-xs font-bold uppercase tracking-wider text-accent mb-3 block">Ciência & Saúde Coletiva</span>
                <h3 className="text-md font-medium text-zinc-900 leading-snug mb-4 group-hover:text-accent transition-colors">
                  Qualidade de vida de crianças e adolescentes com neurofibromatose tipo 1
                </h3>
              </div>
            </a>
            
            {/* Paper 4 */}
            <a href="https://www.scielo.br/j/rbcan/a/tSSJjP7vjGKrgNFs5cfLndj/?lang=pt" target="_blank" rel="noopener noreferrer" className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-accent hover:shadow-lg transition-all group flex flex-col">
              <div className="h-48 bg-white relative border-b border-zinc-100 overflow-hidden">
                <img src="/papers/media_1790150701046.png" alt="Cancerologia Paper" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col grow">
                <span className="text-xs font-bold uppercase tracking-wider text-accent mb-3 block">Revista Bras. de Cancerologia</span>
                <h3 className="text-md font-medium text-zinc-900 leading-snug mb-4 group-hover:text-accent transition-colors">
                  Desenvolvimento de uma Escala Lúdica de Letramento em Saúde Infantil
                </h3>
              </div>
            </a>

            {/* Paper 5 (PLOS ONE) */}
            <a href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0231379" target="_blank" rel="noopener noreferrer" className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-accent hover:shadow-lg transition-all group flex flex-col">
              <div className="h-48 bg-white relative border-b border-zinc-100 overflow-hidden">
                <img src="/papers/plosone.png" alt="PLOS ONE Paper" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col grow">
                <span className="text-xs font-bold uppercase tracking-wider text-accent mb-3 block">PLOS ONE</span>
                <h3 className="text-md font-medium text-zinc-900 leading-snug mb-4 group-hover:text-accent transition-colors">
                  Clinical impact of melatonin on breast cancer patients undergoing chemotherapy
                </h3>
              </div>
            </a>

            {/* Paper 6 (Pain Medicine) */}
            <a href="https://academic.oup.com/painmedicine/article-abstract/21/10/2271/5804972" target="_blank" rel="noopener noreferrer" className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-accent hover:shadow-lg transition-all group flex flex-col">
              <div className="h-48 bg-white relative border-b border-zinc-100 overflow-hidden">
                <img src="/papers/painmed.png" alt="Pain Medicine Paper" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col grow">
                <span className="text-xs font-bold uppercase tracking-wider text-accent mb-3 block">Pain Medicine</span>
                <h3 className="text-md font-medium text-zinc-900 leading-snug mb-4 group-hover:text-accent transition-colors">
                  Artigo de Alto Impacto Científico Internacional em Saúde e Dor
                </h3>
              </div>
            </a>

          </div>
        </div>
      </section>
    </div>
  );
}