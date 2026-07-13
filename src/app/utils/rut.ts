/* ══════════════════════════════════════════════════
   RUT Chileno — Algoritmo oficial módulo 11
   Fuente: SII Chile / Registro Civil e Identificación

   Estructura: XXXXXXXX-D
   • Cuerpo: 7–8 dígitos  (1.000.000 – 99.999.999)
   • Dígito verificador: 0–9 o K

   Algoritmo módulo 11:
   1. Separar cuerpo sin DV
   2. Invertir dígitos del cuerpo
   3. Multiplicar por serie [2,3,4,5,6,7] en ciclo
   4. Sumar productos
   5. DV = 11 − (suma mod 11)
      - Si resultado = 11 → DV = "0"
      - Si resultado = 10 → DV = "K"
      - De lo contrario → DV = resultado.toString()
══════════════════════════════════════════════════ */

/** Calcula el dígito verificador para el cuerpo de un RUT. */
export function calcularDV(body: string): string {
  const clean = body.replace(/[.\-]/g, '');
  if (!clean || isNaN(Number(clean))) return '';
  const reversed = clean.split('').reverse();
  const serie    = [2, 3, 4, 5, 6, 7];
  let suma = 0;
  reversed.forEach((d, i) => { suma += parseInt(d, 10) * serie[i % 6]; });
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

/**
 * Valida un RUT chileno completo.
 * Acepta: "12.345.678-9" | "12345678-9" | "123456789"
 * Reglas:
 *  - Cuerpo numérico entre 1.000.000 y 99.999.999
 *  - DV correcto según módulo 11
 *  - Se rechaza todo RUT con cuerpo < 1.000.000 (no asignados)
 */
export function validarRut(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false;

  // Limpiar todo excepto dígitos y K/k
  const clean = rut.trim().replace(/[^0-9kK]/g, '');
  if (clean.length < 2) return false;

  const body = clean.slice(0, -1);
  const dv   = clean.slice(-1).toUpperCase();

  // Cuerpo debe ser numérico
  if (!/^\d+$/.test(body)) return false;
  const num = parseInt(body, 10);

  // Rango válido (RUTs chilenos asignados)
  if (num < 1_000_000 || num > 99_999_999) return false;

  // Verificar DV
  return calcularDV(body) === dv;
}

/** Formatea en tiempo real mientras el usuario escribe: "12.345.678-9" */
export function formatRut(value: string): string {
  const clean = value.replace(/[^0-9kK]/g, '');
  if (clean.length === 0) return '';
  if (clean.length === 1) return clean.toUpperCase();

  const body = clean.slice(0, -1);
  const dv   = clean.slice(-1).toUpperCase();

  // Agregar puntos cada 3 dígitos desde la derecha
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots}-${dv}`;
}

/** Retorna el RUT sin puntos ni guión: "123456789" */
export function limpiarRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

/** Mensaje de error estándar */
export const MSG_RUT_INVALIDO =
  'RUT inválido. Verifique que el número y dígito verificador (0–9 o K) sean correctos.';

/* ══════════════════════════════════════════════════
   VALIDACIÓN DE FECHAS
══════════════════════════════════════════════════ */

/**
 * Valida que una fecha en formato YYYY-MM-DD sea real y razonable.
 * Rechaza: años < 1900, años futuros, días/meses imposibles.
 */
export function validarFecha(fechaStr: string): { valida: boolean; error: string } {
  if (!fechaStr) return { valida: false, error: 'La fecha es obligatoria' };

  // Debe tener formato YYYY-MM-DD
  const match = fechaStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return { valida: false, error: 'Formato de fecha inválido' };

  const año = parseInt(match[1], 10);
  const mes  = parseInt(match[2], 10);
  const dia  = parseInt(match[3], 10);

  if (año < 1900 || año > new Date().getFullYear() + 1)
    return { valida: false, error: `El año ${año} no es válido (debe ser entre 1900 y ${new Date().getFullYear()})` };

  if (mes < 1 || mes > 12)
    return { valida: false, error: `El mes ${mes} no existe (debe ser entre 1 y 12)` };

  // Validar día según mes/año (respeta años bisiestos)
  const diasEnMes = new Date(año, mes, 0).getDate();
  if (dia < 1 || dia > diasEnMes)
    return { valida: false, error: `El día ${dia} no existe para el mes ${mes} del año ${año}` };

  const fecha = new Date(año, mes - 1, dia);
  if (isNaN(fecha.getTime()))
    return { valida: false, error: 'Fecha inválida' };

  return { valida: true, error: '' };
}

/**
 * Valida fecha de nacimiento con restricción de edad.
 * @param fechaStr YYYY-MM-DD
 * @param edadMin  Edad mínima requerida (0 = solo pasado)
 * @param edadMax  Edad máxima permitida (undefined = sin límite)
 */
export function validarFechaNacimiento(
  fechaStr: string,
  edadMin = 0,
  edadMax?: number,
): string {
  const { valida, error } = validarFecha(fechaStr);
  if (!valida) return error;

  const nac = new Date(fechaStr);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (nac >= hoy) return 'La fecha de nacimiento debe ser anterior a hoy';

  // Calcular edad exacta
  let edad = hoy.getFullYear() - nac.getFullYear();
  const cumpleEsteAño = new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate());
  if (hoy < cumpleEsteAño) edad--;

  if (edad < edadMin)
    return `Debe tener al menos ${edadMin} años (edad actual: ${edad})`;
  if (edadMax !== undefined && edad >= edadMax)
    return `Debe tener menos de ${edadMax} años (edad actual: ${edad})`;

  return ''; // Sin error
}

/** Calcula la edad en años a partir de una fecha YYYY-MM-DD */
export function calcularEdad(fechaStr: string): number | null {
  const { valida } = validarFecha(fechaStr);
  if (!valida) return null;
  const nac = new Date(fechaStr);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  if (hoy < new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate())) edad--;
  return edad;
}

/** Retorna hoy en formato YYYY-MM-DD */
export function hoyISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** Retorna una fecha N años atrás en formato YYYY-MM-DD */
export function fechaHaceAños(años: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - años);
  return d.toISOString().split('T')[0];
}
