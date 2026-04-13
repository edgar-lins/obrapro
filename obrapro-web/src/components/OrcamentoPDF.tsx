import { CalculationResult, isFloorResult, isPaintResult } from "@/types/calculate"

type EnvironmentItem = {
  id: string
  serviceType: "piso" | "pintura"
  area: string
  environment: string
  floorType: string
  removeOldFloor: boolean
  paintType: string
  coats: number
  includeMassaCorrida: boolean
  includeFundo: boolean
  result?: CalculationResult
}

const paintTypeLabel: Record<string, string> = {
  acrilica: "Acrílica",
  latex: "Látex",
  esmalte: "Esmalte",
}

type Props = {
  environments: EnvironmentItem[]
  clientName: string
  clientPhone: string
  clientAddress: string
  totalLabor: number
  totalMaterial: number
  totalCost: number
  totalDays: number
}

const floorTypeLabel: Record<string, string> = {
  porcelanato: "Porcelanato",
  ceramica: "Cerâmica",
  vinilico: "Vinílico",
  outro: "Outro",
}

const environmentLabel: Record<string, string> = {
  sala: "Sala",
  cozinha: "Cozinha",
  banheiro: "Casa de Banho",
  externo: "Exterior",
}

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

export default function OrcamentoPDF({
  environments,
  clientName,
  clientPhone,
  clientAddress,
  totalLabor,
  totalMaterial,
  totalCost,
  totalDays,
}: Props) {
  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="pdf-doc hidden print:block font-body text-on-surface bg-white">

      {/* Cabeçalho */}
      <header className="flex justify-between items-start pb-6 mb-8 border-b-2 border-on-surface">
        <div>
          <p className="text-2xl font-headline font-extrabold tracking-tight text-primary">ObraPro</p>
          <p className="text-xs text-on-surface-variant mt-0.5">Gestão profissional de obras</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Data de Emissão</p>
          <p className="text-sm font-semibold text-on-surface mt-0.5">{today}</p>
        </div>
      </header>

      {/* Título */}
      <div className="mb-8">
        <h1 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight">Proposta de Orçamento</h1>
        <p className="text-sm text-on-surface-variant mt-1">Estimativa detalhada de serviços e materiais</p>
      </div>

      {/* Dados do Cliente */}
      {(clientName || clientPhone || clientAddress) && (
        <div className="mb-8 p-5 border border-outline-variant rounded-xl">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">Dados do Cliente</h2>
          <div className="grid grid-cols-2 gap-4">
            {clientName && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold block mb-0.5">Nome</span>
                <span className="text-sm font-semibold text-on-surface">{clientName}</span>
              </div>
            )}
            {clientPhone && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold block mb-0.5">Telefone</span>
                <span className="text-sm font-semibold text-on-surface">{clientPhone}</span>
              </div>
            )}
            {clientAddress && (
              <div className="col-span-2">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold block mb-0.5">Endereço da Obra</span>
                <span className="text-sm font-semibold text-on-surface">{clientAddress}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabela de Serviços */}
      <div className="mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">Serviços</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-on-surface">
              <th className="text-left py-2 text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Descrição</th>
              <th className="text-center py-2 text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Ambiente</th>
              <th className="text-right py-2 text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Área</th>
              <th className="text-right py-2 text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Mão de Obra</th>
              <th className="text-right py-2 text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Material</th>
              <th className="text-right py-2 text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {environments.filter(e => e.result).map((env) => (
              <tr key={env.id} className="border-b border-outline-variant/40">
                <td className="py-3 font-medium text-on-surface">
                  {env.serviceType === "pintura"
                    ? <>Pintura {paintTypeLabel[env.paintType] || env.paintType} — {env.coats} {env.coats === 1 ? "demão" : "demãos"}</>
                    : <>Assentamento de {floorTypeLabel[env.floorType] || env.floorType}</>
                  }
                  {env.serviceType === "piso" && env.removeOldFloor && <span className="block text-xs text-on-surface-variant">+ Remoção de piso antigo</span>}
                  {env.serviceType === "pintura" && (env.includeMassaCorrida || env.includeFundo) && (
                    <span className="block text-xs text-on-surface-variant">
                      {[env.includeMassaCorrida && "massa corrida", env.includeFundo && "fundo preparador"].filter(Boolean).join(" + ")}
                    </span>
                  )}
                </td>
                <td className="py-3 text-center text-on-surface-variant text-xs">{environmentLabel[env.environment] || env.environment}</td>
                <td className="py-3 text-right font-semibold">{env.area} m²</td>
                <td className="py-3 text-right text-on-surface">{fmt(env.result!.labor_cost)}</td>
                <td className="py-3 text-right text-on-surface">{fmt(env.result!.material_cost)}</td>
                <td className="py-3 text-right font-bold text-on-surface">{fmt(env.result!.total_cost)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-on-surface">
              <td colSpan={3} className="pt-4 text-right text-xs font-bold uppercase tracking-widest text-on-surface-variant">Totais</td>
              <td className="pt-4 text-right font-bold">{fmt(totalLabor)}</td>
              <td className="pt-4 text-right font-bold">{fmt(totalMaterial)}</td>
              <td className="pt-4 text-right text-lg font-headline font-extrabold text-primary">{fmt(totalCost)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Materiais por Ambiente */}
      {environments.filter(e => e.result).map((env) => (
        <div key={env.id} className="mb-6 p-5 bg-surface-container-low rounded-xl">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-3">
            Materiais — {environmentLabel[env.environment] || env.environment} ({env.area} m²)
          </h2>
          {isFloorResult(env.result!) && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Revestimento</p>
                <p className="text-base font-headline font-bold">{env.result.materials.floor_m2.toFixed(1)} m²</p>
                <p className="text-[10px] text-on-surface-variant">+10% quebra</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Argamassa</p>
                <p className="text-base font-headline font-bold">{env.result.materials.mortar_bags} sacos</p>
                <p className="text-[10px] text-on-surface-variant">AC II / AC III</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Rejunte</p>
                <p className="text-base font-headline font-bold">{env.result.materials.grout_kg} kg</p>
                <p className="text-[10px] text-on-surface-variant">Estimativa padrão</p>
              </div>
            </div>
          )}
          {isPaintResult(env.result!) && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Tinta</p>
                <p className="text-base font-headline font-bold">{env.result.paint_materials.paint_liters.toFixed(1)} L</p>
                <p className="text-[10px] text-on-surface-variant">{env.coats} demão(s)</p>
              </div>
              {env.result.paint_materials.massa_corrida_kg > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Massa Corrida</p>
                  <p className="text-base font-headline font-bold">{env.result.paint_materials.massa_corrida_kg.toFixed(1)} kg</p>
                  <p className="text-[10px] text-on-surface-variant">0,5 kg/m²</p>
                </div>
              )}
              {env.result.paint_materials.fundo_liters > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Fundo Preparador</p>
                  <p className="text-base font-headline font-bold">{env.result.paint_materials.fundo_liters.toFixed(1)} L</p>
                  <p className="text-[10px] text-on-surface-variant">10 m²/L</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Prazo + Observações */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="p-4 border border-outline-variant rounded-xl">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Prazo Estimado</p>
          <p className="text-sm font-bold text-on-surface">{totalDays} {totalDays === 1 ? "dia útil" : "dias úteis"}</p>
        </div>
        <div className="p-4 border border-outline-variant/50 rounded-xl">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Validade</p>
          <p className="text-sm font-bold text-on-surface">15 dias a partir da emissão</p>
        </div>
      </div>

      <div className="mb-10 p-4 border border-outline-variant/50 rounded-xl">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">Observações</p>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Os valores de material são estimados com base nos preços configurados. O prazo pode variar conforme condições do local e disponibilidade de equipa. Quaisquer alterações no escopo serão orçadas separadamente.
        </p>
      </div>

      {/* Assinaturas */}
      <div className="grid grid-cols-2 gap-16 mt-8 pt-8 border-t border-outline-variant">
        <div>
          <div className="border-b border-on-surface mb-2 h-10"></div>
          <p className="text-xs text-on-surface-variant text-center font-medium">Empreiteiro / Responsável</p>
        </div>
        <div>
          <div className="border-b border-on-surface mb-2 h-10"></div>
          <p className="text-xs text-on-surface-variant text-center font-medium">{clientName || "Cliente"}</p>
        </div>
      </div>

      {/* Rodapé */}
      <footer className="mt-12 pt-4 border-t border-outline-variant/40 text-center">
        <p className="text-[10px] text-on-surface-variant">Orçamento gerado por ObraPro · obrapro.app</p>
      </footer>
    </div>
  )
}
