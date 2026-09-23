"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Send, ArrowRight } from "lucide-react";

export default function ContatoPage() {
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const assuntos = [
    "Método VITAL — Mentoria para Mestrado e Doutorado",
    "Do Zero ao Seu Artigo",
    "Círculo VITAL — Comunidade de Produção Científica",
    "VITAL Extensão",
    "VITAL Pós",
    "Saúde que Vira Negócio",
    "Da Prática ao Produto",
    "Outro"
  ];

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Hook para rodar apenas no client-side
  import { useEffect } from "react";
  useEffect(() => {
    setIsClient(true);
    if (window.location.search.includes("sucesso=true")) {
      setEnviado(true);
    }
  }, []);

  return (
    <div className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container">
        <motion.div className="text-center mb-12" initial="hidden" animate="visible" variants={fadeUp}>
          <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem', display: 'block', marginBottom: '1rem' }}>
            Fale Conosco
          </span>
          <h1 className="text-h2 mb-4">
            Como podemos impulsionar sua carreira hoje?
          </h1>
          <p className="text-large text-muted mb-8" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Selecione o produto do seu interesse e nos envie uma mensagem detalhando seu momento atual. Entraremos em contato o mais breve possível.
          </p>
        </motion.div>

        {enviado ? (
          <motion.div className="contact-card text-center py-12" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="mb-6 inline-flex p-4 rounded-full" style={{ backgroundColor: 'rgba(87, 94, 207, 0.1)', color: 'var(--accent)' }}>
              <Send size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-primary">Mensagem enviada com sucesso!</h2>
            <p className="text-muted-foreground mb-8">Recebemos o seu contato. Retornaremos no seu e-mail o mais breve possível.</p>
            <button onClick={() => setEnviado(false)} className="btn btn-outline">
              Enviar nova mensagem
            </button>
          </motion.div>
        ) : (
          <motion.form 
            action="https://formsubmit.co/giovani@medaffection.com"
            method="POST"
            className="contact-card"
            initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }}
          >
            {/* Campos ocultos do FormSubmit */}
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_subject" value="Novo Contato - Mentoria VITAL!" />
            {isClient && <input type="hidden" name="_next" value={`${window.location.origin}/contato?sucesso=true`} />}
            
            {/* Nome */}
            <div className="form-group">
              <label htmlFor="nome" className="form-label">Seu Nome</label>
              <input 
                type="text" 
                name="nome"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Ex: Ana Silva"
                className="form-select" // usando as mesmas classes
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Seu E-mail</label>
              <input 
                type="email" 
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Ex: ana@email.com"
                className="form-select" 
              />
            </div>

            {/* Assunto */}
            <div className="form-group">
              <label htmlFor="assunto" className="form-label">
                Assunto / Produto de Interesse
              </label>
              <select 
                id="assunto"
                name="produto_interesse"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                required
                className="form-select"
              >
                <option value="" disabled>Selecione uma opção...</option>
                {assuntos.map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Mensagem */}
            <div className="form-group">
              <label htmlFor="mensagem" className="form-label">
                Sua Mensagem
              </label>
              <textarea 
                id="mensagem"
                name="mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                required
                placeholder="Conte um pouco sobre sua trajetória, seu objetivo atual e como podemos te ajudar..."
                className="form-textarea"
              ></textarea>
            </div>

            {/* Submit */}
            <div className="mt-8 text-center">
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                <Send size={20} style={{ marginRight: '0.5rem' }} />
                Enviar Mensagem
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
}