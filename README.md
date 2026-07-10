# Labor Mexicana — Landing de Staffing V5

Landing B2B mobile-first para Staffing y servicios especializados, desarrollada con HTML, CSS y JavaScript puros. La V5 aplica la reestructura comercial de `LaborMX_Correcciones_LP_Staffing.pdf` y el cuestionario aprobado de `Preguntas staffing.pdf`.

## Cambios incluidos en V5

- Hero reestructurado con el enfoque de responsabilidad solidaria y los copys aprobados:
  - “¿Sabes si tu proveedor de personal te está exponiendo legalmente?”
  - REPSE desde 2019, cero incidentes y cargas sociales cubiertas al 100%.
  - CTA principal: `Agendar llamada`.
- Animación cinética palabra por palabra en:
  - H1 del hero.
  - “Hablemos de la operación que necesitas cubrir”.
- Pattern animado de partículas en los principales fondos azules:
  - Diferenciador humano.
  - Bloque de Recursos Humanos.
  - Cierre de conversión.
  - Footer.
  - Lateral del modal.
  - Thank you page.
- Los cuatro mitos conservan el formato de flip cards y utilizan el copy corregido del PDF.
- Diferenciador humano reestructurado con encuestas de satisfacción, NPS, rotación activa y atención al colaborador.
- Propuesta de valor corregida con lenguaje de `carga social` y la condición comercial para plantillas arriba de 80 personas.
- FAQs renombradas como `Conoce más de nosotros` y sustituidas por las seis preguntas aprobadas.
- Estructura de servicios actualizada bajo el paraguas de Recursos Humanos.
- Formulario reorganizado en el orden aprobado y CTA final `Enviar solicitud`.
- Campo salarial provisional con `No lo sé`, `Prefiero comentarlo en la llamada` o captura de monto aproximado en MXN.
- Se mantienen los timelines automáticos, el popup al final de la página, las fotografías reales y el Calendly preparado.

## Archivos principales

- `index.html`: landing completa.
- `thank-you.html`: página de confirmación con Calendly.
- `assets/css/styles.css`: diseño responsive, partículas, flip cards, timelines y animaciones.
- `assets/js/main.js`: timelines, modal, validaciones, UTMs, Calendly y envío.
- `assets/js/config.js`: configuración de webhook, thank you page, WhatsApp y Calendly.
- `QA_CHECKLIST.md`: revisión funcional y visual.
- `IMPLEMENTATION_CHECKLIST.md`: inventario de contenido, assets y pendientes.

## Configuración

Edita `assets/js/config.js`:

```js
window.LABOR_CONFIG = {
  webhookUrl: "https://...",
  thankYouUrl: "thank-you.html",
  whatsappUrl: "https://wa.me/52...",
  calendlyUrl: "https://calendly.com/...",
  requestTimeoutMs: 12000
};
```

### Velocidad de las líneas de tiempo

Cada componente usa `data-interval` en milisegundos:

```html
<div data-auto-timeline data-interval="2000">
```

Valores actuales:

- Diferenciador humano: `1800` ms.
- Propuesta de valor: `2000` ms.
- FAQs: `2600` ms.

### Calendly

- Mientras `calendlyUrl` esté vacío, el iframe muestra un placeholder.
- Al colocar la URL pública de Calendly, JavaScript sustituye automáticamente el placeholder.

### Webhook / CRM

- El formulario envía un `POST` mediante `FormData`.
- No deben colocarse tokens privados, API keys ni secretos en frontend.
- Con `webhookUrl` vacío, funciona en modo demostración y redirige a la thank you page.

### UTMs

Se conservan durante la sesión y se envían como campos ocultos: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `fbclid` y `msclkid`. También se conserva el referidor y la URL inicial.

## Formulario aprobado

### Paso 1

1. ¿Cómo te llamas?
2. ¿A qué número te llamamos?
3. Tu correo corporativo.
4. Nombre de tu empresa.
5. ¿Cuántas posiciones necesitas tercerizar?
6. Giro de tu empresa.

### Paso 2

7. ¿Dónde está tu operación?
8. Cuéntanos qué necesitas resolver.
9. ¿El personal ya está contratado o lo tienes que contratar?
10. ¿Cuándo quieres empezar?
11. Monto de salario mensual de todas las posiciones.

El formulario rechaza Gmail, Hotmail, Outlook, Yahoo y otros dominios personales con el mensaje `Ingresa un correo corporativo`.

## Información pendiente para producción

1. Webhook o CRM definitivo.
2. URL pública de Calendly.
3. Enlace de WhatsApp.
4. Rangos definitivos para el salario mensual total.
5. URL y texto del aviso de privacidad.

## Pruebas locales

```bash
python -m http.server 8080
```

Abrir `http://localhost:8080/`.

## Accesibilidad y rendimiento

- Imágenes WebP con proporción preservada mediante `object-fit`.
- Timelines activos únicamente al entrar al viewport.
- Compatibilidad con `prefers-reduced-motion`; desactiva autoplay, partículas y animaciones cinéticas.
- Modal con cierre por botón, fondo y tecla `ESC`.
- Focus trap, foco visible y navegación por teclado.
- Partículas construidas con gradientes CSS y animadas con `transform` y `background-position`.
