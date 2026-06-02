import { useEffect, useState, useRef, type ReactNode } from "react";
import { SignalHead } from "./mascot/SignalHead";
import { HeroGlowLayer } from "./hero/HeroGlowLayer";
import { RadarOpportunity } from "./hero/RadarOpportunity";
import { InteractiveNoiseBackground } from "./InteractiveNoiseBackground";
import {
  Map,
  Zap,
  TrendingUp,
  Monitor,
  Target,
  BarChart3,
  MessageSquare,
  Lightbulb,
  Star,
  Check,
  MessageCircle,

  Plus,
} from "lucide-react";

const NUMERO_WHATSAPP = "5511995386342";
const WHATSAPP_URL = `https://wa.me/${NUMERO_WHATSAPP}?text=Ol%C3%A1!%20Vi%20o%20site%20da%20Noise%20Labs%20e%20gostaria%20de%20saber%20mais.`;

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const targets = el.querySelectorAll<HTMLElement>(".reveal");
            targets.forEach((t, i) => {
              setTimeout(() => t.classList.add("is-visible"), i * 100);
            });
            obs.disconnect();
          }
        });
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Section({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  const ref = useReveal();
  return (
    <section ref={ref} id={id} className={className}>
      {children}
    </section>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="reveal block mb-4 text-[12px] font-medium uppercase tracking-[0.12em] text-[#AAFF00] font-[Inter]">
      {children}
    </span>
  );
}

function Logo({ size = 22 }: { size?: number }) {
  return (
    <span style={{ fontSize: size }} className="font-[Space_Grotesk] font-bold tracking-[-0.02em]">
      <span className="text-white">Noise</span>
      <span className="text-[#AAFF00]">Labs</span>
    </span>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#como-funciona", label: "Como funciona" },
    { href: "#servicos", label: "Serviços" },
    { href: "#diferenciais", label: "Diferenciais" },
    { href: "#contato", label: "Contato" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(15,15,15,0.95)] backdrop-blur-[12px] border-b border-[rgba(255,255,255,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 h-16 md:h-[72px] flex items-center justify-between">
        <a href="#inicio" aria-label="Noise Labs">
          <Logo />
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[14px] font-[Inter] font-medium text-[#9CA3AF] hover:text-white transition-colors duration-150"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-[#AAFF00] text-[#AAFF00] hover:bg-[#AAFF00] hover:text-black px-3 md:px-5 py-2 rounded-[8px] text-[13px] md:text-[14px] font-[Space_Grotesk] font-medium transition-all duration-150"
        >
          Falar agora<span className="hidden md:inline"> →</span>
        </a>
      </div>
    </header>
  );
}

function Hero() {
  const ref = useReveal();
  return (
    <section
      ref={ref}
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden bg-[#0A0A0A] pt-20 pb-6 lg:pt-20 lg:pb-8"
    >
      {/* ── Camadas atmosféricas (absolute, atrás do conteúdo) ── */}
      <HeroGlowLayer />
      <InteractiveNoiseBackground intensity="medium" />

      {/* ── Texto — metade esquerda ── */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-10 w-full">
        <div className="md:max-w-[580px]">

          {/* Indicador de posicionamento */}
          <div className="reveal flex items-center gap-3 mb-3">
            <span className="h-px w-6 bg-[#AAFF00] opacity-60 flex-shrink-0" />
            <span className="text-[11px] font-[Inter] font-medium uppercase tracking-[0.18em] text-[#AAFF00] opacity-75">
              Para empresas que precisam ser escolhidas antes da concorrência
            </span>
          </div>

          {/* Headline */}
          <h1 className="reveal font-[Space_Grotesk] font-bold text-white text-[28px] sm:text-[38px] md:text-[46px] lg:text-[48px] xl:text-[52px] leading-[1.08] tracking-[-0.025em] mb-4">
            Enquanto você lê isso, alguém está procurando exatamente o que você vende — e encontrando seu{" "}
            <span className="text-[#AAFF00]">concorrente</span>.
          </h1>

          {/* Subtítulo */}
          <p className="reveal font-[Inter] text-[15px] md:text-[16px] leading-[1.55] text-[#9CA3AF] max-w-[540px] mb-3">
            A Noise Labs ajuda negócios locais a construir uma presença online mais profissional, confiável
            e preparada para transformar pesquisas e visitas em oportunidades reais de venda.
          </p>

          {/* Urgência racional */}
          <p className="reveal font-[Inter] text-[13px] text-[#5A5A5A] leading-[1.55] max-w-[480px] mb-4">
            Enquanto sua presença não transmite confiança, parte da decisão do cliente já aconteceu — antes de ele ligar.
          </p>

          {/* CTAs */}
          <div className="reveal flex flex-wrap items-center gap-3 mb-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#AAFF00] text-black font-semibold px-6 py-3.5 rounded-[10px] text-[15px] hover:bg-[#C5FF3A] hover:shadow-[0_0_28px_rgba(170,255,0,0.40)] transition-all duration-150 inline-flex items-center gap-2 font-[Space_Grotesk]"
            >
              Quero mais clientes agora →
            </a>
            <a
              href="#como-funciona"
              className="text-[#9CA3AF] hover:text-white text-[14px] font-medium transition-colors font-[Inter]"
            >
              Ver como funciona →
            </a>
          </div>

          <p className="reveal text-[12px] text-[#6B7280] font-[Inter] mb-4">
            Resposta em até 1 hora nos dias úteis. Sem compromisso.
            <span className="ml-3 text-[#AAFF00]/60">→</span>
            <span className="ml-1 italic">Antes de decidir, você enxerga o caminho.</span>
          </p>

          {/* Pills compactas */}
          <div className="reveal flex flex-wrap gap-2">
            {["✦ Sites profissionais", "✦ Anúncios locais", "✦ Presença nas redes"].map((c) => (
              <span
                key={c}
                className="border border-[rgba(255,255,255,0.07)] text-[#666666] bg-[rgba(26,26,26,0.6)] rounded-full px-3.5 py-1 text-[12px] font-medium font-[Inter]"
              >
                {c}
              </span>
            ))}
          </div>


        </div>
      </div>

      {/* ── Radar — absolute na metade direita, centrado pela altura da section ── */}
      <div className="hidden md:flex absolute inset-y-0 right-0 w-1/2 items-center justify-center z-10 pointer-events-none select-none px-6 lg:px-10">
        <RadarOpportunity />
      </div>
    </section>
  );
}

function Problema() {
  const cards = [
    {
      quote: '"Pesquisei no Google e não achei seu nome."',
      desc: "Essa frase que você nunca ouve é a razão pela qual clientes escolhem outra empresa.",
    },
    {
      quote: '"Entrei no perfil, mas não passou confiança."',
      desc: "Uma presença digital fraca comunica amadorismo — mesmo que seu serviço seja excelente.",
    },
    {
      quote: '"Tentei entrar em contato, mas foi complicado."',
      desc: "Fricção no caminho até o cliente custa mais do que qualquer investimento em marketing.",
    },
  ];
  return (
    <Section id="problema" className="py-8 md:py-12 bg-[#0F0F0F]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <Label>O Problema</Label>
        <h2 className="reveal font-[Space_Grotesk] font-bold text-white text-[26px] md:text-[36px] leading-[1.08] tracking-[-0.02em] max-w-[680px] mb-6">
          Todo dia sem presença digital é um cliente que vai para o{" "}
          <span className="text-[#AAFF00]">concorrente</span>.
        </h2>
        <p className="reveal font-[Inter] text-[16px] text-[#9CA3AF] max-w-[560px] mb-6 leading-[1.6]">
          Você não perde clientes porque seu serviço é pior. Você perde porque, na hora em que eles pesquisam,
          seu concorrente aparece — e você não.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {cards.map((c) => (
            <div
              key={c.quote}
              className="reveal bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-5 hover:border-[rgba(170,255,0,0.20)] hover:shadow-[0_8px_32px_rgba(170,255,0,0.06)] hover:scale-[1.01] transition-all duration-200"
            >
              <div className="w-2 h-2 rounded-full bg-[#AAFF00] mb-4" />
              <p className="font-[Space_Grotesk] font-medium text-[18px] text-white mb-3 leading-[1.45]">
                {c.quote}
              </p>
              <p className="font-[Inter] text-[14px] text-[#6B7280] leading-[1.6]">{c.desc}</p>
            </div>
          ))}
        </div>

        <p className="reveal font-[Inter] text-[13px] text-[#AAAAAA] text-center max-w-[600px] mx-auto leading-[1.6]">
          A pergunta não é se você precisa de presença digital. É quanto está custando não ter uma que funcione.
        </p>
      </div>
    </Section>
  );
}

function Solucao() {
  const pilares = [
    {
      Icon: Map,
      title: "Estratégia antes de execução",
      text: "Nenhum site, anúncio ou perfil é criado sem antes entender o objetivo de negócio. Isso é o que separa presença digital que gera clientes de presença digital que só gera custo.",
    },
    {
      Icon: Zap,
      title: "Visual que aumenta a percepção de valor",
      text: "Design, copy e estrutura que fazem sua empresa parecer séria, confiável e preparada para atender novos clientes. Porque o visual online comunica o preço que você pode cobrar.",
    },
    {
      Icon: TrendingUp,
      title: "Resultado medido por cliente gerado",
      text: "Não reportamos curtidas. Não reportamos impressões. Reportamos contatos, agendamentos, crescimento de receita — o que realmente importa para o dono do negócio.",
    },
  ];
  return (
    <Section id="solucao" className="py-8 md:py-12 bg-[#0A0A0A] border-t border-[rgba(255,255,255,0.04)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <Label>A Solução</Label>
        <h2 className="reveal font-[Space_Grotesk] font-bold text-white text-[26px] md:text-[36px] leading-[1.08] tracking-[-0.02em] max-w-[760px] mb-6">
          Não entregamos apenas uma página bonita. Construímos uma presença online pensada para fazer sua empresa{" "}
          <span className="text-[#AAFF00]">ser escolhida</span>.
        </h2>
        <p className="reveal font-[Inter] text-[16px] text-[#9CA3AF] max-w-[640px] mb-6 leading-[1.6]">
          A maioria das agências começa pela execução: pega o template, monta o site, publica e cobra. A Noise
          Labs começa pela estratégia: entende o seu negócio, o seu cliente, o que bloqueia a conversão — e só
          então executa.
        </p>

        <div className="reveal flex flex-col md:flex-row gap-px bg-[rgba(255,255,255,0.04)] rounded-[16px] overflow-hidden">
          {pilares.map(({ Icon, title, text }) => (
            <div key={title} className="bg-[#0A0A0A] flex-1 p-6 flex flex-col gap-3">
              <Icon size={24} strokeWidth={1.5} color="#AAFF00" />
              <h3 className="font-[Space_Grotesk] font-medium text-[18px] text-white">{title}</h3>
              <p className="font-[Inter] text-[15px] text-[#9CA3AF] leading-[1.65]">{text}</p>
            </div>
          ))}
        </div>

        <div className="reveal mt-8 text-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-[Inter] text-[14px] font-medium text-[#9CA3AF] hover:text-[#AAFF00] transition-colors duration-150"
          >
            Quero entender o melhor caminho para minha empresa →
          </a>
        </div>
      </div>
    </Section>
  );
}

function ComoFunciona() {
  const steps = [
    {
      n: "01",
      title: "Entendemos o que está custando clientes",
      text: "Analisamos sua presença digital atual (ou a ausência dela), seu mercado e seus concorrentes. Você recebe um diagnóstico honesto — não uma proposta de vendas disfarçada.",
    },
    {
      n: "02",
      title: "O caminho mais direto até o cliente",
      text: "Com base no diagnóstico, definimos o que vai funcionar para o seu negócio: quais canais, qual comunicação, qual presença online vai gerar contato real.",
    },
    {
      n: "03",
      title: "Construímos — você aprova cada etapa",
      text: "Site, página, anúncios, presença nas redes — tudo criado com base na estratégia, não em templates genéricos. Você vê antes de publicar.",
    },
    {
      n: "04",
      title: "Ajustamos o que funciona, cortamos o que não traz resultado",
      text: "Monitoramos, otimizamos e escalamos. À medida que os resultados aparecem, ajustamos o que funciona e eliminamos o que não converte.",
    },
  ];
  return (
    <Section id="como-funciona" className="py-8 md:py-12 bg-[#111111]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <Label>Processo</Label>
        <h2 className="reveal font-[Space_Grotesk] font-bold text-white text-[26px] md:text-[36px] leading-[1.08] tracking-[-0.02em] max-w-[720px] mb-8">
          Como transformamos a presença da sua empresa em contato real.
        </h2>

        <div className="flex flex-col md:flex-row items-stretch gap-0 relative">
          {steps.map((s, i) => (
            <div key={s.n} className="flex-1 p-5 reveal relative">
              <div className="font-[Space_Mono] text-[48px] text-[#AAFF00] opacity-30 leading-none mb-3">
                {s.n}
              </div>
              <h3 className="font-[Space_Grotesk] font-medium text-[18px] text-white mb-2">{s.title}</h3>
              <p className="font-[Inter] text-[14px] text-[#6B7280] leading-[1.6]">{s.text}</p>
              {i < steps.length - 1 && (
                <>
                  <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-0 w-px h-16 bg-gradient-to-b from-transparent via-[rgba(170,255,0,0.25)] to-transparent" />
                  <div className="md:hidden w-full h-px bg-[rgba(255,255,255,0.05)] mt-6" />
                </>
              )}
            </div>
          ))}
        </div>

        <p className="reveal font-[Inter] text-[16px] text-[#6B7280] text-center mt-8">
          Você cuida do que vende. Nós cuidamos de fazer as pessoas certas encontrarem — e escolherem — sua empresa.
        </p>
        <div className="reveal mt-6 text-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-[Inter] text-[14px] font-medium text-[#9CA3AF] hover:text-[#AAFF00] transition-colors duration-150"
          >
            Pedir um diagnóstico inicial →
          </a>
        </div>
      </div>
    </Section>
  );
}

function Servicos() {
  const services = [
    { Icon: Monitor, title: "Sites profissionais que geram contato", text: "Criamos sites que representam sua empresa com autoridade, carregam rápido no celular e têm um caminho claro para o visitante entrar em contato. Não sites bonitos — sites que convertem." },
    { Icon: Target, title: "Páginas para campanhas e WhatsApp", text: "Quando o objetivo é gerar agendamentos, pedidos ou mensagens diretas, uma página focada em uma única ação converte muito mais do que um site genérico. Desenhamos para esse resultado." },
    { Icon: BarChart3, title: "Anúncios com foco em clientes locais", text: "Google Ads e Meta Ads gerenciados com foco em custo por cliente adquirido — não em impressões. Cada real investido tem um destino claro: trazer pessoas que querem o que você vende." },
    { Icon: MessageSquare, title: "Presença consistente nas redes", text: "Conteúdo que posiciona, transmite confiança e mantém sua empresa relevante para quem ainda não comprou mas está considerando. Feito para construir relacionamento com consistência." },
    { Icon: Lightbulb, title: "Plano para transformar presença em contato", text: "Um diagnóstico honesto do que está faltando e um plano claro para corrigir — sem desperdício de dinheiro em ações que não convertem." },
    { Icon: Star, title: "Identidade que faz sua empresa parecer mais confiável", text: "Identidade visual, linguagem de marca e posicionamento que justificam o preço que você pratica e atraem o cliente que você quer." },
  ];
  return (
    <Section id="servicos" className="py-8 md:py-12 bg-[#0A0A0A]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <Label>Serviços</Label>
        <h2 className="reveal font-[Space_Grotesk] font-bold text-white text-[26px] md:text-[36px] leading-[1.08] tracking-[-0.02em] max-w-[640px] mb-6">
          Da primeira impressão ao contato no WhatsApp: organizamos sua presença online para gerar mais oportunidades.
        </h2>
        <p className="reveal font-[Inter] text-[16px] text-[#9CA3AF] max-w-[520px] mb-6 leading-[1.6]">
          Não precisar coordenar quatro fornecedores diferentes é uma das formas mais eficientes de economizar
          tempo e dinheiro.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          {services.map(({ Icon, title, text }) => (
            <div
              key={title}
              className="reveal bg-[#141414] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-5 flex flex-col gap-3 hover:border-[rgba(170,255,0,0.20)] hover:shadow-[0_8px_32px_rgba(170,255,0,0.06)] hover:scale-[1.01] transition-all duration-200"
            >
              <Icon size={24} strokeWidth={1.5} color="#AAFF00" />
              <h3 className="font-[Space_Grotesk] font-medium text-[18px] text-white">{title}</h3>
              <p className="font-[Inter] text-[14px] text-[#9CA3AF] leading-[1.65]">{text}</p>
            </div>
          ))}
        </div>

        <div className="reveal border border-[rgba(170,255,0,0.20)] bg-[rgba(170,255,0,0.03)] rounded-[14px] p-6 text-center max-w-[600px] mx-auto">
          <p className="font-[Space_Grotesk] font-medium text-[22px] text-white mb-3">
            Não sabe por onde começar?
          </p>
          <p className="font-[Inter] text-[16px] text-[#9CA3AF] mb-6 leading-[1.6]">
            Solicite um diagnóstico gratuito. A gente analisa e te diz o que faz mais impacto primeiro.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-transparent border border-[#AAFF00] text-[#AAFF00] hover:bg-[#AAFF00] hover:text-black px-6 py-3 rounded-[8px] font-medium transition-all duration-150 font-[Space_Grotesk]"
          >
            Quero o diagnóstico gratuito →
          </a>
        </div>
      </div>
    </Section>
  );
}

function Diferenciais() {
  const items = [
    { title: "Estratégia não é extra. É o ponto de partida.", text: "Enquanto a maioria começa pelo template, começamos pelo diagnóstico. Nenhuma execução acontece sem entender o que vai gerar resultado para aquele negócio específico." },
    { title: "Antes de decidir, você enxerga o caminho.", text: "Em muitos casos, mostramos como sua empresa pode se apresentar melhor online antes de você tomar qualquer decisão. Você decide com clareza — não com base em promessas." },
    { title: "Não entregamos serviço. Ajudamos sua empresa a ser escolhida.", text: "Nosso foco não é entregar um site ou uma campanha. É fazer sua empresa parecer mais profissional, confiável e fácil de escolher para quem está pesquisando online." },
    { title: "Comunicação direta. Sem fila de chamado.", text: "Você tem um ponto de contato real. Não abre chamado para saber o andamento do projeto. Não aguarda 3 dias úteis para uma resposta simples." },
    { title: "O próprio site é nossa prova.", text: "O site que você está visitando foi criado com a mesma metodologia, a mesma estratégia e o mesmo cuidado que aplicamos em cada cliente." },
  ];
  return (
    <Section id="diferenciais" className="py-8 md:py-12 bg-[#0F0F0F]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <div className="max-w-[760px] mb-6">
          <Label>Por que a Noise Labs</Label>
          <h2 className="reveal font-[Space_Grotesk] font-bold text-white text-[26px] md:text-[36px] leading-[1.08] tracking-[-0.02em]">
            O que separa a Noise Labs de 90% das agências.
          </h2>
        </div>
        <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.05)]">
          {items.map((it) => (
            <div key={it.title} className="reveal group flex items-start gap-6 py-4 hover:bg-[rgba(170,255,0,0.015)] -mx-4 px-4 transition-colors duration-200 rounded-[8px]">
              <div className="w-5 h-5 rounded-full bg-[rgba(170,255,0,0.12)] flex items-center justify-center mt-1 flex-shrink-0 group-hover:bg-[rgba(170,255,0,0.22)] transition-colors duration-200">
                <Check size={12} strokeWidth={2.5} color="#AAFF00" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-2 md:gap-12 w-full items-start">
                <h3 className="font-[Space_Grotesk] font-medium text-[17px] md:text-[19px] text-white leading-[1.35]">{it.title}</h3>
                <p className="font-[Inter] text-[14px] md:text-[15px] text-[#6B7280] leading-[1.65]">{it.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Autoridade() {
  return (
    <Section className="py-6 md:py-9 bg-gradient-to-b from-[#0A0A0A] to-[#111111]">
      <div className="max-w-[680px] mx-auto px-5 md:px-10">
        <div className="reveal border-l-2 border-[rgba(170,255,0,0.40)] pl-8 py-2">
          <p className="font-[Space_Grotesk] font-medium text-[20px] md:text-[24px] text-white leading-[1.4] mb-4">
            Se sua empresa não aparece, não transmite confiança ou não facilita o contato — você não está
            competindo. Está esperando.
          </p>
          <p className="reveal font-[Inter] text-[15px] text-[#6B7280] leading-[1.65]">
            Empresas que crescem no digital têm uma presença construída estrategicamente. Não acontece com
            template genérico. Não acontece com agência que executa sem pensar. Acontece com método.
          </p>
          <p className="reveal mt-5 font-[Inter] text-[14px] text-[#4A4A4A] leading-[1.6] italic">
            Se sua empresa já é boa no atendimento, o digital precisa transmitir isso antes do primeiro contato.
          </p>
        </div>
      </div>
    </Section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`reveal ${open ? "bg-[rgba(170,255,0,0.015)]" : ""} transition-colors`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex justify-between items-center w-full py-4 text-left gap-5"
        aria-expanded={open}
      >
        <span className="font-[Space_Grotesk] font-medium text-[16px] md:text-[17px] text-white">{q}</span>
        <Plus
          size={20}
          color="#AAFF00"
          className={`flex-shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: open ? 500 : 0, opacity: open ? 1 : 0 }}
      >
        <p className="font-[Inter] text-[15px] text-[#9CA3AF] leading-[1.65] pb-6 pr-10">{a}</p>
      </div>
    </div>
  );
}

function FAQ() {
  const faqs = [
    { q: "Já contratei agência antes e não vi resultado. Por que seria diferente com a Noise Labs?", a: "A maioria das decepções com agências vem de um problema de origem: execução sem estratégia. Você recebe um site ou uma campanha, mas sem um diagnóstico real do negócio, do público e do que bloqueia a conversão. Nossa abordagem começa antes de qualquer execução. E se você quiser ver antes de confiar — podemos mostrar um protótipo antes mesmo de fechar contrato." },
    { q: "Quanto tempo leva para ver os primeiros resultados?", a: "Depende do canal. Um site novo ou otimizado pode começar a gerar contatos em semanas. Tráfego pago pode produzir leads já nos primeiros dias de campanha ativa. Construção de presença orgânica e posicionamento levam mais tempo — mas a base certa desde o início acelera tudo que vem depois." },
    { q: "Meu negócio já funciona por indicação. Preciso mesmo de presença digital?", a: "Indicação é o canal mais eficiente que existe — e não vamos te dizer para abandonar. Mas indicação é passiva e tem limite. Digital é ativo e escalável. Se você quer crescer além do que sua rede atual permite, ou quer garantir fluxo de clientes mesmo quando a indicação diminui, presença digital é o próximo passo natural." },
    { q: "Preciso entender de marketing digital para trabalhar com vocês?", a: "Não. Você entende do seu negócio — nós entendemos de digital. Nossa função é traduzir o que você entrega em uma presença que atrai, convence e converte. Você aprova, dá feedback sobre o negócio e colhe o resultado. A parte técnica fica com a gente." },
    { q: "Funciona para empresas pequenas ou só para grandes?", a: "Funciona especialmente para empresas menores — porque é onde o impacto é mais imediato. Uma empresa local que hoje não aparece no digital e passa a aparecer com posicionamento correto sente o resultado rapidamente. O dono de negócio local que investe estrategicamente aqui tem vantagem competitiva real sobre vizinhos que ainda não fizeram isso." },
    { q: "Como funciona o investimento? É projeto único ou mensalidade?", a: "Depende do que faz mais sentido para o seu momento. Criação de site ou landing page é projeto com escopo definido. Gestão de tráfego pago e social media são serviços contínuos. Trabalhamos com modelos que se encaixam na realidade do seu negócio — e isso é definido depois do diagnóstico, não antes." },
  ];
  return (
    <Section id="faq" className="py-8 md:py-12 bg-[#111111]">
      <div className="max-w-[720px] mx-auto px-5 md:px-10">
        <Label>FAQ</Label>
        <h2 className="reveal font-[Space_Grotesk] font-bold text-white text-[26px] md:text-[36px] leading-[1.08] tracking-[-0.02em] mb-8">
          Perguntas de quem pensa sério sobre crescimento.
        </h2>
        <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.06)]">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>

        <div className="reveal mt-12 pt-8 border-t border-[rgba(255,255,255,0.05)] text-center">
          <p className="font-[Inter] text-[14px] text-[#6B7280] mb-4">
            Ficou com alguma dúvida? A conversa mais rápida é pelo WhatsApp.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-[Space_Grotesk] text-[14px] font-medium text-[#AAFF00] hover:text-[#C5FF3A] transition-colors duration-150"
          >
            Chamar no WhatsApp →
          </a>
        </div>
      </div>
    </Section>
  );
}

function CTAFinal() {
  return (
    <Section id="contato" className="py-12 md:py-16 bg-[#0A0A0A] cta-bg relative overflow-hidden">
      {/* Campo de noise interativo — versão soft para não competir com o CTA */}
      <InteractiveNoiseBackground intensity="soft" />
      {/* Glow radial de reforço — acima do noise, abaixo do conteúdo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(170,255,0,0.07)_0%,transparent_55%)] pointer-events-none" />
      <div className="max-w-[720px] mx-auto px-5 md:px-10 text-center relative z-10">
        <Label>Pronto para começar</Label>
        <h2 className="reveal font-[Space_Grotesk] font-bold text-[30px] md:text-[44px] lg:text-[52px] leading-[1.08] tracking-[-0.025em] mb-6">
          Pronto para parar de <span className="text-[#6B7280]">perder clientes</span> para quem{" "}
          <span className="text-white">investiu no digital</span>?
        </h2>
        <p className="reveal font-[Inter] text-[18px] text-[#9CA3AF] leading-[1.6] mb-12">
          Fale com um especialista agora. Sem formulário, sem apresentação de vendas genérica — uma conversa
          real sobre o que seu negócio precisa.
        </p>
        <div className="reveal flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#AAFF00] text-black font-semibold px-10 py-5 rounded-[12px] text-[18px] hover:bg-[#C5FF3A] hover:shadow-[0_0_40px_rgba(170,255,0,0.4)] transition-all duration-150 inline-flex items-center gap-2 font-[Space_Grotesk]"
          >
            Começar agora →
          </a>
          <a
            href="mailto:contato.noiselabs@gmail.com"
            className="text-[#6B7280] hover:text-white text-[14px] transition-colors underline underline-offset-4 font-[Inter]"
          >
            Ou envie um e-mail
          </a>
        </div>
        <p className="reveal font-[Inter] text-[13px] text-[#6B7280] mt-6">
          Resposta em até 1 hora. Sem compromisso. Sem contrato de fidelidade no primeiro contato.
        </p>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="relative bg-[#0A0A0A] border-t border-[rgba(255,255,255,0.05)] py-16 overflow-hidden">
      {/* Monograma ghost */}
      <div aria-hidden="true" role="presentation" className="absolute bottom-0 right-0 overflow-hidden pointer-events-none select-none">
        {/* NL como paths SVG — sem TextNode, Lighthouse não avalia contraste de shapes */}
        <svg
          aria-hidden="true"
          role="presentation"
          viewBox="0 0 390 200"
          className="block translate-x-[8%] translate-y-[15%]"
          style={{ height: "clamp(120px, 20vw, 260px)", width: "auto", fill: "rgba(255,255,255,0.016)" }}
        >
          {/* N: barra esquerda + diagonal + barra direita */}
          <rect x="0"   y="0" width="36"  height="200" />
          <polygon points="36,0 72,0 184,200 148,200" />
          <rect x="184" y="0" width="36"  height="200" />
          {/* L: barra vertical + base horizontal */}
          <rect x="250" y="0"   width="36"  height="200" />
          <rect x="250" y="164" width="140" height="36"  />
        </svg>
      </div>
      <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <Logo />
            <p className="font-[Inter] text-[14px] text-[#9CA3AF] mt-3">Presença que gera clientes.</p>
          </div>
          <div>
            <p className="text-[12px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-4 font-[Inter] font-medium">
              Navegação
            </p>
            {[
              { href: "#como-funciona", l: "Como funciona" },
              { href: "#servicos", l: "Serviços" },
              { href: "#diferenciais", l: "Diferenciais" },
              { href: "#contato", l: "Contato" },
            ].map((i) => (
              <a
                key={i.href}
                href={i.href}
                className="text-[14px] text-[#9CA3AF] hover:text-white block mb-2 transition-colors font-[Inter]"
              >
                {i.l}
              </a>
            ))}
          </div>
          <div>
            <p className="text-[12px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-4 font-[Inter] font-medium">
              Contato
            </p>
            <a
              href="mailto:contato.noiselabs@gmail.com"
              className="text-[14px] text-[#9CA3AF] hover:text-white block mb-2 transition-colors font-[Inter]"
            >
              contato.noiselabs@gmail.com
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-[#9CA3AF] hover:text-white inline-flex items-center gap-2 transition-colors font-[Inter]"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.04)] pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="font-[Inter] text-[13px] text-[#9CA3AF]">
            © 2026 Noise Labs. Marketing digital estratégico para negócios que querem crescer.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 transition-all duration-200 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      {/* Signal — mascote acima do botão, cores canônicas sobre fundo escuro da página */}
      <SignalHead
        size={52}
        headFill="#AAFF00"
        eyeFill="#0A0A0A"
        antennaFill="#AAFF00"
      />

      {/* Botão CTA — verde limpo, símbolo de mensagem reconhecível */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com especialista via WhatsApp"
        className="group relative w-14 h-14 bg-[#AAFF00] rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(170,255,0,0.35)] hover:scale-110 hover:shadow-[0_12px_40px_rgba(170,255,0,0.5)] transition-all duration-150"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#000000" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="absolute right-16 bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] text-white text-[13px] px-3 py-1.5 rounded-[6px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Falar com especialista
        </span>
      </a>
    </div>
  );
}

const SCHEMA_ORG = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://noiselabs.com.br/#organization",
  "name": "Noise Labs",
  "url": "https://noiselabs.com.br",
  "description": "A Noise Labs cria sites, landing pages e estratégias digitais para empresas locais que querem gerar mais clientes. Presença digital que converte.",
  "email": "contato.noiselabs@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "São Paulo",
    "addressRegion": "SP",
    "addressCountry": "BR",
  },
  "areaServed": "São Paulo e região metropolitana",
  "sameAs": [
    "https://instagram.com/noiselabs",
    "https://linkedin.com/company/noiselabs",
  ],
};

export default function NoiseLabsLanding() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }}
      />
      <div className="bg-[#0A0A0A] text-white min-h-screen">
      <Header />
      <main>
        <Hero />
        <Problema />
        <Solucao />
        <ComoFunciona />
        <Servicos />
        <Diferenciais />
        <Autoridade />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
    </>
  );
}
