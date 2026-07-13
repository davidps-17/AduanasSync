Requerimientos de Mejora para el Sistema AduanaSync
1. Validación de RUT mediante Módulo 11
Objetivo

Garantizar que todos los RUT ingresados sean validados correctamente utilizando el algoritmo oficial Módulo 11.

Requisitos
Implementar el algoritmo oficial de validación Módulo 11.
Validar automáticamente el dígito verificador (DV).
Aceptar correctamente valores numéricos y DV "K".
Rechazar inmediatamente RUT inválidos.
Mostrar mensajes claros de validación.
No permitir continuar si el RUT es inválido.
Ejecutar la validación en tiempo real.
Casos de prueba
RUT válido → Permitir continuar.
RUT inválido → Bloquear avance.
DV incorrecto → Rechazar.
Formato incorrecto → Mostrar error.
2. Selector de Fecha Mejorado
Objetivo

Evitar errores de digitación y asegurar la consistencia de las fechas ingresadas.

Requisitos
Eliminar completamente la escritura manual de fechas.
Permitir seleccionar fechas únicamente mediante calendario.
Incorporar un icono de calendario visible dentro del campo.
Utilizar un botón de calendario de alto contraste.
Resaltar la fecha seleccionada.
Resaltar la fecha actual.
Permitir cambiar rápidamente entre meses y años.
Adaptar el calendario para dispositivos táctiles.
Validar automáticamente fechas inválidas.
Campos afectados
Fecha de nacimiento.
Fecha de inicio de viaje.
Fecha de término de viaje.
Fecha de ingreso al país.
Cualquier otro campo relacionado con fechas.
3. Tema Claro y Oscuro
Objetivo

Mejorar la experiencia de usuario y la accesibilidad.

Requisitos
Incorporar selector de tema.
Permitir cambiar entre:
Modo Claro.
Modo Oscuro.
Aplicar el tema a toda la plataforma.
Adaptar:
Fondos.
Formularios.
Calendarios.
Botones.
Mensajes.
Ventanas emergentes.
Guardar la preferencia durante la sesión.
Mantener contraste adecuado para accesibilidad.
4. Validación Automática de Declaraciones
Objetivo

Detectar errores antes de finalizar el proceso.

Requisitos
Validar todos los campos obligatorios.
Validar formatos de correo electrónico.
Validar teléfonos.
Validar fechas.
Detectar inconsistencias entre campos.
Declaración inválida

Si la declaración presenta errores:

Rechazar automáticamente el envío.
Mostrar el motivo específico.
No generar comprobante.
No permitir avanzar hasta corregir los errores.
5. Escaneo Opcional de Documento de Identidad
Objetivo

Reducir errores de digitación y agilizar el ingreso de datos.

Modalidades
Escaneo mediante cámara
Captura de imagen del documento.
Procesamiento OCR.
Extracción automática de datos.
Escaneo mediante lector
Compatible con lectores MRZ.
Compatible con tótems y puestos de control.
Datos obtenidos
Nombres.
Apellidos.
Número de documento.
Nacionalidad.
Fecha de nacimiento.
Fecha de vencimiento.
País emisor.
Validación
Comparar datos escaneados con los ingresados.
Informar inconsistencias.
Registrar método de validación.
Estado de validación

Mostrar:

🟢 Documento validado mediante escaneo

🟡 Datos ingresados manualmente

Compatibilidad
Computadores.
Android.
iPhone.
Tablets.
Tótems de autoservicio.
6. Generación de PDF y Comprobante
Requisitos
Generar PDF automáticamente al finalizar.
Incorporar:
Número de declaración.
Fecha y hora.
Datos del viajero.
Código QR único.
Permitir descarga inmediata.
Permitir impresión directa.
7. Código QR de Verificación
Objetivo

Facilitar la validación por parte de funcionarios aduaneros.

Requisitos
Generar QR único por declaración.
Permitir verificar autenticidad.
Vincular el QR con el registro almacenado.
Evitar duplicaciones o falsificaciones.
8. Validación de Edad
Requisitos
Calcular edad automáticamente según fecha de nacimiento.
Validar requisito de mayoría de edad cuando corresponda.
Mostrar mensajes claros en caso de incumplimiento.
9. Compatibilidad Multiplataforma
Requisitos

Funcionamiento completo en:

Computadores Windows.
Computadores macOS.
Linux.
Android.
iPhone (iOS).
Tablets.
Tótems de autoservicio.
Navegadores compatibles
Google Chrome.
Microsoft Edge.
Mozilla Firefox.
Safari.
10. Optimización para Tótems
Requisitos
Botones de gran tamaño.
Interfaz táctil.
Teclado virtual.
Modo pantalla completa.
Reinicio automático de sesión al finalizar.
Tiempo de espera configurable por inactividad.
11. Barra de Progreso Mejorada
Requisitos

Mostrar claramente cada etapa:

Identificación del viajero.
Información del viaje.
Equipaje.
Declaración de bienes.
Confirmación.
Comprobante final.

Permitir visualizar el progreso total del trámite.

12. Autoguardado de Información
Requisitos
Guardar automáticamente avances del formulario.
Recuperar información si ocurre:
Cierre accidental.
Pérdida de conexión.
Reinicio de dispositivo.
13. Accesibilidad
Requisitos
Alto contraste.
Compatibilidad con lectores de pantalla.
Navegación mediante teclado.
Tamaño de texto adaptable.
Diseño responsive.
14. Seguridad y Protección de Datos
Requisitos
Uso obligatorio de HTTPS.
Protección de datos personales.
Registro de auditoría de acciones.
Prevención de ataques mediante validación de entradas.
Respaldo de información.
Eliminación automática de imágenes utilizadas durante el escaneo de documentos.
Resultado Esperado

El sistema AduanaSync deberá proporcionar una plataforma moderna, segura y accesible que permita validar correctamente la identidad de los usuarios mediante RUT y documentos oficiales, utilizar calendarios visuales para todas las fechas, generar declaraciones verificables mediante QR, funcionar en computadores, dispositivos móviles y tótems de autoservicio, y garantizar una experiencia eficiente tanto para los viajeros como para los funcionarios del Servicio Nacional de Aduanas de Chile.