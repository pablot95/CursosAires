(function () {
    'use strict';

    var firebaseConfig = {
        apiKey: "AIzaSyCZNcCA4l_jj6W7ZFAo8pNAgDW2WASW_Ro",
        authDomain: "cursoaires-1cada.firebaseapp.com",
        projectId: "cursoaires-1cada",
        storageBucket: "cursoaires-1cada.firebasestorage.app",
        messagingSenderId: "955097109164",
        appId: "1:955097109164:web:c1ebf82ef88c2a946d4509"
    };
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();

    var AUTH_HASH = 'e5f1ce21016f47ae02d7d41c91afa560b7f154e6053673d647b3bb76fbd85e78';

    // ==================== DEFAULT / SEED DATA ====================
    var DEFAULTS = {
        topBar: {
            text: 'La oferta finaliza en:',
            ctaText: 'Aprovechar Oferta',
            countdownDate: '2026-03-21T23:59'
        },
        stats: {
            items: [
                { number: 500, suffix: '+', label: 'Alumnos formados' },
                { number: 40, suffix: 'hs', label: 'De contenido práctico' },
                { number: 6, suffix: '', label: 'Módulos completos' },
                { number: 98, suffix: '%', label: 'Tasa de satisfacción' }
            ]
        },
        contenido: {
            tag: 'El curso',
            title: '¿Qué vas a aprender?',
            description: 'Un programa completo para que pases de no saber nada sobre climatización automotor a poder diagnosticar, reparar y cargar gas en el AC de cualquier auto o camioneta del mercado.',
            image: 'images/motorcamionetavertical1.jpeg',
            items: [
                'Cómo funciona el sistema de AC automotor completo',
                'Uso profesional de manómetros y herramientas de diagnóstico',
                'Diagnóstico de fallas paso a paso en vehículos',
                'Carga de gas R134a',
                'Detección y reparación de fugas en el circuito',
                'Service completo del sistema AC del vehículo',
                'Revisión y diagnóstico del compresor automotor',
                'Diagnóstico eléctrico del sistema de climatización'
            ]
        },
        modulos: {
            tag: 'Paso a paso',
            title: '6 módulos que te transforman en técnico',
            description: 'Cada módulo fue diseñado para construir sobre el anterior. Al finalizar, vas a tener las habilidades para resolver cualquier problema de aire acondicionado automotor.',
            items: [
                { number: '01', title: 'Fundamentos del AC Automotor', description: 'Entendé cómo funciona el ciclo frigorífico dentro del vehículo: compresor, condensador, evaporador, válvula de expansión y cómo interactúan con el motor. La base que todo técnico necesita dominar.', classes: '8 clases', hours: '6 horas', image: 'images/medidoreshorizontal.jpeg', imageAlt: 'Manometros de presion para diagnostico de aire acondicionado automotor' },
                { number: '02', title: 'Herramientas y Equipos', description: 'Conocé el kit completo para trabajar en AC automotor: manómetros, bomba de vacío, detector de fugas, balanza de carga y herramientas especiales. Aprendé a usar cada una correctamente.', classes: '6 clases', hours: '5 horas', image: 'images/motorcamionetavertical2.jpeg', imageAlt: 'Motor de camioneta con sistema de climatizacion automotor' },
                { number: '03', title: 'Diagnóstico de Fallas', description: 'Aprendé a leer presiones, identificar síntomas y determinar la falla exacta. Desde un equipo que no enfría hasta un compresor que hace ruido, vas a saber qué hacer en cada caso.', classes: '10 clases', hours: '8 horas', image: 'images/medidoresvertical.jpeg', imageAlt: 'Manometros conectados para diagnostico de fallas en AC vehicular' },
                { number: '04', title: 'Carga de Gas Refrigerante', description: 'Dominá el proceso completo de carga para R134a y R1234yf. Aprendé a hacer vacío correctamente, calcular la carga óptima y verificar el funcionamiento. El servicio que más dinero te va a generar.', classes: '7 clases', hours: '6 horas', image: 'images/motorhorizontal.jpeg', imageAlt: 'Proceso de carga de gas refrigerante R134a en vehiculo' },
                { number: '05', title: 'Reparación de Componentes', description: 'Aprendé a diagnosticar y reparar cada componente: compresor, condensador, evaporador, cañerías, electroventilador y embrague magnético. Sabé cuándo reparar y cuándo reemplazar.', classes: '9 clases', hours: '8 horas', image: 'images/motorcamionetavertical3.jpeg', imageAlt: 'Reparacion de componentes del aire acondicionado en motor de camioneta' },
                { number: '06', title: 'Service y Mantenimiento', description: 'Aprendé a hacer un service completo del AC automotor: limpieza de filtro de cabina, desinfección del evaporador, control de presiones y revisión del circuito completo. El servicio más pedido.', classes: '7 clases', hours: '7 horas', image: 'images/motorcamionetavertical1.jpeg', imageAlt: 'Service y mantenimiento preventivo del sistema de AC automotor' }
            ]
        },
        videoPreview: {
            tag: 'Mirá cómo aprendés',
            title: 'Videos filmados en motores reales',
            description: 'Nada de teoría aburrida. Cada clase está filmada directamente en vehículos reales, con explicaciones claras y lenguaje simple. Ves exactamente qué hacer en el motor.',
            videoSrc: 'images/videovertical.mp4',
            posterSrc: 'images/motorcamionetavertical2.jpeg',
            features: [
                { icon: 'fa-solid fa-camera', text: 'Filmado en alta calidad' },
                { icon: 'fa-solid fa-closed-captioning', text: 'Subtítulos disponibles' },
                { icon: 'fa-solid fa-mobile-screen', text: 'Miralo desde cualquier dispositivo' },
                { icon: 'fa-solid fa-infinity', text: 'Acceso ilimitado para siempre' }
            ]
        },
        bonus: {
            tag: 'Extras incluidos',
            title: 'Con tu compra te llevás de regalo',
            items: [
                { badge: 'BONUS 1', icon: 'fa-solid fa-book-medical', title: 'Manual de Diagnóstico Automotor', description: 'Guía descargable con los síntomas más comunes del AC automotor y sus soluciones. Ideal para consultar en el taller.', oldPrice: '$12.000' },
                { badge: 'BONUS 2', icon: 'fa-solid fa-table-list', title: 'Tabla de Cantidad de Gas por Vehículo', description: 'Tabla profesional con los gramos correctos de R134a según la temperatura ambiente. Indispensable en el taller.', oldPrice: '$8.500' },
                { badge: 'BONUS 3', icon: 'fa-solid fa-file-invoice-dollar', title: 'Plantilla de Presupuestos', description: 'Plantilla profesional lista para usar con tus clientes. Solo completás los datos del vehículo, el trabajo realizado y listo.', oldPrice: '$6.500' },
                { badge: 'BONUS 4', icon: 'fa-brands fa-whatsapp', title: 'Comunidad Privada', description: 'Acceso al grupo exclusivo de alumnos donde podés consultar dudas, compartir diagnósticos y hacer networking con otros técnicos.', oldPrice: '$15.000' }
            ]
        },
        sinCurso: {
            tag: 'La realidad',
            title: 'Sin el curso, esto es lo que pagás en el taller cada vez',
            totalLabel: 'Total en un solo año:',
            totalAmount: '$435.000+',
            items: [
                { label: 'Carga de gas refrigerante automotor', price: '$80.000' },
                { label: 'Cambio de compresor de AC', price: '$250.000' },
                { label: 'Service de aire acondicionado automotor', price: '$45.000' },
                { label: 'Reparación de fuga en el circuito', price: '$60.000' }
            ]
        },
        precio: {
            tag: 'Oferta por tiempo limitado',
            title: 'Curso Completo + 4 Bonus',
            subtitle: 'Todo lo que necesitás para convertirte en técnico en AC automotor',
            oldPriceLabel: 'Valor total:',
            oldPrice: '$89.999 ARS',
            currency: '$',
            amount: '39.999',
            period: 'ARS',
            usdRate: 1400,
            saving: 'Ahorrás $50.000 hoy',
            ctaText: 'Quiero Acceder Ahora',
            ctaLink: 'checkout.html',
            guaranteeText: '7 días de garantía. Si no te sirve, te devolvemos el 100% del dinero.',
            features: [
                '6 módulos completos (40+ horas)',
                '47 clases en video HD',
                'Acceso de por vida',
                'Actualizaciones gratuitas',
                'Certificado de finalización',
                'Manual de Diagnóstico Automotor',
                'Tabla de Presiones Profesional',
                'Plantilla de Presupuestos',
                'Comunidad Privada de Alumnos'
            ]
        },
        config: {
            paypalClientId: '',
            paypalMode: 'sandbox'
        }
    };

    var SECTIONS = {
        topBar: {
            label: 'Barra Superior',
            icon: 'fa-solid fa-bullhorn',
            fields: [
                { key: 'text', label: 'Texto de la barra', type: 'text' },
                { key: 'ctaText', label: 'Texto del botón CTA', type: 'text' },
                { key: 'countdownDate', label: 'Fecha fin del countdown (ej: 2026-03-25T23:59)', type: 'datetime-local' }
            ]
        },
        stats: {
            label: 'Estadísticas',
            icon: 'fa-solid fa-chart-simple',
            fields: [],
            groups: {
                key: 'items',
                label: 'Estadística',
                fields: [
                    { key: 'number', label: 'Número', type: 'number' },
                    { key: 'suffix', label: 'Sufijo (+, hs, %, etc)', type: 'text' },
                    { key: 'label', label: 'Descripción', type: 'text' }
                ]
            }
        },
        contenido: {
            label: 'Contenido del Curso',
            icon: 'fa-solid fa-book-open',
            fields: [
                { key: 'tag', label: 'Tag', type: 'text' },
                { key: 'title', label: 'Título', type: 'text' },
                { key: 'description', label: 'Descripción', type: 'textarea' },
                { key: 'image', label: 'Imagen (URL o subir)', type: 'image' }
            ],
            list: { key: 'items', label: 'Punto de aprendizaje' }
        },
        modulos: {
            label: 'Módulos',
            icon: 'fa-solid fa-layer-group',
            fields: [
                { key: 'tag', label: 'Tag', type: 'text' },
                { key: 'title', label: 'Título', type: 'text' },
                { key: 'description', label: 'Descripción', type: 'textarea' }
            ],
            groups: {
                key: 'items',
                label: 'Módulo',
                fields: [
                    { key: 'number', label: 'Número (01, 02...)', type: 'text' },
                    { key: 'title', label: 'Título', type: 'text' },
                    { key: 'description', label: 'Descripción', type: 'textarea' },
                    { key: 'classes', label: 'Clases (ej: 8 clases)', type: 'text' },
                    { key: 'hours', label: 'Horas (ej: 6 horas)', type: 'text' },
                    { key: 'image', label: 'Imagen (URL o subir)', type: 'image' },
                    { key: 'imageAlt', label: 'Texto alt de imagen', type: 'text' }
                ]
            }
        },
        videoPreview: {
            label: 'Video Preview',
            icon: 'fa-solid fa-video',
            fields: [
                { key: 'tag', label: 'Tag', type: 'text' },
                { key: 'title', label: 'Título', type: 'text' },
                { key: 'description', label: 'Descripción', type: 'textarea' },
                { key: 'videoSrc', label: 'URL del video', type: 'text' },
                { key: 'posterSrc', label: 'Poster del video (URL o subir)', type: 'image' }
            ],
            groups: {
                key: 'features',
                label: 'Característica',
                fields: [
                    { key: 'icon', label: 'Clase de ícono FA', type: 'text' },
                    { key: 'text', label: 'Texto', type: 'text' }
                ]
            }
        },
        bonus: {
            label: 'Bonus',
            icon: 'fa-solid fa-gift',
            fields: [
                { key: 'tag', label: 'Tag', type: 'text' },
                { key: 'title', label: 'Título', type: 'text' }
            ],
            groups: {
                key: 'items',
                label: 'Bonus',
                fields: [
                    { key: 'badge', label: 'Badge (ej: BONUS 1)', type: 'text' },
                    { key: 'icon', label: 'Clase de ícono FA', type: 'text' },
                    { key: 'title', label: 'Título', type: 'text' },
                    { key: 'description', label: 'Descripción', type: 'textarea' },
                    { key: 'oldPrice', label: 'Precio anterior', type: 'text' }
                ]
            }
        },
        sinCurso: {
            label: 'Sin el Curso',
            icon: 'fa-solid fa-circle-exclamation',
            fields: [
                { key: 'tag', label: 'Tag', type: 'text' },
                { key: 'title', label: 'Título', type: 'text' },
                { key: 'totalLabel', label: 'Texto del total', type: 'text' },
                { key: 'totalAmount', label: 'Monto total', type: 'text' }
            ],
            groups: {
                key: 'items',
                label: 'Costo',
                fields: [
                    { key: 'label', label: 'Descripción del servicio', type: 'text' },
                    { key: 'price', label: 'Precio', type: 'text' }
                ]
            }
        },
        precio: {
            label: 'Precio',
            icon: 'fa-solid fa-tag',
            fields: [
                { key: 'tag', label: 'Tag de la sección', type: 'text' },
                { key: 'title', label: 'Título', type: 'text' },
                { key: 'subtitle', label: 'Subtítulo', type: 'text' },
                { key: 'oldPriceLabel', label: 'Label precio anterior', type: 'text' },
                { key: 'oldPrice', label: 'Precio anterior', type: 'text' },
                { key: 'currency', label: 'Símbolo moneda', type: 'text' },
                { key: 'amount', label: 'Monto actual', type: 'text' },
                { key: 'period', label: 'Período/Moneda', type: 'text' },
                { key: 'usdRate', label: 'Tipo de cambio (1 USD = X ARS)', type: 'number', placeholder: 'Ej: 1400' },
                { key: 'saving', label: 'Texto de ahorro', type: 'text' },
                { key: 'ctaText', label: 'Texto del botón CTA', type: 'text' },
                { key: 'ctaLink', label: 'Link del botón CTA', type: 'text' },
                { key: 'guaranteeText', label: 'Texto de garantía', type: 'text' }
            ],
            list: { key: 'features', label: 'Característica incluida' }
        },
        config: {
            label: 'Configuración PayPal',
            icon: 'fa-brands fa-paypal',
            fields: [
                { key: 'paypalClientId', label: 'PayPal Client ID (va en el frontend)', type: 'text', placeholder: 'AXxx...' },
                { key: 'paypalMode', label: 'Modo: sandbox o live', type: 'text', placeholder: 'sandbox' }
            ]
        }
    };

    var loginScreen = document.getElementById('loginScreen');
    var dashboardEl = document.getElementById('dashboard');
    var loginForm = document.getElementById('loginForm');
    var loginError = document.getElementById('loginError');
    var formContainer = document.getElementById('formContainer');
    var logoutBtn = document.getElementById('logoutBtn');
    var seedBtn = document.getElementById('seedBtn');
    var toastEl = document.getElementById('toast');

    // Tab elements
    var tabBtns = document.querySelectorAll('.tab-btn');
    var tabPanels = document.querySelectorAll('.tab-panel');

    // ==================== AUTH ====================
    function hashStr(str) {
        var encoder = new TextEncoder();
        var data = encoder.encode(str);
        return crypto.subtle.digest('SHA-256', data).then(function (buf) {
            return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
        });
    }

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var user = document.getElementById('loginUser').value.trim();
        var pass = document.getElementById('loginPass').value;
        if (user === 'Danielsaire' && pass === 'Danielsaire!') {
            sessionStorage.setItem('admin_auth', '1');
            loginError.classList.add('hidden');
            showDashboard();
        } else {
            loginError.classList.remove('hidden');
        }
    });

    logoutBtn.addEventListener('click', function () {
        sessionStorage.removeItem('admin_auth');
        location.reload();
    });

    function checkSession() {
        if (sessionStorage.getItem('admin_auth') === '1') {
            showDashboard();
        }
    }

    function showDashboard() {
        loginScreen.classList.add('hidden');
        dashboardEl.classList.remove('hidden');
        initTabs();
        loadAllSections();
    }

    // ==================== TABS ====================
    function initTabs() {
        tabBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var tab = btn.getAttribute('data-tab');
                tabBtns.forEach(function (b) { b.classList.remove('active'); });
                tabPanels.forEach(function (p) { p.classList.remove('active'); });
                btn.classList.add('active');
                document.getElementById('panel-' + tab).classList.add('active');

                if (tab === 'ordenes') loadOrders();
                if (tab === 'curso') { loadCourseModules(); loadCourseUsers(); }
            });
        });
    }

    // ==================== LOAD ALL SECTIONS ====================
    function loadAllSections() {
        formContainer.innerHTML = '<p style="color:#999;text-align:center;padding:40px;">Cargando todas las secciones...</p>';

        db.collection('siteContent').get().then(function (snapshot) {
            if (snapshot.empty) {
                showToast('Firebase vacío. Cargando datos iniciales...', 'success');
                runSeed().then(function () { loadAllSections(); });
                return;
            }

            var siteData = {};
            snapshot.forEach(function (doc) { siteData[doc.id] = doc.data(); });

            var html = '';
            Object.keys(SECTIONS).forEach(function (key) {
                var data = siteData[key] || DEFAULTS[key] || {};
                html += renderSectionCard(key, data);
            });
            formContainer.innerHTML = html;
            initImagePreviews();
        }).catch(function () {
            var html = '';
            Object.keys(SECTIONS).forEach(function (key) {
                html += renderSectionCard(key, DEFAULTS[key] || {});
            });
            formContainer.innerHTML = html;
            initImagePreviews();
            showToast('No se pudo conectar a Firebase, mostrando datos por defecto', 'error');
        });
    }

    // ==================== SECTION CARD RENDERING ====================
    function renderSectionCard(sectionKey, data) {
        var sec = SECTIONS[sectionKey];
        var html = '<div class="section-card collapsed" id="section-' + sectionKey + '">';
        html += '<div class="section-card-header" onclick="AdminPanel.toggleCard(this)"><i class="' + sec.icon + '"></i><h2>' + sec.label + '</h2><i class="fa-solid fa-chevron-down card-chevron"></i></div>';
        html += '<div class="section-card-body">';

        // Simple fields
        sec.fields.forEach(function (field) {
            html += renderField(sectionKey, field, data[field.key] || '');
        });

        // List (simple text array)
        if (sec.list) {
            var listItems = data[sec.list.key] || [''];
            html += '<div class="list-section">';
            html += '<div class="group-section-title"><span>' + sec.list.label + 's</span>';
            html += '<button type="button" class="btn-add-item" onclick="AdminPanel.addListItem(\'' + sectionKey + '\',\'' + sec.list.key + '\')"><i class="fa-solid fa-plus"></i> Agregar</button></div>';
            html += '<div id="list-' + sectionKey + '-' + sec.list.key + '">';
            listItems.forEach(function (item, i) {
                html += renderListItem(sectionKey, sec.list.key, i, item);
            });
            html += '</div></div>';
        }

        // Groups (array of objects)
        if (sec.groups) {
            var groupItems = data[sec.groups.key] || [];
            html += '<div class="group-section">';
            html += '<div class="group-section-title"><span>' + sec.groups.label + 's</span>';
            html += '<button type="button" class="btn-add-item" onclick="AdminPanel.addGroupItem(\'' + sectionKey + '\')"><i class="fa-solid fa-plus"></i> Agregar</button></div>';
            html += '<div id="groups-' + sectionKey + '-' + sec.groups.key + '">';
            groupItems.forEach(function (item, i) {
                html += renderGroupItem(sectionKey, i, item);
            });
            html += '</div></div>';
        }

        // Save button
        html += '<div class="form-actions">';
        html += '<button type="button" class="btn-save" id="saveBtn-' + sectionKey + '" onclick="AdminPanel.save(\'' + sectionKey + '\')"><span class="spinner"></span><span class="btn-text"><i class="fa-solid fa-floppy-disk"></i> Guardar Cambios</span></button>';
        html += '</div>';

        html += '</div>'; // close section-card-body
        html += '</div>'; // close section-card
        return html;
    }

    function toggleCard(headerEl) {
        var card = headerEl.closest('.section-card');
        card.classList.toggle('collapsed');
    }

    function renderField(sectionKey, field, value) {
        var id = 'field-' + sectionKey + '-' + field.key;
        var safeValue = escapeAttr(value);
        var html = '<div class="field-group">';
        html += '<label for="' + id + '">' + field.label + '</label>';

        if (field.type === 'textarea') {
            html += '<textarea id="' + id + '" data-key="' + field.key + '">' + escapeHtml(value) + '</textarea>';
        } else if (field.type === 'image') {
            html += '<input type="text" id="' + id + '" data-key="' + field.key + '" value="' + safeValue + '" placeholder="URL de la imagen">';
            html += '<img class="image-preview ' + (value ? 'visible' : '') + '" src="' + (value ? escapeAttr(value) : '') + '" alt="Preview" onerror="this.classList.remove(\'visible\')">';
            html += '<div class="image-upload-row">';
            html += '<input type="file" accept="image/*" data-target="' + id + '" class="img-file-input" style="font-size:13px;max-width:220px;">';
            html += '<button type="button" class="btn-upload-img" onclick="AdminPanel.uploadImage(\'' + id + '\')"><i class="fa-solid fa-upload"></i> Subir</button>';
            html += '</div>';
        } else if (field.type === 'datetime-local') {
            html += '<input type="datetime-local" id="' + id + '" data-key="' + field.key + '" value="' + safeValue + '">';
        } else if (field.type === 'number') {
            html += '<input type="number" id="' + id + '" data-key="' + field.key + '" value="' + safeValue + '">';
        } else {
            html += '<input type="text" id="' + id + '" data-key="' + field.key + '" value="' + safeValue + '" placeholder="' + (field.placeholder ? escapeAttr(field.placeholder) : '') + '">';
        }

        html += '</div>';
        return html;
    }

    function renderListItem(sectionKey, listKey, index, value) {
        return '<div class="list-item" data-list="' + listKey + '" data-index="' + index + '">' +
            '<input type="text" value="' + escapeAttr(value) + '" class="list-input">' +
            '<button type="button" class="btn-remove-list" onclick="AdminPanel.removeListItem(this)"><i class="fa-solid fa-trash"></i></button>' +
            '</div>';
    }

    function renderGroupItem(sectionKey, index, itemData) {
        var sec = SECTIONS[sectionKey];
        var groupDef = sec.groups;
        var html = '<div class="group-item" data-group="' + groupDef.key + '" data-index="' + index + '">';
        html += '<div class="group-item-header"><span>' + groupDef.label + ' ' + (index + 1) + '</span>';
        html += '<button type="button" class="btn-remove-item" onclick="AdminPanel.removeGroupItem(this)"><i class="fa-solid fa-trash"></i></button></div>';

        groupDef.fields.forEach(function (field) {
            var val = itemData ? (itemData[field.key] || '') : '';
            var fieldId = 'group-' + sectionKey + '-' + groupDef.key + '-' + index + '-' + field.key;
            html += '<div class="field-group">';
            html += '<label for="' + fieldId + '">' + field.label + '</label>';

            if (field.type === 'textarea') {
                html += '<textarea id="' + fieldId + '" data-gkey="' + field.key + '">' + escapeHtml(val) + '</textarea>';
            } else if (field.type === 'image') {
                html += '<input type="text" id="' + fieldId + '" data-gkey="' + field.key + '" value="' + escapeAttr(val) + '" placeholder="URL de la imagen">';
                html += '<img class="image-preview ' + (val ? 'visible' : '') + '" src="' + (val ? escapeAttr(val) : '') + '" alt="Preview" onerror="this.classList.remove(\'visible\')">';
                html += '<div class="image-upload-row">';
                html += '<input type="file" accept="image/*" data-target="' + fieldId + '" class="img-file-input" style="font-size:13px;max-width:220px;">';
                html += '<button type="button" class="btn-upload-img" onclick="AdminPanel.uploadImage(\'' + fieldId + '\')"><i class="fa-solid fa-upload"></i> Subir</button>';
                html += '</div>';
            } else if (field.type === 'datetime-local') {
                html += '<input type="datetime-local" id="' + fieldId + '" data-gkey="' + field.key + '" value="' + escapeAttr(val) + '">';
            } else if (field.type === 'number') {
                html += '<input type="number" id="' + fieldId + '" data-gkey="' + field.key + '" value="' + escapeAttr(val) + '">';
            } else {
                html += '<input type="text" id="' + fieldId + '" data-gkey="' + field.key + '" value="' + escapeAttr(val) + '" placeholder="' + (field.placeholder ? escapeAttr(field.placeholder) : '') + '">';
            }
            html += '</div>';
        });

        html += '</div>';
        return html;
    }

    function initImagePreviews() {
        document.querySelectorAll('.field-group input[type="text"]').forEach(function (input) {
            var preview = input.parentElement.querySelector('.image-preview');
            if (!preview) return;
            input.addEventListener('input', function () {
                if (input.value) {
                    preview.src = input.value;
                    preview.classList.add('visible');
                } else {
                    preview.classList.remove('visible');
                }
            });
        });
    }

    // ==================== COLLECT DATA ====================
    function collectFormData(sectionKey) {
        var sec = SECTIONS[sectionKey];
        var container = document.getElementById('section-' + sectionKey);
        var data = {};

        // Simple fields
        sec.fields.forEach(function (field) {
            var el = document.getElementById('field-' + sectionKey + '-' + field.key);
            if (el) {
                data[field.key] = field.type === 'number' ? Number(el.value) : el.value;
            }
        });

        // List
        if (sec.list) {
            var items = [];
            container.querySelectorAll('#list-' + sectionKey + '-' + sec.list.key + ' .list-item input').forEach(function (input) {
                if (input.value.trim()) items.push(input.value.trim());
            });
            data[sec.list.key] = items;
        }

        // Groups
        if (sec.groups) {
            var groupItems = [];
            container.querySelectorAll('#groups-' + sectionKey + '-' + sec.groups.key + ' .group-item').forEach(function (groupEl) {
                var item = {};
                sec.groups.fields.forEach(function (field) {
                    var inp = groupEl.querySelector('[data-gkey="' + field.key + '"]');
                    if (inp) {
                        item[field.key] = field.type === 'number' ? Number(inp.value) : inp.value;
                    }
                });
                groupItems.push(item);
            });
            data[sec.groups.key] = groupItems;
        }

        return data;
    }

    // ==================== SAVE ====================
    function save(sectionKey) {
        if (!sectionKey) return;
        var btn = document.getElementById('saveBtn-' + sectionKey);
        btn.classList.add('loading');
        btn.disabled = true;

        var data = collectFormData(sectionKey);
        db.collection('siteContent').doc(sectionKey).set(data)
            .then(function () {
                showToast(SECTIONS[sectionKey].label + ' guardado correctamente', 'success');
                btn.classList.remove('loading');
                btn.disabled = false;
            })
            .catch(function (err) {
                showToast('Error al guardar: ' + err.message, 'error');
                btn.classList.remove('loading');
                btn.disabled = false;
            });
    }

    // ==================== LIST/GROUP ACTIONS ====================
    function addListItem(sectionKey, listKey) {
        var container = document.getElementById('list-' + sectionKey + '-' + listKey);
        var count = container.querySelectorAll('.list-item').length;
        var div = document.createElement('div');
        div.innerHTML = renderListItem(sectionKey, listKey, count, '');
        container.appendChild(div.firstElementChild);
    }

    function removeListItem(btn) {
        btn.closest('.list-item').remove();
    }

    function addGroupItem(sectionKey) {
        var sec = SECTIONS[sectionKey];
        var container = document.getElementById('groups-' + sectionKey + '-' + sec.groups.key);
        var count = container.querySelectorAll('.group-item').length;
        var div = document.createElement('div');
        div.innerHTML = renderGroupItem(sectionKey, count, {});
        container.appendChild(div.firstElementChild);
        initImagePreviews();
    }

    function removeGroupItem(btn) {
        btn.closest('.group-item').remove();
    }

    // ==================== IMAGE UPLOAD ====================
    function uploadImage(targetFieldId) {
        var fileInput = document.querySelector('input[data-target="' + targetFieldId + '"]');
        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
            showToast('Seleccioná una imagen primero', 'error');
            return;
        }
        var file = fileInput.files[0];
        var allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.indexOf(file.type) === -1) {
            showToast('Formato no permitido. Usá JPG, PNG, WEBP o GIF.', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('La imagen no puede superar 5MB.', 'error');
            return;
        }

        var formData = new FormData();
        formData.append('image', file);

        var btn = fileInput.nextElementSibling;
        btn.innerHTML = '<span class="spinner"></span>';
        btn.disabled = true;

        fetch('upload.php', { method: 'POST', body: formData })
            .then(function (r) { return r.json(); })
            .then(function (res) {
                btn.innerHTML = '<i class="fa-solid fa-upload"></i> Subir';
                btn.disabled = false;
                if (res.success) {
                    var field = document.getElementById(targetFieldId);
                    field.value = res.url;
                    field.dispatchEvent(new Event('input'));
                    showToast('Imagen subida correctamente', 'success');
                } else {
                    showToast('Error: ' + res.error, 'error');
                }
            })
            .catch(function () {
                btn.innerHTML = '<i class="fa-solid fa-upload"></i> Subir';
                btn.disabled = false;
                showToast('Error de conexión al subir imagen', 'error');
            });
    }

    // ==================== TOAST ====================
    function showToast(msg, type) {
        toastEl.textContent = msg;
        toastEl.className = 'toast ' + type + ' show';
        clearTimeout(toastEl._timer);
        toastEl._timer = setTimeout(function () {
            toastEl.className = 'toast hidden';
        }, 3500);
    }

    // ==================== SEED ====================
    if (seedBtn) seedBtn.addEventListener('click', function () {
        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = '<div class="modal-card">' +
            '<h3>Cargar datos iniciales</h3>' +
            '<p>Esto va a subir el contenido actual de la página a Firebase. Si ya hay datos, se van a sobreescribir.</p>' +
            '<div class="modal-actions">' +
            '<button class="btn-modal-cancel" id="seedCancel">Cancelar</button>' +
            '<button class="btn-modal-confirm" id="seedConfirm">Confirmar</button>' +
            '</div></div>';
        document.body.appendChild(overlay);

        document.getElementById('seedCancel').addEventListener('click', function () {
            overlay.remove();
        });
        document.getElementById('seedConfirm').addEventListener('click', function () {
            overlay.remove();
            runSeed();
        });
    });

    function runSeed() {
        showToast('Subiendo datos iniciales...', 'success');

        var batch = db.batch();
        Object.keys(DEFAULTS).forEach(function (key) {
            var ref = db.collection('siteContent').doc(key);
            batch.set(ref, DEFAULTS[key]);
        });

        return batch.commit().then(function () {
            showToast('Datos iniciales cargados correctamente en Firebase', 'success');
        }).catch(function (err) {
            showToast('Error al cargar datos: ' + err.message, 'error');
        });
    }

    // ==================== HELPERS ====================
    function escapeAttr(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ==================== ORDERS ====================
    function loadOrders() {
        var container = document.getElementById('ordersContainer');
        var countEl = document.getElementById('ordersCount');
        container.innerHTML = '<p class="empty-state">Cargando órdenes...</p>';

        db.collection('orders').orderBy('createdAt', 'desc').get().then(function (snap) {
            if (snap.empty) {
                container.innerHTML = '<p class="empty-state">No hay órdenes aún</p>';
                countEl.textContent = '0 órdenes';
                return;
            }
            countEl.textContent = snap.size + ' orden' + (snap.size !== 1 ? 'es' : '');

            var html = '<table class="orders-table"><thead><tr>';
            html += '<th>Fecha</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Estado</th>';
            html += '</tr></thead><tbody>';

            snap.forEach(function (doc) {
                var d = doc.data();
                var date = d.createdAt ? d.createdAt.toDate().toLocaleString('es-AR') : '-';
                var statusClass = d.status || 'pending';
                var statusLabel = d.status === 'completed' ? 'Completada' : d.status === 'failed' ? 'Fallida' : 'Pendiente';
                html += '<tr>';
                html += '<td>' + escapeHtml(date) + '</td>';
                html += '<td>' + escapeHtml((d.firstName || '') + ' ' + (d.lastName || '')) + '</td>';
                html += '<td>' + escapeHtml(d.email || '') + '</td>';
                html += '<td>' + escapeHtml(d.phone || '-') + '</td>';
                html += '<td><span class="badge-status ' + statusClass + '">' + statusLabel + '</span></td>';
                html += '</tr>';
            });

            html += '</tbody></table>';
            container.innerHTML = html;
        }).catch(function (err) {
            container.innerHTML = '<p class="empty-state">Error al cargar órdenes: ' + escapeHtml(err.message) + '</p>';
        });
    }

    document.getElementById('btnRefreshOrders').addEventListener('click', loadOrders);

    // ==================== COURSE CONTENT MANAGEMENT ====================
    function loadCourseModules() {
        var container = document.getElementById('courseContainer');
        container.innerHTML = '<p class="empty-state">Cargando módulos...</p>';

        db.collection('courseContent').orderBy('order').get().then(function (snap) {
            if (snap.empty) {
                container.innerHTML = '<p class="empty-state">No hay módulos creados aún. Hacé click en "Agregar Módulo" para empezar.</p>';
                return;
            }
            var html = '';
            snap.forEach(function (doc) {
                html += renderCourseModuleCard(doc.id, doc.data());
            });
            container.innerHTML = html;
        }).catch(function (err) {
            container.innerHTML = '<p class="empty-state">Error: ' + escapeHtml(err.message) + '</p>';
        });
    }

    function renderCourseModuleCard(docId, data) {
        var html = '<div class="course-module-card collapsed" data-doc="' + docId + '">';
        html += '<div class="course-module-header" onclick="AdminPanel.toggleModuleCard(this)">';
        html += '<i class="fa-solid fa-layer-group" style="color:var(--accent);font-size:18px"></i>';
        html += '<input type="text" value="' + escapeAttr(data.title || '') + '" placeholder="Nombre del módulo" class="module-title-input" onclick="event.stopPropagation()">';
        html += '<i class="fa-solid fa-chevron-down chevron"></i>';
        html += '</div>';
        html += '<div class="course-module-body">';

        var lessons = data.lessons || [];
        if (lessons.length === 0) {
            html += '<p style="color:var(--text-light);font-size:14px;padding:8px 0;">Sin lecciones. Agregá una con el botón de abajo.</p>';
        }
        lessons.forEach(function (lesson, i) {
            html += renderLessonRow(i, lesson);
        });

        html += '<div class="course-module-actions">';
        html += '<button class="btn-add-lesson" onclick="AdminPanel.addLesson(\'' + docId + '\')"><i class="fa-solid fa-plus"></i> Agregar Lección</button>';
        html += '<button class="btn-save-module" onclick="AdminPanel.saveModule(\'' + docId + '\')"><i class="fa-solid fa-floppy-disk"></i> Guardar Módulo</button>';
        html += '<button class="btn-delete-module" onclick="AdminPanel.deleteModule(\'' + docId + '\')"><i class="fa-solid fa-trash"></i> Eliminar</button>';
        html += '</div></div></div>';
        return html;
    }

    function renderLessonRow(index, lesson) {
        lesson = lesson || {};
        var html = '<div class="lesson-row">';
        html += '<div class="field-group"><label>Título de la lección</label><input type="text" value="' + escapeAttr(lesson.title || '') + '" data-lfield="title" placeholder="Ej: Introducción al sistema AC"></div>';
        html += '<div class="field-group"><label>URL del video (YouTube/Vimeo) o subir archivo</label>';
        html += '<input type="text" value="' + escapeAttr(lesson.videoUrl || '') + '" data-lfield="videoUrl" placeholder="https://youtube.com/watch?v= o subí un video">';
        html += '<div class="image-upload-row" style="margin-top:6px">';
        html += '<input type="file" accept="video/mp4,video/webm,video/ogg" class="video-file-input" style="font-size:13px;max-width:220px">';
        html += '<button type="button" class="btn-upload-img" onclick="AdminPanel.uploadVideo(this)"><i class="fa-solid fa-upload"></i> Subir video</button>';
        html += '</div></div>';
        // Archivo adjunto (PDF)
        html += '<div class="field-group"><label><i class="fa-solid fa-file-pdf" style="color:#e74c3c"></i> Archivo adjunto (PDF)</label>';
        html += '<input type="text" value="' + escapeAttr(lesson.fileUrl || '') + '" data-lfield="fileUrl" placeholder="URL del archivo" readonly style="background:var(--bg);cursor:default">';
        html += '<input type="hidden" value="' + escapeAttr(lesson.fileName || '') + '" data-lfield="fileName">';
        var hasFile = lesson.fileUrl ? true : false;
        html += '<div class="file-info"' + (hasFile ? '' : ' style="display:none"') + '><i class="fa-solid fa-file-pdf" style="color:#e74c3c"></i> <span class="file-name-display">' + escapeHtml(lesson.fileName || '') + '</span> <button type="button" class="btn-remove-file" onclick="AdminPanel.removeFile(this)" title="Quitar archivo"><i class="fa-solid fa-xmark"></i></button></div>';
        html += '<div class="image-upload-row" style="margin-top:6px">';
        html += '<input type="file" accept="application/pdf" class="file-input" style="font-size:13px;max-width:220px">';
        html += '<button type="button" class="btn-upload-img" onclick="AdminPanel.uploadFile(this)"><i class="fa-solid fa-upload"></i> Subir PDF</button>';
        html += '</div></div>';
        html += '<button class="btn-remove-lesson" onclick="AdminPanel.removeLesson(this)"><i class="fa-solid fa-trash"></i></button>';
        html += '</div>';
        return html;
    }

    function toggleModuleCard(headerEl) {
        headerEl.closest('.course-module-card').classList.toggle('collapsed');
    }

    function addModule() {
        var newOrder = document.querySelectorAll('.course-module-card').length;
        db.collection('courseContent').add({
            title: 'Nuevo Módulo',
            order: newOrder,
            lessons: []
        }).then(function () {
            showToast('Módulo creado', 'success');
            loadCourseModules();
        }).catch(function (err) { showToast('Error: ' + err.message, 'error'); });
    }

    document.getElementById('btnAddModule').addEventListener('click', addModule);

    function saveModule(docId) {
        var card = document.querySelector('.course-module-card[data-doc="' + docId + '"]');
        if (!card) return;
        var title = card.querySelector('.module-title-input').value.trim() || 'Sin título';
        var lessons = [];
        card.querySelectorAll('.lesson-row').forEach(function (row) {
            var t = row.querySelector('[data-lfield="title"]').value.trim();
            var v = row.querySelector('[data-lfield="videoUrl"]').value.trim();
            var f = row.querySelector('[data-lfield="fileUrl"]').value.trim();
            var fn = row.querySelector('[data-lfield="fileName"]').value.trim();
            if (t || v || f) {
                var lessonData = { title: t, videoUrl: v };
                if (f) { lessonData.fileUrl = f; lessonData.fileName = fn; }
                lessons.push(lessonData);
            }
        });

        db.collection('courseContent').doc(docId).update({
            title: title,
            lessons: lessons
        }).then(function () {
            showToast('Módulo guardado', 'success');
        }).catch(function (err) { showToast('Error: ' + err.message, 'error'); });
    }

    function deleteModule(docId) {
        if (!confirm('¿Seguro que querés eliminar este módulo?')) return;
        db.collection('courseContent').doc(docId).delete().then(function () {
            showToast('Módulo eliminado', 'success');
            loadCourseModules();
        }).catch(function (err) { showToast('Error: ' + err.message, 'error'); });
    }

    function addLesson(docId) {
        var card = document.querySelector('.course-module-card[data-doc="' + docId + '"]');
        if (!card) return;
        var body = card.querySelector('.course-module-body');
        var actions = body.querySelector('.course-module-actions');
        var emptyMsg = body.querySelector('p');
        if (emptyMsg) emptyMsg.remove();
        var div = document.createElement('div');
        div.innerHTML = renderLessonRow(0, {});
        actions.parentNode.insertBefore(div.firstElementChild, actions);
    }

    function removeLesson(btn) {
        btn.closest('.lesson-row').remove();
    }

    // ==================== VIDEO UPLOAD ====================
    function uploadVideo(btn) {
        var fileInput = btn.previousElementSibling;
        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
            showToast('Seleccioná un video primero', 'error');
            return;
        }
        var file = fileInput.files[0];
        var allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (allowedTypes.indexOf(file.type) === -1) {
            showToast('Formato no permitido. Usá MP4, WEBM u OGG.', 'error');
            return;
        }
        if (file.size > 200 * 1024 * 1024) {
            showToast('El video no puede superar 200MB.', 'error');
            return;
        }

        var formData = new FormData();
        formData.append('video', file);

        btn.innerHTML = '<span class="spinner"></span> Subiendo...';
        btn.disabled = true;

        fetch('upload_video.php', { method: 'POST', body: formData })
            .then(function (r) { return r.json(); })
            .then(function (res) {
                btn.innerHTML = '<i class="fa-solid fa-upload"></i> Subir video';
                btn.disabled = false;
                if (res.success) {
                    var urlInput = btn.closest('.field-group').querySelector('[data-lfield="videoUrl"]');
                    if (urlInput) urlInput.value = res.url;
                    showToast('Video subido correctamente', 'success');
                } else {
                    showToast('Error: ' + res.error, 'error');
                }
            })
            .catch(function () {
                btn.innerHTML = '<i class="fa-solid fa-upload"></i> Subir video';
                btn.disabled = false;
                showToast('Error de conexión al subir video', 'error');
            });
    }

    // ==================== FILE UPLOAD ====================
    function uploadFile(btn) {
        var fileInput = btn.previousElementSibling;
        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
            showToast('Seleccioná un archivo PDF primero', 'error');
            return;
        }
        var file = fileInput.files[0];
        if (file.type !== 'application/pdf') {
            showToast('Solo se permiten archivos PDF', 'error');
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            showToast('El archivo no puede superar 50MB.', 'error');
            return;
        }

        var formData = new FormData();
        formData.append('file', file);

        btn.innerHTML = '<span class="spinner"></span> Subiendo...';
        btn.disabled = true;

        fetch('upload_file.php', { method: 'POST', body: formData })
            .then(function (r) { return r.json(); })
            .then(function (res) {
                btn.innerHTML = '<i class="fa-solid fa-upload"></i> Subir PDF';
                btn.disabled = false;
                if (res.success) {
                    var fieldGroup = btn.closest('.field-group');
                    var urlInput = fieldGroup.querySelector('[data-lfield="fileUrl"]');
                    var nameInput = fieldGroup.querySelector('[data-lfield="fileName"]');
                    var fileInfo = fieldGroup.querySelector('.file-info');
                    var fileNameDisplay = fieldGroup.querySelector('.file-name-display');
                    if (urlInput) urlInput.value = res.url;
                    if (nameInput) nameInput.value = res.originalName || file.name;
                    if (fileInfo) fileInfo.style.display = '';
                    if (fileNameDisplay) fileNameDisplay.textContent = res.originalName || file.name;
                    showToast('Archivo subido correctamente', 'success');
                } else {
                    showToast('Error: ' + res.error, 'error');
                }
            })
            .catch(function () {
                btn.innerHTML = '<i class="fa-solid fa-upload"></i> Subir PDF';
                btn.disabled = false;
                showToast('Error de conexión al subir archivo', 'error');
            });
    }

    function removeFile(btn) {
        var fieldGroup = btn.closest('.field-group');
        var urlInput = fieldGroup.querySelector('[data-lfield="fileUrl"]');
        var nameInput = fieldGroup.querySelector('[data-lfield="fileName"]');
        var fileInfo = fieldGroup.querySelector('.file-info');
        if (urlInput) urlInput.value = '';
        if (nameInput) nameInput.value = '';
        if (fileInfo) fileInfo.style.display = 'none';
    }

    // ==================== USERS MANAGEMENT ====================
    function loadCourseUsers() {
        var container = document.getElementById('usersContainer');
        var countEl = document.getElementById('usersCount');
        container.innerHTML = '<p class="empty-state">Cargando usuarios...</p>';

        db.collection('students').get().then(function (snap) {
            if (snap.empty) {
                container.innerHTML = '<p class="empty-state">No hay usuarios registrados aún</p>';
                countEl.textContent = '0 usuarios';
                return;
            }
            countEl.textContent = snap.size + ' usuario' + (snap.size !== 1 ? 's' : '');

            // Ordenar por fecha descendente en el cliente
            var docs = [];
            snap.forEach(function (doc) { docs.push({ id: doc.id, data: doc.data() }); });
            docs.sort(function (a, b) {
                var ta = a.data.createdAt ? a.data.createdAt.toMillis() : 0;
                var tb = b.data.createdAt ? b.data.createdAt.toMillis() : 0;
                return tb - ta;
            });

            var html = '<table class="orders-table"><thead><tr>';
            html += '<th>Fecha</th><th>Nombre</th><th>Email</th><th>Tel\u00e9fono</th><th>Acciones</th>';
            html += '</tr></thead><tbody>';

            docs.forEach(function (item) {
                var d = item.data;
                var date = d.createdAt ? d.createdAt.toDate().toLocaleString('es-AR') : '-';
                var fullName = escapeHtml(((d.firstName || '') + ' ' + (d.lastName || '')).trim()) || '-';
                html += '<tr>';
                html += '<td>' + escapeHtml(date) + '</td>';
                html += '<td>' + fullName + '</td>';
                html += '<td>' + escapeHtml(d.email || '-') + '</td>';
                html += '<td>' + escapeHtml(d.phone || '-') + '</td>';
                html += '<td><button class="btn-delete-user" onclick="AdminPanel.deleteUser(\'' + escapeAttr(item.id) + '\', \'' + escapeAttr(d.email || 'este usuario') + '\')"><i class="fa-solid fa-trash"></i> Eliminar</button></td>';
                html += '</tr>';
            });

            html += '</tbody></table>';
            container.innerHTML = html;
        }).catch(function (err) {
            container.innerHTML = '<p class="empty-state">Error al cargar usuarios: ' + escapeHtml(err.message) + '</p>';
        });
    }

    function deleteUser(docId, userEmail) {
        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = '<div class="modal-card">' +
            '<h3><i class="fa-solid fa-triangle-exclamation" style="color:var(--danger)"></i> Eliminar usuario</h3>' +
            '<p>¿Seguro que querés eliminar a <strong>' + escapeHtml(userEmail) + '</strong>?</p>' +
            '<p style="color:var(--danger);font-size:13px;margin-top:6px">Esta acción no se puede deshacer.</p>' +
            '<div class="modal-actions">' +
            '<button class="btn-modal-cancel" id="deleteUserCancel">Cancelar</button>' +
            '<button class="btn-modal-confirm btn-modal-danger" id="deleteUserConfirm">Eliminar</button>' +
            '</div></div>';
        document.body.appendChild(overlay);

        document.getElementById('deleteUserCancel').addEventListener('click', function () {
            overlay.remove();
        });
        document.getElementById('deleteUserConfirm').addEventListener('click', function () {
            overlay.remove();
            db.collection('students').doc(docId).delete().then(function () {
                showToast('Usuario eliminado correctamente', 'success');
                loadCourseUsers();
            }).catch(function (err) {
                showToast('Error al eliminar: ' + err.message, 'error');
            });
        });
    }

    document.getElementById('btnRefreshUsers').addEventListener('click', loadCourseUsers);

    // ==================== PUBLIC API ====================
    window.AdminPanel = {
        save: save,
        addListItem: addListItem,
        removeListItem: removeListItem,
        addGroupItem: addGroupItem,
        removeGroupItem: removeGroupItem,
        uploadImage: uploadImage,
        toggleCard: toggleCard,
        toggleModuleCard: toggleModuleCard,
        saveModule: saveModule,
        deleteModule: deleteModule,
        addLesson: addLesson,
        removeLesson: removeLesson,
        uploadVideo: uploadVideo,
        uploadFile: uploadFile,
        removeFile: removeFile,
        deleteUser: deleteUser
    };

    // ==================== INIT ====================
    checkSession();

})();
