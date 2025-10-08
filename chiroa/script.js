const chicken = document.getElementById('chicken');
const winPopup = document.getElementById('winPopup');
const multiplierValue = document.getElementById('multiplierValue');
const playButton = document.querySelector('.play-btn');
const jumpSound = document.getElementById('jumpSound');
const timerDisplay = document.getElementById('timerDisplay');
const loader = document.getElementById('loader');
const backButtonMain = document.querySelector('.back-btn-main');
const scrollContainer = document.querySelector('.scroll-container');
const gameArea = document.getElementById('gameArea');

const difficultySelector = document.querySelector('.difficulty-selector');
const selectedDisplay = document.querySelector('.difficulty-selected span');
const difficultyOptions = document.querySelectorAll('.difficulty-option');

const difficultyLevels = {
    "EASY": ["1.03","1.07","1.12","1.17","1.23","1.29","1.36","1.44","1.53","1.63","1.75","1.88","2.04","2.22","2.45","2.72","3.06","3.50","4.08","4.90","6.13","6.61","9.81","19.44"],
    "MEDIUM": ["1.12","1.28","1.47","1.70","1.98","2.33","2.76","3.32","4.03","4.96","6.20","6.91","8.90","11.74","15.99","22.61","33.58","53.20","92.17","182.51","451.71","1788.80"],
    "HARD": ["1.23","1.55","1.98","2.56","3.36","4.49","5.49","7.53","10.56","15.21","22.59","34.79","55.97","94.99","172.42","341.40","760.46","2007.63","6956.47","41321.43"],
    "DAREDEVIL": ["1.63","2.80","4.95","9.08","15.21","30.12","62.96","140.24","337.19","890.19","2643.89","9161.08","39301.05","233448.29","2542251.93"]
};

let multipliers = [];
let currentDifficulty = 'EASY'; 
let gameInProgress = false;
let canPlay = true;
let loaderTimeoutId = null;
let cooldownIntervalId = null;

/**
 * Generates the multiplier circles on the screen based on the selected difficulty.
 * @param {string} difficulty - The selected difficulty key (e.g., "EASY").
 */
function generateMultiplierCircles(difficulty) {
    gameArea.innerHTML = `<img src="images/chicken.webp" id="chicken" class="chicken" alt="Chicken">`;
    const coefficients = difficultyLevels[difficulty];
    
    coefficients.forEach(coeff => {
        const circle = document.createElement('div');
        circle.className = 'multiplier-circle';
        circle.textContent = `${coeff}x`;
        gameArea.appendChild(circle);
    });

    multipliers = document.querySelectorAll('.multiplier-circle');
    resetChickenToStartPosition(false);
}

/**
 * Resets the chicken to the first multiplier circle.
 * @param {boolean} animate - Whether to use smooth animation for the reset.
 */
function resetChickenToStartPosition(animate = false) {
    if (multipliers.length > 0) {
        const firstMultiplier = multipliers[0];
        const chickenEl = document.getElementById('chicken');
        const targetLeft = firstMultiplier.offsetLeft;

        chickenEl.style.transform = 'translateY(0) translateX(+5%)';

        if (animate) {
            chickenEl.style.left = targetLeft + "px";
        } else {
            const originalTransition = chickenEl.style.transition;
            chickenEl.style.transition = 'none';
            chickenEl.style.left = targetLeft + "px";
            chickenEl.offsetHeight; 
            chickenEl.style.transition = originalTransition;
        }

        scrollContainer.scrollTo({
            left: 0,
            behavior: animate ? 'smooth' : 'auto'
        });
    }
}

function startGame() {
  if (gameInProgress || !canPlay) {
    console.log("Wait for the 10-second cooldown or for the current game to finish.");
    return;
  }

  canPlay = false;
  difficultySelector.classList.remove('open'); // Ensure dropdown is closed

  playButton.style.display = 'none';
  backButtonMain.style.display = 'none';
  loader.style.display = 'flex';
  timerDisplay.textContent = "Loading...";

  if (loaderTimeoutId) clearTimeout(loaderTimeoutId);

  loaderTimeoutId = setTimeout(() => {
    loaderTimeoutId = null;
    loader.style.display = 'none';
    timerDisplay.textContent = "";

    gameInProgress = true;
    difficultySelector.style.pointerEvents = 'none'; // Disable selector during game

    playButton.disabled = true;
    playButton.style.opacity = "0.6";
    playButton.style.display = 'block';
    backButtonMain.style.display = 'block';

    if (cooldownIntervalId) clearInterval(cooldownIntervalId);

    let countdown = 10;
    timerDisplay.textContent = `Wait: ${countdown} sec`;
    cooldownIntervalId = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        timerDisplay.textContent = `Wait: ${countdown} sec`;
      } else {
        clearInterval(cooldownIntervalId);
        cooldownIntervalId = null;
        timerDisplay.textContent = "";
        canPlay = true;
        if (!gameInProgress) {
            playButton.disabled = false;
            playButton.style.opacity = "1";
            difficultySelector.style.pointerEvents = 'auto'; // Re-enable selector
            resetChickenToStartPosition(true);
        }
      }
    }, 1000);

    const chickenEl = document.getElementById('chicken');
    const activeMultipliers = difficultyLevels[currentDifficulty];
    const randomMultiplierIndex = Math.floor(Math.random() * activeMultipliers.length);
    const multiplierCircle = multipliers[randomMultiplierIndex];
    const multiplier = activeMultipliers[randomMultiplierIndex];

    chickenEl.style.left = multiplierCircle.offsetLeft + "px";
    chickenEl.style.transform = `translateY(-100px) translateX(+5%)`;
    jumpSound.play();

    setTimeout(() => {
      chickenEl.style.transform = `translateY(0) translateX(+5%)`;
      showWinPopup(multiplier);
    }, 500);

    scrollContainer.scrollTo({
      left: multiplierCircle.offsetLeft - (scrollContainer.offsetWidth / 2) + (multiplierCircle.offsetWidth / 2),
      behavior: 'smooth'
    });

  }, 2000);
}

/**
 * Shows the win popup with the resulting multiplier.
 * @param {string} multiplier - The winning multiplier value.
 */
function showWinPopup(multiplier) {
  const winSound = document.getElementById('winSound');
  multiplierValue.textContent = multiplier;
  
  winPopup.classList.add('shake');
  winPopup.style.display = 'block';

  winSound.currentTime = 0;
  winSound.play();

  setTimeout(() => {
    winPopup.style.display = 'none';
    winPopup.classList.remove('shake');
    gameInProgress = false;

    if (canPlay && !cooldownIntervalId) {
        playButton.disabled = false;
        playButton.style.opacity = "1";
        difficultySelector.style.pointerEvents = 'auto'; 
        resetChickenToStartPosition(true);
    }
  }, 3000);
}

function goBack() {
  window.location.href = 'https://kzshtr.github.io/myold';
}


document.addEventListener('DOMContentLoaded', () => {
    generateMultiplierCircles('EASY');
    
    difficultySelector.addEventListener('click', () => {
        if (!gameInProgress) {
            difficultySelector.classList.toggle('open');
        }
    });

    difficultyOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            currentDifficulty = event.target.dataset.value;
            selectedDisplay.textContent = event.target.textContent;
            generateMultiplierCircles(currentDifficulty);
        });
    });

    window.addEventListener('click', (event) => {
        if (!difficultySelector.contains(event.target)) {
            difficultySelector.classList.remove('open');
        }
    });
});