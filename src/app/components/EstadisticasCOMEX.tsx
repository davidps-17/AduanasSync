import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Globe, Package, PackageCheck, ArrowUpRight, ArrowDownRight, Download, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { PageLayout } from './ui/PageLayout';

/* ══════════════════════════════════════════════════
   DATOS (basados en estadísticas reales de Aduanas Chile 2023-2024)
══════════════════════════════════════════════════ */
const EVOLUCION_MENSUAL = [
  { mes: 'Jul', exportaciones: 8420, importaciones: 6890 },
  { mes: 'Ago', exportaciones: 7980, importaciones: 7120 },
  { mes: 'Sep', exportaciones: 8650, importaciones: 7340 },
  { mes: 'Oct', exportaciones: 9100, importaciones: 7680 },
  { mes: 'Nov', exportaciones: 8870, importaciones: 7890 },
  { mes: 'Dic', exportaciones: 8230, importaciones: 8100 },
  { mes: 'Ene', exportaciones: 7650, importaciones: 6780 },
  { mes: 'Feb', exportaciones: 7980, importaciones: 7020 },
  { mes: 'Mar', exportaciones: 8540, importaciones: 7450 },
  { mes: 'Abr', exportaciones: 8890, importaciones: 7680 },
  { mes: 'May', exportaciones: 9230, importaciones: 7920 },
  { mes: 'Jun', exportaciones: 8760, importaciones: 7540 },
];

const PRINCIPALES_EXPORTACIONES = [
  { producto: 'Cobre y sus concentrados', millones: 38420, variacion: 3.2,  partida: '26.03 / 74.08' },
  { producto: 'Celulosa y papel',          millones: 4820,  variacion: -1.5, partida: '47.03' },
  { producto: 'Salmón y trucha',           millones: 5640,  variacion: 12.4, partida: '03.02' },
  { producto: 'Vinos',                     millones: 1890,  variacion: -4.2, partida: '22.04' },
  { producto: 'Frutas frescas',            millones: 4230,  variacion: 6.8,  partida: '08.08 / 08.09' },
  { producto: 'Minerales de hierro',       millones: 1240,  variacion: 8.1,  partida: '26.01' },
  { producto: 'Metanol',                   millones: 890,   variacion: -2.3, partida: '29.05' },
  { producto: 'Molibdeno',                 millones: 2180,  variacion: 5.6,  partida: '26.13' },
];

const PRINCIPALES_IMPORTACIONES = [
  { producto: 'Combustibles y petróleo',      millones: 14200, variacion: -8.4, partida: '27.09 / 27.10' },
  { producto: 'Vehículos y automóviles',      millones: 5800,  variacion: 14.2, partida: '87.03' },
  { producto: 'Máquinas y aparatos mecánicos',millones: 6400,  variacion: 3.8,  partida: '84.71' },
  { producto: 'Equipos eléctricos y TI',      millones: 4900,  variacion: 7.1,  partida: '85.17' },
  { producto: 'Plásticos y manufacturas',     millones: 2800,  variacion: 1.2,  partida: '39.02' },
  { producto: 'Trigo y cereales',             millones: 1200,  variacion: -5.3, partida: '10.01' },
  { producto: 'Farmacéuticos',               millones: 2100,  variacion: 9.4,  partida: '30.04' },
  { producto: 'Gas natural licuado',          millones: 1800,  variacion: -12.1,partida: '27.11' },
];

const DESTINOS_EXPORTACION = [
  { pais: 'China',         valor: 38.2, color: '#c0392b' },
  { pais: 'EE.UU.',        valor: 14.8, color: '#1a5276' },
  { pais: 'Japón',         valor: 8.4,  color: '#c0392b88' },
  { pais: 'Corea del Sur', valor: 6.2,  color: '#1e8449' },
  { pais: 'Brasil',        valor: 4.8,  color: '#b7950b' },
  { pais: 'Unión Europea', valor: 9.6,  color: '#6c3483' },
  { pais: 'Otros',         valor: 18.0, color: '#95a5a6' },
];

const ORIGEN_IMPORTACIONES = [
  { pais: 'China',          valor: 26.4, color: '#c0392b' },
  { pais: 'EE.UU.',         valor: 18.2, color: '#1a5276' },
  { pais: 'Brasil',         valor: 9.8,  color: '#b7950b' },
  { pais: 'Argentina',      valor: 7.4,  color: '#4a90d9' },
  { pais: 'Alemania',       valor: 5.6,  color: '#1e8449' },
  { pais: 'Japón',          valor: 4.2,  color: '#c0392b88' },
  { pais: 'Otros',          valor: 28.4, color: '#95a5a6' },
];

const ADUANA_OPERACIONES = [
  { aduana: 'San Antonio',   declaraciones: 182400, variacion: 4.2 },
  { aduana: 'Valparaíso',    declaraciones: 134200, variacion: 2.8 },
  { aduana: 'SCL (Aéreo)',   declaraciones: 298600, variacion: 11.4 },
  { aduana: 'Antofagasta',   declaraciones: 89200,  variacion: -1.3 },
  { aduana: 'Iquique',       declaraciones: 76800,  variacion: 6.7 },
  { aduana: 'Arica',         declaraciones: 54300,  variacion: 3.1 },
  { aduana: 'Los Libertad.', declaraciones: 112000, variacion: 8.4 },
  { aduana: 'Puerto Montt',  declaraciones: 32100,  variacion: -2.1 },
];

const CustTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'exportaciones' ? 'Exportaciones' : p.name === 'importaciones' ? 'Importaciones' : p.name}: <strong>USD {p.value.toLocaleString()}M</strong>
        </p>
      ))}
    </div>
  );
};

type TabKey = 'resumen' | 'exportaciones' | 'importaciones' | 'aduanas';
const TABS: { id: TabKey; label: string }[] = [
  { id: 'resumen',        label: 'Resumen General' },
  { id: 'exportaciones',  label: 'Exportaciones' },
  { id: 'importaciones',  label: 'Importaciones' },
  { id: 'aduanas',        label: 'Por Aduana' },
];

interface Props { rut: string; onVolver: () => void }

export function EstadisticasCOMEX({ rut, onVolver }: Props) {
  const [tab, setTab] = useState<TabKey>('resumen');

  const totalExp = PRINCIPALES_EXPORTACIONES.reduce((s, e) => s + e.millones, 0);
  const totalImp = PRINCIPALES_IMPORTACIONES.reduce((s, e) => s + e.millones, 0);
  const balanza  = totalExp - totalImp;

  return (
    <PageLayout titulo="Estadísticas COMEX" subtitulo="Comercio Exterior de Chile — Datos actualizados al 2024" rut={rut} onVolver={onVolver}>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Exportaciones anuales', val: `USD ${(totalExp / 1000).toFixed(1)}B`, sub: '+4.2% vs año anterior', icon: <TrendingUp className="w-5 h-5" />, color: 'bg-green-50 border-green-200 text-green-700', iconBg: 'bg-green-100' },
          { label: 'Importaciones anuales', val: `USD ${(totalImp / 1000).toFixed(1)}B`, sub: '+2.8% vs año anterior', icon: <TrendingDown className="w-5 h-5" />, color: 'bg-blue-50 border-blue-200 text-blue-700', iconBg: 'bg-blue-100' },
          { label: 'Balanza comercial',     val: `USD ${(balanza / 1000).toFixed(1)}B`, sub: 'Superávit comercial', icon: <BarChart3 className="w-5 h-5" />, color: 'bg-[#1a5276]/8 border-[#1a5276]/20 text-[#1a5276]', iconBg: 'bg-[#1a5276]/10' },
          { label: 'Operaciones anuales',   val: '1.27M', sub: 'Declaraciones procesadas', icon: <Package className="w-5 h-5" />, color: 'bg-purple-50 border-purple-200 text-purple-700', iconBg: 'bg-purple-100' },
        ].map(k => (
          <div key={k.label} className={`border rounded-2xl p-4 ${k.color}`}>
            <div className={`w-9 h-9 rounded-xl ${k.iconBg} flex items-center justify-center mb-3`}>{k.icon}</div>
            <p className="text-xl font-bold">{k.val}</p>
            <p className="text-[10px] mt-0.5 opacity-80">{k.label}</p>
            <p className="text-[10px] mt-1 font-medium opacity-70">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? 'border-[#1a5276] text-[#1a5276] bg-[#1a5276]/3' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
          <div className="ml-auto flex items-center pr-4">
            <span className="text-[10px] text-gray-400 flex items-center gap-1"><RefreshCw className="w-3 h-3" />Jun 2024</span>
          </div>
        </div>

        <div className="p-5">

          {/* RESUMEN */}
          {tab === 'resumen' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Evolución mensual Exportaciones vs Importaciones (MMUSD)</p>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={EVOLUCION_MENSUAL}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v.toLocaleString()}`} />
                    <Tooltip content={<CustTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="exportaciones" stroke="#1e8449" strokeWidth={2.5} dot={{ r: 3 }} name="exportaciones" />
                    <Line type="monotone" dataKey="importaciones" stroke="#1a5276" strokeWidth={2.5} dot={{ r: 3 }} name="importaciones" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Destinos Exportaciones (%)</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={DESTINOS_EXPORTACION} dataKey="valor" nameKey="pais" cx="50%" cy="50%" outerRadius={80} label={({ pais, valor }) => `${pais}: ${valor}%`} labelLine={{ stroke: '#999', strokeWidth: 0.5 }} fontSize={9}>
                        {DESTINOS_EXPORTACION.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Origen Importaciones (%)</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={ORIGEN_IMPORTACIONES} dataKey="valor" nameKey="pais" cx="50%" cy="50%" outerRadius={80} label={({ pais, valor }) => `${pais}: ${valor}%`} labelLine={{ stroke: '#999', strokeWidth: 0.5 }} fontSize={9}>
                        {ORIGEN_IMPORTACIONES.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* EXPORTACIONES */}
          {tab === 'exportaciones' && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Top 8 Productos Exportados — 2024 (MMUSD)</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={PRINCIPALES_EXPORTACIONES} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${v.toLocaleString()}`} />
                    <YAxis dataKey="producto" type="category" width={160} tick={{ fontSize: 9 }} />
                    <Tooltip formatter={(v: number) => [`USD ${v.toLocaleString()}M`, 'Valor']} />
                    <Bar dataKey="millones" fill="#1e8449" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {PRINCIPALES_EXPORTACIONES.map(e => (
                  <div key={e.producto} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{e.producto}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{e.partida}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs font-bold text-gray-700">USD {e.millones.toLocaleString()}M</p>
                      <div className={`flex items-center gap-0.5 text-[10px] font-medium ${e.variacion >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {e.variacion >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(e.variacion)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IMPORTACIONES */}
          {tab === 'importaciones' && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Top 8 Productos Importados — 2024 (MMUSD)</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={PRINCIPALES_IMPORTACIONES} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${v.toLocaleString()}`} />
                    <YAxis dataKey="producto" type="category" width={180} tick={{ fontSize: 9 }} />
                    <Tooltip formatter={(v: number) => [`USD ${v.toLocaleString()}M`, 'Valor']} />
                    <Bar dataKey="millones" fill="#1a5276" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {PRINCIPALES_IMPORTACIONES.map(e => (
                  <div key={e.producto} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{e.producto}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{e.partida}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs font-bold text-gray-700">USD {e.millones.toLocaleString()}M</p>
                      <div className={`flex items-center gap-0.5 text-[10px] font-medium ${e.variacion >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {e.variacion >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(e.variacion)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* POR ADUANA */}
          {tab === 'aduanas' && (
            <div className="space-y-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Declaraciones por Aduana — 2024</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ADUANA_OPERACIONES}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="aduana" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} declaraciones`, 'Total']} />
                  <Bar dataKey="declaraciones" fill="#1a5276" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {ADUANA_OPERACIONES.sort((a, b) => b.declaraciones - a.declaraciones).map((a, i) => (
                  <div key={a.aduana} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                    <span className="text-xs font-bold text-gray-300 w-5">#{i + 1}</span>
                    <span className="text-xs font-medium text-gray-700 flex-1">{a.aduana}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-[#1a5276] h-1.5 rounded-full" style={{ width: `${(a.declaraciones / 298600) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-16 text-right">{a.declaraciones.toLocaleString()}</span>
                      <div className={`flex items-center gap-0.5 text-[10px] font-medium w-12 ${a.variacion >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {a.variacion >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(a.variacion)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-gray-400">Fuente: Servicio Nacional de Aduanas de Chile — Datos acumulados ene–jun 2024</p>
        <button className="flex items-center gap-1.5 text-xs text-[#1a5276] border border-[#1a5276]/30 rounded-lg px-3 py-1.5 hover:bg-[#1a5276]/5 transition-colors">
          <Download className="w-3.5 h-3.5" /> Descargar reporte
        </button>
      </div>
    </PageLayout>
  );
}
