/* ==========================================================================
   PORTFOLIO INTERACTIVE LOGIC: Hari Baskar T
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initPreloader();
  initTopbar();
  initScrollReveal();
  init3DCardTilt();
  initThreeJSConstellation();
  initContactForm();
});

/* ==========================================================================
   1. PRELOADER DISMISS
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  // Dismiss loader when everything has finished loading (or after safety timeout)
  window.addEventListener("load", dismiss);
  
  // Safety timeout in case window load event doesn't trigger
  const timeoutId = setTimeout(dismiss, 2500);

  function dismiss() {
    clearTimeout(timeoutId);
    if (!preloader.classList.contains("fade-out")) {
      preloader.classList.add("fade-out");
      // Remove from DOM after transition completes
      setTimeout(() => {
        preloader.remove();
      }, 800);
    }
  }
}

/* ==========================================================================
   2. SCROLL ACTION: STICKY NAVIGATION BAR
   ========================================================================== */
function initTopbar() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      topbar.classList.add("scrolled");
    } else {
      topbar.classList.remove("scrolled");
    }
  });
}

/* ==========================================================================
   3. SCROLL REVEAL OBSERVER
   ========================================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          
          // If the entry has skill chips, trigger a staggered reveal
          const chips = entry.target.querySelectorAll(".chips span");
          if (chips.length > 0) {
            chips.forEach((chip, index) => {
              chip.style.opacity = "0";
              chip.style.transform = "translateY(15px) scale(0.9)";
              
              // Trigger reflow to start transition
              void chip.offsetWidth;
              
              chip.style.transition = `all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.05}s`;
              chip.style.opacity = "1";
              chip.style.transform = "translateY(0) scale(1)";
            });
          }
          
          // Unobserve after showing
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    }
  );

  reveals.forEach((el) => {
    observer.observe(el);
  });
}

/* ==========================================================================
   4. 3D CARD TILT & HOLOGRAPHIC SHEEN
   ========================================================================== */
function init3DCardTilt() {
  const cards = document.querySelectorAll(".card, .photo-card");
  
  cards.forEach((card) => {
    let frameId = null;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // Cursor X within card
      const y = e.clientY - rect.top;  // Cursor Y within card
      
      const width = rect.width;
      const height = rect.height;
      
      // Calculate normal coordinates [-1, 1] relative to card center
      const normX = (x / width) * 2 - 1;
      const normY = (y / height) * 2 - 1;
      
      // Rotation intensity factors
      const maxRotation = card.classList.contains("photo-card") ? 10 : 8;
      
      const rotX = -normY * maxRotation;
      const rotY = normX * maxRotation;

      if (frameId) cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        // Apply 3D perspective rotation
        if (card.classList.contains("photo-card")) {
          card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
        } else {
          card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;
        }
        
        // Dynamically place reflection gradient (Sheen)
        const pctX = (x / width) * 100;
        const pctY = (y / height) * 100;
        card.style.setProperty("--sheen-x", `${pctX}%`);
        card.style.setProperty("--sheen-y", `${pctY}%`);
      });
    });

    card.addEventListener("mouseenter", () => {
      card.style.transition = "none";
    });

    card.addEventListener("mouseleave", () => {
      if (frameId) cancelAnimationFrame(frameId);
      
      // Reset card transform with a smooth snap back transition
      card.style.transition = "transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.4s ease, box-shadow 0.4s ease";
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)";
      
      // Reset sheen coordinates
      card.style.setProperty("--sheen-x", "50%");
      card.style.setProperty("--sheen-y", "50%");
    });
  });
}

/* ==========================================================================
   5. THREE.JS PARTICLE CONSTELLATION BACKGROUND
   ========================================================================== */
function initThreeJSConstellation() {
  const canvas = document.getElementById("bg-canvas-3d");
  if (!canvas || typeof THREE === "undefined") return;

  // Scene setup
  const scene = new THREE.Scene();
  
  // Camera setup
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 400;

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Constellation Parameters
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 35 : 75;
  const maxDistance = isMobile ? 80 : 120;
  
  // Geometry buffers
  const particlesGeometry = new THREE.BufferGeometry();
  const lineGeometry = new THREE.BufferGeometry();
  
  const particlePositions = new Float32Array(particleCount * 3);
  const linePositions = new Float32Array(particleCount * particleCount * 6);
  const lineColors = new Float32Array(particleCount * particleCount * 6);

  const particlesData = [];
  
  // Distribute particles in a 3D box
  const boxWidth = 600;
  const boxHeight = 500;
  const boxDepth = 400;

  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * boxWidth;
    const y = (Math.random() - 0.5) * boxHeight;
    const z = (Math.random() - 0.5) * boxDepth;

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    // Movement velocity
    particlesData.push({
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      ),
      numConnections: 0
    });
  }

  // Glowing particle texture
  function getParticleTexture() {
    const canvasTex = document.createElement("canvas");
    canvasTex.width = 32;
    canvasTex.height = 32;
    const ctx = canvasTex.getContext("2d");
    
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.2, "rgba(16, 185, 129, 0.8)"); // emerald green glow
    grad.addColorStop(0.6, "rgba(6, 182, 212, 0.2)");  // cyan overlay
    grad.addColorStop(1, "rgba(3, 7, 18, 0)");
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();
    
    return new THREE.CanvasTexture(canvasTex);
  }

  // Create point cloud
  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: isMobile ? 8 : 12,
    map: getParticleTexture(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
  scene.add(particleSystem);

  // Line segments for connection lines
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    linewidth: 1 // Note: linewidth is usually 1 in WebGL implementations due to driver limits
  });

  const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineSegments);

  // Mouse interaction variables
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  document.addEventListener("mousemove", (e) => {
    // Normalise mouse to [-1, 1]
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Render loop
  function animate() {
    requestAnimationFrame(animate);

    const positions = particlesGeometry.attributes.position.array;
    let lineIndex = 0;
    let numConnected = 0;

    // Reset connections count
    for (let i = 0; i < particleCount; i++) {
      particlesData[i].numConnections = 0;
    }

    // Update positions of particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Add velocity
      positions[i3] += particlesData[i].velocity.x;
      positions[i3 + 1] += particlesData[i].velocity.y;
      positions[i3 + 2] += particlesData[i].velocity.z;

      // Boundary collision check (reverse velocity)
      if (Math.abs(positions[i3]) > boxWidth / 2) particlesData[i].velocity.x *= -1;
      if (Math.abs(positions[i3 + 1]) > boxHeight / 2) particlesData[i].velocity.y *= -1;
      if (Math.abs(positions[i3 + 2]) > boxDepth / 2) particlesData[i].velocity.z *= -1;

      // Node connection logic
      for (let j = i + 1; j < particleCount; j++) {
        const j3 = j * 3;
        
        const dx = positions[i3] - positions[j3];
        const dy = positions[i3 + 1] - positions[j3 + 1];
        const dz = positions[i3 + 2] - positions[j3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Draw line if proximity is closer than max distance
        if (dist < maxDistance) {
          particlesData[i].numConnections++;
          particlesData[j].numConnections++;

          // Line opacity gets higher the closer the nodes are
          const alpha = 1.0 - dist / maxDistance;

          // Segment node A
          linePositions[lineIndex] = positions[i3];
          linePositions[lineIndex + 1] = positions[i3 + 1];
          linePositions[lineIndex + 2] = positions[i3 + 2];

          // Segment node B
          linePositions[lineIndex + 3] = positions[j3];
          linePositions[lineIndex + 4] = positions[j3 + 1];
          linePositions[lineIndex + 5] = positions[j3 + 2];

          // Color blending from Emerald to Cyan based on positions
          const colorRatio = (positions[i3] + boxWidth/2) / boxWidth;
          const r1 = (16 / 255) * colorRatio + (6 / 255) * (1 - colorRatio);
          const g1 = (185 / 255) * colorRatio + (182 / 255) * (1 - colorRatio);
          const b1 = (129 / 255) * colorRatio + (212 / 255) * (1 - colorRatio);

          lineColors[lineIndex] = r1 * alpha;
          lineColors[lineIndex + 1] = g1 * alpha;
          lineColors[lineIndex + 2] = b1 * alpha;

          lineColors[lineIndex + 3] = r1 * alpha;
          lineColors[lineIndex + 4] = g1 * alpha;
          lineColors[lineIndex + 5] = b1 * alpha;

          lineIndex += 6;
          numConnected++;
        }
      }
    }

    // Set draw range of line segments to avoid rendering empty buffers
    lineGeometry.setDrawRange(0, numConnected * 2);
    
    // Request updates in GPU
    particlesGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.color.needsUpdate = true;

    // Mouse Parallax effect
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Slight rotation to coordinates
    particleSystem.rotation.y = targetX * 0.12;
    particleSystem.rotation.x = -targetY * 0.12;
    lineSegments.rotation.y = targetX * 0.12;
    lineSegments.rotation.x = -targetY * 0.12;

    // Standard slow spin
    particleSystem.rotation.z += 0.0003;
    lineSegments.rotation.z += 0.0003;

    renderer.render(scene, camera);
  }

  animate();
}

/* ==========================================================================
   6. CONTACT FORM SYSTEM WITH MOCK BACKEND RESPONDING
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById("contact-form");
  const statusContainer = document.getElementById("form-status");
  
  if (!form || !statusContainer) return;

  const inputs = form.querySelectorAll("input, textarea");

  // Remove invalid markings on input focus
  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      const formGroup = input.closest(".form-group");
      if (formGroup) {
        formGroup.classList.remove("invalid");
      }
      statusContainer.style.display = "none";
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    let isValid = true;
    
    // Validate inputs
    inputs.forEach((input) => {
      const value = input.value.trim();
      const formGroup = input.closest(".form-group");
      
      if (!value) {
        isValid = false;
        if (formGroup) formGroup.classList.add("invalid");
      } else if (input.type === "email") {
        // Basic Email Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          if (formGroup) formGroup.classList.add("invalid");
        }
      }
    });

    if (!isValid) {
      statusContainer.className = "form-status error";
      statusContainer.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Please fix the errors in the form before sending.`;
      statusContainer.style.display = "flex";
      
      // Shake animation on the form to represent failure
      form.classList.add("shake-form");
      setTimeout(() => {
        form.classList.remove("shake-form");
      }, 500);
      return;
    }

    // Submit animation triggers
    const submitBtn = form.querySelector(".btn-submit");
    const originalBtnHTML = submitBtn.innerHTML;
    
    // Disable form inputs & buttons
    inputs.forEach(el => el.disabled = true);
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
    
    statusContainer.className = "form-status loading";
    statusContainer.innerHTML = `<i class="fa-solid fa-spinner"></i> Dispatching secure message package...`;
    statusContainer.style.display = "flex";

    // Simulate REST API Call
    setTimeout(() => {
      // Re-enable form fields
      inputs.forEach(el => el.disabled = false);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
      
      // Show Success Box
      statusContainer.className = "form-status success";
      statusContainer.innerHTML = `<i class="fa-solid fa-circle-check"></i> Thank you! Message sent successfully. I'll respond within 24 hours.`;
      statusContainer.style.display = "flex";
      
      // Clear inputs
      form.reset();

      // Clear success notification after 6 seconds
      setTimeout(() => {
        statusContainer.style.transition = "opacity 0.5s ease";
        statusContainer.style.opacity = "0";
        setTimeout(() => {
          statusContainer.style.display = "none";
          statusContainer.style.opacity = "1";
        }, 500);
      }, 6000);
      
    }, 1800);
  });
}

/* Year updating in footer */
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = `© ${new Date().getFullYear()} Hari Baskar T. All rights reserved.`;
}