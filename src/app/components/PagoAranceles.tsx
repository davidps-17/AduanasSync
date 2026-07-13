import { useState } from 'react';
import { CreditCard, Search, CheckCircle2, AlertCircle, FileText, Banknote, Smartphone, Building } from 'lucide-react';
import { PageLayout, IndicadorPasos } from './ui/PageLayout';
import { Campo, FInput, NavBtns, InfoBox, Confirmacion } from './ui/FormFields';

const PASOS = [
  { id: 1, label: 'Buscar Deuda',   icon: <Search className="w-4 h-4" /> },
  { id: 2, label: 'Detalle',        icon: <FileText className="w-4 h-4" /> },
  { id: 3, label: 'Pago',           icon: <CreditCard className="w-4 h-4" /> },
  { id: 4, label: 'Confirmación',   icon: <CheckCircle2 className="w-4 h-4" /> },
];

const MOCK_DEUDAS: Record<string, { folio: string; tipo: string; mercancia: string; valorCIF: number; advalorem: number; iva: number; otros: number }> = {
  'IMP-2026-00431': { folio: 'IMP-2026-00431', tipo: 'Importación', mercancia: 'Maquinaria industrial — Partida 84.79', valorCIF: 48500, advalorem: 2910, iva: 9747, otros: 150 },
  'IMP-2026-00382': { folio: 'IMP-2026-00382', tipo: 'Importación', mercancia: 'Equipos electrónicos — Partida 85.71', valorCIF: 12400, advalorem: 744, iva: 2493, otros: 80 },
  'EXP-2026-00187': { folio: 'EXP-2026-00187', tipo: 'Exportación', mercancia: 'Productos vitivinícolas — Partida 22.04', valorCIF: 0, advalorem: 0, iva: 0, otros: 45 },
};

type MetodoPago = 'tarjeta' | 'transferencia' | 'webpay' | null;

interface Props { rut: string; onVolver: () => void }

export function PagoAranceles({ rut, onVolver }: Props) {
  const [paso, setPaso] = useState(1);
  const [folio, setFolio] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [deuda, setDeuda] = useState<typeof MOCK_DEUDAS[string] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [metodo, setMetodo] = useState<MetodoPago>(null);
  const [nroTarjeta, setNroTarjeta] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [titular, setTitular] = useState('');
  const [nroPago, setNroPago] = useState('');

  const buscar = () => {
    const key = busqueda.trim().toUpperCase();
    const found = MOCK_DEUDAS[key];
    if (found) { setDeuda(found); setNotFound(false); setPaso(2); }
    else { setDeuda(null); setNotFound(true); }
  };

  const total = deuda ? deuda.advalorem + deuda.iva + deuda.otros : 0;

  const pagar = () => {
    const f = `PAG-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setFolio(f);
    setPaso(4);
  };

  const formatCard = (v: string) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const formatExp  = (v: string) => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').slice(0, 5);

  return (
    <PageLayout titulo="Pago de Impuestos y Aranceles" subtitulo="Derechos ad valorem, IVA y otros gravámenes" rut={rut} onVolver={onVolver}>
      {paso < 4 && <IndicadorPasos pasos={PASOS} actual={paso} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {paso < 4 && <div className="mb-6"><h2 className="text-gray-800 font-bold">{PASOS[paso - 1].label}</h2><p className="text-xs text-gray-400">Paso {paso} de {PASOS.length}</p></div>}

        {/* PASO 1 — Buscar */}
        {paso === 1 && (
          <div className="space-y-5">
            <Campo label="Número de Declaración / Folio" required>
              <div className="flex gap-2">
                <FInput value={busqueda} onChange={e => setBusqueda(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && buscar()} placeholder="Ej: IMP-2026-00431" className="font-mono" />
                <button onClick={buscar} className="bg-[#1a5276] text-white px-5 rounded-lg text-sm font-medium hover:bg-[#143d5a] transition-colors flex items-center gap-2 flex-shrink-0">
                  <Search className="w-4 h-4" /> Consultar
                </button>
              </div>
            </Campo>

            {notFound && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                No se encontró deuda para el folio <strong className="font-mono ml-1">{busqueda}</strong>
              </div>
            )}

            <div className="border border-gray-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Ejemplos de consulta</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(MOCK_DEUDAS).map(k => (
                  <button key={k} onClick={() => setBusqueda(k)} className="font-mono text-xs text-[#1a5276] bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 hover:bg-blue-100 transition-colors">{k}</button>
                ))}
              </div>
            </div>

            <InfoBox color="amber">
              Puede consultar el estado de deuda de declaraciones de importación (IMP), exportación (EXP) y manifiestos. Si tiene deuda vencida, puede solicitar un plan de pago en cuotas.
            </InfoBox>
          </div>
        )}

        {/* PASO 2 — Detalle */}
        {paso === 2 && deuda && (
          <div className="space-y-5">
            <div className="bg-[#1a5276]/5 border border-[#1a5276]/20 rounded-xl p-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Declaración</p>
              <p className="font-mono font-bold text-[#1a5276]">{deuda.folio}</p>
              <p className="text-xs text-gray-500 mt-1">{deuda.mercancia}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm py-2.5 border-b border-gray-100">
                <span className="text-gray-600">Valor CIF base</span>
                <span className="font-medium text-gray-700">USD {deuda.valorCIF.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between text-sm py-2.5 border-b border-gray-100">
                <span className="text-gray-600">Derechos ad valorem (6%)</span>
                <span className="font-medium text-gray-700">$ {deuda.advalorem.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-sm py-2.5 border-b border-gray-100">
                <span className="text-gray-600">IVA (19%)</span>
                <span className="font-medium text-gray-700">$ {deuda.iva.toLocaleString('es-CL')}</span>
              </div>
              {deuda.otros > 0 && (
                <div className="flex justify-between text-sm py-2.5 border-b border-gray-100">
                  <span className="text-gray-600">Tasas y servicios</span>
                  <span className="font-medium text-gray-700">$ {deuda.otros.toLocaleString('es-CL')}</span>
                </div>
              )}
              <div className="flex justify-between py-3 bg-[#1a5276] text-white rounded-xl px-4 mt-2">
                <span className="font-semibold">Total a pagar</span>
                <span className="font-bold text-lg">$ {total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <NavBtns onBack={() => setPaso(1)} onNext={() => setPaso(3)} nextLabel="Proceder al pago" />
          </div>
        )}

        {/* PASO 3 — Método de pago */}
        {paso === 3 && (
          <div className="space-y-5">
            <p className="text-sm font-semibold text-gray-700">Total a pagar: <span className="text-[#1a5276]">$ {total.toLocaleString('es-CL')}</span></p>

            {/* Selector método */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'webpay' as MetodoPago,       label: 'Webpay Plus',        icon: <Smartphone className="w-5 h-5" />, sub: 'Débito / Crédito' },
                { id: 'tarjeta' as MetodoPago,      label: 'Tarjeta Manual',     icon: <CreditCard className="w-5 h-5" />, sub: 'Visa / Mastercard' },
                { id: 'transferencia' as MetodoPago,label: 'Transferencia',      icon: <Building className="w-5 h-5" />,   sub: 'Banco a banco' },
              ].map(m => (
                <button key={m.id} onClick={() => setMetodo(m.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${metodo === m.id ? 'border-[#1a5276] bg-[#1a5276]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metodo === m.id ? 'bg-[#1a5276] text-white' : 'bg-gray-100 text-gray-500'}`}>{m.icon}</div>
                  <p className="text-xs font-semibold text-gray-700">{m.label}</p>
                  <p className="text-[10px] text-gray-400">{m.sub}</p>
                </button>
              ))}
            </div>

            {/* Formulario tarjeta manual */}
            {metodo === 'tarjeta' && (
              <div className="space-y-4 pt-2">
                <Campo label="Número de tarjeta" required>
                  <FInput value={nroTarjeta} onChange={e => setNroTarjeta(formatCard(e.target.value))} placeholder="0000 0000 0000 0000" className="font-mono" maxLength={19} />
                </Campo>
                <Campo label="Titular">
                  <FInput value={titular} onChange={e => setTitular(e.target.value.toUpperCase())} placeholder="NOMBRE APELLIDO" />
                </Campo>
                <div className="grid grid-cols-2 gap-4">
                  <Campo label="Vencimiento"><FInput value={vencimiento} onChange={e => setVencimiento(formatExp(e.target.value))} placeholder="MM/AA" maxLength={5} /></Campo>
                  <Campo label="CVV"><FInput value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="000" type="password" maxLength={4} /></Campo>
                </div>
              </div>
            )}

            {/* Transferencia */}
            {metodo === 'transferencia' && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-600 mb-3">Datos para transferencia</p>
                {[['Banco', 'Banco Estado'], ['Tipo de cuenta', 'Cuenta Corriente'], ['N° Cuenta', '00-000-12345-6'], ['RUT Beneficiario', '61.704.000-8'], ['Nombre', 'Servicio Nacional de Aduanas'], ['Asunto', deuda?.folio ?? '']].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs"><span className="text-gray-400">{k}</span><span className="font-medium text-gray-700">{v}</span></div>
                ))}
                <div className="pt-3">
                  <Campo label="N° de operación bancaria" required>
                    <FInput value={nroPago} onChange={e => setNroPago(e.target.value)} placeholder="Número de comprobante de transferencia" />
                  </Campo>
                </div>
              </div>
            )}

            {/* Webpay */}
            {metodo === 'webpay' && (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-14 h-14 rounded-2xl bg-[#1a5276] flex items-center justify-center mx-auto mb-3">
                  <Banknote className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Redirección a Webpay Plus</p>
                <p className="text-xs text-gray-400 mb-4">Será redirigido al portal de pago seguro Transbank</p>
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs rounded-full px-4 py-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Conexión SSL segura
                </div>
              </div>
            )}

            <NavBtns onBack={() => setPaso(2)} onNext={pagar} nextLabel="Confirmar pago" disabled={!metodo} />
          </div>
        )}

        {paso === 4 && (
          <Confirmacion folio={folio} tipo="Pago de Aranceles" pasos={['El pago quedará registrado en su expediente aduanero.', 'Recibirá el comprobante de pago en su correo registrado.', 'Puede retirar su mercancía presentando este comprobante.']} onVolver={onVolver} />
        )}
      </div>
    </PageLayout>
  );
}
