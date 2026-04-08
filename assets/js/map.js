document.addEventListener('DOMContentLoaded', function () {
    var mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    var panLayer = document.getElementById('map-pan-layer');
    var mapImage = document.getElementById('map-image');

    var MAP_LOCATIONS = [
        {
            id: 'venue',
            name: 'Albuquerque Museum',
            type: 'venue',
            label: 'Venue',
            address: '2000 Mountain Rd NW',
            description: 'The home of Blastoff Rails.',
            detail: null,
            distance: null,
            url: 'https://www.cabq.gov/artsculture/albuquerque-museum/',
            x: 57.6,
            y: 61.0
        },
        {
            id: 'hotel-abq',
            name: 'Hotel Albuquerque',
            type: 'hotel',
            label: 'Hotel',
            address: '800 Rio Grande Blvd NW',
            description: 'Historic hotel in Old Town.',
            detail: '$250 - $300/night',
            distance: '6 min walk',
            url: 'https://www.hotelabq.com/',
            x: 40.3,
            y: 27.4
        },
        {
            id: 'best-western',
            name: 'Best Western Rio Grande Inn',
            type: 'hotel',
            label: 'Hotel',
            address: '1015 Rio Grande Blvd NW',
            description: 'Budget-friendly with free airport shuttle.',
            detail: '$150 - $200/night',
            distance: '12 min walk',
            url: 'https://riograndeinn.com/',
            x: 18.4,
            y: 10.8
        },
        {
            id: 'sawmill',
            name: 'Sawmill Market',
            type: 'food',
            label: 'Food Hall',
            address: '1909 Bellamah Ave NW',
            description: 'Vibrant food hall with local vendors and diverse dining.',
            detail: null,
            distance: '8 min walk',
            url: 'https://www.sawmillmarket.com/',
            x: 59.2,
            y: 25.5
        },
        {
            id: 'old-town',
            name: 'Old Town Albuquerque',
            type: 'attraction',
            label: 'Attraction',
            address: 'Old Town Historic District',
            description: 'The historic heart of Albuquerque with restaurants, shops, and galleries.',
            detail: null,
            distance: '5 min walk',
            url: 'https://www.albuquerqueoldtown.com/',
            x: 17.9,
            y: 81.0
        },
        {
            id: 'tiguex-park',
            name: 'Tiguex Park',
            type: 'attraction',
            label: 'Park',
            address: '1800 Mountain Rd NW',
            description: 'Beautiful park right next to the museum, perfect for a break between sessions.',
            detail: null,
            distance: 'Right next to venue',
            url: 'https://www.cabq.gov/parksandrecreation/parks/prescription-trails/87104/tiguex-park',
            x: 87.0,
            y: 74.1
        },
        {
            id: 'church-street-cafe',
            name: 'Church Street Cafe',
            type: 'food',
            label: 'Restaurant',
            address: '2111 Church St NW',
            description: 'New Mexican cuisine in a historic Old Town adobe building.',
            detail: null,
            distance: '5 min walk',
            url: 'https://www.churchstreetcafe.com/',
            x: 21.1,
            y: 62.9
        },
        {
            id: 'natural-history-museum',
            name: 'NM Museum of Natural History',
            type: 'attraction',
            label: 'Museum',
            address: '1801 Mountain Rd NW',
            description: 'Explore New Mexico\'s natural history from dinosaurs to the Ice Age and beyond.',
            detail: null,
            distance: '5 min walk',
            url: 'https://www.nmnaturalhistory.org/',
            x: 95.5,
            y: 57.8
        }
    ];

    var isMobile = window.matchMedia('(hover: none)').matches;
    var activePopupId = null;
    var stickyPopupId = null;
    var hoverHideTimeout = null;

    // --- Pan state ---
    var panX = 0;
    var panY = 0;
    var isDragging = false;
    var dragStartX = 0;
    var dragStartY = 0;
    var dragStartPanX = 0;
    var dragStartPanY = 0;
    var dragMoved = false;
    var DRAG_THRESHOLD = 5;
    var ELASTIC_FACTOR = 0.3;
    var MAX_OVERSCROLL = 100;

    function initMap() {
        // Wait for image to load so we know its dimensions
        if (mapImage.complete) {
            onImageReady();
        } else {
            mapImage.addEventListener('load', onImageReady);
        }
    }

    function onImageReady() {
        // Center the map initially
        centerMap();

        MAP_LOCATIONS.forEach(function (loc) {
            var marker = createMarker(loc);
            var popup = createPopup(loc);
            panLayer.appendChild(marker);
            // On mobile, append popups to body so position:fixed works
            // (transform on panLayer creates a new containing block that breaks fixed positioning)
            if (isMobile) {
                document.body.appendChild(popup);
            } else {
                panLayer.appendChild(popup);
            }
            attachMarkerEvents(marker, popup, loc);
        });

        attachPanEvents();
        // Coordinate picker is a dev tool — enable with ?picker in the URL
        if (window.location.search.indexOf('picker') !== -1) {
            initCoordinatePicker();
        }

        document.addEventListener('click', function (e) {
            if (!e.target.closest('.map-marker') && !e.target.closest('.map-popup')) {
                hideAllPopups();
            }
        });

        window.addEventListener('resize', function () {
            clampPan();
            applyPan();
        });
    }

    function getMapDimensions() {
        return {
            imgW: mapImage.offsetWidth,
            imgH: mapImage.offsetHeight,
            viewW: mapContainer.clientWidth,
            viewH: mapContainer.clientHeight
        };
    }

    function centerMap() {
        var d = getMapDimensions();
        panX = -(d.imgW - d.viewW) / 2;
        panY = -(d.imgH - d.viewH) / 2;
        clampPan();
        applyPan();
    }

    function getPanBounds() {
        var d = getMapDimensions();
        return {
            minX: d.imgW <= d.viewW ? (d.viewW - d.imgW) / 2 : d.viewW - d.imgW,
            maxX: d.imgW <= d.viewW ? (d.viewW - d.imgW) / 2 : 0,
            minY: d.imgH <= d.viewH ? (d.viewH - d.imgH) / 2 : d.viewH - d.imgH,
            maxY: d.imgH <= d.viewH ? (d.viewH - d.imgH) / 2 : 0
        };
    }

    function clampPan() {
        var b = getPanBounds();
        panX = Math.min(b.maxX, Math.max(panX, b.minX));
        panY = Math.min(b.maxY, Math.max(panY, b.minY));
    }

    function elasticPan(rawX, rawY) {
        var b = getPanBounds();

        panX = applyElastic(rawX, b.minX, b.maxX);
        panY = applyElastic(rawY, b.minY, b.maxY);
    }

    function applyElastic(value, min, max) {
        if (value > max) {
            var over = value - max;
            return max + Math.min(over * ELASTIC_FACTOR, MAX_OVERSCROLL);
        }
        if (value < min) {
            var over = min - value;
            return min - Math.min(over * ELASTIC_FACTOR, MAX_OVERSCROLL);
        }
        return value;
    }

    function bounceBack() {
        panLayer.classList.add('is-bouncing');
        clampPan();
        applyPan();

        // Remove transition class after animation completes
        function onEnd() {
            panLayer.classList.remove('is-bouncing');
            panLayer.removeEventListener('transitionend', onEnd);
        }
        panLayer.addEventListener('transitionend', onEnd);
    }

    function applyPan() {
        panLayer.style.transform = 'translate(' + panX + 'px, ' + panY + 'px)';
    }

    // --- Pan events ---
    function attachPanEvents() {
        // Mouse
        mapContainer.addEventListener('mousedown', onDragStart);
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);

        // Touch
        mapContainer.addEventListener('touchstart', onTouchStart, { passive: false });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);
    }

    function onDragStart(e) {
        // Don't start drag from popups
        if (e.target.closest('.map-popup')) return;

        panLayer.classList.remove('is-bouncing');
        isDragging = true;
        dragMoved = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartPanX = panX;
        dragStartPanY = panY;
        mapContainer.classList.add('is-dragging');
        e.preventDefault();
    }

    function onDragMove(e) {
        if (!isDragging) return;

        var dx = e.clientX - dragStartX;
        var dy = e.clientY - dragStartY;

        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
            dragMoved = true;
        }

        elasticPan(dragStartPanX + dx, dragStartPanY + dy);
        applyPan();
    }

    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        mapContainer.classList.remove('is-dragging');
        bounceBack();
    }

    function onTouchStart(e) {
        if (e.target.closest('.map-popup')) return;
        if (e.touches.length !== 1) return;

        panLayer.classList.remove('is-bouncing');
        isDragging = true;
        dragMoved = false;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        dragStartPanX = panX;
        dragStartPanY = panY;
    }

    function onTouchMove(e) {
        if (!isDragging) return;
        if (e.touches.length !== 1) return;

        var dx = e.touches[0].clientX - dragStartX;
        var dy = e.touches[0].clientY - dragStartY;

        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
            dragMoved = true;
        }

        elasticPan(dragStartPanX + dx, dragStartPanY + dy);
        applyPan();
        e.preventDefault();
    }

    function onTouchEnd() {
        if (!isDragging) return;
        isDragging = false;
        bounceBack();
    }

    // --- Markers ---
    function createMarker(loc) {
        var btn = document.createElement('button');
        btn.className = 'map-marker map-marker--' + loc.type;
        btn.setAttribute('aria-label', loc.name);
        btn.setAttribute('data-location-id', loc.id);
        btn.style.left = loc.x + '%';
        btn.style.top = loc.y + '%';

        var dot = document.createElement('span');
        dot.className = 'map-marker__dot';
        btn.appendChild(dot);

        return btn;
    }

    function createPopup(loc) {
        var popup = document.createElement('div');
        popup.className = 'map-popup';
        popup.id = 'popup-' + loc.id;

        var html = '<div class="map-popup__header">' +
            '<span class="map-popup__type map-popup__type--' + loc.type + '">' + loc.label + '</span>' +
            '<button class="map-popup__close" aria-label="Close">&times;</button>' +
            '</div>' +
            '<h3 class="map-popup__name">' + loc.name + '</h3>' +
            '<p class="map-popup__address">' + loc.address + '</p>';

        if (loc.distance) {
            html += '<p class="map-popup__distance">' + loc.distance + '</p>';
        }

        html += '<p class="map-popup__description">' + loc.description + '</p>';

        if (loc.detail) {
            html += '<p class="map-popup__detail">' + loc.detail + '</p>';
        }

        html += '<a href="' + loc.url + '" target="_blank" rel="noopener noreferrer" class="map-popup__link">Learn More &rarr;</a>';

        popup.innerHTML = html;

        popup.querySelector('.map-popup__close').addEventListener('click', function (e) {
            e.stopPropagation();
            hideAllPopups();
        });

        return popup;
    }

    function attachMarkerEvents(marker, popup, loc) {
        if (isMobile) {
            marker.addEventListener('click', function (e) {
                e.stopPropagation();
                if (dragMoved) return;
                if (activePopupId === loc.id) {
                    hideAllPopups();
                } else {
                    showPopup(loc.id);
                }
            });
        } else {
            marker.addEventListener('mouseenter', function () {
                clearTimeout(hoverHideTimeout);
                if (!stickyPopupId) {
                    showPopup(loc.id);
                }
            });

            marker.addEventListener('mouseleave', function () {
                if (!stickyPopupId) {
                    hoverHideTimeout = setTimeout(hideAllPopups, 200);
                }
            });

            popup.addEventListener('mouseenter', function () {
                clearTimeout(hoverHideTimeout);
            });

            popup.addEventListener('mouseleave', function () {
                if (!stickyPopupId) {
                    hoverHideTimeout = setTimeout(hideAllPopups, 200);
                }
            });

            marker.addEventListener('click', function (e) {
                e.stopPropagation();
                if (dragMoved) return;
                if (stickyPopupId === loc.id) {
                    stickyPopupId = null;
                    hideAllPopups();
                } else {
                    stickyPopupId = loc.id;
                    showPopup(loc.id);
                }
            });
        }
    }

    function showPopup(locationId) {
        hideAllPopups();

        var marker = panLayer.querySelector('[data-location-id="' + locationId + '"]');
        var popup = document.getElementById('popup-' + locationId);
        if (!marker || !popup) return;

        marker.classList.add('map-marker--active');
        popup.classList.add('map-popup--visible');
        activePopupId = locationId;

        if (!isMobile) {
            positionPopup(popup, marker);
        }
    }

    function hideAllPopups() {
        var markers = panLayer.querySelectorAll('.map-marker--active');
        var popups = document.querySelectorAll('.map-popup--visible');

        markers.forEach(function (m) { m.classList.remove('map-marker--active'); });
        popups.forEach(function (p) { p.classList.remove('map-popup--visible'); });

        activePopupId = null;
        stickyPopupId = null;
    }

    function positionPopup(popup, marker) {
        var containerRect = mapContainer.getBoundingClientRect();
        var markerRect = marker.getBoundingClientRect();
        var popupWidth = 260;
        var gap = 12;

        // Marker position relative to the pan layer
        var markerCenterX = markerRect.left - containerRect.left - panX + markerRect.width / 2;
        var markerTopY = markerRect.top - containerRect.top - panY;
        var markerBottomY = markerTopY + markerRect.height;

        // Temporarily show to measure height
        popup.style.visibility = 'hidden';
        popup.style.display = 'block';
        popup.style.left = '0';
        popup.style.top = '0';
        var popupHeight = popup.offsetHeight;
        popup.style.display = '';
        popup.style.visibility = '';

        var left = markerCenterX - popupWidth / 2;
        var top;

        // Place above by default, below if not enough room (relative to viewport)
        var markerScreenTop = markerRect.top - containerRect.top;
        if (markerScreenTop - gap - popupHeight < 0) {
            top = markerBottomY + gap;
        } else {
            top = markerTopY - gap - popupHeight;
        }

        // Clamp horizontally within the image
        var imgW = mapImage.offsetWidth;
        if (left < 8) left = 8;
        if (left + popupWidth > imgW - 8) {
            left = imgW - popupWidth - 8;
        }

        popup.style.left = left + 'px';
        popup.style.top = top + 'px';
    }

    // --- Coordinate Picker (dev tool — remove when done) ---
    function initCoordinatePicker() {
        var pickerEnabled = false;
        var coordLog = [];

        // Toggle button
        var toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'Coord Picker: OFF';
        toggleBtn.style.cssText = 'position:fixed;bottom:1rem;left:1rem;z-index:200;padding:0.5rem 1rem;' +
            'background:#333;color:#fff;border:none;border-radius:6px;font-size:0.85rem;cursor:pointer;opacity:0.8;';
        document.body.appendChild(toggleBtn);

        // Output panel
        var panel = document.createElement('div');
        panel.style.cssText = 'position:fixed;bottom:3.5rem;left:1rem;z-index:200;background:rgba(0,0,0,0.85);' +
            'color:#0f0;font-family:monospace;font-size:0.8rem;padding:0.75rem;border-radius:8px;' +
            'max-height:300px;overflow-y:auto;display:none;min-width:220px;';
        document.body.appendChild(panel);

        // Crosshair
        var crosshairH = document.createElement('div');
        var crosshairV = document.createElement('div');
        var crosshairStyle = 'position:fixed;z-index:150;pointer-events:none;display:none;';
        crosshairH.style.cssText = crosshairStyle + 'left:0;width:100%;height:1px;background:rgba(255,0,0,0.5);';
        crosshairV.style.cssText = crosshairStyle + 'top:0;height:100%;width:1px;background:rgba(255,0,0,0.5);';
        document.body.appendChild(crosshairH);
        document.body.appendChild(crosshairV);

        toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            pickerEnabled = !pickerEnabled;
            toggleBtn.textContent = 'Coord Picker: ' + (pickerEnabled ? 'ON' : 'OFF');
            toggleBtn.style.background = pickerEnabled ? '#c00' : '#333';
            panel.style.display = pickerEnabled ? 'block' : 'none';
            crosshairH.style.display = pickerEnabled ? 'block' : 'none';
            crosshairV.style.display = pickerEnabled ? 'block' : 'none';
            if (pickerEnabled && coordLog.length === 0) {
                panel.innerHTML = '<em>Click on the map to log coordinates</em>';
            }
        });

        // Crosshair follows mouse
        document.addEventListener('mousemove', function (e) {
            if (!pickerEnabled) return;
            crosshairH.style.top = e.clientY + 'px';
            crosshairV.style.left = e.clientX + 'px';
        });

        // Click to log coordinates
        mapContainer.addEventListener('click', function (e) {
            if (!pickerEnabled) return;
            if (e.target.closest('.map-marker') || e.target.closest('.map-popup')) return;

            var imgRect = mapImage.getBoundingClientRect();
            var x = ((e.clientX - imgRect.left) / imgRect.width * 100).toFixed(1);
            var y = ((e.clientY - imgRect.top) / imgRect.height * 100).toFixed(1);

            coordLog.push({ x: x, y: y });

            // Drop a temporary dot
            var dot = document.createElement('div');
            dot.style.cssText = 'position:absolute;width:8px;height:8px;background:red;border-radius:50%;' +
                'transform:translate(-50%,-50%);pointer-events:none;z-index:100;border:1px solid #fff;';
            dot.style.left = x + '%';
            dot.style.top = y + '%';
            panLayer.appendChild(dot);

            // Update panel
            var lines = coordLog.map(function (c, i) {
                return '<div>#' + (i + 1) + ': x: <b>' + c.x + '</b>, y: <b>' + c.y + '</b></div>';
            });
            panel.innerHTML = lines.join('');
            panel.scrollTop = panel.scrollHeight;
        });
    }

    // --- Auto-hide navbar ---
    function initNavbar() {
        var header = document.querySelector('header');
        var trigger = document.getElementById('map-nav-trigger');
        if (!header || !trigger) return;

        var hideTimeout;

        function showNav() {
            clearTimeout(hideTimeout);
            header.classList.add('is-visible');
        }

        function scheduleHide() {
            hideTimeout = setTimeout(function () {
                header.classList.remove('is-visible');
            }, 400);
        }

        // Desktop: mouse enters trigger zone or header
        trigger.addEventListener('mouseenter', showNav);
        header.addEventListener('mouseenter', showNav);

        trigger.addEventListener('mouseleave', scheduleHide);
        header.addEventListener('mouseleave', scheduleHide);

        // Mobile: tap trigger zone to toggle
        trigger.addEventListener('touchstart', function (e) {
            e.preventDefault();
            if (header.classList.contains('is-visible')) {
                header.classList.remove('is-visible');
            } else {
                showNav();
            }
        });
    }

    initNavbar();
    initMap();
});
