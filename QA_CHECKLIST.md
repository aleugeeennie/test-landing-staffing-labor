# Checklist de QA — V5

## Validaciones técnicas

- [x] `index.html` y `thank-you.html` parsean correctamente.
- [x] JavaScript validado con `node --check`.
- [x] No existen IDs duplicados.
- [x] Todas las referencias `aria-controls` apuntan a IDs existentes.
- [x] Todas las rutas locales de CSS, JS e imágenes existen.
- [x] No hay credenciales ni secretos en frontend.

## Copy y estructura V5

- [x] Hero sustituido por el headline y subheadline del PDF de correcciones.
- [x] Microproof sustituido por REPSE desde 2019, cero incidentes y cargas sociales al 100%.
- [x] CTA principal cambiado a `Agendar llamada`.
- [x] Cuatro mitos sustituidos por la redacción final del PDF.
- [x] Diferenciador humano actualizado con NPS, rotación y atención al colaborador.
- [x] Value prop corregida de `carga legal` a `carga social`.
- [x] Se muestra la condición comercial para plantillas arriba de 80 personas.
- [x] FAQs renombradas como `Conoce más de nosotros`.
- [x] Seis respuestas sustituidas por la redacción final aprobada.
- [x] Estructura de servicios actualizada bajo Recursos Humanos.
- [x] Headhunting aparece bajo Reclutamiento/Recursos Humanos y no como subcategoría de Staffing.

## Animación y diseño

- [x] H1 del hero tiene animación cinética palabra por palabra.
- [x] Headline de cierre tiene animación cinética palabra por palabra.
- [x] Palabras clave reciben una segunda microanimación de énfasis.
- [x] Pattern animado de partículas aplicado a los principales fondos azules.
- [x] `prefers-reduced-motion` desactiva partículas y animaciones de texto.
- [x] Flip cards se activan con hover, foco, clic y toque.
- [x] Reverso azul con tipografía blanca y detalles verdes.
- [x] Timelines conservan loop automático y navegación manual.
- [x] Popup se activa automáticamente al llegar al final de la página una sola vez.

## Formulario

- [x] Campos colocados en el orden aprobado.
- [x] Teléfono limitado a 10 dígitos.
- [x] Posiciones mostradas como cuatro tarjetas de selección.
- [x] Correo corporativo obligatorio.
- [x] Gmail, Hotmail, Outlook, Yahoo y otros dominios personales son rechazados.
- [x] Mensaje de rechazo: `Ingresa un correo corporativo`.
- [x] Estado de contratación mostrado como Sí / No.
- [x] Opciones de inicio: Hoy o mañana, 1 a 3 meses, 6 meses y No lo tengo claro.
- [x] Campo salarial incluye alternativas provisionales y captura condicional de monto.
- [x] CTA final: `Enviar solicitud`.
- [x] Estados de carga, éxito y error conservados.
- [x] UTMs y referidor conservados.
- [x] Redirección a thank you page conservada.

## Thank you page

- [x] Iframe de Calendly preparado.
- [x] Placeholder visible mientras no exista URL.
- [x] Pattern de partículas agregado al fondo azul.
- [x] URL controlada desde `assets/js/config.js`.

## Pendientes de producción

- [ ] Conectar webhook o CRM real.
- [ ] Agregar URL de Calendly.
- [ ] Agregar URL de WhatsApp.
- [ ] Confirmar rangos definitivos de salario mensual total.
- [ ] Agregar aviso de privacidad aprobado.
- [ ] Realizar validación final en Safari y dispositivo físico desde hosting de pruebas.
