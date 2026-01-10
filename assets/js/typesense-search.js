// ========================================
// TYPESENSE SEARCH MODULE
// Things to Do in Albuquerque page
// ========================================
(function() {
    'use strict';

    // Configuration - Replace with your Typesense Cloud credentials
    const TYPESENSE_CONFIG = {
        host: 'bp1mzwg09hxvkeqop-1.a1.typesense.net',  // Replace with your Typesense Cloud host
        port: '443',
        protocol: 'https',
        apiKey: 'NCevdTNlbc1Q5NhPjWajGyjDYB4sEhLn',  // Replace with your search-only API key
        collection: 'activities'
    };

    // DOM Elements
    let searchInput;
    let searchButton;
    let resultsContainer;
    let resultsCount;
    let loadingIndicator;
    let noResults;
    let filterButtons;
    let currentCategory = 'all';
    let debounceTimer;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Skip if not on things-to-do page
        if (!document.getElementById('activity-search')) return;

        // Get DOM elements
        searchInput = document.getElementById('activity-search');
        searchButton = document.getElementById('search-button');
        resultsContainer = document.getElementById('activity-results');
        resultsCount = document.getElementById('results-count');
        loadingIndicator = document.getElementById('loading-indicator');
        noResults = document.getElementById('no-results');
        filterButtons = document.querySelectorAll('.filter-btn');

        // Event listeners
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(searchInput.value);
            }
        });
        searchButton.addEventListener('click', function() {
            performSearch(searchInput.value);
        });

        // Category filter listeners
        filterButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                filterButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                currentCategory = this.dataset.category;
                performSearch(searchInput.value);
            });
        });

        // Load initial results (show all)
        performSearch('');
    });

    // Debounced search on input
    function handleSearchInput(e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() {
            performSearch(e.target.value);
        }, 300);
    }

    // Perform search against Typesense
    async function performSearch(query) {
        showLoading(true);
        hideNoResults();

        try {
            var searchParams = {
                q: query || '*',
                query_by: 'name,description,category,tags,subcategory,highlights,best_for',
                per_page: 50
            };

            // Add category filter if not "all"
            if (currentCategory !== 'all') {
                searchParams.filter_by = 'category:=' + currentCategory;
            }

            var response = await typesenseSearch(searchParams);
            displayResults(response);
        } catch (error) {
            console.error('Search error:', error);
            showError();
        } finally {
            showLoading(false);
        }
    }

    // Make API call to Typesense
    async function typesenseSearch(params) {
        var queryParts = [];
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                queryParts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
            }
        }
        var queryString = queryParts.join('&');
        var url = TYPESENSE_CONFIG.protocol + '://' + TYPESENSE_CONFIG.host + ':' + TYPESENSE_CONFIG.port + '/collections/' + TYPESENSE_CONFIG.collection + '/documents/search?' + queryString;

        var response = await fetch(url, {
            headers: {
                'X-TYPESENSE-API-KEY': TYPESENSE_CONFIG.apiKey
            }
        });

        if (!response.ok) {
            throw new Error('Search request failed');
        }

        return response.json();
    }

    // Display search results
    function displayResults(response) {
        var hits = response.hits || [];

        // Update results count
        var found = response.found || 0;
        resultsCount.textContent = found + ' ' + (found === 1 ? 'activity' : 'activities') + ' found';

        if (hits.length === 0) {
            resultsContainer.innerHTML = '';
            showNoResults();
            return;
        }

        var html = '';
        for (var i = 0; i < hits.length; i++) {
            html += createActivityCard(hits[i].document);
        }
        resultsContainer.innerHTML = html;
    }

    // Create HTML for activity card
    function createActivityCard(activity) {
        var imageHtml = activity.image_url
            ? '<img src="' + escapeHtml(activity.image_url) + '" alt="' + escapeHtml(activity.name) + '" class="activity-image" loading="lazy">'
            : '<div class="activity-image-placeholder"></div>';

        var tagsHtml = '';
        if (activity.tags && activity.tags.length > 0) {
            var tagsToShow = activity.tags.slice(0, 4);
            for (var i = 0; i < tagsToShow.length; i++) {
                tagsHtml += '<span class="activity-tag">' + escapeHtml(tagsToShow[i]) + '</span>';
            }
        }

        var highlightsHtml = '';
        if (activity.highlights && activity.highlights.length > 0) {
            highlightsHtml = '<ul class="activity-highlights">';
            for (var j = 0; j < activity.highlights.length; j++) {
                highlightsHtml += '<li>' + escapeHtml(activity.highlights[j]) + '</li>';
            }
            highlightsHtml += '</ul>';
        }

        var websiteLink = activity.website_url
            ? '<a href="' + escapeHtml(activity.website_url) + '" target="_blank" rel="noopener noreferrer" class="card-link">Visit Website &rarr;</a>'
            : '';

        var distanceHtml = activity.distance_from_venue
            ? '<p class="activity-distance">' + escapeHtml(activity.distance_from_venue) + ' from venue</p>'
            : '';

        var priceHtml = activity.price_range
            ? '<span class="activity-price">' + escapeHtml(activity.price_range) + '</span>'
            : '';

        return '<article class="activity-card">' +
            imageHtml +
            '<div class="activity-content">' +
                '<div class="activity-header">' +
                    '<span class="activity-category">' + escapeHtml(activity.category) + '</span>' +
                    priceHtml +
                '</div>' +
                '<h3 class="activity-name">' + escapeHtml(activity.name) + '</h3>' +
                '<p class="activity-description">' + escapeHtml(activity.description) + '</p>' +
                distanceHtml +
                highlightsHtml +
                '<div class="activity-tags">' + tagsHtml + '</div>' +
                websiteLink +
            '</div>' +
        '</article>';
    }

    // Utility: Escape HTML to prevent XSS
    function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Utility: Show/hide loading indicator
    function showLoading(show) {
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'flex' : 'none';
        }
    }

    // Utility: Show no results message
    function showNoResults() {
        if (noResults) {
            noResults.style.display = 'block';
        }
    }

    // Utility: Hide no results message
    function hideNoResults() {
        if (noResults) {
            noResults.style.display = 'none';
        }
    }

    // Utility: Show error message
    function showError() {
        if (resultsContainer) {
            resultsContainer.innerHTML = '<p class="error-message">An error occurred while searching. Please try again.</p>';
        }
    }
})();
