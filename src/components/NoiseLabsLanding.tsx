import { useEffect, useState, useRef, type ReactNode } from "react";
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
  Instagram,
  Linkedin,
  Plus,
} from "lucide-react";

// TODO: substituir pelo número real
const NUMERO_WHATSAPP = "5500000000000";
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
      className="hero-bg min-h-screen flex items-center relative overflow-hidden pt-24"
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 w-full">
        <div className="max-w-[760px]">
          <div className="reveal inline-flex items-center gap-2 border border-[rgba(170,255,0,0.3)] text-[#AAFF00] bg-[rgba(170,255,0,0.05)] rounded-full px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.1em] mb-7">
            Agência de Marketing Digital
          </div>

          <h1 className="reveal font-[Space_Grotesk] font-bold text-white text-[40px] sm:text-[56px] md:text-[72px] lg:text-[80px] leading-[1.05] tracking-[-0.02em] mb-7">
            Enquanto você lê isso, alguém está procurando exatamente o que você vende — e encontrando seu{" "}
            <span className="text-[#AAFF00]">concorrente</span>.
          </h1>

          <p className="reveal font-[Inter] text-[16px] md:text-[20px] leading-[1.6] text-[#9CA3AF] max-w-[560px] mb-10">
            A Noise Labs cria a presença digital que faz seu negócio aparecer, gerar confiança e transformar
            visitantes em clientes. Todos os dias — sem depender de indicação.
          </p>

          <div className="reveal flex flex-wrap items-center gap-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#AAFF00] text-black font-semibold px-7 py-4 rounded-[10px] text-[16px] hover:bg-[#C5FF3A] hover:shadow-[0_0_24px_rgba(170,255,0,0.35)] transition-all duration-150 inline-flex items-center gap-2 font-[Space_Grotesk]"
            >
              Quero mais clientes agora →
            </a>
            <a
              href="#como-funciona"
              className="text-[#9CA3AF] hover:text-white text-[15px] font-medium transition-colors font-[Inter]"
            >
              Ver como funciona →
            </a>
          </div>

          <p className="reveal mt-3 mb-12 text-[13px] text-[#6B7280] font-[Inter]">
            Resposta em até 1 hora nos dias úteis. Sem compromisso.
          </p>

          <div className="reveal flex flex-wrap gap-3">
            {["✦ Sites estratégicos", "✦ Tráfego pago", "✦ Conversão real"].map((c) => (
              <span
                key={c}
                className="border border-[rgba(255,255,255,0.08)] text-[#888888] bg-[#1A1A1A] rounded-full px-4 py-1.5 text-[13px] font-medium font-[Inter]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
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
    <Section id="problema" className="py-20 md:py-[120px] bg-[#0F0F0F]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <Label>O Problema</Label>
        <h2 className="reveal font-[Space_Grotesk] font-bold text-white text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.02em] max-w-[680px] mb-6">
          Todo dia sem presença digital é um cliente que vai para o{" "}
          <span className="text-[#AAFF00]">concorrente</span>.
        </h2>
        <p className="reveal font-[Inter] text-[18px] text-[#9CA3AF] max-w-[560px] mb-16 leading-[1.6]">
          Você não perde clientes porque seu serviço é pior. Você perde porque, na hora em que eles pesquisam,
          seu concorrente aparece — e você não.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {cards.map((c) => (
            <div
              key={c.quote}
              className="reveal bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-8 hover:border-[rgba(170,255,0,0.20)] hover:shadow-[0_8px_32px_rgba(170,255,0,0.06)] hover:scale-[1.01] transition-all duration-200"
            >
              <div className="w-2 h-2 rounded-full bg-[#AAFF00] mb-6" />
              <p className="font-[Space_Grotesk] font-medium text-[16px] text-white mb-3 leading-[1.45]">
                {c.quote}
              </p>
              <p className="font-[Inter] text-[14px] text-[#6B7280] leading-[1.6]">{c.desc}</p>
            </div>
          ))}
        </div>

        <p className="reveal font-[Inter] text-[18px] text-[#AAAAAA] text-center max-w-[600px] mx-auto leading-[1.6]">
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
      title: "Execução com padrão premium",
      text: "Design, copy, estrutura e performance no mesmo nível de grandes marcas. Porque o visual da sua empresa online comunica o preço que você pode cobrar.",
    },
    {
      Icon: TrendingUp,
      title: "Resultado medido por cliente gerado",
      text: "Não reportamos curtidas. Não reportamos impressões. Reportamos contatos, agendamentos, crescimento de receita — o que realmente importa para o dono do negócio.",
    },
  ];
  return (
    <Section id="solucao" className="py-20 md:py-[120px] bg-[#0A0A0A] border-t border-[rgba(255,255,255,0.04)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <Label>A Solução</Label>
        <h2 className="reveal font-[Space_Grotesk] font-bold text-white text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.02em] max-w-[760px] mb-6">
          Uma agência que pensa como <span className="text-[#AAFF00]">sócio</span>, não como fornecedor.
        </h2>
        <p className="reveal font-[Inter] text-[18px] text-[#9CA3AF] max-w-[640px] mb-16 leading-[1.6]">
          A maioria das agências começa pela execução: pega o template, monta o site, publica e cobra. A Noise
          Labs começa pela estratégia: entende o seu negócio, o seu cliente, o que bloqueia a conversão — e só
          então executa.
        </p>

        <div className="reveal flex flex-col md:flex-row gap-px bg-[rgba(255,255,255,0.04)] rounded-[16px] overflow-hidden">
          {pilares.map(({ Icon, title, text }) => (
            <div key={title} className="bg-[#0A0A0A] flex-1 p-10 flex flex-col gap-4">
              <Icon size={32} strokeWidth={1.5} color="#AAFF00" />
              <h3 className="font-[Space_Grotesk] font-medium text-[20px] text-white">{title}</h3>
              <p className="font-[Inter] text-[15px] text-[#9CA3AF] leading-[1.65]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function ComoFunciona() {
  const steps = [
    {
      n: "01",
      title: "Diagnóstico",
      text: "Analisamos sua presença digital atual (ou a ausência dela), seu mercado e seus concorrentes. Você recebe um diagnóstico honesto — não uma proposta de vendas disfarçada.",
    },
    {
      n: "02",
      title: "Estratégia",
      text: "Com base no diagnóstico, definimos o caminho mais direto entre você e seus clientes: quais canais, qual comunicação, qual estrutura.",
    },
    {
      n: "03",
      title: "Execução",
      text: "Site, landing page, anúncios, social media — tudo criado com base na estratégia, não em templates genéricos. Você aprova. Nós entregamos.",
    },
    {
      n: "04",
      title: "Crescimento",
      text: "Monitoramos, otimizamos e escalamos. À medida que os resultados aparecem, ajustamos o que funciona e eliminamos o que não converte.",
    },
  ];
  return (
    <Section id="como-funciona" className="py-20 md:py-[120px] bg-[#111111]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <Label>Processo</Label>
        <h2 className="reveal font-[Space_Grotesk] font-bold text-white text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.02em] max-w-[720px] mb-16">
          Do diagnóstico ao crescimento. Quatro passos.
        </h2>

        <div className="flex flex-col md:flex-row items-stretch gap-0 relative">
          {steps.map((s, i) => (
            <div key={s.n} className="flex-1 p-6 md:p-8 reveal relative">
              <div className="font-[Space_Mono] text-[72px] text-[#AAFF00] opacity-20 leading-none mb-4">
                {s.n}
              </div>
              <h3 className="font-[Space_Grotesk] font-medium text-[20px] text-white mb-2">{s.title}</h3>
              <p className="font-[Inter] text-[14px] text-[#6B7280] leading-[1.6]">{s.text}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-[60px] right-0 w-px h-12 bg-[rgba(170,255,0,0.20)]" />
              )}
            </div>
          ))}
        </div>

        <p className="reveal font-[Inter] text-[16px] text-[#6B7280] text-center mt-16">
          Você conduz seu negócio. Nós conduzimos sua presença digital. Simples assim.
        </p>
      </div>
    </Section>
  );
}

function Servicos() {
  const services = [
    { Icon: Monitor, title: "Sites Profissionais", text: "Criamos sites que representam sua empresa com autoridade, carregam rápido no celular e têm um caminho claro para o visitante entrar em contato. Não sites bonitos — sites que convertem." },
    { Icon: Target, title: "Landing Pages de Conversão", text: "Quando o objetivo é gerar leads, agendamentos ou pedidos, uma landing page especializada converte muito mais do que um site genérico. Desenhamos para uma ação específica." },
    { Icon: BarChart3, title: "Tráfego Pago", text: "Google Ads e Meta Ads gerenciados com foco em custo por cliente adquirido — não em impressões. Cada real investido tem um destino claro." },
    { Icon: MessageSquare, title: "Social Media", text: "Conteúdo que posiciona, gera autoridade e mantém sua marca relevante para quem ainda não comprou mas está considerando. Feito para construir relacionamento com consistência." },
    { Icon: Lightbulb, title: "Estratégia Digital", text: "Um diagnóstico honesto do que está faltando e um plano claro para corrigir — sem desperdício de dinheiro em ações que não convertem." },
    { Icon: Star, title: "Posicionamento e Identidade", text: "Identidade visual, linguagem de marca e posicionamento que justificam o preço que você pratica e atraem o cliente que você quer." },
  ];
  return (
    <Section id="servicos" className="py-20 md:py-[120px] bg-[#0A0A0A]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <Label>Serviços</Label>
        <h2 className="reveal font-[Space_Grotesk] font-bold text-white text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.02em] max-w-[640px] mb-6">
          Tudo que seu negócio precisa para crescer no digital — em um único lugar.
        </h2>
        <p className="reveal font-[Inter] text-[17px] text-[#9CA3AF] max-w-[520px] mb-16 leading-[1.6]">
          Não precisar coordenar quatro fornecedores diferentes é uma das formas mais eficientes de economizar
          tempo e dinheiro.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {services.map(({ Icon, title, text }) => (
            <div
              key={title}
              className="reveal bg-[#141414] border border-[rgba(255,255,255,0.06)] rounded-[16px] p-8 flex flex-col gap-4 hover:border-[rgba(170,255,0,0.20)] hover:shadow-[0_8px_32px_rgba(170,255,0,0.06)] hover:scale-[1.01] transition-all duration-200"
            >
              <Icon size={32} strokeWidth={1.5} color="#AAFF00" />
              <h3 className="font-[Space_Grotesk] font-medium text-[20px] text-white">{title}</h3>
              <p className="font-[Inter] text-[14px] text-[#9CA3AF] leading-[1.65]">{text}</p>
            </div>
          ))}
        </div>

        <div className="reveal border border-[rgba(170,255,0,0.20)] bg-[rgba(170,255,0,0.03)] rounded-[16px] p-10 text-center max-w-[600px] mx-auto">
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
    { title: "Você vê antes de pagar.", text: "Nossa abordagem de prospecção ativa significa que, em muitos casos, você recebe um protótipo real do seu site antes mesmo de assinar qualquer contrato." },
    { title: "Não vendemos serviços. Resolvemos problemas de crescimento.", text: "Nosso foco não é entregar um site ou uma campanha. É resolver a equação: como sua empresa consegue mais clientes." },
    { title: "Comunicação direta. Sem fila de chamado.", text: "Você tem um ponto de contato real. Não abre chamado para saber o andamento do projeto. Não aguarda 3 dias úteis para uma resposta simples." },
    { title: "O próprio site é nossa prova.", text: "O site que você está visitando foi criado com a mesma metodologia, a mesma estratégia e o mesmo cuidado que aplicamos em cada cliente." },
  ];
  return (
    <Section id="diferenciais" className="py-20 md:py-[120px] bg-[#0F0F0F]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div>
          <Label>Por que a Noise Labs</Label>
          <h2 className="reveal font-[Space_Grotesk] font-bold text-white text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.02em] mb-8">
            O que separa a Noise Labs de 90% das agências.
          </h2>
          <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.04)]">
            {items.map((it) => (
              <div key={it.title} className="reveal flex items-start gap-4 py-7">
                <div className="w-5 h-5 rounded-full bg-[rgba(170,255,0,0.15)] flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Check size={12} strokeWidth={2.5} color="#AAFF00" />
                </div>
                <div>
                  <h3 className="font-[Space_Grotesk] font-medium text-[17px] text-white mb-1">{it.title}</h3>
                  <p className="font-[Inter] text-[14px] text-[#6B7280] leading-[1.6]">{it.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block reveal">
          <div className="border border-[rgba(255,255,255,0.06)] rounded-[20px] bg-[#141414] p-8 aspect-square relative overflow-hidden">
            {/* Decorative grid */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative h-full flex flex-col gap-4">
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full bg-[#AAFF00]" />
                <div className="h-2 w-24 bg-[rgba(255,255,255,0.08)] rounded-full" />
                <div className="ml-auto h-2 w-2 rounded-full bg-[rgba(255,255,255,0.15)]" />
                <div className="h-2 w-2 rounded-full bg-[rgba(255,255,255,0.15)]" />
              </div>
              <div className="h-px bg-[rgba(255,255,255,0.06)]" />
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div className="col-span-2 bg-[rgba(170,255,0,0.06)] border border-[rgba(170,255,0,0.20)] rounded-[10px] p-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-2 w-16 bg-[rgba(170,255,0,0.4)] rounded-full" />
                    <div className="h-3 w-32 bg-[rgba(255,255,255,0.15)] rounded-full" />
                    <div className="h-3 w-24 bg-[rgba(255,255,255,0.10)] rounded-full" />
                  </div>
                  <div className="h-6 w-20 bg-[#AAFF00] rounded-md" />
                </div>
                <div className="space-y-3">
                  <div className="bg-[rgba(255,255,255,0.04)] rounded-[8px] p-3 space-y-2">
                    <div className="h-1.5 w-12 bg-[rgba(255,255,255,0.15)] rounded-full" />
                    <div className="h-3 w-8 bg-[#AAFF00] rounded-full" />
                  </div>
                  <div className="bg-[rgba(255,255,255,0.04)] rounded-[8px] p-3 space-y-2">
                    <div className="h-1.5 w-10 bg-[rgba(255,255,255,0.15)] rounded-full" />
                    <div className="h-3 w-12 bg-[rgba(255,255,255,0.30)] rounded-full" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[40, 65, 80, 55].map((h, i) => (
                  <div key={i} className="bg-[rgba(255,255,255,0.04)] rounded-[6px] p-2 flex items-end h-20">
                    <div
                      className={`w-full rounded ${i === 2 ? "bg-[#AAFF00]" : "bg-[rgba(255,255,255,0.15)]"}`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Autoridade() {
  return (
    <Section className="py-20 md:py-[120px] bg-gradient-to-b from-[#0A0A0A] to-[#111111]">
      <div className="max-w-[720px] mx-auto px-5 md:px-10 text-center">
        <Label>Perspectiva</Label>
        <h2 className="reveal font-[Space_Grotesk] font-bold text-white text-[28px] md:text-[42px] leading-[1.1] tracking-[-0.02em] mb-6">
          A diferença entre crescer e estagnar está em quem cuida da sua presença digital.
        </h2>
        <p className="reveal font-[Inter] text-[17px] text-[#9CA3AF] leading-[1.65] mb-6">
          Empresas que crescem no digital não crescem por acidente. Elas têm uma presença construída
          estrategicamente: site que transmite profissionalismo, anúncios que atingem as pessoas certas, e uma
          experiência online que converte visitante em cliente.
        </p>
        <p className="reveal font-[Inter] text-[17px] text-[#9CA3AF] leading-[1.65] mb-10">
          Essa estrutura não acontece com template genérico. Não acontece com agência que executa sem pensar.
          Acontece com método.
        </p>
        <p className="reveal font-[Space_Grotesk] font-medium text-[20px] text-white leading-[1.4] border-l-2 border-[#AAFF00] pl-6 text-left max-w-[560px] mx-auto">
          Se sua empresa não aparece, não transmite confiança ou não facilita o contato — você não está
          competindo. Está esperando.
        </p>
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
        className="flex justify-between items-center w-full py-6 text-left gap-6"
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
    <Section id="faq" className="py-20 md:py-[120px] bg-[#111111]">
      <div className="max-w-[720px] mx-auto px-5 md:px-10">
        <Label>FAQ</Label>
        <h2 className="reveal font-[Space_Grotesk] font-bold text-white text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.02em] mb-16">
          Perguntas de quem pensa sério sobre crescimento.
        </h2>
        <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.06)]">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </Section>
  );
}

function CTAFinal() {
  return (
    <Section id="contato" className="py-24 md:py-[160px] bg-[#0A0A0A] cta-bg relative overflow-hidden">
      <div className="max-w-[680px] mx-auto px-5 md:px-10 text-center relative z-10">
        <Label>Pronto para começar</Label>
        <h2 className="reveal font-[Space_Grotesk] font-bold text-[32px] md:text-[52px] leading-[1.05] tracking-[-0.02em] mb-6">
          Pronto para parar de <span className="text-[#9CA3AF]">perder clientes</span> para quem{" "}
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
    <footer className="bg-[#0A0A0A] border-t border-[rgba(255,255,255,0.06)] py-16">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <Logo />
            <p className="font-[Inter] text-[14px] text-[#6B7280] mt-3">Presença que gera clientes.</p>
          </div>
          <div>
            <h4 className="text-[12px] uppercase tracking-[0.12em] text-[#6B7280] mb-4 font-[Inter] font-medium">
              Navegação
            </h4>
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
            <h4 className="text-[12px] uppercase tracking-[0.12em] text-[#6B7280] mb-4 font-[Inter] font-medium">
              Contato
            </h4>
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
          <p className="font-[Inter] text-[13px] text-[#6B7280]">
            © 2025 Noise Labs. Marketing digital estratégico para negócios que querem crescer.
          </p>
          <div className="flex gap-4">
            <a href="#" aria-label="Instagram" className="text-[#6B7280] hover:text-[#AAFF00] transition-colors">
              <Instagram size={18} />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-[#6B7280] hover:text-[#AAFF00] transition-colors">
              <Linkedin size={18} />
            </a>
          </div>
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
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com especialista via WhatsApp"
      className={`group fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#AAFF00] rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(170,255,0,0.35)] hover:scale-110 hover:shadow-[0_12px_40px_rgba(170,255,0,0.5)] transition-all duration-200 ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
      }`}
      style={{ transitionProperty: "opacity, transform, box-shadow" }}
    >
      <MessageCircle size={26} color="#000" strokeWidth={2} />
      <span className="absolute right-16 bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] text-white text-[13px] px-3 py-1.5 rounded-[6px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Falar com especialista
      </span>
    </a>
  );
}

export default function NoiseLabsLanding() {
  return (
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
  );
}
