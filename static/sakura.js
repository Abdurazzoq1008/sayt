// Sakura (gilos guli) barglarining to'kilishi va sichqonchaga reaksiyasi
(function() {
  // Canvas elementini yaratish va sahifaga ulash
  let canvas = document.getElementById('sakura-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'sakura-canvas';
    document.body.appendChild(canvas);
  }

  if (!document.getElementById('flower-scene')) {
    const scene = document.createElement('div');
    scene.id = 'flower-scene';
    scene.className = 'flower-scene';
    scene.setAttribute('aria-hidden', 'true');

    ['one', 'two', 'three', 'four'].forEach(name => {
      const flower = document.createElement('div');
      flower.className = 'flower-3d flower-3d--' + name;

      const stem = document.createElement('span');
      stem.className = 'flower-3d__stem';
      flower.appendChild(stem);

      const leftLeaf = document.createElement('span');
      leftLeaf.className = 'flower-3d__leaf';
      const rightLeaf = document.createElement('span');
      rightLeaf.className = 'flower-3d__leaf flower-3d__leaf--right';
      flower.append(leftLeaf, rightLeaf);

      for (let i = 0; i < 12; i++) {
        const petal = document.createElement('span');
        petal.className = 'flower-3d__petal flower-3d__petal--outer';
        petal.style.setProperty('--petal-angle', (i * 30) + 'deg');
        flower.appendChild(petal);
      }

      for (let i = 0; i < 8; i++) {
        const petal = document.createElement('span');
        petal.className = 'flower-3d__petal flower-3d__petal--inner';
        petal.style.setProperty('--petal-angle', (i * 45 + 22.5) + 'deg');
        flower.appendChild(petal);
      }

      const center = document.createElement('span');
      center.className = 'flower-3d__center';
      flower.appendChild(center);

      for (let i = 0; i < 12; i++) {
        const stamen = document.createElement('span');
        stamen.className = 'flower-3d__stamen';
        stamen.style.setProperty('--stamen-angle', (i * 30) + 'deg');
        flower.appendChild(stamen);
      }

      scene.appendChild(flower);
    });

    document.body.appendChild(scene);
  }

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  let scrollY = window.scrollY;
  const getPageHeight = () => Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    height
  );
  let pageHeight = getPageHeight();
  const shelves = [];
  const shelfByElement = new Map();
  let lastShelfUpdate = 0;

  function updateDimensions() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    pageHeight = getPageHeight();
    updateShelves();
  }

  function updateShelves() {
    const now = performance.now();
    if (now - lastShelfUpdate < 700) return;
    lastShelfUpdate = now;
    shelves.length = 0;

    document.querySelectorAll('.product-card, #delivery').forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0) return;

      let shelf = shelfByElement.get(element);
      if (!shelf) {
        shelf = { element, buckets: [] };
        shelfByElement.set(element, shelf);
      }

      shelf.left = element.id === 'delivery' ? 0 : rect.left;
      shelf.width = element.id === 'delivery' ? width : rect.width;
      shelf.y = (element.id === 'delivery' ? rect.bottom : rect.top) + scrollY;
      shelf.bucketCount = Math.ceil(shelf.width / 18);
      shelf.buckets.length = shelf.bucketCount;
      for (let i = 0; i < shelf.bucketCount; i++) {
        if (typeof shelf.buckets[i] !== 'number') shelf.buckets[i] = 0;
      }
      shelves.push(shelf);
    });
  }

  window.addEventListener('resize', updateDimensions);
  window.addEventListener('load', updateDimensions);

  // Sichqoncha pozitsiyasi va ta'sir doirasi
  const mouse = {
    x: -2000,
    y: -2000,
    radius: 140, // Sichqoncha ta'sir radiusi
    active: false
  };

  window.addEventListener('scroll', () => {
    const nextScrollY = window.scrollY;
    if (mouse.active) {
      mouse.y += nextScrollY - scrollY;
    }
    scrollY = nextScrollY;
    pageHeight = getPageHeight();
    updateShelves();
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY + scrollY;
    mouse.active = true;

    // Fon sichqoncha harakatiga qarama-qarshi tarafga suriladi.
    const moveX = ((e.clientX / width) - 0.5) * -34;
    const moveY = ((e.clientY / height) - 0.5) * -24;
    document.documentElement.style.setProperty('--bg-x', moveX.toFixed(2) + 'px');
    document.documentElement.style.setProperty('--bg-y', moveY.toFixed(2) + 'px');
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.x = -2000;
    mouse.y = -2000;
    document.documentElement.style.setProperty('--bg-x', '0px');
    document.documentElement.style.setProperty('--bg-y', '0px');
  });

  // Mobil qurilmalarda teginish (touch) uchun
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY + scrollY;
      mouse.active = true;
      const moveX = ((e.touches[0].clientX / width) - 0.5) * -34;
      const moveY = ((e.touches[0].clientY / height) - 0.5) * -24;
      document.documentElement.style.setProperty('--bg-x', moveX.toFixed(2) + 'px');
      document.documentElement.style.setProperty('--bg-y', moveY.toFixed(2) + 'px');
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.active = false;
    mouse.x = -2000;
    mouse.y = -2000;
    document.documentElement.style.setProperty('--bg-x', '0px');
    document.documentElement.style.setProperty('--bg-y', '0px');
  });

  // Sakura gul bargi klassi
  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial
        ? Math.random() * pageHeight
        : -30 - Math.random() * 60;
      this.size = Math.random() * 5 + 8;
      this.speedY = Math.random() * 1.2 + 0.8;
      this.speedX = Math.random() * 0.8 - 0.2; // Yengil shamol oqimi
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.03;
      this.flip = Math.random() * Math.PI;
      this.flipSpeed = Math.random() * 0.03 + 0.01;
      this.opacity = Math.random() * 0.15 + 0.85;
      this.settled = false;
      this.settleLife = 0;
      this.shelf = null;
      this.shelfBucket = -1;
      this.ignoreShelf = null;
      this.shelfIgnoreFrames = 0;
      
      // Kunduzgi och fonlarda ham aniq ko'rinadigan sakura ranglari
      const colors = [
        'rgba(242, 105, 145, ',
        'rgba(247, 127, 159, ',
        'rgba(233, 92, 131, ',
        'rgba(250, 146, 173, ',
        'rgba(232, 70, 117, '
      ];
      this.baseColor = colors[Math.floor(Math.random() * colors.length)];
      
      // Sichqoncha ta'siridagi turtki tezliklari
      this.pushVx = 0;
      this.pushVy = 0;
    }

    update() {
      // Sichqoncha yaqinlashganda barglarning itarilishi (reaksiya)
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          // Yaqinroq bo'lganda kuchliroq itarilish kuchi
          const force = (1 - dist / mouse.radius) * 6;
          const angle = Math.atan2(dy, dx);
          this.pushVx += Math.cos(angle) * force * 0.45;
          this.pushVy += Math.sin(angle) * force * 0.45;
          this.rotationSpeed += (Math.random() - 0.5) * 0.06;
          if (this.settled) {
            this.ignoreShelf = this.shelf;
            this.shelfIgnoreFrames = 30;
            this.release();
          }
        }
      }

      if (this.shelfIgnoreFrames > 0) this.shelfIgnoreFrames--;
      else this.ignoreShelf = null;

      // Kuchning sekin-asta so'nishi (inersiya)
      this.pushVx *= 0.92;
      this.pushVy *= 0.92;

      if (this.settled) {
        this.settleLife--;
        this.x += Math.sin(this.flip) * 0.08;
        this.flip += this.flipSpeed * 0.35;
        this.rotation += this.rotationSpeed * 0.25;
        if (this.settleLife <= 0) {
          this.release();
          this.y = -30;
        }
      } else {
        const previousY = this.y;
        this.x += this.speedX + Math.sin(this.flip) * 0.7 + this.pushVx;
        this.y += this.speedY + this.pushVy;
        this.rotation += this.rotationSpeed;
        this.flip += this.flipSpeed;

        for (let i = 0; i < shelves.length; i++) {
          const shelf = shelves[i];
          if (shelf === this.ignoreShelf) continue;
          const bucket = Math.floor((this.x - shelf.left) / 18);
          if (bucket < 0 || bucket >= shelf.bucketCount) continue;

          const pileHeight = shelf.buckets[bucket] * 8;
          const landingY = shelf.y - pileHeight - this.size * 0.65;
          if (previousY <= landingY && this.y >= landingY) {
            this.settled = true;
            this.y = landingY;
            this.x = shelf.left + bucket * 18 + 9;
            this.shelf = shelf;
            this.shelfBucket = bucket;
            shelf.buckets[bucket]++;
            this.settleLife = 2400 + Math.random() * 1800;
            break;
          }
        }
      }

      // Sahifaning pastki chetiga yetgach barg yana yuqoridan tushadi.
      if (!this.settled && this.y > pageHeight + 40) {
        this.reset();
      } else if (this.x < -50) {
        this.x = width + 50;
      } else if (this.x > width + 50) {
        this.x = -50;
      }
    }

    release() {
      if (this.shelf && this.shelfBucket >= 0) {
        this.shelf.buckets[this.shelfBucket] = Math.max(
          0,
          this.shelf.buckets[this.shelfBucket] - 1
        );
      }
      this.shelf = null;
      this.shelfBucket = -1;
      this.settled = false;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y - scrollY);
      ctx.rotate(this.rotation);
      ctx.scale(Math.cos(this.flip), 1);

      ctx.beginPath();
      // Tabiiy sakura bargining chiroyli yuraksimon egri chizig'i
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(this.size * 0.85, -this.size * 0.85, this.size * 0.9, this.size * 0.4, 0, this.size);
      ctx.bezierCurveTo(-this.size * 0.9, this.size * 0.4, -this.size * 0.85, -this.size * 0.85, 0, -this.size);
      
      ctx.fillStyle = this.baseColor + this.opacity + ')';
      ctx.shadowColor = 'rgba(230, 90, 130, 0.4)';
      ctx.shadowBlur = 7;
      ctx.fill();

      ctx.strokeStyle = 'rgba(190, 55, 90, ' + (this.opacity * 0.45) + ')';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Barg markazidagi nafis chiziq (tomiri)
      ctx.beginPath();
      ctx.moveTo(0, -this.size * 0.7);
      ctx.lineTo(0, this.size * 0.6);
      ctx.strokeStyle = 'rgba(175, 50, 80, ' + (this.opacity * 0.6) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }

  // Ekran kengligiga mos barglar soni
  const petalCount = Math.min(
    Math.ceil(width / 24) * Math.ceil(pageHeight / height),
    240
  );
  const petals = [];
  for (let i = 0; i < petalCount; i++) {
    petals.push(new Petal());
  }

  // Animatsiya sikli
  function animate() {
    ctx.clearRect(0, 0, width, height);
    updateShelves();
    for (let i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw();
    }
    requestAnimationFrame(animate);
  }

  animate();
})();
