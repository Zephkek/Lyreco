let backgroundAudio = new Audio("sound/background.mp3");
backgroundAudio.loop = true;
backgroundAudio.volume = 0.3;

let clickSound = new Audio("sound/click.wav");
clickSound.volume = 0.5;

let bonusSound = new Audio("sound/bonus.wav");
bonusSound.volume = 0.7;

function playBackgroundSound() {
  backgroundAudio.play();
}

function pauseBackgroundSound() {
  backgroundAudio.pause();
}

function playClickSound() {
  clickSound.currentTime = 0;
  clickSound.play();
}

function playBonusSound() {
  bonusSound.currentTime = 0;
  bonusSound.play();
}
