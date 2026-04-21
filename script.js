(function(){

    var header = document.getElementById('header');
    var menuToggle = document.getElementById('menuToggle');
    var navLinks = document.getElementById('navLinks');
    var scrollProgress = document.getElementById('scrollProgress');
    var mobileCta = document.getElementById('mobileCta');
    var faqItems = document.querySelectorAll('.faq-item');
    var animElements = document.querySelectorAll('[data-animate]');
    var statNumbers = document.querySelectorAll('.stat-number');

    var endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);
    endDate.setHours(23, 59, 59, 0);

    window._setCountdownDate = function(dateStr) {
        if(dateStr) endDate = new Date(dateStr);
    };

    function updateCountdown(){
        var now = new Date().getTime();
        var diff = endDate.getTime() - now;
        if(diff <= 0){
            document.getElementById('cd-days').textContent = '00';
            document.getElementById('cd-hours').textContent = '00';
            document.getElementById('cd-mins').textContent = '00';
            document.getElementById('cd-secs').textContent = '00';
            return;
        }
        var d = Math.floor(diff / (1000 * 60 * 60 * 24));
        var h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var s = Math.floor((diff % (1000 * 60)) / 1000);
        document.getElementById('cd-days').textContent = d < 10 ? '0' + d : d;
        document.getElementById('cd-hours').textContent = h < 10 ? '0' + h : h;
        document.getElementById('cd-mins').textContent = m < 10 ? '0' + m : m;
        document.getElementById('cd-secs').textContent = s < 10 ? '0' + s : s;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    window.addEventListener('scroll', function(){
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        var progress = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = progress + '%';

        if(scrollTop > 60){
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        if(scrollTop > 600 && mobileCta){
            mobileCta.classList.add('visible');
        } else if(mobileCta){
            mobileCta.classList.remove('visible');
        }
    });

    menuToggle.addEventListener('click', function(){
        navLinks.classList.toggle('open');
        var spans = menuToggle.querySelectorAll('span');
        if(navLinks.classList.contains('open')){
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    navLinks.querySelectorAll('a').forEach(function(link){
        link.addEventListener('click', function(){
            navLinks.classList.remove('open');
            var spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    document.addEventListener('click', function(e){
        if(!navLinks.contains(e.target) && !menuToggle.contains(e.target)){
            navLinks.classList.remove('open');
            var spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
            if(entry.isIntersecting){
                var el = entry.target;
                var delay = el.getAttribute('data-delay') || 0;
                setTimeout(function(){
                    el.classList.add('animated');
                }, parseInt(delay));
                observer.unobserve(el);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    animElements.forEach(function(el){
        observer.observe(el);
    });

    var statsObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
            if(entry.isIntersecting){
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, {threshold: 0.3});

    var statsSection = document.getElementById('stats');
    if(statsSection) statsObserver.observe(statsSection);

    function animateCounters(){
        statNumbers.forEach(function(counter){
            var target = parseInt(counter.getAttribute('data-count'));
            var duration = 2000;
            var start = 0;
            var startTime = null;

            function step(timestamp){
                if(!startTime) startTime = timestamp;
                var elapsed = timestamp - startTime;
                var progress = Math.min(elapsed / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                var current = Math.floor(eased * target);
                counter.textContent = current;
                if(progress < 1){
                    requestAnimationFrame(step);
                } else {
                    counter.textContent = target;
                }
            }

            requestAnimationFrame(step);
        });
    }

    faqItems.forEach(function(item){
        var question = item.querySelector('.faq-question');
        question.addEventListener('click', function(){
            var isActive = item.classList.contains('active');
            faqItems.forEach(function(i){ i.classList.remove('active'); });
            if(!isActive){
                item.classList.add('active');
            }
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(function(anchor){
        anchor.addEventListener('click', function(e){
            var targetId = this.getAttribute('href');
            if(targetId === '#') return;
            var target = document.querySelector(targetId);
            if(target){
                e.preventDefault();
                var headerHeight = header.offsetHeight + 20;
                var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({top: targetPosition, behavior: 'smooth'});
            }
        });
    });

    var heroImg = document.querySelector('.hero-img-wrapper img');
    if(heroImg && window.innerWidth > 768){
        window.addEventListener('scroll', function(){
            var scrolled = window.pageYOffset;
            if(scrolled < 800){
                heroImg.style.transform = 'translateY(' + (scrolled * 0.08) + 'px)';
            }
        });
    }

    var previewVideo = document.getElementById('previewVideo');
    var playOverlay = document.getElementById('playOverlay');
    var playIcon = document.getElementById('playIcon');
    if(previewVideo && playOverlay){
        playOverlay.addEventListener('click', function(){
            if(previewVideo.paused){
                previewVideo.muted = false;
                previewVideo.play();
                playOverlay.style.opacity = '0';
                playOverlay.style.pointerEvents = 'none';
                playIcon.classList.remove('fa-play');
                playIcon.classList.add('fa-pause');
            }
        });
        previewVideo.addEventListener('click', function(){
            if(!previewVideo.paused){
                previewVideo.pause();
                playOverlay.style.opacity = '1';
                playOverlay.style.pointerEvents = 'auto';
                playIcon.classList.remove('fa-pause');
                playIcon.classList.add('fa-play');
            }
        });
        previewVideo.addEventListener('ended', function(){
            playOverlay.style.opacity = '1';
            playOverlay.style.pointerEvents = 'auto';
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
        });
    }

    // ==================== FIREBASE DATA LOADING ====================
    if(typeof firebase !== 'undefined'){
        var firebaseConfig = {
            apiKey: "AIzaSyCZNcCA4l_jj6W7ZFAo8pNAgDW2WASW_Ro",
            authDomain: "cursoaires-1cada.firebaseapp.com",
            projectId: "cursoaires-1cada",
            storageBucket: "cursoaires-1cada.firebasestorage.app",
            messagingSenderId: "955097109164",
            appId: "1:955097109164:web:c1ebf82ef88c2a946d4509"
        };
        if(!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        var db = firebase.firestore();

        db.collection('siteContent').get().then(function(snapshot){
            var siteData = {};
            snapshot.forEach(function(doc){ siteData[doc.id] = doc.data(); });

            if(siteData.topBar) loadTopBar(siteData.topBar);
            if(siteData.stats) loadStats(siteData.stats);
            if(siteData.contenido) loadContenido(siteData.contenido);
            if(siteData.modulos) loadModulos(siteData.modulos);
            if(siteData.videoPreview) loadVideoPreview(siteData.videoPreview);
            if(siteData.bonus) loadBonus(siteData.bonus);
            if(siteData.sinCurso) loadSinCurso(siteData.sinCurso);
            if(siteData.precio) loadPrecio(siteData.precio);

            // Re-observe new dynamic elements for animations
            document.querySelectorAll('[data-animate]:not(.animated)').forEach(function(el){
                observer.observe(el);
            });
        }).catch(function(err){
            console.warn('Firebase: usando contenido estático.', err);
        });
    }

    function esc(str){ 
        if(!str && str !== 0) return '';
        var d = document.createElement('div');
        d.textContent = String(str);
        return d.innerHTML;
    }

    function loadTopBar(d){
        var bar = document.querySelector('.top-bar-inner');
        if(!bar) return;
        var span = bar.querySelector('span');
        if(span && d.text) span.textContent = d.text;
        var cta = bar.querySelector('.top-bar-cta');
        if(cta && d.ctaText) cta.textContent = d.ctaText;
        if(d.countdownDate) window._setCountdownDate(d.countdownDate);
    }

    function loadStats(d){
        if(!d.items || !d.items.length) return;
        var grid = document.querySelector('.stats-grid');
        if(!grid) return;
        grid.innerHTML = '';
        d.items.forEach(function(item, i){
            var div = document.createElement('div');
            div.className = 'stat-item';
            div.setAttribute('data-animate', 'fade-up');
            if(i > 0) div.setAttribute('data-delay', String(i * 100));
            var numSpan = document.createElement('span');
            numSpan.className = 'stat-number';
            numSpan.setAttribute('data-count', String(item.number));
            numSpan.textContent = '0';
            var sufSpan = document.createElement('span');
            sufSpan.className = 'stat-suffix';
            sufSpan.textContent = item.suffix || '';
            var p = document.createElement('p');
            p.textContent = item.label;
            div.appendChild(numSpan);
            div.appendChild(sufSpan);
            div.appendChild(p);
            grid.appendChild(div);
        });
        // Re-observe for animations
        statNumbers = document.querySelectorAll('.stat-number');
    }

    function loadContenido(d){
        var section = document.getElementById('contenido');
        if(!section) return;
        var tag = section.querySelector('.section-tag');
        if(tag && d.tag) tag.textContent = d.tag;
        var h2 = section.querySelector('.content-info h2');
        if(h2 && d.title) h2.textContent = d.title;
        var desc = section.querySelector('.content-info > p');
        if(desc && d.description) desc.textContent = d.description;
        if(d.image){
            var img = section.querySelector('.media-stack img');
            if(img) img.src = d.image;
        }
        if(d.items && d.items.length){
            var ul = section.querySelector('.content-list');
            if(ul){
                ul.innerHTML = '';
                d.items.forEach(function(text){
                    var li = document.createElement('li');
                    var icon = document.createElement('i');
                    icon.className = 'fa-solid fa-check';
                    li.appendChild(icon);
                    li.appendChild(document.createTextNode(' ' + text));
                    ul.appendChild(li);
                });
            }
        }
    }

    function loadModulos(d){
        var section = document.getElementById('modulos');
        if(!section) return;
        var headerTag = section.querySelector('.section-header .section-tag');
        if(headerTag && d.tag) headerTag.textContent = d.tag;
        var headerH2 = section.querySelector('.section-header h2');
        if(headerH2 && d.title) headerH2.textContent = d.title;
        var headerP = section.querySelector('.section-header p');
        if(headerP && d.description) headerP.textContent = d.description;

        if(d.items && d.items.length){
            var timeline = section.querySelector('.modules-timeline');
            if(!timeline) return;
            timeline.innerHTML = '';
            d.items.forEach(function(mod, i){
                var dir = (i % 2 === 0) ? 'fade-right' : 'fade-left';
                var item = document.createElement('div');
                item.className = 'module-item';
                item.setAttribute('data-animate', dir);

                var numDiv = document.createElement('div');
                numDiv.className = 'module-number';
                numDiv.textContent = mod.number;

                var contentDiv = document.createElement('div');
                contentDiv.className = 'module-content';

                var imgDiv = document.createElement('div');
                imgDiv.className = 'module-img';
                var img = document.createElement('img');
                img.src = mod.image || '';
                img.alt = mod.imageAlt || '';
                img.loading = 'lazy';
                img.width = 400;
                img.height = 300;
                imgDiv.appendChild(img);

                var textDiv = document.createElement('div');
                textDiv.className = 'module-text';
                var h3 = document.createElement('h3');
                h3.textContent = mod.title;
                var p = document.createElement('p');
                p.textContent = mod.description;
                var meta = document.createElement('div');
                meta.className = 'module-meta';
                meta.innerHTML = '<span><i class="fa-solid fa-play-circle"></i> ' + esc(mod.classes) + '</span>' +
                    '<span><i class="fa-solid fa-clock"></i> ' + esc(mod.hours) + '</span>';
                textDiv.appendChild(h3);
                textDiv.appendChild(p);
                textDiv.appendChild(meta);

                contentDiv.appendChild(imgDiv);
                contentDiv.appendChild(textDiv);
                item.appendChild(numDiv);
                item.appendChild(contentDiv);
                timeline.appendChild(item);
            });
        }
    }

    function loadVideoPreview(d){
        var section = document.getElementById('video-preview');
        if(!section) return;
        var tag = section.querySelector('.section-tag');
        if(tag && d.tag) tag.textContent = d.tag;
        var h2 = section.querySelector('.video-info h2');
        if(h2 && d.title) h2.textContent = d.title;
        var p = section.querySelector('.video-info > p');
        if(p && d.description) p.textContent = d.description;

        if(d.features && d.features.length){
            var ul = section.querySelector('.video-features');
            if(ul){
                ul.innerHTML = '';
                d.features.forEach(function(f){
                    var li = document.createElement('li');
                    var icon = document.createElement('i');
                    icon.className = f.icon;
                    li.appendChild(icon);
                    li.appendChild(document.createTextNode(' ' + f.text));
                    ul.appendChild(li);
                });
            }
        }

        var video = document.getElementById('previewVideo');
        if(video){
            if(d.videoSrc) video.src = d.videoSrc;
            if(d.posterSrc) video.poster = d.posterSrc;
        }
    }

    function loadBonus(d){
        var section = document.getElementById('bonus');
        if(!section) return;
        var headerTag = section.querySelector('.section-header .section-tag');
        if(headerTag && d.tag) headerTag.textContent = d.tag;
        var headerH2 = section.querySelector('.section-header h2');
        if(headerH2 && d.title) headerH2.textContent = d.title;

        if(d.items && d.items.length){
            var grid = section.querySelector('.bonus-grid');
            if(!grid) return;
            grid.innerHTML = '';
            d.items.forEach(function(b, i){
                var card = document.createElement('div');
                card.className = 'bonus-card';
                card.setAttribute('data-animate', 'fade-up');
                if(i > 0) card.setAttribute('data-delay', String(i * 100));

                var badge = document.createElement('div');
                badge.className = 'bonus-badge';
                badge.textContent = b.badge;

                var iconDiv = document.createElement('div');
                iconDiv.className = 'bonus-icon';
                var iconEl = document.createElement('i');
                iconEl.className = b.icon;
                iconDiv.appendChild(iconEl);

                var h3 = document.createElement('h3');
                h3.textContent = b.title;

                var p = document.createElement('p');
                p.textContent = b.description;

                var valDiv = document.createElement('div');
                valDiv.className = 'bonus-value';
                var oldVal = document.createElement('span');
                oldVal.className = 'old-val';
                oldVal.textContent = b.oldPrice;
                var freeVal = document.createElement('span');
                freeVal.className = 'free-val';
                freeVal.textContent = 'GRATIS';
                valDiv.appendChild(oldVal);
                valDiv.appendChild(freeVal);

                card.appendChild(badge);
                card.appendChild(iconDiv);
                card.appendChild(h3);
                card.appendChild(p);
                card.appendChild(valDiv);
                grid.appendChild(card);
            });
        }
    }

    function loadSinCurso(d){
        var section = document.getElementById('sin-curso');
        if(!section) return;
        var headerTag = section.querySelector('.section-header .section-tag');
        if(headerTag && d.tag) headerTag.textContent = d.tag;
        var headerH2 = section.querySelector('.section-header h2');
        if(headerH2 && d.title) headerH2.textContent = d.title;

        if(d.items && d.items.length){
            var costList = section.querySelector('.cost-list');
            if(!costList) return;
            costList.innerHTML = '';
            d.items.forEach(function(c){
                var item = document.createElement('div');
                item.className = 'cost-item';
                var label = document.createElement('span');
                label.className = 'cost-label';
                label.textContent = c.label;
                var price = document.createElement('span');
                price.className = 'cost-price';
                price.textContent = c.price;
                item.appendChild(label);
                item.appendChild(price);
                costList.appendChild(item);
            });
            var total = document.createElement('div');
            total.className = 'cost-total';
            var tLabel = document.createElement('span');
            tLabel.textContent = d.totalLabel || 'Total en un solo año:';
            var tAmount = document.createElement('span');
            tAmount.className = 'total-amount';
            tAmount.textContent = d.totalAmount || '$435.000+';
            total.appendChild(tLabel);
            total.appendChild(tAmount);
            costList.appendChild(total);
        }
    }

    function loadPrecio(d){
        var section = document.getElementById('precio');
        if(!section) return;
        var tag = section.querySelector('.pricing-tag');
        if(tag && d.tag) tag.textContent = d.tag;
        var h2 = section.querySelector('.pricing-header h2');
        if(h2 && d.title) h2.textContent = d.title;
        var sub = section.querySelector('.pricing-header p');
        if(sub && d.subtitle) sub.textContent = d.subtitle;

        var oldLabel = section.querySelector('.price-old span:first-child');
        if(oldLabel && d.oldPriceLabel) oldLabel.textContent = d.oldPriceLabel;
        var oldPrice = section.querySelector('.price-old .strikethrough');
        if(oldPrice && d.oldPrice) oldPrice.textContent = d.oldPrice;

        var currency = section.querySelector('.price-current .currency');
        if(currency && d.currency) currency.textContent = d.currency;
        var amount = section.querySelector('.price-current .amount');
        if(amount && d.amount) amount.textContent = d.amount;
        var period = section.querySelector('.price-current .period');
        if(period && d.period) period.textContent = d.period;

        var saving = section.querySelector('.price-saving');
        if(saving){
            // Calcular ahorro automaticamente
            var oldNum = d.oldPrice ? parseInt(d.oldPrice.replace(/[^0-9]/g, ''), 10) : 0;
            var newNum = d.amount ? parseInt(String(d.amount).replace(/[^0-9]/g, ''), 10) : 0;
            if(oldNum > 0 && newNum > 0 && oldNum > newNum){
                var diff = oldNum - newNum;
                saving.textContent = 'Ahorrás $' + diff.toLocaleString('es-AR') + ' hoy';
            } else if(d.saving){
                saving.textContent = d.saving;
            }
        }

        // Precio en USD (fallback 1400 si no está configurado en Firebase)
        var priceUsd = document.getElementById('priceUSD');
        var usdAmountEl = section.querySelector('.usd-amount');
        if(priceUsd && usdAmountEl && d.amount){
            var arsNum2 = parseInt(String(d.amount).replace(/[^0-9]/g, ''), 10);
            var rate = (d.usdRate && Number(d.usdRate) > 0) ? Number(d.usdRate) : 1400;
            if(arsNum2 > 0){
                var usdVal = Math.round(arsNum2 / rate);
                usdAmountEl.textContent = usdVal.toLocaleString('en-US');
                priceUsd.style.display = '';
            }
        }

        if(d.features && d.features.length){
            var ul = section.querySelector('.pricing-features');
            if(ul){
                ul.innerHTML = '';
                d.features.forEach(function(f){
                    var li = document.createElement('li');
                    var icon = document.createElement('i');
                    icon.className = 'fa-solid fa-check-circle';
                    li.appendChild(icon);
                    li.appendChild(document.createTextNode(' ' + f));
                    ul.appendChild(li);
                });
            }
        }

        var cta = section.querySelector('.pricing-body > a.btn');
        if(cta){
            if(d.ctaText) cta.textContent = d.ctaText;
            cta.href = 'checkout.html';
        }

        var guarantee = section.querySelector('.pricing-guarantee span');
        if(guarantee && d.guaranteeText) guarantee.textContent = d.guaranteeText;

        // Also update cta-final and mobile-cta with pricing data
        var fpOld = document.querySelector('.fp-old');
        if(fpOld && d.oldPrice) fpOld.textContent = d.oldPrice;
        var fpCurrent = document.querySelector('.fp-current');
        if(fpCurrent && d.amount && d.period) fpCurrent.textContent = d.currency + d.amount + ' ' + d.period;

        var mcpOld = document.querySelector('.mcp-old');
        if(mcpOld && d.oldPrice) mcpOld.textContent = d.oldPrice;
        var mcpCurrent = document.querySelector('.mcp-current');
        if(mcpCurrent && d.amount) mcpCurrent.textContent = d.currency + d.amount;
    }

})();