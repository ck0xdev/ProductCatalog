document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the catalog page
    const productContainer = document.getElementById('product-container');
    if (!productContainer) return; // Exit if on contact page

    const products = window.catalogProducts || [];
    let currentCategory = 'All';
    let maxPrice = 1000;
    let searchQuery = '';
    let priceSort = 'default';

    const categoryLinks = document.querySelectorAll('#category-list a');
    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-value');
    const priceSortSelect = document.getElementById('price-sort');
    const searchInput = document.getElementById('search-input');
    const emptyState = document.getElementById('empty-state');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');

    // -- Mobile Filter Toggle --
    window.toggleFilters = () => {
        if (sidebar) sidebar.classList.toggle('show-mobile');
        if (mobileOverlay) mobileOverlay.classList.toggle('show');
    };

    // Initialize
    renderProducts();

    // -- Event Listeners --

    // Category Filter
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active from all
            categoryLinks.forEach(l => l.classList.remove('active-cat'));
            // Add active to clicked
            e.target.classList.add('active-cat');
            
            // Update current category and render
            currentCategory = e.target.getAttribute('data-category');
            renderProducts();

            // Auto-close mobile drawer when category selected
            if (window.innerWidth <= 992) {
                toggleFilters();
            }
        });
    });

    // Price Filter
    priceSlider.addEventListener('input', (e) => {
        maxPrice = parseInt(e.target.value);
        priceValue.textContent = '₹' + maxPrice;
        renderProducts();
    });

    // Search Filter
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderProducts();
    });

    // Sort Filter
    if (priceSortSelect) {
        priceSortSelect.addEventListener('change', (e) => {
            priceSort = e.target.value;
            renderProducts();
        });
    }

    // -- Render Function --
    function renderProducts() {
        // Filter the products array
        let filteredProducts = products.filter(product => {
            const matchCategory = currentCategory === 'All' || product.category === currentCategory;
            const matchPrice = product.price <= maxPrice;
            const matchSearch = product.name.toLowerCase().includes(searchQuery);
            return matchCategory && matchPrice && matchSearch;
        });

        // Sort the filtered array
        if (priceSort === 'low-high') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (priceSort === 'high-low') {
            filteredProducts.sort((a, b) => b.price - a.price);
        }

        // Clear container
        productContainer.innerHTML = '';

        if (filteredProducts.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            
            // Build HTML for each product
            filteredProducts.forEach(product => {
                let priceHTML = '';
                let discountBadge = '';
                
                if (product.originalPrice && product.originalPrice > product.price) {
                    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                    priceHTML = `
                        <div class="price-wrap">
                            <span class="price">₹${product.price}</span>
                            <span class="original-price">₹${product.originalPrice}</span>
                        </div>
                    `;
                    discountBadge = `<span class="discount-badge">${discount}% OFF</span>`;
                } else {
                    priceHTML = `<span class="price">₹${product.price}</span>`;
                }

                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <div class="product-img-wrapper">
                        <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async">
                    </div>
                    <div class="product-info">
                        <span class="cat-label">${product.category}</span>
                        <h4>${product.name}</h4>
                        <div class="badges-wrap">
                            <span class="product-badge">${product.badge}</span>
                            ${discountBadge}
                        </div>
                        <div class="card-footer">
                            ${priceHTML}
                        </div>
                    </div>
                `;
                productContainer.appendChild(card);
            });
        }
    }

    // Global reset filter function for empty state
    window.resetFilters = () => {
        currentCategory = 'All';
        maxPrice = 1000;
        searchQuery = '';
        priceSort = 'default';
        
        // Reset UI
        categoryLinks.forEach(l => l.classList.remove('active-cat'));
        document.querySelector('[data-category="All"]').classList.add('active-cat');
        priceSlider.value = 300;
        priceValue.textContent = '₹300';
        searchInput.value = '';
        if (priceSortSelect) priceSortSelect.value = 'default';

        renderProducts();
    };

    // --- Layout Toggles ---
    window.setLayout = (layoutType) => {
        // Remove existing layout classes
        productContainer.classList.remove('layout-grid-2', 'layout-list', 'layout-grid-1');
        
        // Add new layout class if needed
        if (layoutType === 'grid-2') {
            productContainer.classList.add('layout-grid-2');
        } else if (layoutType === 'grid-1') {
            productContainer.classList.add('layout-grid-1');
        } else if (layoutType === 'list') {
            productContainer.classList.add('layout-list');
        }
        
        // Update active state on buttons
        document.querySelectorAll('.layout-controls .btn-icon').forEach(btn => btn.classList.remove('active-layout'));
        document.getElementById('btn-' + layoutType).classList.add('active-layout');
    };
});
