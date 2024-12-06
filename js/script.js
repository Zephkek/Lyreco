document.addEventListener("DOMContentLoaded", () => {
  let score = 0;
  let bestScore = 0;
  let isPlaying = false;
  let currentLogo = null;
  let logoInterval = null;
  let bonusInterval = null;
  let trapInterval = null;
  let logoSpeed = 3000;
  let lives = 5;
  let missedMoves = 0;
  let currentStreak = 0;
  const bonusSpawnTime = 20000;
  const trapSpawnTime = 30000;
  let trapSpawnTimeMin = 30000;
  let trapSpawnTimeMax = 15000;
  let newRecordShown = false;

  const gameArena = document.getElementById("gameArena");
  const scoreElement = document.getElementById("score");
  const bestScoreElement = document.getElementById("bestScore");
  const streakDisplay = document.getElementById("streakDisplay");
  const startButton = document.getElementById("startButton");
  const pauseButton = document.getElementById("pauseButton");
  const milestoneMessage = document.getElementById("milestoneMessage");
  const confettiContainer = document.getElementById("confettiContainer");
  const gameOverOverlay = document.getElementById("gameOverOverlay");
  const livesContainer = document.getElementById("livesContainer");
  const trophy = document.getElementById("trophy");

  const logoVariants = [
    {
      type: "glow",
      html: `<span class="logo-text glow-text">LYRECO</span>`,
    },
    {
      type: "rainbow",
      html: `<span class="logo-text rainbow-text">LYRECO</span>`,
    },
    {
      type: "neon",
      html: `<span class="logo-text neon-text">LYRECO</span>`,
    },
    {
      type: "glitch",
      html: `<span class="logo-text glitch-text" data-text="LYRECO">LYRECO</span>`,
    },
    {
      type: "cyber",
      html: `<span class="logo-text cyber-text">LYRECO</span>`,
    },
    {
      type: "shimmer",
      html: `<span class="logo-text shimmer-text">LYRECO</span>`,
    },
  ];

  if (localStorage.getItem("lyrecoBestScore")) {
    bestScore = parseInt(localStorage.getItem("lyrecoBestScore"), 10);
    bestScoreElement.textContent = bestScore;
  }

  function updateLivesDisplay() {
    livesContainer.innerHTML = "";
    for (let i = 0; i < lives; i++) {
      const lifeBubble = document.createElement("div");
      lifeBubble.className = "heart";
      livesContainer.appendChild(lifeBubble);
    }
  }

  function saveBestScore() {
    if (score > bestScore) {
      bestScore = score;
      bestScoreElement.textContent = bestScore;
      localStorage.setItem("lyrecoBestScore", bestScore);
      trophy.style.display = "block";

      if (bestScore >= 100) {
        bestScoreElement.classList.add("rainbow");
      }
    }
  }

  function updateStreakDisplay() {
    const streakCount = streakDisplay.querySelector(".streak-count");
    streakCount.textContent = currentStreak;

    if (currentStreak > 0) {
      streakDisplay.classList.add("active");

      if (currentStreak >= 50) {
        streakDisplay.classList.add("rainbow");
        scoreElement.classList.add("rainbow");
        streakDisplay.classList.remove("streak-20", "streak-10");
      } else if (currentStreak >= 20) {
        streakDisplay.classList.add("streak-20");
        streakDisplay.classList.remove("streak-10", "rainbow");
        scoreElement.classList.remove("rainbow");
      } else if (currentStreak >= 10) {
        streakDisplay.classList.add("streak-10");
        streakDisplay.classList.remove("streak-20", "rainbow");
        scoreElement.classList.remove("rainbow");
      } else {
        streakDisplay.classList.remove("streak-10", "streak-20", "rainbow");
        scoreElement.classList.remove("rainbow");
      }
    } else {
      streakDisplay.classList.remove(
        "active",
        "streak-10",
        "streak-20",
        "rainbow"
      );
      scoreElement.classList.remove("rainbow");
    }
  }

  function createParticles() {
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.width = Math.random() * 4 + 2 + "px";
      particle.style.height = particle.style.width;
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      particle.style.animationDelay = Math.random() * 4 + "s";
      particle.style.opacity = Math.random() * 0.5 + 0.2;
      gameArena.appendChild(particle);
    }
  }

  function createTrap() {
    if (!isPlaying) return;

    const trap = document.createElement("div");
    trap.className = "plastic-trap";
    trap.innerHTML = `
      <svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(255,255,255,0.4);stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:0.3" />
          </linearGradient>
        </defs>
        <path d="M10 20 C10 10, 50 10, 50 20 L55 70 C55 75, 5 75, 5 70 Z" fill="url(#bagGradient)" />
        <path d="M15 20 C15 15, 45 15, 45 20" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.5" />
        <path d="M20 5 C20 0, 40 0, 40 5 L45 20" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" />
        <path d="M20 30 Q30 35 40 30" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" />
        <path d="M15 40 Q30 50 45 40" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" />
        <path d="M10 50 Q30 60 50 50" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" />
      </svg>
    `;

    const bounds = gameArena.getBoundingClientRect();
    const maxX = bounds.width - 60;
    const maxY = bounds.height - 80;
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    trap.style.left = x + "px";
    trap.style.top = y + "px";
    trap.style.transform = `rotate(${Math.random() * 360}deg)`;

    trap.addEventListener("click", catchTrap);
    gameArena.appendChild(trap);

    setTimeout(() => {
      if (trap.parentNode && isPlaying) trap.remove();
    }, 10000);
  }

  startButton.addEventListener("click", () => {
    isPlaying = true;
    score = 0;
    logoSpeed = 3000;
    lives = 5;
    missedMoves = 0;
    currentStreak = 0;
    scoreElement.textContent = score;
    updateStreakDisplay();
    updateLivesDisplay();
    trophy.style.display = "none";
    gameOverOverlay.style.display = "none";

    [
      ...gameArena.querySelectorAll(
        ".particle,.bonus,.bubble-burst,.success-message,.garbage-fragment,.click-bubble,.plastic-trap"
      ),
    ].forEach((el) => el.remove());

    createParticles();
    createLogo();
    startLogoMovement();
    startBonusSpawn();
    startTrapSpawn();
    startButton.style.display = "none";
    pauseButton.style.display = "inline-block";
    playBackgroundSound();
  });

  function createLogo() {
    if (currentLogo) {
      currentLogo.removeEventListener("click", catchLogo);
      currentLogo.remove();
      missedMoves++;
      if (missedMoves >= 3) {
        lives--;
        currentStreak = 0;
        updateLivesDisplay();
        missedMoves = 0;
        if (lives <= 0) {
          endGame();
          return;
        }
      }
    }

    const logo = document.createElement("div");
    logo.className = "logo";

    const chosenVariant =
      logoVariants[Math.floor(Math.random() * logoVariants.length)];
    logo.innerHTML = chosenVariant.html;

    const bounds = gameArena.getBoundingClientRect();
    const maxX = bounds.width - 90;
    const maxY = bounds.height - 90;
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    logo.style.left = x + "px";
    logo.style.top = y + "px";
    logo.style.transform = `rotate(${Math.random() * 360}deg)`;

    logo.addEventListener("click", catchLogo);
    gameArena.appendChild(logo);
    currentLogo = logo;
  }

  function createBonus() {
    if (!isPlaying) return;
    const bonus = document.createElement("div");
    bonus.className = "bonus";
    bonus.textContent = "+20";
    const bounds = gameArena.getBoundingClientRect();
    const maxX = bounds.width - 50;
    const maxY = bounds.height - 50;
    let x, y;
    let colliding = true;

    while (colliding) {
      x = Math.random() * maxX;
      y = Math.random() * maxY;
      colliding = false;

      const traps = gameArena.querySelectorAll(".plastic-trap");
      for (let i = 0; i < traps.length; i++) {
        const trap = traps[i];
        const trapRect = trap.getBoundingClientRect();
        const bonusRect = {
          left: x,
          top: y,
          right: x + 50,
          bottom: y + 50,
        };

        if (
          bonusRect.left < trapRect.right &&
          bonusRect.right > trapRect.left &&
          bonusRect.top < trapRect.bottom &&
          bonusRect.bottom > trapRect.top
        ) {
          colliding = true;
          break;
        }
      }
    }

    bonus.style.left = x + "px";
    bonus.style.top = y + "px";

    bonus.addEventListener("click", catchBonus);
    gameArena.appendChild(bonus);

    setTimeout(() => {
      if (bonus.parentNode && isPlaying) bonus.remove();
    }, 10000);
  }

  function catchTrap(event) {
    const trap = event.currentTarget;
    lives--;
    currentStreak = 0;
    updateLivesDisplay();
    if (lives <= 0) {
      endGame();
      return;
    }

    const warning = document.createElement("div");
    warning.className = "success-message";
    warning.textContent = "Oh non, une prise de pollution !";
    warning.style.color = "#ff4444";
    warning.style.left = parseFloat(trap.style.left) + 20 + "px";
    warning.style.top = parseFloat(trap.style.top) - 20 + "px";
    gameArena.appendChild(warning);

    trap.remove();
    setTimeout(() => warning.remove(), 2000);

    if (score >= 150 && trapSpawnTimeMin > 10000) {
      trapSpawnTimeMin -= 5000;
      trapSpawnTimeMax -= 2500;
      startTrapSpawn();
    }
  }

  function catchBonus(event) {
    const bonusEl = event.currentTarget;
    playBonusSound();
    score += 20;
    scoreElement.textContent = score;
    saveBestScore();
    bonusEl.remove();

    const bonusMessage = document.createElement("div");
    bonusMessage.className = "success-message";
    bonusMessage.textContent = "+20 Bonus!";
    bonusMessage.style.left = bonusEl.style.left;
    bonusMessage.style.top = bonusEl.style.top;
    gameArena.appendChild(bonusMessage);
    setTimeout(() => bonusMessage.remove(), 2000);
  }

  function showStreakBonus(bonus) {
    const bonusMessage = document.createElement("div");
    bonusMessage.className =
      "success-message" + (currentStreak >= 50 ? " rainbow" : "");
    bonusMessage.textContent = `+${bonus} Streak Bonus!`;
    bonusMessage.style.left = "50%";
    bonusMessage.style.top = "50%";
    bonusMessage.style.transform = "translate(-50%, -50%)";
    gameArena.appendChild(bonusMessage);

    setTimeout(() => bonusMessage.remove(), 2000);
  }

  function startLogoMovement() {
    if (logoInterval) clearInterval(logoInterval);
    logoInterval = setInterval(() => {
      if (!isPlaying) return;
      createLogo();
    }, logoSpeed);
  }

  function startBonusSpawn() {
    if (bonusInterval) clearInterval(bonusInterval);
    bonusInterval = setInterval(() => {
      if (isPlaying) createBonus();
    }, bonusSpawnTime);
  }

  function startTrapSpawn() {
    if (trapInterval) clearInterval(trapInterval);
    trapInterval = setInterval(() => {
      if (isPlaying) createTrap();
    }, Math.floor(Math.random() * (trapSpawnTimeMax - trapSpawnTimeMin)) + trapSpawnTimeMin);
  }

  function checkMilestone(s) {
    if (s > bestScore && !newRecordShown) {
      const milestone = document.createElement("div");
      milestone.className = "milestone-text" + (s >= 100 ? " rainbow" : "");
      milestone.textContent = "Nouveau Record!";

      const pointsText = document.createElement("div");
      pointsText.className = "milestone-subtext";
      pointsText.textContent = `Vous avez sauvé ${s} litres d'eau de la pollution!`;

      milestoneMessage.innerHTML = "";
      milestoneMessage.appendChild(milestone);
      milestoneMessage.appendChild(pointsText);
      milestoneMessage.style.display = "block";
      milestoneMessage.classList.add("shown");

      setTimeout(() => {
        milestoneMessage.style.display = "none";
        milestoneMessage.classList.remove("shown");
      }, 3000);

      showMilestoneCelebration();
      newRecordShown = true;
    }
    if (s > bestScore) {
      bestScore = s;
      bestScoreElement.textContent = bestScore;
      bestScoreElement.classList.add("rainbow");
      localStorage.setItem("lyrecoBestScore", bestScore);
    }
  }

  function showMilestoneCelebration() {
    milestoneMessage.style.display = "block";
    milestoneMessage.querySelector(".milestone-text").className =
      "milestone-text" + (score >= 100 ? " rainbow" : "");

    setTimeout(() => {
      milestoneMessage.style.display = "none";
    }, 3000);

    for (let i = 0; i < 30; i++) {
      const conf = document.createElement("div");
      conf.className = "confetti";
      conf.style.left = 50 + Math.random() * 20 - 10 + "%";
      conf.style.top = 50 + Math.random() * 20 - 10 + "%";
      conf.style.background = `hsl(${Math.random() * 360},100%,50%)`;
      confettiContainer.appendChild(conf);
      setTimeout(() => conf.remove(), 2000);
    }
  }

  function catchLogo() {
    if (!isPlaying) return;
    score += 10;
    currentStreak++;
    scoreElement.textContent = score;
    updateStreakDisplay();

    if (score > bestScore && score > 0) {
      checkMilestone(score);
    }

    saveBestScore();
    missedMoves = 0;

    if (currentStreak % 5 === 0) {
      const bonus = Math.floor(currentStreak / 5) * 5;
      score += bonus;
      scoreElement.textContent = score;
      showStreakBonus(bonus);
    }

    const logoX = parseFloat(currentLogo.style.left);
    const logoY = parseFloat(currentLogo.style.top);

    playClickSound();

    const ripple = document.createElement("div");
    ripple.style.position = "absolute";
    ripple.style.left = logoX + "px";
    ripple.style.top = logoY + "px";
    ripple.style.width = "80px";
    ripple.style.height = "80px";
    ripple.style.border = "2px solid var(--accent)";
    ripple.style.borderRadius = "50%";
    ripple.style.animation = "ripple 0.8s ease-out forwards";
    gameArena.appendChild(ripple);

    for (let i = 0; i < 5; i++) {
      const bubble = document.createElement("div");
      bubble.className = "bubble-burst";
      bubble.style.left = logoX + 40 + "px";
      bubble.style.top = logoY + 40 + "px";
      bubble.style.transform = `translate(${(Math.random() - 0.5) * 50}px, ${
        (Math.random() - 0.5) * 50
      }px)`;
      bubble.style.animationDelay = Math.random() * 0.5 + "s";
      gameArena.appendChild(bubble);
      setTimeout(() => bubble.remove(), 1100);
    }

    const message = document.createElement("div");
    message.className =
      "success-message" + (currentStreak >= 50 ? " rainbow" : "");
    message.textContent = "+10 pour l'océan !";
    message.style.left = logoX + 50 + "px";
    message.style.top = logoY - 20 + "px";
    gameArena.appendChild(message);
    setTimeout(() => message.remove(), 2000);

    for (let i = 0; i < 10; i++) {
      const frag = document.createElement("div");
      frag.className = "garbage-fragment";
      frag.style.left = logoX + 40 + "px";
      frag.style.top = logoY + 40 + "px";
      frag.style.transform = `translate(${(Math.random() - 0.5) * 80}px, ${
        (Math.random() - 0.5) * 80
      }px)`;
      gameArena.appendChild(frag);
      setTimeout(() => frag.remove(), 1000);
    }

    currentLogo.style.animation = "logoClickOut 0.5s forwards";

    setTimeout(() => {
      ripple.remove();
      createLogo();
    }, 800);

    if (score < 100) {
      logoSpeed = 3000;
    } else if (score < 200) {
      logoSpeed = 2500;
    } else if (score < 300) {
      logoSpeed = 2000;
    } else {
      logoSpeed = 1500;
    }
    startLogoMovement();
  }

  function endGame() {
    isPlaying = false;
    clearInterval(logoInterval);
    clearInterval(bonusInterval);
    clearInterval(trapInterval);
    pauseBackgroundSound();

    if (currentLogo) currentLogo.remove();

    const bonuses = gameArena.querySelectorAll(".bonus");
    bonuses.forEach((b) => b.remove());

    const traps = gameArena.querySelectorAll(".plastic-trap");
    traps.forEach((t) => t.remove());

    currentStreak = 0;
    updateStreakDisplay();

    gameOverOverlay.style.display = "flex";
    gameOverOverlay.textContent = `Partie Terminée!\nScore: ${score}\nMeilleur Score: ${bestScore}`;

    setTimeout(() => {
      startButton.style.display = "inline-block";
      pauseButton.style.display = "none";
    }, 2000);
  }

  pauseButton.addEventListener("click", () => {
    isPlaying = false;
    clearInterval(logoInterval);
    clearInterval(bonusInterval);
    clearInterval(trapInterval);
    startButton.style.display = "inline-block";
    pauseButton.style.display = "none";
    pauseBackgroundSound();
  });
});
