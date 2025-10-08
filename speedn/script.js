// --- START OF FILE script.js ---

var isLoading = false;
var isReturningToInitialState = false;
let loaderInterval; // Переменная для хранения интервала анимации текста

const loaderOverlay = document.querySelector('.loader-overlay');
const resultModal = document.getElementById('resultModal');
const modalContent = document.querySelector('.modal-content');
const closeModalBtn = document.getElementById('modalCloseBtn'); 

// ... селекторы для модального окна ...
const winnerColumn = document.getElementById('winner-column');
const loserColumn = document.getElementById('loser-column');
const winnerStatus = document.getElementById('winner-status');
const winnerCarImg = document.getElementById('winner-car-img');
const winnerCarData = document.getElementById('winner-car-data');
const loserStatus = document.getElementById('loser-status');
const loserCarImg = document.getElementById('loser-car-img');
const loserCarData = document.getElementById('loser-car-data');

// Функция для генерации случайного хэш-ID
function generateHash() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 3) result += '-';
    }
    return result;
}

// Функция для анимации текста "взлома"
const loaderMessages = [
    "Анализ сервера 1win...",
    "Поиск уязвимостей...",
    "Обход firewall...",
    "Получение данных...",
    "Генерация сигнала..."
];

function animateLoaderText(messages) {
    let currentIndex = 0;
    const statusElement = document.getElementById('loader-status-text');
    
    // Очищаем предыдущий интервал, если он был
    if (loaderInterval) clearInterval(loaderInterval);

    // Устанавливаем первое сообщение сразу
    statusElement.textContent = messages[currentIndex];

    // Запускаем смену сообщений
    loaderInterval = setInterval(() => {
        currentIndex++;
        if (currentIndex < messages.length) {
            statusElement.textContent = messages[currentIndex];
        } else {
            clearInterval(loaderInterval); // Останавливаем, когда сообщения закончились
        }
    }, 2000); // Смена каждые 2 секунды (5 сообщений * 2с = 10с)
}

function generateRandomNumber() {
    if (isLoading || isReturningToInitialState) return;

    isLoading = true;

    // ЗАПУСК НОВЫХ ФУНКЦИЙ ЛОАДЕРА
    animateLoaderText(loaderMessages);
    document.getElementById('loader-hash').textContent = generateHash();

    loaderOverlay.style.display = 'flex';
    document.querySelector('.bar').style.width = '0%';
    
    setTimeout(() => {
        document.querySelector('.bar').style.width = '100%'; 
        setTimeout(showText, 10000); 

        setTimeout(() => {
            document.querySelector('.bar').style.width = '0%';
            isReturningToInitialState = true;
            isLoading = false; 
        }, 11000);

        setTimeout(() => { isReturningToInitialState = false; }, 22000);
    }, 100); 
}

function showText() {
    const coeffOrange = getRan(1.5, 3).toFixed(2);
    const coeffBlue = getRan(1.5, 3).toFixed(2);
    const chance = getRan(86, 97).toFixed(0);
    const isOrangeWinner = parseFloat(coeffOrange) > parseFloat(coeffBlue);

    const winnerCoeff = isOrangeWinner ? coeffOrange : coeffBlue;
    const loserCoeff = isOrangeWinner ? coeffBlue : coeffOrange;
    const winnerImg = isOrangeWinner ? 'images/car1.png' : 'images/car2.png';
    const loserImg = isOrangeWinner ? 'images/car2.png' : 'images/car1.png';

    winnerStatus.textContent = 'WIN';
    winnerStatus.className = 'car-status win';
    winnerCarImg.src = winnerImg;
    winnerCarData.innerHTML = `<p>Коэффициент: <strong>${winnerCoeff}X</strong></p><p>Шанс: <strong>${chance}%</strong></p>`;

    loserStatus.textContent = 'LOSE';
    loserStatus.className = 'car-status lose';
    loserCarImg.src = loserImg;
    loserCarData.innerHTML = `<p>Коэффициент: <strong>${loserCoeff}X</strong></p>`;

    loaderOverlay.style.display = 'none';
    resultModal.classList.add('visible');
    modalContent.classList.add('show');

    [winnerColumn, loserColumn].forEach(col => col.classList.remove('reveal'));
    setTimeout(() => winnerColumn.classList.add('reveal'), 300);
    setTimeout(() => loserColumn.classList.add('reveal'), 450);
}

// ... остальная часть JS без изменений ...
function getRan(min, max) { return Math.random() * (max - min) + min; }
function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function closeModal() { modalContent.classList.remove('show'); setTimeout(() => { resultModal.classList.remove('visible'); }, 400); }
closeModalBtn.onclick = closeModal;
window.onclick = function(event) { if (event.target == resultModal) { closeModal(); } }
let countdown; let timerRunning = false;
const timerDisplay = document.getElementById('timers');
const startButton = document.getElementById('startButton');
function saveTimerState(timeLeft) { localStorage.setItem('timeLeft', timeLeft); localStorage.setItem('timestamp', Date.now()); }
function clearTimerState() { localStorage.removeItem('timeLeft'); localStorage.removeItem('timestamp'); }
function startTimer(duration) {
  let timeLeft = duration;
  const timerWrapper = document.querySelector('.timer-wrapper');
  countdown = setInterval(function() {
    let minutes = parseInt(timeLeft / 60, 10);
    let seconds = parseInt(timeLeft % 60, 10);
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    timerDisplay.textContent = minutes + ":" + seconds;
    if (--timeLeft < 0) {
      clearInterval(countdown);
      timerWrapper.classList.remove('active');
      startButton.removeAttribute('disabled');
      timerRunning = false;
      clearTimerState();
    } else { saveTimerState(timeLeft); }
  }, 1000);
}
function restoreTimer() {
  let savedTimeLeft = localStorage.getItem('timeLeft');
  let savedTimestamp = localStorage.getItem('timestamp');
  const timerWrapper = document.querySelector('.timer-wrapper');
  if (savedTimeLeft && savedTimestamp) {
    let elapsedTime = Math.floor((Date.now() - savedTimestamp) / 1000);
    let timeLeft = savedTimeLeft - elapsedTime;
    if (timeLeft > 0) {
      startTimer(timeLeft);
      timerRunning = true;
      startButton.setAttribute('disabled', 'true'); 
      timerWrapper.classList.add('active');
    } else { clearTimerState(); }
  }
}
function initialize() {
  const timerWrapper = document.querySelector('.timer-wrapper');
  startButton.addEventListener('click', function() {
    generateRandomNumber();
    if (countdown) { clearInterval(countdown); timerRunning = false; clearTimerState(); }
    if (!timerRunning) {
      let duration = 600;
      startButton.setAttribute('disabled', 'true');
      timerWrapper.classList.remove('active');
      setTimeout(() => {
        startTimer(duration);
        timerWrapper.classList.add('active');
        timerRunning = true;
      }, 9100);
    }
  });
  restoreTimer();
}
initialize();