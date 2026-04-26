// URL CSV para el proyecto Santo Guaton
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTE9GBeLp-9iQoegNCb8-mBiImY1LKfGTX44f7jVFe8KvrkATPv8sudiuyEuh-aYyYZegs34tmziwkq/pub?gid=0&single=true&output=csv';

const COLUMS = {
    nombre: 'NOMBRE',
    descripcion: 'DESCRIPCIÓN',
    precio: 'PRECIO',
    imagen: 'IMAGEN',
    categoria: 'CATEGORIA',
    disponibilidad: 'DISPONIBILIDAD',
    etiqueta1: 'ETIQUETA1',
    precio1: 'PRECIO1',
    etiqueta2: 'ETIQUETA2',
    precio2: 'PRECIO2',
    etiqueta3: 'ETIQUETA3',
    precio3: 'PRECIO3'
};

let allMenuItems = [];
let currentSearchTerm = '';
let currentCategory = 'TODOS';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year').textContent = new Date().getFullYear();
    initializeApp();
});

async function initializeApp() {
    try {
        const response = await fetch(GOOGLE_SHEET_URL + '&t=' + Date.now(), { cache: 'no-store' });
        if (!response.ok) throw new Error('Error al cargar los datos');
        const csvText = await response.text();
        allMenuItems = parseCSVToObj(csvText);

        renderCategoryFilters(allMenuItems);
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const val = e.target.value.trim().toLowerCase();
                if (val.length >= 2) {
                    currentSearchTerm = val;
                    currentCategory = 'TODOS';
                    document.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.remove('active');
                        if(btn.textContent === 'TODOS') btn.classList.add('active');
                    });
                    applyFilters();
                } else {
                    if (currentSearchTerm !== '') {
                        currentSearchTerm = '';
                        applyFilters();
                    }
                }
            });
        }


        renderMenuItems(allMenuItems);
        
    } catch (error) {
        console.error('Error detallado:', error);
        document.getElementById('menu-grid').innerHTML = `<p style="text-align:center; grid-column: 1/-1; font-size: 1.5rem; color: #ff0000;">FALLARON LOS BAJONES :(<br>Error: ${error.message} <br><br><span style="font-size: 1rem; color: #fff;">Si dice "Failed to fetch" estás abriendo el archivo localmente y el navegador bloquea la conexión (CORS). Súbelo a un servidor.</span></p>`;
    } finally {
        setTimeout(hideLoader, 800); 
    }
}

function hideLoader() {
    const loader = document.getElementById('loader-wrapper');
    const mainContent = document.getElementById('main-content');
    
    loader.classList.add('fade-out');
    mainContent.classList.remove('hidden');
    
    setTimeout(() => {
        loader.style.display = 'none';
    }, 500);
}

function renderCategoryFilters(items) {
    const filtersContainer = document.getElementById('category-filters');
    if (!filtersContainer) return;
    
    const categories = ['TODOS'];
    items.forEach(item => {
        const cat = item[COLUMS.categoria];
        if (cat && cat.trim() !== '' && !categories.includes(cat.trim().toUpperCase())) {
            categories.push(cat.trim().toUpperCase());
        }
    });
    
    if (categories.length <= 1) {
        filtersContainer.style.display = 'none';
        return;
    }
    
    filtersContainer.innerHTML = '';
    
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = `filter-btn ${category === 'TODOS' ? 'active' : ''}`;
        btn.textContent = category;
        btn.onclick = () => filterByCategory(category, btn);
        filtersContainer.appendChild(btn);
    });
}

function filterByCategory(category, buttonElement) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (buttonElement) buttonElement.classList.add('active');
    
    currentCategory = category;
    
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value !== '') {
        searchInput.value = '';
        currentSearchTerm = '';
    }

    applyFilters();
}

function applyFilters() {
    let filtered = allMenuItems;
    
    if (currentCategory !== 'TODOS') {
        filtered = filtered.filter(item => {
            const cat = item[COLUMS.categoria];
            return cat && cat.trim().toUpperCase() === currentCategory;
        });
    }
    
    if (currentSearchTerm.length >= 2) {
        filtered = filtered.filter(item => {
            const nombre = (item[COLUMS.nombre] || '').toLowerCase();
            const desc = (item[COLUMS.descripcion] || '').toLowerCase();
            const catItem = (item[COLUMS.categoria] || '').toLowerCase();
            return nombre.includes(currentSearchTerm) || desc.includes(currentSearchTerm) || catItem.includes(currentSearchTerm);
        });
    }
    
    renderMenuItems(filtered);
}

function renderMenuItems(items) {
    const grid = document.getElementById('menu-grid');
    grid.innerHTML = ''; 
    
    if (items.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; font-size: 1.5rem;">Cero bajones por acá.</p>';
        return;
    }

    const formatPrice = (p) => {
        if (!p) return '';
        const cleaned = p.trim();
        if (cleaned.toLowerCase() === 'consultar' || cleaned.includes('$')) return cleaned;
        return '$' + cleaned;
    };

    const getFallbackImage = (cat, nom) => {
        const text = (String(cat) + ' ' + String(nom)).toLowerCase();
        const nameHash = Array.from(text).reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0);
        const getImg = (arr) => {
            const id = arr[Math.abs(nameHash) % arr.length];
            return `https://images.unsplash.com/photo-${id}?w=600&h=400&fit=crop`;
        };

        if (text.includes('papita') || text.includes('papas') || text.includes('salchipapa')) {
            return getImg(['1576107232684-1279f390859f', '1630431341973-02e1b662ce3b', '1585507119028-9bfceddb8311']);
        }
        if (text.includes('tocomple') || text.includes('completo')) {
            return getImg(['1612392062631-94ddbfc9ff54', '1590165482329-87a4128913bd']);
        }
        if (text.includes('sanguchito') || text.includes('mechada') || text.includes('sandwich')) {
            return getImg(['1619881589316-56c7f9e6b587', '1528735602780-2552fd46c7af']);
        }
        if (text.includes('schop') || text.includes('botellin') || text.includes('cerveza') || text.includes('michelada')) {
            return getImg(['1566816288339-bc78b30f3c5f', '1535958636474-b021ee887b13', '1572116469696-ed7aeeafabe6']);
        }
        if (text.includes('piscola') || text.includes('mojito') || text.includes('gincito') || text.includes('trago')) {
            return getImg(['1536935338788-846bb9981813', '1514362545857-3bc16c4c7d1b', '1556679343-c7306c1976bc']);
        }

        // Generic urban fast food
        return getImg(['1550547660-d9450f859349', '1561758033-48d52648faa7']);
    };

    items.forEach((item, index) => {
        if (!item[COLUMS.nombre]) return;
        
        const disponible = (item[COLUMS.disponibilidad] || '').toLowerCase();
        const isUnavailable = disponible === 'no' || disponible === 'falso' || disponible === 'false' || disponible === 'agotado';
        
        const card = document.createElement('article');
        card.className = `menu-card ${isUnavailable ? 'unavailable' : ''}`;
        card.style.animationDelay = `${index * 0.05}s`; 
        
        const fallbackImg = getFallbackImage(item[COLUMS.categoria], item[COLUMS.nombre]);
        const imgUrl = item[COLUMS.imagen] || fallbackImg;
        
        let priceHtml = '';
        let dualPriceHtml = '';
        const precio1 = item[COLUMS.precio1] ? item[COLUMS.precio1].trim() : '';
        const precio2 = item[COLUMS.precio2] ? item[COLUMS.precio2].trim() : '';
        const precio3 = item[COLUMS.precio3] ? item[COLUMS.precio3].trim() : '';
        const precioPrincipal = item[COLUMS.precio] ? item[COLUMS.precio].trim() : '';
        
        if (precio1 || precio2 || precio3) {
            dualPriceHtml = '<div class="dual-price-container">';
            if (precio1) {
                const etiq1 = item[COLUMS.etiqueta1] ? item[COLUMS.etiqueta1].trim() : '';
                dualPriceHtml += `<div class="price-item"><span class="price-label">${etiq1}</span><span class="price-value">${formatPrice(precio1)}</span></div>`;
            }
            if (precio2) {
                const etiq2 = item[COLUMS.etiqueta2] ? item[COLUMS.etiqueta2].trim() : '';
                dualPriceHtml += `<div class="price-item"><span class="price-label">${etiq2}</span><span class="price-value">${formatPrice(precio2)}</span></div>`;
            }
            if (precio3) {
                const etiq3 = item[COLUMS.etiqueta3] ? item[COLUMS.etiqueta3].trim() : '';
                dualPriceHtml += `<div class="price-item"><span class="price-label">${etiq3}</span><span class="price-value">${formatPrice(precio3)}</span></div>`;
            }
            dualPriceHtml += '</div>';
        } else if (precioPrincipal) {
            priceHtml = `<div class="price-container"><span class="card-price">${formatPrice(precioPrincipal)}</span></div>`;
        }
        
        const descText = item[COLUMS.descripcion] ? item[COLUMS.descripcion].trim() : '';
        const descHtml = descText ? `<p class="card-desc">${descText}</p>` : '';
        
        let titleAndDescAndPrice = '';
        if (dualPriceHtml) {
            titleAndDescAndPrice = `
                <h2 class="card-title">${item[COLUMS.nombre]}</h2>
                ${descHtml}
                ${dualPriceHtml}
            `;
        } else {
            if (descText) {
                titleAndDescAndPrice = `
                    <h2 class="card-title">${item[COLUMS.nombre]}</h2>
                    <div class="single-price-row">
                        ${descHtml}
                        ${priceHtml}
                    </div>
                `;
            } else {
                titleAndDescAndPrice = `
                    <div class="single-price-row title-price-row">
                        <h2 class="card-title">${item[COLUMS.nombre]}</h2>
                        ${priceHtml}
                    </div>
                `;
            }
        }

        card.innerHTML = `
            <div class="card-image-wrapper">
                ${isUnavailable ? '<div class="unavailable-overlay">Agotado</div>' : ''}
                <img src="${imgUrl}" alt="${item[COLUMS.nombre]}" class="card-image" loading="${index < 4 ? 'eager' : 'lazy'}" onerror="this.src='https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop'">
            </div>
            <div class="card-content">
                <span class="card-category-label">${item[COLUMS.categoria] || ''}</span>
                ${titleAndDescAndPrice}
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function parseCSVToObj(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    
    const headers = splitCSVLine(lines[0]);
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = splitCSVLine(line);
        const obj = {};
        
        headers.forEach((header, index) => {
            const h = header.trim();
            obj[h] = values[index] ? values[index].trim() : '';
        });
        
        results.push(obj);
    }
    
    return results;
}

function splitCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"' && line[i+1] === '"') {
            current += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    
    return result;
}
