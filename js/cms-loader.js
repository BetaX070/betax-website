/**
 * BetaX CMS Content Loader
 * Loads content from local _data files (no external API needed)
 */

// Known files - update this list when adding new content
const KNOWN_PRODUCTS = ['irrigate-smart', 'solar-plant', 'ignite-home'];
const KNOWN_TEAM = ['umar-muhammad']; // Add new team member filenames here

// Utility function to fetch JSON data
async function fetchData(path) {
    try {
        const response = await fetch(path);
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
                const response = await fetch(`/_data/products/${filename}.md`);
                if (response.ok) {
                    const text = await response.text();
                    const { meta } = parseMarkdown(text);
                    if (meta.active !== 'false') {
                        products.push(meta);
                    }
                }
            } catch (e) {
                console.log(`Could not load ${filename}`);
            }
        }

        products.sort((a, b) => parseInt(a.order || 999) - parseInt(b.order || 999));

        // Update solutions page
        const solutionsGrid = document.querySelector('.solutions-grid');
        if (solutionsGrid && products.length) {
            solutionsGrid.innerHTML = products.map(product => `
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
        }

        // Update homepage featured products
        const featuredProducts = products.filter(p => p.featured === 'true');
        const homepageGrid = document.querySelector('#homepage-solutions-grid');
        if (homepageGrid) {
            const displayProducts = featuredProducts.length ? featuredProducts : products;
            homepageGrid.innerHTML = displayProducts.slice(0, 3).map(product => `
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
        }
    } catch (error) {
        console.error('Error loading products:', error);
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
