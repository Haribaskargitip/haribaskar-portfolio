const yearElement = document.getElementById("year");

if (yearElement) {
  const currentYear = new Date().getFullYear();
  yearElement.textContent = `© ${currentYear} Hari Baskar T. All rights reserved.`;
}
