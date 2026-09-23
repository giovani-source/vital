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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assunto || !mensagem) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    
    // Codifica os dados para a URL do email
    const subject = encodeURIComponent(assunto);
    const body = encodeURIComponent(mensagem);
    
    // Direciona para o email fornecido usando mailto
    window.location.href = `mailto:giovani@medaffection.com?subject=${subject}&body=${body}`;
  };

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

        <motion.form 
          onSubmit={handleSubmit}
          className="contact-card"
          initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }}
        >
          {/* Assunto */}
          <div className="form-group">
            <label htmlFor="assunto" className="form-label">
              Assunto / Produto de Interesse
            </label>
            <select 
              id="assunto"
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
      </div>
    </div>
  );
}