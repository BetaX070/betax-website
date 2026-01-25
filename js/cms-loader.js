/**
 * BetaX CMS Content Loader
 * Loads content from local _data files (no external API needed)
 * @version 2.0 - with path normalization
 */

// Known files - update this list when adding new content
const KNOWN_PRODUCTS = ['irrigate-smart', 'solar-plant', 'ignite-home'];
const KNOWN_TEAM = ['umar-muhammad']; // Add new team member filenames here

// Hardcoded fallback product data (ensures products always show)
const FALLBACK_PRODUCTS = [
    {
        name: "IrrigateSmart",
        description: "IoT-powered irrigation automation system for modern farming",
        image: "/assets/images/products/product1/main.jpg",
        featured: "true",
        order: "1",
        active: "true"
    },
    {
        name: "SolarPlant",
        description: "Sustainable solar energy solutions for homes and businesses",
        image: "/assets/images/products/product2/main.jpg",
        featured: "true",
        order: "2",
        active: "true"
    },
    {
        name: "IgniteHome",
        description: "Complete smart home automation for modern living",
        image: "/assets/images/products/product3/main.jpg",
        featured: "true",
        order: "3",
        active: "true"
    }
];

// ------- Path normalization helper (fixes images & fetch on all hosts) -------
function getBasePath() {
    if (typeof window !== 'undefined' && window.__BETAX_BASE__) {
        return window.__BETAX_BASE__.replace(/\/$/, '');
    }
    const baseEl = document.querySelector && document.querySelector('base');
    if (baseEl && baseEl.getAttribute('href')) {
        return baseEl.getAttribute('href').replace(/\/$/, '');
    }
    // default: empty means origin root (works if site is root-hosted like Vercel)
    return '';
}

function normalizePath(p) {
    if (!p) return p;
    // absolute URL stays as-is
    if (/^https?:\/\//i.test(p)) return p;
    // data URIs stay as-is
    if (/^data:/i.test(p)) return p;

    const base = getBasePath();
    // handle paths that start with a slash (origin-relative)
    if (p.startsWith('/')) {
        return base ? base + p : p;
    }
    // relative paths: ensure base + '/' + p
    return base ? base + '/' + p.replace(/^\.\//, '') : p.replace(/^\.\//, '');
}
// ------- END path normalization -------

// ------- HTML escaping for XSS prevention -------
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
// ------- END HTML escaping -------


// Utility function to fetch JSON data
async function fetchData(path) {
    try {
        const response = await fetch(normalizePath(path));
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Parse markdown frontmatter
function parseMarkdown(text) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
    const match = text.match(frontmatterRegex);

    if (!match) return { meta: {}, content: text };

    const frontmatter = match[1];
    const content = text.substring(match[0].length).trim();
    const meta = {};

    // Parse YAML frontmatter
    const lines = frontmatter.split('\n');
    let currentKey = null;
    let currentValue = '';

    lines.forEach(line => {
        if (line.match(/^\s*[\w]+:/)) {
            if (currentKey) {
                meta[currentKey] = currentValue.trim().replace(/^["']|["']$/g, '');
            }
            const [key, ...valueParts] = line.split(':');
            currentKey = key.trim();
            currentValue = valueParts.join(':').trim();
        } else if (currentKey) {
            currentValue += '\n' + line;
        }
    });

    if (currentKey) {
        meta[currentKey] = currentValue.trim().replace(/^["']|["']$/g, '');
    }

    return { meta, content };
}

// Load homepage content
async function loadHomepageContent() {
    const data = await fetchData('/_data/homepage.json');
    if (!data) return;

    if (data.hero) {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroTitle) heroTitle.textContent = data.hero.title;
        if (heroSubtitle) heroSubtitle.textContent = data.hero.subtitle;
    }

    if (data.stats) {
        const statsContainer = document.querySelector('.stats-grid');
        if (statsContainer) {
            statsContainer.innerHTML = data.stats.map(stat => `
                <div class="stat-card scroll-reveal">
                    <div class="stat-number">${stat.number}</div>
                    <div class="stat-label">${stat.label}</div>
                </div>
            `).join('');
        }
    }
}

// Load products from known file list
async function loadProducts() {
    try {
        const products = [];

        for (const filename of KNOWN_PRODUCTS) {
            try {
                const response = await fetch(normalizePath(`/_data/products/${filename}.md`));
                if (response.ok) {
                    const text = await response.text();
                    const { meta } = parseMarkdown(text);
                    // Only add if we successfully parsed the name (validates it's not HTML junk)
                    if (meta && meta.name && meta.active !== 'false') {
                        products.push(meta);
                    }
                }
            } catch (e) {
                console.log(`Could not load ${filename}`);
            }
        }

        // If no products loaded from files (or all failed validation), use fallback
        const displayProducts = products.length > 0 ? products : FALLBACK_PRODUCTS;
        console.log('Products to display:', displayProducts);

        displayProducts.sort((a, b) => parseInt(a.order || 999) - parseInt(b.order || 999));

        // Update solutions page
        const solutionsGrid = document.querySelector('.solutions-grid');
        if (solutionsGrid && displayProducts.length) {
            console.log('Loading products:', displayProducts);
            solutionsGrid.innerHTML = displayProducts.map(product => `
                <div class="card product-card scroll-reveal delay-100" style="flex: 1;">
                    <div class="card-image">
                        <img src="${normalizePath(product.image)}" alt="${escapeHtml(product.name)}" 
                             onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect fill=%27%230052CC%27 width=%27400%27 height=%27300%27/%3E%3Ctext fill=%27white%27 font-family=%27Arial%27 font-size=%2724%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3E${escapeHtml(product.name)}%3C/text%3E%3C/svg%3E';">
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${escapeHtml(product.name)}</h3>
                        <p class="card-description">${escapeHtml(product.description)}</p>
                        <div class="card-actions" style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                            <a href="https://wa.me/2347035459321?text=Hello%20BetaX!%20I'm%20interested%20in%20${encodeURIComponent(product.name)}" 
                               class="btn btn-primary" 
                                target="_blank" 
                               rel="noopener noreferrer" 
                               style="flex: 1;">
                                Place Order
                            </a>
                            <a href="contact.html" class="btn btn-outline" style="flex: 1;">Contact Us</a>
                        </div>
                    </div>
                </div>
            `).join('');
        } else if (solutionsGrid) {
            console.error('No products found or failed to load');
        }

        // Update homepage featured products
        const featuredProducts = displayProducts.filter(p => p.featured === 'true');
        const homepageGrid = document.querySelector('#homepage-solutions-grid');
        if (homepageGrid) {
            const homeProducts = featuredProducts.length ? featuredProducts : displayProducts;
            console.log('Loading homepage products:', homeProducts.slice(0, 3));
            homepageGrid.innerHTML = homeProducts.slice(0, 3).map(product => `
                <div class="card scroll-reveal">
                    <div class="card-image">
                        <img src="${normalizePath(product.image)}" alt="${escapeHtml(product.name)}"
                             onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect fill=%27%230052CC%27 width=%27400%27 height=%27300%27/%3E%3Ctext fill=%27white%27 font-family=%27Arial%27 font-size=%2724%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3E${escapeHtml(product.name)}%3C/text%3E%3C/svg%3E';">
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${escapeHtml(product.name)}</h3>
                        <p class="card-description">${escapeHtml(product.description)}</p>
                        <a href="solutions.html" class="btn btn-outline">Learn More</a>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error in loadProducts:', error);
    }
}

// Load team members
async function loadTeam() {
    try {
        const teamMembers = [];

        for (const filename of KNOWN_TEAM) {
            try {
                const response = await fetch(`/_data/team/${filename}.md`);
                if (response.ok) {
                    const text = await response.text();
                    const { meta } = parseMarkdown(text);
                    if (meta.active !== 'false') {
                        teamMembers.push(meta);
                    }
                }
            } catch (e) {
                console.log(`Could not load ${filename}`);
            }
        }

        teamMembers.sort((a, b) => parseInt(a.order || 999) - parseInt(b.order || 999));

        // Update team grid if exists
        const teamGrid = document.querySelector('#team-grid');
        if (teamGrid && teamMembers.length) {
            teamGrid.innerHTML = teamMembers.map(member => `
                <div class="team-member-card scroll-reveal">
                    <div class="team-member-image">
                        <img src="${member.photo}" alt="${member.name}">
                    </div>
                    <h3 class="team-member-name">${member.name}</h3>
                    <p class="team-member-title">${member.title}</p>
                    ${member.tagline ? `<p class="team-member-tagline">"${member.tagline}"</p>` : ''}
                </div>
            `).join('');
        }

        // Update single CEO display (fallback)
        if (teamMembers.length > 0) {
            const ceo = teamMembers[0];
            const ceoName = document.querySelector('.ceo-name');
            const ceoTitle = document.querySelector('.ceo-title');
            const ceoTagline = document.querySelector('.ceo-tagline');
            const ceoImage = document.querySelector('.ceo-image-container img');

            if (ceoName) ceoName.textContent = ceo.name;
            if (ceoTitle) ceoTitle.textContent = ceo.title;
            if (ceoTagline) ceoTagline.textContent = `"${ceo.tagline}"`;
            if (ceoImage) ceoImage.src = ceo.photo;
        }
    } catch (error) {
        console.error('Error loading team:', error);
    }
}

// Load contact information
async function loadContactInfo() {
    const data = await fetchData('/_data/contact.json');
    if (!data) return;

    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.href = `mailto:${data.email}`;
        if (link.textContent.includes('@')) {
            link.textContent = data.email;
        }
    });

    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        const cleanPhone = data.phone.replace(/\s/g, '');
        link.href = `tel:${cleanPhone}`;
        if (link.textContent.includes('+')) {
            link.textContent = data.phone;
        }
    });
}

// Initialize CMS content loading
document.addEventListener('DOMContentLoaded', async function () {
    const currentPage = window.location.pathname;

    await loadContactInfo();

    if (currentPage.endsWith('index.html') || currentPage === '/' || currentPage === '') {
        await loadHomepageContent();
        await loadProducts();
    } else if (currentPage.includes('solutions.html')) {
        await loadProducts();
    } else if (currentPage.includes('team.html')) {
        await loadTeam();
    }

    if (typeof initScrollReveal === 'function') {
        setTimeout(initScrollReveal, 100);
    }
});
