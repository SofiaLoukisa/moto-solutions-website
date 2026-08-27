/* ============================================================
   MOTO SOLUTIONS — Main JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── AOS init ── */
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 750, once: true, offset: 60 });
  }

  /* ── Hero carousel: start cycling right away, don't wait for full page load ── */
  const heroCarouselEl = document.getElementById('heroCarousel');
  if (heroCarouselEl && typeof bootstrap !== 'undefined') {
    new bootstrap.Carousel(heroCarouselEl, { ride: 'carousel' });
  }

  /* ── Navbar scroll shadow ── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    
    /* ── Ensure navbar stays visible on mobile ── */
    const enforceNavbarVisibility = () => {
      navbar.style.position = 'fixed';
      navbar.style.top = '0';
      navbar.style.left = '0';
      navbar.style.right = '0';
      navbar.style.zIndex = '1030';
      navbar.style.visibility = 'visible';
      navbar.style.display = 'block';
      navbar.style.opacity = '1';
      navbar.style.width = '100%';
      
      // Also ensure navbar elements are visible
      const navbarToggler = navbar.querySelector('.navbar-toggler');
      const navbarCollapse = navbar.querySelector('.navbar-collapse');
      if (navbarToggler) {
        navbarToggler.style.visibility = 'visible';
        navbarToggler.style.display = 'block';
      }
      if (navbarCollapse) {
        navbarCollapse.style.visibility = 'visible';
        navbarCollapse.style.opacity = '1';
      }
    };
    
    enforceNavbarVisibility();
    
    // Use MutationObserver to watch for any style changes that might hide the navbar
    const observer = new MutationObserver(enforceNavbarVisibility);
    observer.observe(navbar, { attributes: true, attributeFilter: ['style', 'class'] });
    
    // Also re-enforce on window resize and scroll
    window.addEventListener('resize', enforceNavbarVisibility, { passive: true });
    window.addEventListener('scroll', enforceNavbarVisibility, { passive: true });
  }

  /* ── Active nav link ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Animated counter ── */
  const counters = document.querySelectorAll('.counter');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = +el.dataset.target;
      const duration = 1800;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current).toLocaleString('el-GR');
      }, 16);
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
  }

  /* ── Back to top ── */
  const btt = document.getElementById('backToTop');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── Gallery lightbox ── */
  const overlay   = document.getElementById('lightboxOverlay');
  const lbImg     = document.getElementById('lightboxImg');
  const lbClose   = document.getElementById('lightboxClose');
  const lbPrev    = document.getElementById('lightboxPrev');
  const lbNext    = document.getElementById('lightboxNext');
  const galleryItems = document.querySelectorAll('.gallery-item');
  let currentIndex = 0;

  if (overlay && galleryItems.length) {
    const showImage = (idx) => {
      currentIndex = (idx + galleryItems.length) % galleryItems.length;
      lbImg.src = galleryItems[currentIndex].querySelector('img').src;
    };
    galleryItems.forEach((item, i) => {
      item.addEventListener('click', () => { overlay.classList.add('active'); showImage(i); });
    });
    lbClose.addEventListener('click', () => overlay.classList.remove('active'));
    lbPrev.addEventListener('click',  () => showImage(currentIndex - 1));
    lbNext.addEventListener('click',  () => showImage(currentIndex + 1));
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
    document.addEventListener('keydown', e => {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') overlay.classList.remove('active');
      if (e.key === 'ArrowLeft')  showImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });
  }

  /* ── Gallery filter ── */
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryGrid = document.querySelectorAll('.gallery-item');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        galleryGrid.forEach(item => {
          const show = filter === 'all' || item.dataset.category === filter;
          item.style.display = show ? 'block' : 'none';
        });
      });
    });
  }

  /* ── Contact form (Formspree) ── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Αποστολή...';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          showToast('success', 'Το μήνυμά σας στάλθηκε με επιτυχία! Θα επικοινωνήσουμε σύντομα.');
          form.reset();
        } else {
          throw new Error();
        }
      } catch {
        showToast('danger', 'Σφάλμα αποστολής. Παρακαλώ δοκιμάστε ξανά ή καλέστε μας.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Αποστολή Μηνύματος';
      }
    });
  }

  /* ── Toast helper ── */
  function showToast(type, msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const id = 'toast-' + Date.now();
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    container.insertAdjacentHTML('beforeend', `
      <div id="${id}" class="toast align-items-center text-bg-${type} border-0 mb-2" role="alert">
        <div class="d-flex">
          <div class="toast-body"><i class="fas ${icon} me-2"></i>${msg}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>`);
    const toastEl = document.getElementById(id);
    new bootstrap.Toast(toastEl, { delay: 5000 }).show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  }

  /* ── Mobile nav close on link click ── */
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const toggler = document.querySelector('.navbar-toggler');
      const collapse = document.querySelector('.navbar-collapse');
      if (collapse && collapse.classList.contains('show')) {
        toggler.click();
      }
    });
  });

});
