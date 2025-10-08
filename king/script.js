document.addEventListener("DOMContentLoaded", () => {
    // --- Получение элементов DOM ---
    const pageLoader = document.getElementById('page-load-loader');
    const gameStartLoader = document.getElementById('game-start-loader');
    const flyingObjectsContainer = document.getElementById('flying-objects-container');
    const gameWrapper = document.querySelector('.game-wrapper');
    const footerHashElement = document.getElementById('footer-hash');
    const playButton = document.getElementById('play-button');
    const skulls = document.querySelectorAll('.skull');
    const diamond = document.getElementById('diamond');
    const messageContainer = document.getElementById('message');

    // --- Логика при загрузке страницы ---
    function initPage() {
        generateAndSetHashId();
        createFlyingObjects();

        setTimeout(() => {
            // --->>> ДОБАВЛЯЕМ ЭТУ СТРОКУ, ЧТОБЫ ОСТАНОВИТЬ АНИМАЦИИ <<<---
            document.body.classList.add('animations-paused');

            // Скрываем лоадер и показываем игру
            pageLoader.style.display = 'none';
            gameWrapper.style.display = 'block';
            footerHashElement.style.display = 'block';
            
            setTimeout(() => {
                gameWrapper.style.opacity = '1';
                footerHashElement.style.opacity = '1';
            }, 50);

        }, 3500);
    }

    // --- Остальной код игры без изменений ---
    function generateAndSetHashId() {
        const chars = 'ABCDEF0123456789';
        let hash = '';
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) hash += '-';
            hash += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        footerHashElement.textContent = hash;
    }
    
    function createFlyingObjects() {
        const vw = window.innerWidth;
        for (let i = 0; i < 30; i++) {
            const obj = document.createElement('img');
            obj.src = '3.png';
            obj.classList.add('flying-object');
            obj.style.left = `${Math.random() * vw}px`;
            obj.style.top = '-150px';
            const randomDuration = 2 + Math.random() * 3; 
            const randomDelay = (Math.random() * 4) - 4;
            const startRotation = Math.random() * 360;
            const endRotation = startRotation + (Math.random() * 360 - 180);
            obj.style.setProperty('--start-rot', `${startRotation}deg`);
            obj.style.setProperty('--end-rot', `${endRotation}deg`);
            obj.style.animationDuration = `${randomDuration}s`;
            obj.style.animationDelay = `${randomDelay}s`;
            obj.style.width = `${20 + Math.random() * 40}px`;
            flyingObjectsContainer.appendChild(obj);
        }
    }

    playButton.addEventListener('click', () => {
        playButton.disabled = true;
        gameStartLoader.style.display = 'flex';
        setTimeout(() => {
            gameStartLoader.style.display = 'none';
            startGame();
        }, 2500);
    });

    function startGame() {
        diamond.style.display = 'none';
        messageContainer.innerHTML = '';
        skulls.forEach(img => { img.classList.remove('selected-skull'); img.style.transform = ''; });
        shuffleSkulls();
    }
    function shuffleSkulls() {
        let intervals = 300; let totalDuration = 3000; let steps = totalDuration / intervals;
        function shuffleStep(currentStep) {
            let positions = [0, 1, 2]; positions.sort(() => Math.random() - 0.5);
            skulls.forEach((skull, index) => {
                let horizontalMove = positions[index] - index;
                let verticalMove = Math.random() > 0.5 ? 15 : -15;
                skull.style.transform = `translate(${horizontalMove * 105}px, ${verticalMove}px)`;
            });
            if (currentStep < steps) { setTimeout(() => shuffleStep(currentStep + 1), intervals); } else {
                setTimeout(() => {
                    skulls.forEach(skull => { skull.style.transition = 'transform 0.5s cubic-bezier(0.32, 0.64, 0.45, 1)'; skull.style.transform = ''; });
                    setTimeout(displayRandomMessage, 500);
                }, intervals);
            }
        }
        shuffleStep(1);
    }
    function displayRandomMessage() {
        const messages = ["RIGHT", "CENTER", "LEFT"]; const skullIds = ["skull3", "skull2", "skull1"]; const randomIndex = Math.floor(Math.random() * messages.length);
        messageContainer.innerHTML = `<span class="glass-message">${messages[randomIndex]}</span>`;
        const selectedSkull = document.getElementById(skullIds[randomIndex]);
        selectedSkull.classList.add('selected-skull'); selectedSkull.style.transform = 'translateY(-23px)';
        diamond.style.display = 'block';
        const skullRect = selectedSkull.getBoundingClientRect(); const containerRect = document.querySelector('.container').getBoundingClientRect();
        const diamondLeft = skullRect.left - containerRect.left + (selectedSkull.offsetWidth - diamond.offsetWidth) / 2;
        const diamondTop = skullRect.bottom - containerRect.top - diamond.offsetHeight + 45;
        diamond.style.left = `${diamondLeft}px`; diamond.style.top = `${diamondTop}px`;
        playButton.disabled = false;
    }
    document.addEventListener("click", function (event) {
        if (event.target.matches("button[data-link]")) { window.location.href = "https://kzshtr.github.io/myold/"; }
    });

    // --- Запускаем все при загрузке ---
    initPage();

    // === ИНТЕГРИРОВАННАЯ ЛОГИКА TELEGRAM-УВЕДОМЛЕНИЯ ===
    // --- Настройка контента ---
    /*const telegramUsername = '@TRIPX_BOT';
    const usernameElement = document.getElementById('notification-username');
    if (usernameElement) {
        usernameElement.textContent = telegramUsername;
    }
    
    // --- Логика для управления уведомлением ---
    const notificationContainer = document.getElementById('notification-container');
    let notificationTimeout;

    function showTelegramNotification() {
        if (!notificationContainer || notificationContainer.classList.contains('show')) return;
        clearTimeout(notificationTimeout);
        notificationContainer.classList.remove('hide');
        notificationContainer.classList.add('show');
        notificationTimeout = setTimeout(() => {
            notificationContainer.classList.remove('show');
            notificationContainer.classList.add('hide');
        }, 5000);
    }*/

    // --- Автоматические триггеры ---
    // Показать через 2 секунды после загрузки
    setTimeout(showTelegramNotification, 2000);
    // Показывать каждые 30 секунд
    setInterval(showTelegramNotification, 30000);

});