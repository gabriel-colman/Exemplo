const sections = document.querySelectorAll("section"); // querySelectorAll retorna uma NodeList com todos os elementos que correspondem ao seletor CSS especificado.
const images = document.querySelectorAll(".bg"); // querySelectorAll retorna uma NodeList com todos os elementos que correspondem ao seletor CSS especificado.
const headings = gsap.utils.toArray(".section-heading"); // toArray converte uma NodeList em um array
const outerWrappers = gsap.utils.toArray(".outer"); // toArray converte uma NodeList em um array  .outer é uma classe css
const innerWrappers = gsap.utils.toArray(".inner");  // toArray converte uma NodeList em um array .inner é uma classe css

document.addEventListener("wheel", handleWheel); // Adiciona um evento ao elemento especificado. O evento é disparado quando o usuário rola a roda do mouse sobre o elemento.
document.addEventListener("touchstart", handleTouchStart); // Adiciona um evento ao elemento especificado. O evento é disparado quando o usuário toca o elemento. 
document.addEventListener("touchmove", handleTouchMove); // Adiciona um evento ao elemento especificado. O evento é disparado quando o usuário move o dedo sobre o elemento.
document.addEventListener("touchend", handleTouchEnd); // Adiciona um evento ao elemento especificado. O evento é disparado quando o usuário remove o dedo do elemento.

let listening = false,
  direction = "down", 
  current,
  next = 0; 

const touch = {
  startX: 0, // starX é uma propriedade de touch que recebe o valor 0
  startY: 0,
  dx: 0,
  dy: 0,
  startTime: 0,
  dt: 0
};

const tlDefaults = { 
  ease: "slow.inOut", // slow.inOut é uma propriedade de tlDefaults que recebe o valor slow.inOut
  duration: 1.25 // duration é uma propriedade de tlDefaults que recebe o valor 1.25
};

const splitHeadings = headings.map((heading) => { // map() é um método de array que chama uma função callback para cada elemento do array e retorna um novo array com os resultados da chamada da função callback.
  return new SplitText(heading, { // SplitText é uma função que recebe dois parâmetros, o primeiro é o elemento que será dividido e o segundo é um objeto com as opções de divisão.
    type: "chars, words, lines",
    linesClass: "clip-text"
  });
});

function revealSectionHeading() { // gsap.to é uma função que recebe dois parâmetros, o primeiro é o elemento que será animado e o segundo é um objeto com as opções de animação.
  return gsap.to(splitHeadings[next].chars, { // splitHeadings[next].chars é um array que contém todos os caracteres do próximo elemento
    autoAlpha: 1,
    yPercent: 0,
    duration: 1,
    ease: "power2",
    stagger: {
      each: 0.02,
      from: "random"
    }
  });
}

gsap.set(outerWrappers, { yPercent: 100 });
gsap.set(innerWrappers, { yPercent: -100 });

// Slides a section in on scroll down
function slideIn() {
  // The first time this function runs, current is undefined
  if (current !== undefined) gsap.set(sections[current], { zIndex: 0 });

  gsap.set(sections[next], { autoAlpha: 1, zIndex: 1 });
  gsap.set(images[next], { yPercent: 0 });
  gsap.set(splitHeadings[next].chars, { autoAlpha: 0, yPercent: 100 });

  const tl = gsap
    .timeline({
      paused: true,
      defaults: tlDefaults,
      onComplete: () => {
        listening = true;
        current = next;
      }
    })
    .to([outerWrappers[next], innerWrappers[next]], { yPercent: 0 }, 0)
    .from(images[next], { yPercent: 15 }, 0)
    .add(revealSectionHeading(), 0);

  if (current !== undefined) {
    tl.add(
      gsap.to(images[current], {
        yPercent: -15,
        ...tlDefaults
      }),
      0
    ).add(
      gsap
        .timeline()
        .set(outerWrappers[current], { yPercent: 100 })
        .set(innerWrappers[current], { yPercent: -100 })
        .set(images[current], { yPercent: 0 })
        .set(sections[current], { autoAlpha: 0 })
    );
  }

  tl.play(0);
}

// Desliza uma seção ao rolar para cima
function slideOut() {
  gsap.set(sections[current], { zIndex: 1 });
  gsap.set(sections[next], { autoAlpha: 1, zIndex: 0 });
  gsap.set(splitHeadings[next].chars, { autoAlpha: 0, yPercent: 100 });
  gsap.set([outerWrappers[next], innerWrappers[next]], { yPercent: 0 });
  gsap.set(images[next], { yPercent: 0 });

  gsap
    .timeline({
      defaults: tlDefaults,
      onComplete: () => {
        listening = true;
        current = next;
      }
    })
    .to(outerWrappers[current], { yPercent: 100 }, 0)
    .to(innerWrappers[current], { yPercent: -100 }, 0)
    .to(images[current], { yPercent: 15 }, 0)
    .from(images[next], { yPercent: -15 }, 0)
    .add(revealSectionHeading(), ">-1")
    .set(images[current], { yPercent: 0 });
}

function handleDirection() {
  listening = false;

  if (direction === "down") {
    next = current + 1;
    if (next >= sections.length) next = 0;
    slideIn();
  }

  if (direction === "up") {
    next = current - 1;
    if (next < 0) next = sections.length - 1;
    slideOut();
  }
}

function handleWheel(e) {
  if (!listening) return;
  direction = e.wheelDeltaY < 0 ? "down" : "up";
  handleDirection();
}

function handleTouchStart(e) {
  if (!listening) return;
  const t = e.changedTouches[0];
  touch.startX = t.pageX;
  touch.startY = t.pageY;
}

function handleTouchMove(e) {
  if (!listening) return;
  e.preventDefault();
}

function handleTouchEnd(e) {
  if (!listening) return;
  const t = e.changedTouches[0];
  touch.dx = t.pageX - touch.startX;
  touch.dy = t.pageY - touch.startY;
  if (touch.dy > 10) direction = "up";
  if (touch.dy < -10) direction = "down";
  handleDirection();
}

slideIn(); // Chama a função slideIn() para iniciar a animação
