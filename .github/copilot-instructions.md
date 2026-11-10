# Instrucciones del repositorio para GitHub Copilot — Eventos UANL

## 1. Contexto y alcance

Este proyecto es un **rediseño del sistema de eventos de la Universidad Autónoma de Nuevo León (UANL)**. Debe permitir que cualquier persona consulte eventos disponibles y que usuarios registrados se inscriban y consulten sus eventos y pases digitales. El personal administrativo y los organizadores autorizados gestionan los eventos publicados.

**Decisión definitiva de alcance: no existen pagos en este proyecto.** No implementar ni sugerir cobros, precios de entradas, costos, descuentos, cupones, facturas, pasarelas de pago, carritos o procesos de checkout. **Ignorar todas las menciones a pagos, costos y descuentos presentes en los prototipos antiguos**; tampoco incluir estos campos en formularios, modelos de datos, endpoints o pruebas nuevas. La inscripción a eventos no requiere pago.

Los mockups en `Act_2-5_EQ3.pdf` son referencia de flujos y estructura, **no un contrato técnico ni una paleta de colores definitiva**. La captura de la pantalla «Mis eventos» es la referencia visual principal. Si los materiales no están en el repositorio, utiliza las reglas descritas en este archivo sin inventar detalles.

## 2. Tecnologías confirmadas y decisiones pendientes

- **React** para construir componentes de interfaz.
- **Next.js** como framework de la aplicación web, incluyendo enrutamiento y renderizado conforme a la versión y estructura existentes.
- **Node.js** para la ejecución de lógica de backend.

**Estado explícito de las decisiones técnicas:**

- **Lenguaje: por definir** (JavaScript o TypeScript). No convertir archivos de un lenguaje a otro por iniciativa propia.
- **Arquitectura del backend: por definir** (rutas/acciones de servidor de Next.js o servicio Node.js independiente). No crear servicios paralelos sin aprobación.
- **Base de datos: por definir** (sin motor ni ORM seleccionados). No fijar modelos, migraciones o conexiones para un motor específico sin decisión previa.

También siguen pendientes App Router frente a Pages Router, Tailwind/CSS Modules/otro sistema de estilos, framework de API independiente (Express, NestJS), solución de autenticación, proveedor de archivos, librería QR y plataforma de despliegue. Detectar las decisiones reales en `package.json`, configuración y estructura del repositorio antes de escribir código. No instalar tecnologías nuevas sin justificación o petición.

Next.js puede servir endpoints y lógica de servidor en Node.js. **No crear automáticamente un servidor Express separado**; reutilizar la arquitectura de backend existente y mantener una sola fuente de verdad para las reglas de negocio.

## 3. Instrucciones de trabajo para el agente

- Responder en **español** y mantener los textos de la UI en español; respetar las convenciones de nombres del código existente.
- Antes de modificar, inspeccionar archivos relevantes, dependencias, rutas y convenciones. Seguir los patrones presentes.
- Hacer cambios mínimos y relacionados con la solicitud; reutilizar componentes y funciones, no duplicar lógica.
- Separar presentación, lógica de negocio y acceso a datos en los límites que soporte la arquitectura existente.
- Mantener los datos y operaciones sensibles del lado del servidor; no exponer secretos ni tokens en componentes cliente.
- No inventar APIs, tablas, campos, rutas, integraciones o funcionalidades existentes. Si una decisión está pendiente, plantear una propuesta explícita y acotada.
- **Regla fundamental: no eliminar código existente.** Conservar componentes, rutas, lógica, estilos y funcionalidades actuales; modificar solo las partes necesarias para la petición. No borrar ni reemplazar archivos, funciones, estilos o media queries para simplificar una tarea. Si es imprescindible retirar o sustituir código, explicar el motivo y solicitar aprobación antes de hacerlo.
- No refactorizar de forma masiva, cambiar dependencias ni alterar contratos de API sin necesidad.
- Cuando se implemente un cambio, añadir o ajustar validaciones y pruebas pertinentes. Al finalizar, resumir archivos modificados y comprobaciones efectuadas sin afirmar pruebas no ejecutadas.

## 4. Perfiles y permisos

- **Visitante:** explora el catálogo, filtra y consulta detalles de eventos sin iniciar sesión.
- **Asistente registrado:** se inscribe en eventos disponibles, consulta «Mis eventos» y accede a sus propios pases digitales cuando esa funcionalidad esté implementada.
- **Organizador / personal administrativo autorizado:** crea, edita y gestiona eventos según permisos efectivos.

Autorización y validaciones deben ejecutarse **en el servidor**. Ocultar botones según el rol no reemplaza la verificación de permisos en endpoints, acciones de servidor ni consultas. Nunca permitir que un usuario consulte o modifique inscripciones y pases ajenos sin autorización.

La relación precisa entre los roles de organizador y administrador, la gestión de cuentas y el método de inicio de sesión son **decisiones pendientes**: no imponer un modelo de permisos no acordado.

## 5. Flujos funcionales de referencia

### Catálogo público
- Mostrar eventos y detalles clave: nombre, dependencia/organizador, fecha, hora, sede o enlace de acceso según modalidad, descripción y disponibilidad si aplica.
- Ofrecer filtros por **fecha, dependencia, categoría y modalidad** (presencial/en línea), como indican los prototipos.
- Incorporar paginación o un mecanismo equivalente cuando lo requiera el catálogo; contemplar resultados vacíos, carga y errores.

### Detalle e inscripción
- Mostrar información completa del evento y acción de inscripción cuando corresponda.
- Verificar desde el servidor que el evento admite inscripciones, que existe cupo cuando esté limitado, y que la persona no esté ya inscrita.
- Evitar duplicados y sobreinscripción con un mecanismo consistente y seguro ante solicitudes simultáneas (por ejemplo, una operación transaccional si la base de datos lo permite).
- Confirmar el registro solo después de que el servidor confirme su persistencia.
- **No agregar pasos de pago ni campos monetarios.**

### Mis eventos y pases
- Mostrar los eventos en que el usuario está inscrito, destacando los próximos.
- Permitir consulta o descarga de pases digitales cuando estén implementados; los prototipos contemplan QR.
- Un código QR no es, por sí solo, una validación segura: definir en el backend la emisión, autorización y eventual verificación del pase antes de desarrollar el control de acceso.

### Gestión de eventos
- Permitir a usuarios autorizados registrar y mantener eventos con título, descripción, categoría, dependencia, responsable, fecha, horario, modalidad, lugar o enlace y datos de contacto que se hayan aprobado.
- La adjunción de documentos y visualización en mapas son funciones contempladas por los prototipos, sujetas a la implementación real.
- **No incluir precio, costo, descuento, cupón ni ninguna configuración económica.**
- Los estados del ciclo de vida (borrador, publicado, cancelado, finalizado) y las reglas de apertura/cierre de inscripciones **deben acordarse** antes de tratarlos como requisitos cerrados.

## 6. Diseño visual y experiencia de usuario

La referencia cromática es la captura «Mis eventos», **no los colores inconsistentes de otros mockups**.

| Token sugerido | HEX | Uso |
| --- | --- | --- |
| `--color-navy` | `#021F54` | Barra de navegación, botones institucionales y elementos destacados. |
| `--color-primary` | `#0844A4` | Encabezados, secciones y superficies principales. |
| `--color-accent` | `#D68227` | Acciones contextuales y acentos. |
| `--color-background` | `#F7F6F6` | Fondo y áreas neutras. |

Son los **cuatro colores principales**. Pueden añadirse blanco, negro y neutros funcionales para legibilidad, contraste, bordes y estados. Centralizar valores en tokens/variables del estilo realmente utilizado. No dispersar HEX por los componentes.

- Mantener imagen institucional, moderna, accesible, clara y confiable.
- Usar encabezado azul marino, títulos de sección azules, superficies claras y acentos naranjas moderados.
- Priorizar tarjetas de eventos legibles, jerarquía tipográfica, espaciado consistente y navegación responsiva.
- Mantener nombres y acciones comprensibles: «Inicio», «Eventos», «Mis eventos», «Mis pases», «Ver detalle», «Inscribirse» y «Descargar boleto» cuando correspondan.
- **Reutilizar componentes React existentes** antes de crear otros, sin duplicar tarjetas, botones, formularios, menús o estructuras. Preservar su API pública salvo solicitud explícita.
- **Respetar la estructura y navegación de Next.js** tal y como esté implementada (App Router o Pages Router). Utilizar `next/link` para navegación interna cuando proceda; no sustituir enrutamiento ni romper rutas o layouts existentes.
- Usar HTML semántico, etiquetas de formulario, foco visible, navegación por teclado y contraste adecuado (objetivo WCAG AA).
- Diseñar estados de carga, vacío, error, confirmación y acceso denegado; no depender exclusivamente del color para comunicar estados.

## 7. Accesibilidad obligatoria y diseño móvil primero

**Objetivo: interfaces utilizables con teclado y tecnologías de asistencia (especialmente lectores de pantalla), sin depender del mouse ni de la percepción del color.** Buscar cumplimiento de WCAG 2.2 nivel AA en componentes nuevos o modificados, sin afirmar certificación automática.

### Jerarquía visual, distribución y tipografía
- Establecer una jerarquía coherente y semántica: un `h1` por vista principal, títulos `h2`/`h3` en orden lógico, regiones `<header>`, `<nav>`, `<main>`, `<section>` y `<footer>` cuando correspondan. No escoger títulos solo por su tamaño visual.
- Agrupar controles y contenido relacionado, mantener el orden de lectura coherente con el orden visual y el orden del DOM. Evitar reorganizaciones con CSS que confundan el foco de teclado.
- Usar tipografía legible con tamaño base preferentemente de **16px o más**, unidades relativas (`rem`, `em`) y alturas de línea recomendadas cercanas a **1.5 para párrafos**. Permitir zoom y ajuste de tamaño sin recortes ni scroll horizontal innecesario.
- No bloquear personalizaciones de espaciado. La interfaz debe tolerar, donde aplique, interlineado de 1.5 veces el tamaño de fuente, espacio después de párrafos de 2 veces el tamaño, espaciado entre letras de 0.12 veces el tamaño y entre palabras de 0.16 veces el tamaño (criterio WCAG 1.4.12).
- Mantener distancias y espacios suficientes entre tarjetas, campos y acciones; no usar texto incrustado en imágenes como única forma de presentar información.

### Contraste y uso del color
- Comprobar el contraste de cada combinación real de texto/fondo: **al menos 4.5:1** para texto normal y **3:1** para texto grande; componentes gráficos esenciales y sus estados deben contar con contraste suficiente, normalmente **3:1** respecto al entorno.
- Los cuatro colores institucionales son tokens de marca, **no garantía de contraste por sí solos**. Ajustar combinaciones o introducir colores funcionales accesibles cuando sea necesario; no usar naranja de acento con texto blanco sin verificar la relación de contraste.
- No usar solo color para comunicar categoría, estado, error, selección o disponibilidad: acompañar con texto, iconos con nombre accesible o indicadores adicionales.
- Mostrar el foco de teclado de forma muy visible; no quitar `outline` sin reemplazo perceptible.

### Teclado y lectores de pantalla
- Todos los controles interactivos deben poder alcanzarse mediante **Tab** (y recorrerse hacia atrás con **Shift+Tab**) en orden lógico y operarse sin mouse. Mantener el foco visible; probar **Enter** y **Espacio** según el tipo de control, así como **Escape** para cerrar diálogos/menús cuando corresponda.
- Utilizar elementos HTML nativos: `<button>` para acciones, `<a>`/`Link` para navegación, `<label>` asociado a `<input>` para formularios, controles nativos para selección. **No convertir `<div>` o tarjetas enteras en botones simulados** salvo que exista un motivo excepcional y se implemente toda la interacción y semántica necesarias.
- Asignar **nombre accesible** a cada control: preferir texto visible o `<label>`; usar `aria-label` o `aria-labelledby` en controles solo con iconos o sin etiqueta visible. **No añadir `aria-label` indiscriminadamente** a cada elemento, ni reemplazar etiquetas visuales correctas, porque puede producir redundancia o resultados confusos para lectores de pantalla.
- Poner `alt` descriptivo a imágenes informativas y `alt=""` a imágenes decorativas; los iconos decorativos deben ocultarse a tecnologías de asistencia (`aria-hidden="true"`).
- Incluir enlace «Saltar al contenido principal» visible al recibir foco, `lang="es"` en el documento, indicación programática de errores y mensajes de estado accesibles (`aria-live`/`role="status"` cuando corresponda), y asociaciones `aria-describedby` para ayudas y errores de formularios.
- En diálogos y menús, gestionar foco inicial, contención del foco cuando sea modal y retorno al elemento activador al cerrar. Evitar `tabIndex` positivo y cambios de foco inesperados.
- Para tarjetas de eventos, mantener un título semántico y un enlace o botón con nombre descriptivo (por ejemplo, «Ver detalles de [evento]»); no crear focos duplicados o clics anidados innecesarios.
- Un `aria-label` favorece la interpretación por **lectores de pantalla**, pero **no crea por sí solo asistencia auditiva**. La salida por voz depende de la tecnología de asistencia del usuario; combinar ARIA correctamente con HTML semántico.

### Botones, tarjetas y formularios
- Mantener botones y enlaces distinguibles, con estados visuales de foco, hover, deshabilitado y carga; evitar acciones ambiguas llamadas únicamente «Ver» sin contexto accesible.
- Los objetivos táctiles deben tener tamaño y separación suficientes; procurar **al menos 24×24 px CSS** según los requisitos aplicables de WCAG 2.2 AA y preferir áreas más cómodas (por ejemplo, 44×44 px) cuando sea posible.
- No confiar solo en placeholders para identificar campos. Presentar etiquetas y errores claros, próximos al control y disponibles para lectores de pantalla.

### Diseño responsivo: móvil primero
- Construir los estilos **primero para pantallas estrechas**, con flujo natural, ancho flexible, columnas que se adapten sin desbordamiento y contenido útil desde el tamaño móvil.
- Usar `min-width` media queries **solo para ampliar o redistribuir** la interfaz en pantallas mayores cuando se necesiten. **No depender de media queries para que la vista móvil funcione**: si se quitan las reglas de breakpoint, el estilo base debe seguir siendo utilizable en móvil.
- **No eliminar media queries existentes por defecto**: pueden ser necesarias para escritorio, accesibilidad o preferencias como `prefers-reduced-motion`. El criterio de móvil primero exige una base móvil sólida, no prohibir ni borrar media queries.
- Verificar tanto navegación por teclado en escritorio como interacción táctil en móvil, y probar cambios de zoom, orientación y distintos anchos de pantalla.

### Validación al terminar cambios de interfaz
- Revisar el recorrido de Tab/Shift+Tab y el funcionamiento sin mouse; comprobar foco al abrir/cerrar elementos emergentes.
- Inspeccionar etiquetas accesibles, roles, jerarquía de títulos, texto alternativo y anuncios de error.
- Comprobar contraste en sus combinaciones reales, legibilidad con zoom hasta 200% y redistribución del contenido en anchos pequeños cuando aplique.
- Verificar que no se haya perdido funcionalidad, navegación de Next.js ni código preexistente. Informar claramente de cualquier comprobación que no se haya podido ejecutar.

## 8. Arquitectura y lógica de backend

- Usar **componentes de servidor y cliente de Next.js según sus necesidades reales**, sin marcar toda la aplicación como cliente por defecto cuando se utilice App Router.
- Mantener secretos, acceso a datos, permisos y mutaciones sensibles en el servidor. Validar entradas en los límites de la API o acciones de servidor.
- Si existe API independiente en Node.js, respetar sus rutas, contratos y middleware; si no existe, evitar crear una sin una razón aprobada.
- Definir los contratos entre frontend y backend con entradas, respuestas, errores y controles de autorización claros, siguiendo el lenguaje y las herramientas existentes.
- La base de datos aún no está definida. Antes de modelarla, acordar entidades y relaciones fundamentales: **usuarios, eventos, inscripciones y, si procede, pases**. No inventar un esquema final.
- Para fechas y horarios, conservar la información de zona horaria que corresponda a cada evento; no asumir que todos ocurren en una única zona por tratarse de la UANL.
- Tratar IDs y datos recibidos del navegador como no confiables. Verificar permisos en todas las operaciones de lectura restringida y escritura.
- Manejar errores sin mostrar al usuario trazas internas, credenciales o detalles de infraestructura.

## 9. Pruebas y criterios de aceptación

Para cada funcionalidad nueva, priorizar verificaciones de:
- Filtrado, navegación, responsive móvil primero y estados de interfaz.
- Navegación completa con teclado (Tab, Shift+Tab, Enter, Espacio y Escape cuando proceda), foco visible, semántica HTML, nombres accesibles, lectores de pantalla y contraste WCAG AA.
- Conservación de funcionalidades, componentes y código existente; estabilidad de rutas y layouts de Next.js.
- Acceso público a eventos y acceso autenticado a secciones personales.
- Restricciones por rol sobre creación, edición y gestión de eventos.
- Inscripciones: cupo, duplicados, solicitudes concurrentes y confirmación real del servidor.
- Protección de inscripciones y pases contra consultas de otros usuarios.
- Ausencia de campos, flujos, dependencias e integraciones de pago.

Usar las herramientas de lint, tests y build que ya estén configuradas en el proyecto. No instalar un nuevo stack de pruebas sin justificación.

## 10. Decisiones pendientes que deben consultarse

No asumir que están resueltas:
1. JavaScript o TypeScript y versión de Next.js.
2. App Router o Pages Router (o migración si ya existe una estructura).
3. Backend integrado en Next.js o servicio Node.js independiente.
4. Motor de base de datos y ORM / librería de acceso.
5. Autenticación, recuperación de cuenta y permisos detallados.
6. Política de cupos, cancelación de inscripción y estados de los eventos.
7. Emisión, formato y validación operativa de pases QR.
8. Carga de documentos, mapas y despliegue.

Cuando una tarea dependa de uno de estos puntos, primero inspeccionar si existe una decisión en el código o documentación. Si no existe, explicar el supuesto mínimo o preguntar antes de introducir una arquitectura permanente.

## 11. Fuentes funcionales

- `Act_2-5_EQ3.pdf`: catálogo y filtros (p. 2), detalle e inscripción (p. 3), registro de eventos (pp. 4–5), vistas móviles y pases (p. 6), navegación de usuarios (p. 7). **Toda referencia a pagos, precios o descuentos queda anulada por la decisión actual del proyecto.**
- Captura «Mis eventos»: referencia visual principal para la paleta y la composición de tarjetas.

Estas fuentes describen ideas de prototipo, no prueban que una funcionalidad ya esté implementada.
