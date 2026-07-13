/* ══════════════════════════════════════════════════
   Generador de documento oficial imprimible / PDF
   Incluye QR code via qrcode-generator (CDN)
══════════════════════════════════════════════════ */

export interface SeccionDoc { titulo: string; filas: [string, string][] }

export interface DatosDocumento {
  folio: string;
  titulo: string;
  subtitulo?: string;
  fechaHora: string;   // Fecha y hora de emisión formateada
  rut?: string;
  secciones: SeccionDoc[];
  notas?: string[];
  advertencia?: string;
}

/** Abre una ventana con el documento formateado y dispara impresión / guardado como PDF */
export function imprimirDeclaracion(datos: DatosDocumento): void {
  const qrData = encodeURIComponent(`ADUANASYNC|${datos.folio}|${datos.fechaHora}|${datos.rut ?? ''}`);

  const seccionHTML = (s: SeccionDoc) => `
    <div class="sec">
      <div class="sec-head">${s.titulo}</div>
      <div class="sec-body">
        ${s.filas.map(([k, v]) => `
          <div class="field">
            <span class="field-k">${k}</span>
            <span class="field-v">${v || '—'}</span>
          </div>`).join('')}
      </div>
    </div>`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${datos.folio} — ${datos.titulo}</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#111;background:#fff;padding:28px 36px;max-width:820px;margin:auto}

    /* ── Encabezado ── */
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:3px solid #1a5276;margin-bottom:18px}
    .logo{width:52px;height:52px;background:#1a5276;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:900;letter-spacing:-1px;margin-right:12px;flex-shrink:0}
    .brand{display:flex;align-items:center}
    .brand-text .name{font-size:15px;font-weight:700;color:#1a5276}
    .brand-text .sub{font-size:9px;color:#666;margin-top:2px}
    .folio-area{text-align:right}
    .folio-lbl{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.5px}
    .folio-num{font-size:22px;font-weight:700;color:#1a5276;font-family:monospace;letter-spacing:1px}
    .folio-dt{font-size:9px;color:#888;margin-top:3px}

    /* ── Título ── */
    .doc-titulo{text-align:center;font-size:13px;font-weight:700;color:#1a5276;background:#f0f6fc;border:1.5px solid #c8dff0;border-radius:8px;padding:10px;margin-bottom:16px;letter-spacing:.3px}
    .doc-sub{text-align:center;font-size:10px;color:#666;margin-bottom:16px;margin-top:-10px}

    /* ── QR + validación ── */
    .qr-row{display:flex;align-items:center;gap:16px;margin-bottom:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px}
    #qr-container svg{width:90px!important;height:90px!important}
    .qr-info{flex:1}
    .qr-info .q-title{font-size:10px;font-weight:700;color:#1a5276;margin-bottom:4px}
    .qr-info .q-sub{font-size:9px;color:#666;line-height:1.5}
    .qr-info .q-folio{font-family:monospace;font-size:11px;font-weight:700;color:#1a5276;background:#e8f0fb;border-radius:4px;padding:2px 6px;display:inline-block;margin-top:4px}

    /* ── Secciones ── */
    .sec{margin-bottom:12px;border:1px solid #e0e8f0;border-radius:8px;overflow:hidden;page-break-inside:avoid}
    .sec-head{background:#1a5276;color:#fff;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;padding:5px 12px}
    .sec-body{display:grid;grid-template-columns:1fr 1fr;padding:10px 12px;gap:6px 24px}
    .field{display:flex;flex-direction:column}
    .field-k{font-size:8.5px;color:#888;text-transform:uppercase;letter-spacing:.3px;margin-bottom:1px}
    .field-v{font-size:10.5px;font-weight:600;color:#111;word-break:break-word}

    /* ── Advertencia / notas ── */
    .advertencia{background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:10px 14px;margin-bottom:12px;font-size:9.5px;color:#664d03;page-break-inside:avoid}
    .advertencia strong{display:block;margin-bottom:4px}
    .notas{background:#fffbeb;border:1px solid #f0d060;border-radius:8px;padding:10px 14px;margin-top:14px;page-break-inside:avoid}
    .notas h4{font-size:10px;font-weight:700;color:#7a5c00;margin-bottom:6px}
    .notas p{font-size:9.5px;color:#7a5c00;margin-bottom:3px;line-height:1.4}

    /* ── Firmas ── */
    .firmas{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:28px}
    .firma{border-top:1px solid #444;padding-top:6px;font-size:9px;color:#555;text-align:center}

    /* ── Pie ── */
    .pie{display:flex;justify-content:space-between;align-items:flex-end;margin-top:18px;padding-top:12px;border-top:1px solid #ddd}
    .pie-txt{font-size:8px;color:#aaa;line-height:1.5}
    .sello{border:2px solid #1a5276;border-radius:8px;padding:8px 18px;font-size:9px;color:#1a5276;text-align:center;font-weight:600;opacity:.8}

    @media print{
      body{padding:12px 18px}
      @page{margin:1.2cm;size:A4}
      .no-print{display:none!important}
    }
  </style>
</head>
<body>

  <!-- Botón imprimir (solo pantalla) -->
  <div class="no-print" style="text-align:right;margin-bottom:14px">
    <button onclick="window.print()"
      style="background:#1a5276;color:#fff;border:none;border-radius:8px;padding:8px 20px;font-size:12px;font-weight:600;cursor:pointer;margin-right:8px">
      🖨 Imprimir / Guardar PDF
    </button>
    <button onclick="window.close()"
      style="background:#f3f4f6;color:#374151;border:1px solid #d1d5db;border-radius:8px;padding:8px 20px;font-size:12px;cursor:pointer">
      Cerrar
    </button>
  </div>

  <!-- Encabezado -->
  <div class="hdr">
    <div class="brand">
      <div class="logo">A</div>
      <div class="brand-text">
        <div class="name">AduanaSync</div>
        <div class="sub">Servicio Nacional de Aduanas de Chile</div>
        <div class="sub">aduana.cl · Gobierno de Chile</div>
      </div>
    </div>
    <div class="folio-area">
      <div class="folio-lbl">Nº de Folio</div>
      <div class="folio-num">${datos.folio}</div>
      <div class="folio-dt">Emitido: ${datos.fechaHora}</div>
      ${datos.rut ? `<div class="folio-dt">RUT Declarante: ${datos.rut}</div>` : ''}
    </div>
  </div>

  <!-- Título -->
  <div class="doc-titulo">${datos.titulo}</div>
  ${datos.subtitulo ? `<div class="doc-sub">${datos.subtitulo}</div>` : ''}

  <!-- QR -->
  <div class="qr-row">
    <div id="qr-container"></div>
    <div class="qr-info">
      <div class="q-title">Código de Verificación</div>
      <div class="q-sub">Escanee el código QR para verificar la autenticidad de este documento en el sistema AduanaSync.</div>
      <div class="q-folio">${datos.folio}</div>
      <div class="q-sub" style="margin-top:4px">Fecha: ${datos.fechaHora}</div>
    </div>
  </div>

  ${datos.advertencia ? `<div class="advertencia"><strong>⚠ Atención:</strong>${datos.advertencia}</div>` : ''}

  <!-- Secciones -->
  ${datos.secciones.map(seccionHTML).join('')}

  <!-- Notas -->
  ${datos.notas?.length ? `
  <div class="notas">
    <h4>📋 Instrucciones al arribar a Chile:</h4>
    ${datos.notas.map((n, i) => `<p>${i + 1}. ${n}</p>`).join('')}
  </div>` : ''}

  <!-- Firmas -->
  <div class="firmas">
    <div class="firma">Firma del Declarante</div>
    <div class="firma">Funcionario de Aduanas</div>
    <div class="firma">Timbre Oficial</div>
  </div>

  <!-- Pie -->
  <div class="pie">
    <div class="pie-txt">
      Documento generado por AduanaSync v2.1<br>
      Folio: ${datos.folio} · ${datos.fechaHora}<br>
      Este documento es válido solo con timbre oficial del Servicio Nacional de Aduanas
    </div>
    <div class="sello">PENDIENTE DE<br>VALIDACIÓN OFICIAL</div>
  </div>

  <!-- QR generator desde CDN -->
  <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
  <script>
    try {
      var qr = qrcode(0, 'M');
      qr.addData('ADUANASYNC:${datos.folio}:${encodeURIComponent(datos.fechaHora)}:${datos.rut ?? ''}');
      qr.make();
      document.getElementById('qr-container').innerHTML = qr.createSvgTag(3, 0);
    } catch(e) {
      document.getElementById('qr-container').innerHTML =
        '<div style="width:90px;height:90px;border:2px dashed #ccc;display:flex;align-items:center;justify-content:center;font-size:9px;color:#999;text-align:center;border-radius:6px">QR no<br>disponible</div>';
    }
    window.addEventListener('load', function() { window.focus(); });
  </script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=960,height=800,scrollbars=yes');
  if (!w) {
    alert('Permita las ventanas emergentes en su navegador para descargar/imprimir el documento.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

/** Formatea la fecha y hora actual en español */
export function ahora(): string {
  return new Date().toLocaleString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}
