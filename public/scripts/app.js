const btn = document.querySelector(".btn").addEventListener("click", () => {
  window.open("https://www.academy.nehonix.space/register", "_blank");
});

gsap.to(".container", {
  opacity: 1,
  duration: 1,
  y: -20,
  ease: "power3.out",
});

const shapesContainer = document.querySelector(".floating-shapes");
for (let i = 0; i < 100; i++) {
  let shape = document.createElement("div");
  shape.classList.add("shape");
  shape.style.left = `${Math.random() * 100}%`;
  shape.style.top = `${Math.random() * 100}%`;
  shape.style.width = `${Math.random() * 50 + 20}px`;
  shape.style.height = shape.style.width;
  shape.style.animationDuration = `${Math.random() * 4 + 2}s`;
  shapesContainer.appendChild(shape);
}
