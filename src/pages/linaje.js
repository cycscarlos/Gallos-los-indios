import { API } from '../lib/api.js';

/* ──────────────────────────────────────────────────
   CONFIGURACIÓN VISUAL DEL ÁRBOL
────────────────────────────────────────────────── */
const NODE_W   = 160;   // ancho del nodo
const NODE_H   = 72;    // alto del nodo
const H_GAP    = 60;    // gap horizontal entre nodos del mismo nivel
const V_GAP    = 110;   // gap vertical entre generaciones

const COLORS = {
    main:        { fill: '#1a1200', stroke: '#d4af37', strokeW: 2.5 },
    parent:      { fill: '#0f0f0f', stroke: 'rgba(212,175,55,0.55)', strokeW: 1.5 },
    grandparent: { fill: '#0a0a0a', stroke: 'rgba(212,175,55,0.28)', strokeW: 1.2 },
    empty:       { fill: 'transparent', stroke: 'rgba(255,255,255,0.08)', strokeW: 1 },
};

/* ──────────────────────────────────────────────────
   UTILIDADES
────────────────────────────────────────────────── */
const params     = new URLSearchParams(window.location.search);
const ejemplarId = params.get('id');

function formatFecha(str) {
    if (!str) return '-';
    return new Date(str).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function showLoading(v)  { document.getElementById('linaje-loading').style.display = v ? 'flex' : 'none'; }
function showError(msg)  {
    document.getElementById('linaje-loading').style.display  = 'none';
    document.getElementById('linaje-error').style.display    = 'flex';
    document.getElementById('linaje-error-msg').textContent  = msg;
}
function showTree() {
    document.getElementById('linaje-loading').style.display = 'none';
    const wrapper = document.getElementById('linaje-wrapper');
    wrapper.classList.add('show');
}

/* ──────────────────────────────────────────────────
   PANEL DE DETALLE
────────────────────────────────────────────────── */
function showDetailPanel(e) {
    const overlay = document.getElementById('detail-overlay');
    document.getElementById('detail-content').innerHTML = `
        <div class="detail-panel-placa">🐓 ${e.placa_id}</div>
        <div class="detail-panel-marca">${e.marca || ''} · ${e.genero || ''}</div>
        <div class="detail-grid">
            <div class="detail-field">
                <span class="detail-field-label">Línea</span>
                <span class="detail-field-value">${e.linea || '-'}</span>
            </div>
            <div class="detail-field">
                <span class="detail-field-label">Nacimiento</span>
                <span class="detail-field-value">${formatFecha(e.fecha_nacimiento)}</span>
            </div>
            <div class="detail-field">
                <span class="detail-field-label">Precio</span>
                <span class="detail-field-value gold">${e.precio || 'CONSULTAR'}</span>
            </div>
            <div class="detail-field">
                <span class="detail-field-label">Estado</span>
                <span class="d-estado ${e.estado || 'disponible'}">${e.estado || 'disponible'}</span>
            </div>
            ${e.padre_id ? `<div class="detail-field"><span class="detail-field-label">Padre (Placa)</span><span class="detail-field-value gold">${e.padre_id}</span></div>` : ''}
            ${e.madre_id ? `<div class="detail-field"><span class="detail-field-label">Madre (Placa)</span><span class="detail-field-value gold">${e.madre_id}</span></div>` : ''}
            ${e.abuelo_paterno_id ? `<div class="detail-field"><span class="detail-field-label">Abuelo Paterno</span><span class="detail-field-value gold">${e.abuelo_paterno_id}</span></div>` : ''}
            ${e.abuela_paterna_id ? `<div class="detail-field"><span class="detail-field-label">Abuela Paterna</span><span class="detail-field-value gold">${e.abuela_paterna_id}</span></div>` : ''}
            ${e.abuelo_materno_id ? `<div class="detail-field"><span class="detail-field-label">Abuelo Materno</span><span class="detail-field-value gold">${e.abuelo_materno_id}</span></div>` : ''}
            ${e.abuela_materna_id ? `<div class="detail-field"><span class="detail-field-label">Abuela Materna</span><span class="detail-field-value gold">${e.abuela_materna_id}</span></div>` : ''}
            ${e.observaciones ? `<div class="detail-field" style="grid-column:span 2"><span class="detail-field-label">Observaciones</span><span class="detail-field-value">${e.observaciones}</span></div>` : ''}
        </div>
    `;
    overlay.classList.add('show');
}

/* ──────────────────────────────────────────────────
   CONSTRUCCIÓN DEL ÁRBOL CON D3.js
────────────────────────────────────────────────── */
function buildTreeData(e) {
    return {
        // Nodo raíz (Arriba)
        placa: e.placa_id || 'DUMMY',
        role:  'Ejemplar',
        color: COLORS.main,
        onClick: () => showDetailPanel(e),
        children: [
            {
                placa: e.padre_id || 'DUMMY',
                role: 'Padre',
                color: e.padre_id ? COLORS.parent : COLORS.empty,
                empty: !e.padre_id,
                children: [
                    {
                        placa: e.abuelo_paterno_id || 'DUMMY',
                        role: 'Abuelo Paterno',
                        color: e.abuelo_paterno_id ? COLORS.grandparent : COLORS.empty,
                        empty: !e.abuelo_paterno_id,
                        children: [],
                    },
                    {
                        placa: e.abuela_paterna_id || 'DUMMY',
                        role: 'Abuela Paterna',
                        color: e.abuela_paterna_id ? COLORS.grandparent : COLORS.empty,
                        empty: !e.abuela_paterna_id,
                        children: [],
                    }
                ],
            },
            {
                placa: e.madre_id || 'DUMMY',
                role: 'Madre',
                color: e.madre_id ? COLORS.parent : COLORS.empty,
                empty: !e.madre_id,
                children: [
                    {
                        placa: e.abuelo_materno_id || 'DUMMY',
                        role: 'Abuelo Materno',
                        color: e.abuelo_materno_id ? COLORS.grandparent : COLORS.empty,
                        empty: !e.abuelo_materno_id,
                        children: [],
                    },
                    {
                        placa: e.abuela_materna_id || 'DUMMY',
                        role: 'Abuela Materna',
                        color: e.abuela_materna_id ? COLORS.grandparent : COLORS.empty,
                        empty: !e.abuela_materna_id,
                        children: [],
                    }
                ],
            },
        ],
    };
}

function renderD3Tree(ejemplar) {
    const treeData = buildTreeData(ejemplar);

    // ── Jerarquía D3 ──
    const root = d3.hierarchy(treeData, d => d.children);

    // Usamos el layout de árbol de D3 con nodeSize fijo
    const treeLayout = d3.tree()
        .nodeSize([NODE_W + H_GAP, V_GAP])
        .separation((a, b) => (a.parent === b.parent ? 1.3 : 1.8));

    treeLayout(root);

    // SIN inversión: el ejemplar (raíz) queda ARRIBA, abuelos ABAJO
    // (comportamiento natural de D3 top-down)

    // Calcular bounding box
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    root.each(d => {
        if (d.x < x0) x0 = d.x;
        if (d.x > x1) x1 = d.x;
        if (d.y < y0) y0 = d.y;
        if (d.y > y1) y1 = d.y;
    });

    const padding   = 80;
    const viewW     = (x1 - x0) + NODE_W + padding * 2;
    const viewH     = (y1 - y0) + NODE_H + padding * 2;
    const offsetX   = -x0 + NODE_W / 2 + padding;
    const offsetY   = -y0 + NODE_H / 2 + padding;

    // ── SVG principal ──
    const container = document.getElementById('tree-svg-container');
    container.innerHTML = '';

    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${viewW} ${viewH}`)
        .attr('width', '100%')
        .attr('style', 'max-height: calc(100vh - 100px); display: block; margin: auto;');

    const g = svg.append('g');

    // ── LINKS (curvas de Bézier) ──
    const linkGenerator = d3.linkVertical()
        .x(d => d.x + offsetX)
        .y(d => d.y + offsetY + NODE_H / 2);  // parte inferior del nodo hijo

    // Link personalizado que sale de la parte superior del padre y llega a la inferior del hijo
    g.selectAll('path.tree-link')
        .data(root.links())
        .join('path')
        .attr('class', 'tree-link')
        .attr('d', d => {
            const sx = d.source.x + offsetX;
            const sy = d.source.y + offsetY + NODE_H;  // borde inferior del padre
            const tx = d.target.x + offsetX;
            const ty = d.target.y + offsetY;            // borde superior del hijo
            const midY = (sy + ty) / 2;
            // Curva cúbica de Bézier top → down
            return `M${sx},${sy} C${sx},${midY} ${tx},${midY} ${tx},${ty}`;
        })
        .attr('fill', 'none')
        .attr('stroke', d => {
            const src = d.source.data;
            return src.color?.stroke || 'rgba(212,175,55,0.3)';
        })
        .attr('stroke-width', 1.8)
        .attr('stroke-dasharray', '6 4')
        .attr('opacity', 0)
        .transition().duration(800).delay((_, i) => i * 120)
        .attr('opacity', 1);

    // ── NODES ──
    const nodes = g.selectAll('g.tree-node-group')
        .data(root.descendants())
        .join('g')
        .attr('class', 'tree-node-group')
        .attr('transform', d => `translate(${d.x + offsetX - NODE_W / 2}, ${d.y + offsetY})`)
        .attr('opacity', 0)
        .on('click', (event, d) => {
            if (d.data.onClick)   { d.data.onClick(); return; }
            if (d.data.empty)     return;
            // Para nodos de padre/abuelo sin handler específico: podemos simplemente ignorar o mostrar algo
        });

    // Entrada animada
    nodes.transition().duration(600).delay((_, i) => i * 100).attr('opacity', 1);

    // Fondo del nodo (rect redondeado)
    const rects = nodes.append('rect')
        .attr('class', 'tree-node-rect')
        .attr('width',  NODE_W)
        .attr('height', NODE_H)
        .attr('rx', 14).attr('ry', 14)
        .attr('fill',         d => d.data.color?.fill   || '#0f0f0f')
        .attr('stroke',       d => d.data.color?.stroke || 'rgba(212,175,55,0.2)')
        .attr('stroke-width', d => d.data.color?.strokeW || 1)
        .attr('pointer-events', 'all'); // Asegurar que capture eventos

    // Glow para el nodo principal
    nodes.filter(d => d.depth === 0)
        .append('rect')
        .attr('width',  NODE_W)
        .attr('height', NODE_H)
        .attr('rx', 14).attr('ry', 14)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(212,175,55,0.2)')
        .attr('stroke-width', 8)
        .attr('filter', 'url(#gold-glow)')
        .attr('pointer-events', 'none'); // No debe interferir

    // ─── EVENTOS DE HOVER (Tooltip) ───
    const tooltip = document.getElementById('hover-tooltip');
    
    nodes.filter(d => d.depth === 0)
        .select('.tree-node-rect')
        .style('cursor', 'pointer')
        .on('mouseover', (event) => {
            const e = ejemplar;
            tooltip.innerHTML = `
                <div class="tooltip-header">${e.placa_id}</div>
                <div class="tooltip-grid">
                    <div class="detail-field">
                        <span class="detail-field-label">Marca</span>
                        <span class="detail-field-value">${e.marca || '-'}</span>
                    </div>
                    <div class="detail-field">
                        <span class="detail-field-label">Nacimiento</span>
                        <span class="detail-field-value">${formatFecha(e.fecha_nacimiento)}</span>
                    </div>
                    <div class="detail-field">
                        <span class="detail-field-label">Línea</span>
                        <span class="detail-field-value">${e.linea || '-'}</span>
                    </div>
                    <div class="detail-field">
                        <span class="detail-field-label">Precio</span>
                        <span class="detail-field-value gold">${e.precio || 'CONSULAR'}</span>
                    </div>
                    <div class="detail-field">
                        <span class="detail-field-label">Estado</span>
                        <span class="d-estado ${e.estado || 'disponible'}" style="font-size:10px; padding:2px 6px;">${e.estado || 'disponible'}</span>
                    </div>
                </div>
            `;
            tooltip.classList.add('show');
        })
        .on('mousemove', (event) => {
            const x = event.pageX;
            const y = event.pageY;
            tooltip.style.left = (x + 15) + 'px';
            tooltip.style.top = (y + 15) + 'px';
        })
        .on('mouseout', () => {
            tooltip.classList.remove('show');
        });

    // PLACA ID (texto grande)
    nodes.append('text')
        .attr('class', 'tree-node-placa')
        .attr('x', NODE_W / 2)
        .attr('y', NODE_H / 2 - 10)
        .attr('font-size', d => d.depth === 0 ? '15px' : '13px')
        .text(d => d.data.placa);

    // ROL (texto pequeño abajo)
    nodes.append('text')
        .attr('class', 'tree-node-role')
        .attr('x', NODE_W / 2)
        .attr('y', NODE_H / 2 + 14)
        .text(d => d.data.role);


    // Filtro de glow SVG
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'gold-glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    filter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');
}

/* ──────────────────────────────────────────────────
   INICIALIZACIÓN
────────────────────────────────────────────────── */
async function init() {
    if (!ejemplarId) {
        showError('No se especificó ningún ejemplar. Vuelve a la galería y pulsa "Ver Linaje".');
        return;
    }

    try {
        const { data, error } = await API.ejemplares.getById(ejemplarId);

        if (error || !data) {
            showError('Ejemplar no encontrado en la base de datos.');
            return;
        }

        // Actualizar título pestaña
        document.title = `Linaje: ${data.placa_id} · Gallos Los Indios`;

        renderD3Tree(data);
        showTree();

    } catch (err) {
        console.error('Error en linaje:', err);
        showError('Error inesperado al cargar el árbol. Inténtalo de nuevo.');
    }
}

/* ──────────────────────────────────────────────────
   EVENTOS
────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    init();

    const overlay  = document.getElementById('detail-overlay');
    const closeBtn = document.getElementById('detail-close');

    closeBtn.addEventListener('click', () => overlay.classList.remove('show'));
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('show');
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') overlay.classList.remove('show');
    });
});
