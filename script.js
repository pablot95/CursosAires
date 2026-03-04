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

})();