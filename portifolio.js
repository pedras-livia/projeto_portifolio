// js/cursor.js
(() => {
  // Do not init on touch devices or when prefers-reduced-motion is requested
  const isTouch = matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouch) return; // skip creating custom cursor on touch devices

  // Create or select the cursor element
  const cursor = document.getElementById('custom-cursor') || (() => {
    const el = document.createElement('div');
    el.id = 'custom-cursor';
    document.body.appendChild(el);
    return el;
  })();

  // State
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  const ease = 0.16; // smoothing factor (0 = no movement, 1 = instant)

  // Update target position on pointer move
  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // show cursor if hidden
    cursor.style.opacity = '1';
    // mark idle off
    cursor.classList.remove('idle');
  }, { passive: true });

  // Hide on leaving window
  window.addEventListener('pointerleave', () => {
    cursor.style.opacity = '0';
  });

  // Click feedback
  window.addEventListener('pointerdown', () => {
    cursor.classList.add('active');
  });
  window.addEventListener('pointerup', () => {
    cursor.classList.remove('active');
  });

  // Elements that should trigger the hover (bigger cursor)
  const interactiveSelectors = [
    'a', 'button', 'input', 'textarea', 'select', '.btn-github-card', '.btn-github-principal',
    '.card-projeto', '.link-social', '.formulario-contato button', 'label[for]'
  ];
  const interactive = Array.from(document.querySelectorAll(interactiveSelectors.join(',')));

  // Add listeners to interactive elements for hover state
  interactive.forEach(el => {
    el.addEventListener('pointerenter', () => cursor.classList.add('hover'), { passive: true });
    el.addEventListener('pointerleave', () => cursor.classList.remove('hover'), { passive: true });
    // For keyboard focus accessibility
    el.addEventListener('focus', () => cursor.classList.add('hover'));
    el.addEventListener('blur', () => cursor.classList.remove('hover'));
  });

  // Add mutation observer to capture dynamically added interactive elements (e.g., cards loaded later)
  const mo = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (!(node instanceof HTMLElement)) return;
        interactiveSelectors.forEach(sel => {
          if (node.matches && node.matches(sel)) {
            node.addEventListener('pointerenter', () => cursor.classList.add('hover'), { passive: true });
            node.addEventListener('pointerleave', () => cursor.classList.remove('hover'), { passive: true });
            node.addEventListener('focus', () => cursor.classList.add('hover'));
            node.addEventListener('blur', () => cursor.classList.remove('hover'));
          }
          // also check descendants
          node.querySelectorAll && node.querySelectorAll(sel).forEach(child => {
            child.addEventListener('pointerenter', () => cursor.classList.add('hover'), { passive: true });
            child.addEventListener('pointerleave', () => cursor.classList.remove('hover'), { passive: true });
            child.addEventListener('focus', () => cursor.classList.add('hover'));
            child.addEventListener('blur', () => cursor.classList.remove('hover'));
          });
        });
      });
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });

  // Idle state: if user doesn't move mouse for 2.5s, add idle class (subtle pulse in CSS)
  let idleTimeout;
  const resetIdle = () => {
    clearTimeout(idleTimeout);
    cursor.classList.remove('idle');
    idleTimeout = setTimeout(() => {
      cursor.classList.add('idle');
    }, 2500);
  };
  window.addEventListener('pointermove', resetIdle, { passive: true });
  resetIdle();

  // Respect reduced motion: reduce smoothing and disable idle animation if requested
  const animationEase = reduceMotion ? 0.6 : ease;

  // RAF loop for smooth following
  function animate() {
    // lerp
    cursorX += (mouseX - cursorX) * animationEase;
    cursorY += (mouseY - cursorY) * animationEase;
    // apply transform (translate3d for better perf)
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // Ensure cursor initially hidden until first move (avoid flashing at 0,0)
  cursor.style.opacity = '0';

  // Clean up on unload (optional)
  window.addEventListener('unload', () => {
    mo.disconnect();
  });

  // expose for debug if needed
  window.__customCursor = { el: cursor };
})();





// darkmode.js
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("theme-toggle");
  const body = document.body;

  // Verifica se há preferência salva
  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    toggle.checked = true;
  }

  // Alterna tema ao clicar
  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  });

  // Sincroniza com preferências do sistema (opcional)
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  prefersDark.addEventListener("change", (e) => {
    if (e.matches) {
      body.classList.add("dark-mode");
      toggle.checked = true;
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark-mode");
      toggle.checked = false;
      localStorage.setItem("theme", "light");
    }
  });
});


// modal.js
document.addEventListener("DOMContentLoaded", () => {
  const modalOverlay = document.getElementById("modal-overlay");
  const openModal = document.getElementById("open-modal");
  const closeModal = document.querySelector(".close-modal");
  const closeBtn = document.getElementById("close-btn");

  // Abrir modal
  openModal.addEventListener("click", () => {
    modalOverlay.classList.add("active");
  });

  // Fechar modal pelos botões
  closeModal.addEventListener("click", () => {
    modalOverlay.classList.remove("active");
  });
  closeBtn.addEventListener("click", () => {
    modalOverlay.classList.remove("active");
  });

  // Fechar clicando fora do modal
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove("active");
    }
  });
});
