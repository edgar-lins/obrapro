import { TopAppBar } from "@/components/top-app-bar"
import { Icon } from "@/components/icon"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar showNav={true} isLoggedIn={false} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-secondary-container/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary-fixed-dim/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">

            {/* Left: copy */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-highest rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-primary-fixed-dim" />
                <span className="text-xs font-heading font-bold uppercase tracking-widest text-on-surface-variant">
                  Para empreiteiros que querem crescer
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-on-surface leading-tight">
                Você sabe fazer o orçamento.{" "}
                <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
                  Mas ganhou dinheiro na obra?
                </span>
              </h1>

              <p className="mt-6 text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-xl mx-auto md:mx-0">
                ObraPro registra cada gasto, acompanha cada etapa e mostra em tempo real se a obra está no lucro ou no prejuízo.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white font-heading font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
                >
                  Começar de graça
                  <Icon name="arrow_forward" size={20} />
                </Link>
                <Link
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-surface-container-high text-on-surface font-heading font-semibold text-lg hover:bg-surface-container-highest transition-colors"
                >
                  Ver como funciona
                </Link>
              </div>
            </div>

            {/* Right: mock — controle de obra, não calculadora */}
            <div className="flex-1 w-full max-w-md">
              <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-2xl shadow-on-surface/10 border border-outline-variant/30">

                {/* Header da obra */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                      <Icon name="layers" size={20} className="text-on-surface-variant" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-on-surface text-sm">Reforma Silva</h3>
                      <p className="text-xs text-on-surface-variant">Em andamento</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-primary-container/30 text-primary rounded-full text-[10px] font-heading font-bold uppercase tracking-wide">
                    Em Andamento
                  </span>
                </div>

                {/* Progresso */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
                    <span className="font-heading font-medium">Progresso das etapas</span>
                    <span className="font-heading font-bold text-on-surface">3 / 4</span>
                  </div>
                  <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-primary to-primary-container rounded-full" />
                  </div>
                </div>

                {/* Financeiro: estimado vs real */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-surface-container-low rounded-2xl">
                    <p className="text-[10px] text-on-surface-variant font-heading uppercase tracking-wider mb-1">Estimado</p>
                    <p className="text-lg font-heading font-bold text-on-surface">R$ 10.140</p>
                  </div>
                  <div className="p-3 bg-error-container/40 rounded-2xl">
                    <p className="text-[10px] text-on-error-container font-heading uppercase tracking-wider mb-1">Gasto real</p>
                    <p className="text-lg font-heading font-bold text-error">R$ 11.850</p>
                  </div>
                </div>

                {/* Alerta de estouro */}
                <div className="flex items-center gap-2.5 p-3 bg-error-container/30 rounded-2xl">
                  <Icon name="warning" size={18} className="text-error shrink-0" />
                  <p className="text-xs text-on-error-container font-heading font-medium">
                    Obra <strong>R$ 1.710 acima</strong> do orçamento. Revise os gastos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DOR ──────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-inverse-surface">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <p className="text-on-primary/60 font-heading text-sm uppercase tracking-widest mb-6">Isso acontece com você?</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: "help", text: "Terminou a obra e não sabe se lucrou ou perdeu dinheiro" },
              { icon: "receipt_long", text: "Os gastos saem no WhatsApp, num papel ou na sua cabeça" },
              { icon: "sentiment_dissatisfied", text: "O cliente pede atualização e você não tem nada para mostrar" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl text-left">
                <Icon name={item.icon} size={20} className="text-on-primary/40 shrink-0 mt-0.5" />
                <p className="text-on-primary/70 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-on-primary/50 text-sm">
            Se você respondeu sim para algum desses — o ObraPro foi feito pra você.
          </p>
        </div>
      </section>

      {/* ── COMO FUNCIONA ─────────────────────────────────────────────────── */}
      <section id="como-funciona" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-on-surface">
              Simples de usar. Poderoso no controle.
            </h2>
            <p className="mt-4 text-lg text-on-surface-variant max-w-2xl mx-auto">
              Do orçamento ao fim da obra em três passos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* linha conectora desktop */}
            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent" />

            {[
              {
                step: "01",
                icon: "edit_note",
                iconBg: "bg-primary-fixed/20",
                iconColor: "text-primary",
                title: "Crie o orçamento",
                desc: "Adicione os serviços, ambientes e m². O ObraPro calcula mão de obra, material e prazo com a sua tabela de preços.",
              },
              {
                step: "02",
                icon: "checklist",
                iconBg: "bg-secondary-container/30",
                iconColor: "text-secondary",
                title: "Acompanhe as etapas",
                desc: "Marque cada etapa como pendente, em andamento ou concluída. Veja o progresso real da obra a qualquer momento.",
              },
              {
                step: "03",
                icon: "account_balance_wallet",
                iconBg: "bg-primary-container/30",
                iconColor: "text-primary",
                title: "Registre os gastos reais",
                desc: "Cada compra, cada diária extra — tudo registrado. Veja na hora se a obra ainda está no lucro ou cruzou a linha.",
              },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-start">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl ${item.iconBg} flex items-center justify-center`}>
                    <Icon name={item.icon} size={30} className={item.iconColor} />
                  </div>
                  <span className="text-4xl font-heading font-bold text-outline-variant/40">{item.step}</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-on-surface mb-3">{item.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ──────────────────────────────────────────────── */}
      <section id="funcionalidades" className="py-20 md:py-28 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-on-surface">
              Tudo que você precisa, nada que não precisa
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: "monitoring",
                iconBg: "bg-primary-fixed/20",
                iconColor: "text-primary",
                title: "Controle financeiro",
                desc: "Estimado vs real em tempo real. Você sabe imediatamente quando a obra vai estourar o orçamento.",
              },
              {
                icon: "checklist_rtl",
                iconBg: "bg-secondary-container/30",
                iconColor: "text-secondary",
                title: "Gestão de etapas",
                desc: "Divida a obra em etapas e atualize o status de cada uma. O progresso aparece em barra visual.",
              },
              {
                icon: "picture_as_pdf",
                iconBg: "bg-primary-container/30",
                iconColor: "text-primary",
                title: "PDF profissional",
                desc: "Gere um orçamento em PDF para apresentar ao cliente. Passa credibilidade antes mesmo de começar.",
              },
              {
                icon: "tune",
                iconBg: "bg-surface-container-highest",
                iconColor: "text-on-surface-variant",
                title: "Sua tabela de preços",
                desc: "Configure os seus valores de mão de obra e material. Os cálculos refletem a realidade do seu negócio.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-surface-container-lowest rounded-3xl p-7 hover:shadow-xl hover:shadow-on-surface/5 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center mb-5`}>
                  <Icon name={f.icon} size={24} className={f.iconColor} />
                </div>
                <h3 className="text-base font-heading font-bold text-on-surface mb-2">{f.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREÇOS ───────────────────────────────────────────────────────── */}
      <section id="precos" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-on-surface">
              Comece de graça. Pague quando precisar de mais.
            </h2>
            <p className="mt-4 text-lg text-on-surface-variant max-w-xl mx-auto">
              Sem contrato, sem pegadinha. Cancele quando quiser.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 border-2 border-outline-variant/30">
              <div className="mb-6">
                <h3 className="text-2xl font-heading font-bold text-on-surface">Free</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-heading font-bold text-on-surface">R$0</span>
                  <span className="text-on-surface-variant">/mês</span>
                </div>
                <p className="text-sm text-on-surface-variant mt-1">Para testar e ver se funciona pra você</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Até 3 obras completas",
                  "Controle de etapas e gastos",
                  "Calculadora com sua tabela de preços",
                  "Exportação em PDF",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <Icon name="check_circle" size={18} className="text-primary shrink-0" />
                    <span className="text-sm text-on-surface">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full py-3.5 rounded-2xl bg-surface-container-high text-center font-heading font-semibold text-on-surface hover:bg-surface-container-highest transition-colors"
              >
                Criar conta grátis
              </Link>
            </div>

            {/* Pro */}
            <div className="relative bg-surface-container-lowest rounded-3xl p-8 border-2 border-primary">
              <div className="absolute -top-3 right-6 px-3 py-1 bg-primary-container text-primary-fixed text-xs font-heading font-bold rounded-full">
                Mais popular
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-heading font-bold text-on-surface">Pro</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-heading font-bold text-primary">R$39</span>
                  <span className="text-on-surface-variant">/mês</span>
                </div>
                <p className="text-sm text-on-surface-variant mt-1">Para quem tem mais de 3 obras rodando</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Obras ilimitadas",
                  "Tudo do plano Free",
                  "Histórico completo de obras",
                  "Suporte prioritário",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <Icon name="check_circle" size={18} className="text-primary shrink-0" />
                    <span className="text-sm text-on-surface">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white font-heading font-bold hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <Icon name="rocket_launch" size={18} />
                Começar agora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="py-12 bg-inverse-surface">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
                <Icon name="architecture" size={18} className="text-primary-fixed" />
              </div>
              <span className="font-heading font-bold text-on-primary">ObraPro</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-on-primary/70 hover:text-on-primary text-sm transition-colors">Login</Link>
              <Link href="#" className="text-on-primary/70 hover:text-on-primary text-sm transition-colors">Termos de Uso</Link>
              <Link href="#" className="text-on-primary/70 hover:text-on-primary text-sm transition-colors">Privacidade</Link>
            </div>
            <p className="text-on-primary/50 text-sm">© 2025 ObraPro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
