/* ====================================================================
   SISTEMA CENTRALIZADO DE CONFIGURACIÓN Y LÓGICA - HERRAMIENTAS DEL SOLDADO
   Permite la escalabilidad modular de herramientas internas y externas.
   ==================================================================== */

const herramientas = [
    {
        id: "analisis-criminal",
        nombre: "De Soldado a General",
        descripcion: "No se pide permiso para cambiar la Historia",
        icono: "🔎",
        url: "paginas/matrix/index.html",
        tipo: "interno",
        categoria: "analisis"
    },
    {
        id: "consultas",
        nombre: "Consultas",
        descripcion: "Sistema de consultas centralizadas y búsqueda de registros estructurados.",
        icono: "📋",
        url: "paginas/consultas/index.html",
        tipo: "interno",
        categoria: "consultas"
    },
    {
        id: "utilidades",
        nombre: "Utilidades",
        descripcion: "Conjunto de utilidades operativas para optimización de tareas técnicas.",
        icono: "🛠️",
        url: "paginas/herramientas/index.html",
        tipo: "interno",
        categoria: "utilidades"
    },
    {
        id: "manual del usuario",
        nombre: "Manual del Usuario",
        descripcion: "Reglas y Protocolos de Clasificación",
        icono: "📋",
        url: "paginas/reglas/index.html",
        tipo: "interno",
        categoria: "manual del usuario"
    },
    {
        id: "recursos",
        nombre: "Recursos",
        descripcion: "Repositorio de documentación, guías operativas y recursos de consulta.",
        icono: "📚",
        url: "paginas/recursos/index.html",
        tipo: "interno",
        categoria: "recursos"
    },
    {
        id: "recurso-externo",
        nombre: "Ge geoportal Oficial",
        descripcion: "Acceso seguro a plataforma cartográfica georreferenciada externa.",
        icono: "🌐",
        url: "https://www.openstreetmap.org",
        tipo: "externo",
        categoria: "recurso-externo",
        nuevaPestana: true
    },
    {
        id: "recurso-gemini",
        nombre: "Buscador IA",
        descripcion: "Acceso seguro a plataforma Gemina IA.",
        icono: "🌐",
        url: "https://gemini.google.com/app",
        tipo: "externo",
        categoria: "gemini",
        nuevaPestana: true
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const gridContainer = document.getElementById("tools-grid");
    const searchInput = document.getElementById("search-input");
    const filterButtons = document.querySelectorAll(".filter-btn");

    if (gridContainer) {
        renderizarTarjetas(herramientas);
        
        // Buscador en tiempo real
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                const termino = e.target.value.toLowerCase();
                const categoriaActiva = document.querySelector(".filter-btn.active").dataset.category;
                filtrarYRenderizar(termino, categoriaActiva);
            });
        }

        // Filtros por categoría
        filterButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                filterButtons.forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");
                const categoria = e.target.dataset.category;
                const termino = searchInput ? searchInput.value.toLowerCase() : "";
                filtrarYRenderizar(termino, categoria);
            });
        });
    }
});

function renderizarTarjetas(listaHerramientas) {
    const gridContainer = document.getElementById("tools-grid");
    gridContainer.innerHTML = "";

    if (listaHerramientas.length === 0) {
        gridContainer.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 2rem;">No se encontraron herramientas que coincidan con la búsqueda.</p>`;
        return;
    }

    listaHerramientas.forEach(tool => {
        const card = document.createElement("div");
        card.className = "tool-card";

        let enlaceHtml = "";
        if (tool.tipo === "interno") {
            enlaceHtml = `<a href="${tool.url}" class="tool-btn">INGRESAR</a>`;
        } else {
            const relAttr = tool.nuevaPestana ? 'target="_blank" rel="noopener noreferrer"' : '';
            enlaceHtml = `<a href="${tool.url}" ${relAttr} class="tool-btn">ACCEDER EXTERNO</a>`;
        }

        card.innerHTML = `
            <div>
                <div class="tool-icon">${tool.icono}</div>
                <div class="tool-info">
                    <h3>${tool.nombre}</h3>
                    <p>${tool.descripcion}</p>
                </div>
            </div>
            ${enlaceHtml}
        `;

        gridContainer.appendChild(card);
    });
}

function filtrarYRenderizar(termino, categoria) {
    const filtradas = herramientas.filter(tool => {
        const coincideTermino = tool.nombre.toLowerCase().includes(termino) || tool.descripcion.toLowerCase().includes(termino);
        const coincideCategoria = categoria === "todas" || tool.categoria === categoria;
        return coincideTermino && coincideCategoria;
    });
    renderizarTarjetas(filtradas);
}