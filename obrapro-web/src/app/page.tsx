import Link from "next/link";

export default function Home() {
  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">architecture</span>
          <span className="text-xl font-extrabold text-on-surface font-headline tracking-tight">ObraPro</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a className="font-headline font-semibold text-sm text-primary transition-colors" href="#">Produto</a>
          <a className="font-headline font-semibold text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Funcionalidades</a>
          <a className="font-headline font-semibold text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Preços</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-sm font-semibold text-secondary px-4 py-2">Login</Link>
          <Link href="/register" className="bg-primary-container text-on-primary px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-fixed transition-colors">
            Começar Agora
          </Link>
        </div>
      </nav>

      <main className="pt-24">
        <section className="relative px-6 pt-16 pb-24 overflow-hidden md:pt-32 md:pb-40">
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-highest rounded-full">
                  <span className="w-2 h-2 rounded-full bg-primary-fixed-dim"></span>
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">O Futuro dos Orçamentos</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold font-headline leading-[1.1] tracking-tight text-on-surface">
                  Chega de adivinhar. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Orçamentos profissionais.</span>
                </h1>
                <p className="text-lg md:text-xl text-on-surface-variant max-w-lg leading-relaxed font-body">
                  O ObraPro ajuda a criar estimativas de construção precisas em segundos, não em horas. Construído para arquitetos e empreiteiros que exigem precisão.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register" className="px-8 py-4 bg-primary-container text-on-primary rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary-fixed transition-all group">
                    Teste Grátis
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-6 md:p-8 relative z-20 border border-outline-variant/10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-container/10 rounded-lg">
                        <span className="material-symbols-outlined text-primary-container">analytics</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-on-surface">Estimativa de Projeto</div>
                        <div className="text-xs text-on-surface-variant">Moradia Moderna A-12</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-4 bg-surface-container-low rounded-full w-3/4"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-surface-container rounded-xl">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">Mão de Obra</div>
                        <div className="text-xl font-extrabold text-on-surface">R$ 4.250</div>
                      </div>
                      <div className="p-4 bg-primary-container text-on-primary rounded-xl">
                        <div className="text-[10px] uppercase tracking-wider font-bold opacity-80 mb-1">Margem</div>
                        <div className="text-xl font-extrabold">+18.5%</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl z-0"></div>
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary-fixed-dim/20 rounded-full blur-3xl z-0"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}