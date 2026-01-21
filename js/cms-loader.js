/**
 * BetaX CMS Content Loader
 * Loads content from _data directory and updates the website dynamically
 */

// Utility function to fetch JSON data
async function fetchData(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to fetch ${path}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Parse markdown frontmatter and content
function parseMarkdown(text) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = text.match(frontmatterRegex);

    if (!match) return { meta: {}, content: text };

    const frontmatter = match[1];
    const content = match[2];
    const meta = {};

    frontmatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            let value = valueParts.join(':').trim();
            // Remove quotes if present
            value = value.replace(/^["']|["']$/g, '');
            // Handle multiline (|)
            if (value === '|') return;
            meta[key.trim()] = value;
        }
    });

    return { meta, content: content.trim() };
}

// Load homepage content
async function loadHomepageContent() {
    const data = await fetchData('/_data/homepage.json');
    if (!data) return;

    // Update hero section
    if (data.hero) {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroTitle) heroTitle.textContent = data.hero.title;
        if (heroSubtitle) heroSubtitle.textContent = data.hero.subtitle;
    }

    // Update stats
    if (data.stats) {
        const statsContainer = document.querySelector('.stats-grid');
        if (statsContainer) {
            const statsHTML = data.stats.map(stat => `
                <div class="stat-card scroll-reveal">
                    <div class="stat-number">${stat.number}</div>
                    <div class="stat-label">${stat.label}</div>
                </div>
            `).join('');
            statsContainer.innerHTML = statsHTML;
        }
    }
}

// Load products
async function loadProducts() {
    try {
        // Fetch all product markdown files
        const products = [];
        const productFiles = ['irrigate-smart', 'solar-plant', 'ignite-home'];

        for (const file of productFiles) {
            const response = await fetch(`/_data/products/${file}.md`);
            if (response.ok) {
                const text = await response.text();
                const { meta } = parseMarkdown(text);
                if (meta.active !== 'false') {
                    products.push(meta);
                }
            }
        }

        // Sort by order
        products.sort((a, b) => parseInt(a.order || 999) - parseInt(b.order || 999));

        // Update solutions page
        const solutionsGrid = document.querySelector('.solutions-grid');
        if (solutionsGrid) {
            const productsHTML = products.map(product => `
                <div class="card product-card scroll-reveal delay-100" style="flex: 1;">
                    <div class="card-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${product.name}</h3>
                        <p class="card-description">${product.description}</p>
                        <div class="card-actions">
                            <a href="contact.html" class="btn btn-primary">Contact Us</a>
                        </div>
                    </div>
                </div>
            `).join('');
            solutionsGrid.innerHTML = productsHTML;
        }

        // Update homepage featured products
        const featuredProducts = products.filter(p => p.featured === 'true');
        const homepageGrid = document.querySelector('#homepage-solutions-grid');
        if (homepageGrid && featuredProducts.length) {
            const featuredHTML = featuredProducts.slice(0, 3).map(product => `
                <div class="card scroll-reveal">
                    <div class="card-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${product.name}</h3>
                        <p class="card-description">${product.description}</p>
                        <a href="solutions.html" class="btn btn-outline">Learn More</a>
                    </div>
                </div>
            `).join('');
            homepageGrid.innerHTML = featuredHTML;
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load team members
async function loadTeam() {
    try {
        const response = await fetch('/_data/team/umar-muhammad.md');
        if (!response.ok) return;

        const text = await response.text();
        const { meta } = parseMarkdown(text);

        // Update CEO info on team page
        const ceoName = document.querySelector('.ceo-name');
        const ceoTitle = document.querySelector('.ceo-title');
        const ceoTagline = document.querySelector('.ceo-tagline');
        const ceoImage = document.querySelector('.ceo-image-container img');

        if (ceoName) ceoName.textContent = meta.name;
        if (ceoTitle) ceoTitle.textContent = meta.title;
        if (ceoTagline) ceoTagline.textContent = meta.tagline;
        if (ceoImage) ceoImage.src = meta.photo;
    } catch (error) {
        console.error('Error loading team:', error);
    }
}

// Load contact information
async function loadContactInfo() {
    const data = await fetchData('/_data/contact.json');
    if (!data) return;

    // Update all email links
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.href = `mailto:${data.email}`;
        if (link.textContent.includes('@')) {
            link.textContent = data.email;
        }
    });

    // Update all phone links
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        const cleanPhone = data.phone.replace(/\s/g, '');
        link.href = `tel:${cleanPhone}`;
        if (link.textContent.includes('+')) {
            link.textContent = data.phone;
        }
    });

    // Update address
    document.querySelectorAll('p').forEach(p => {
        if (p.textContent.includes('Zoo Road') || p.textContent.includes('Kano')) {
            p.textContent = data.address;
        }
    });
}

// Initialize CMS content loading
document.addEventListener('DOMContentLoaded', async function () {
    const currentPage = window.location.pathname;

    // Load contact info on all pages (footer)
    await loadContactInfo();

    // Load page-specific content
    if (currentPage.endsWith('index.html') || currentPage === '/') {
        await loadHomepageContent();
        await loadProducts(); // For featured products
    } else if (currentPage.includes('solutions.html')) {
        await loadProducts();
    } else if (currentPage.includes('team.html')) {
        await loadTeam();
    }

    // Re-trigger scroll animations after content loads
    if (typeof initScrollReveal === 'function') {
        initScrollReveal();
    }
});
