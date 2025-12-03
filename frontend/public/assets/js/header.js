 fetch("header.html").then(res => res.text()).then(data => {
      document.getElementById("header").innerHTML = data;
    });

    fetch("footer.html").then(res => res.text()).then(data => {
      document.getElementById("footer").innerHTML = data;
    });


    // hover function 

    const sections = document.querySelectorAll("section");

function reveal() {
  sections.forEach(sec => {
    const top = sec.getBoundingClientRect().top;
    if (top < window.innerHeight - 120) {
      sec.classList.add("visible");
    }
  });
}
window.addEventListener("scroll", reveal);
reveal();


// Fade-up animation on scroll
const fadeElements = document.querySelectorAll('.fade-up');

function handleScroll() {
  fadeElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', handleScroll);
window.addEventListener('load', handleScroll);
