/* ── Year ── */
const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = `© ${new Date().getFullYear()} Hari Baskar T. All rights reserved.`;
}

/* ── Scroll Reveal ── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ── 3D Card Tilt on Mouse Move ── */
function applyTilt(card) {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const rotateX = ((y - cy) / cy) * -6;
    const rotateY = ((x - cx) / cx) * 6;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) translateZ(10px)`;

    /* Spotlight glow follows cursor */
    const pctX = Math.round((x / rect.width) * 100);
    const pctY = Math.round((y / rect.height) * 100);
    card.style.setProperty("--glow-x", `${pctX}%`);
    card.style.setProperty("--glow-y", `${pctY}%`);
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
    card.style.transition = "transform 0.5s ease, box-shadow 0.5s ease";
    setTimeout(() => {
      card.style.transition = "";
    }, 500);
  });
}

/* Apply tilt to all cards — works for both light and dark themes */
document.querySelectorAll(".card, .skill-card, .quick-stats article").forEach(applyTilt);

/* ── Staggered reveal for chips ── */
document.querySelectorAll(".chips span").forEach((chip, i) => {
  chip.style.opacity = "0";
  chip.style.transform = "translateY(16px)";
  chip.style.transition = `opacity 0.4s ease ${i * 0.04}s, transform 0.4s ease ${i * 0.04}s`;
});

const chipsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll("span").forEach((chip) => {
          chip.style.opacity = "1";
          chip.style.transform = "translateY(0)";
        });
        chipsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".chips").forEach((wrap) => chipsObserver.observe(wrap));

/* ── Skill meter animate on scroll (light theme) ── */
const meterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".meter span").forEach((bar) => {
          bar.style.animationPlayState = "running";
        });
        meterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll(".skill-card").forEach((card) => {
  /* Pause animation until in view */
  card.querySelectorAll(".meter span").forEach((bar) => {
    bar.style.animationPlayState = "paused";
  });
  meterObserver.observe(card);
});
