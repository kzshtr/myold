document.addEventListener('DOMContentLoaded', () => {
    const kangaroo = document.getElementById('kangaroo');
    const platformContainer = document.getElementById('platform-container');
    const playButton = document.getElementById('start-game-button');
    const starsContainer = document.querySelector('.stars-container');

    // --- NEW: Sound Effects ---
    // Create these audio files (e.g., jump.mp3, win.mp3) and place them in your project folder.
    const jumpSound = new Audio('jump.mp3');
    const winSound = new Audio('win.mp3');
    // --- End of Sound Effects ---

    // Preloading images
    const kenguImg = new Image();
    kenguImg.src = 'kengu.png';
    const kenguzerkImg = new Image();
    kenguzerkImg.src = 'kenguzerk.png';

    kenguzerkImg.onload = () => console.log('✅ kenguzerk.png found and preloaded');
    kenguzerkImg.onerror = () => console.error('❌ kenguzerk.png NOT FOUND - fix the file path!');
    kenguImg.onload = () => console.log('✅ kengu.png found and preloaded');
    kenguImg.onerror = () => console.error('❌ kengu.png NOT FOUND - fix the file path!');

    // Flag for the 20-100x jump mode
    let highMultiplierMode = false;
    
    // Create an invisible button for the 20-100x jump mode
    const secretButton = document.createElement('div');
    secretButton.style.position = 'fixed';
    secretButton.style.left = '20px';
    secretButton.style.bottom = '20px';
    secretButton.style.width = '80px';
    secretButton.style.height = '80px';
    secretButton.style.zIndex = '100';
    secretButton.style.cursor = 'pointer';
    secretButton.style.opacity = '0'; // Make the button invisible
    document.body.appendChild(secretButton);
    
    secretButton.addEventListener('click', () => {
        highMultiplierMode = !highMultiplierMode;
        if (highMultiplierMode) {
            alert('High-multiplier mode (20-100x) enabled!');
            console.log('High-multiplier mode enabled.');
        } else {
            alert('High-multiplier mode disabled.');
            console.log('High-multiplier mode disabled.');
        }
    });
    
    // --- NEW: Create a beautiful win modal ---
    const modal = document.createElement('div');
    modal.className = 'win-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'win-modal-content';

    const modalIcon = document.createElement('div');
    modalIcon.className = 'win-modal-icon';
    modalIcon.textContent = '★'; // Star icon

    const modalTitle = document.createElement('h2');
    modalTitle.className = 'win-modal-title';
    modalTitle.textContent = 'YOU WON!';

    const modalMultiplier = document.createElement('p');
    modalMultiplier.className = 'win-modal-multiplier';

    const okButton = document.createElement('button');
    okButton.className = 'win-modal-button';
    okButton.textContent = 'AWESOME!';
    
    okButton.addEventListener('click', () => {
        hideModal();
        returnToStart();
    });

    modalContent.appendChild(modalIcon);
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(modalMultiplier);
    modalContent.appendChild(okButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    // --- End of New Modal ---

    function showModal(coefficient) {
        winSound.play(); // Play win sound
        modalMultiplier.textContent = `${coefficient}x`;
        modal.style.display = 'flex';
        
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.pointerEvents = 'auto';
            modalContent.style.transform = 'scale(1)';
        }, 10);
    }

    function hideModal() {
        modal.style.opacity = '0';
        modalContent.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.pointerEvents = 'none';
        }, 300);
    }
    
    const isMobile = window.innerWidth < 768;
    
    function getAdaptedPositions() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const positions = [];
        const coefficients = [1.1, 1.2, 1.5, 2, 3, 5, 10, 20, 50, 100];
        
        const getPlatformType = (coef) => {
            if (coef <= 2) return 'plitka1.png';
            if (coef <= 10) return 'plitka2.png';
            return 'plitka3.png';
        };

        const radius = screenHeight * Math.min(0.45, ((screenWidth - screenWidth * 0.05 - 200) / screenWidth) * 0.6);
        const maxCosAngle = Math.cos(-0.5 * Math.PI * 0.8);
        const centerX = Math.min(screenWidth * 0.12, (screenWidth - screenWidth * 0.05 - 200) - radius * maxCosAngle);
        const centerY = screenHeight * 0.5;
        const maxScale = isMobile ? 1.1 : 1.3;
        const minScale = isMobile ? 0.5 : 0.65;
        
        for (let i = 0; i < coefficients.length; i++) {
            const progress = i / (coefficients.length - 1);
            let tAdjusted = 0.15 + Math.pow(progress, 0.9) * 0.8;

            if(i === 0) tAdjusted = 0.15;
            else if (i === 1) tAdjusted = 0.32;
            else {
                const p = (i - 1) / (coefficients.length - 2);
                tAdjusted = 0.32 + Math.pow(p, 0.9) * 0.65;
            }

            const angle = (tAdjusted - 0.5) * Math.PI * 0.8;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const scale = minScale + (1 - Math.abs(tAdjusted - 0.5) * 1.8) * (maxScale - minScale);
            
            positions.push({
                id: `p-${coefficients[i]}`,
                coefficient: coefficients[i],
                plitka: getPlatformType(coefficients[i]),
                position: { bottom: y, left: x },
                scale: scale
            });
        }
        return positions;
    }
    
    let platformData = getAdaptedPositions();
    let currentPosition = { x: isMobile ? 80 : 120, y: 80 };
    let isJumping = false;
    let visiblePlatforms = [];
    let usedPlatforms = [];
    
    function createPlatforms() {
        platformContainer.innerHTML = '';
        visiblePlatforms = [];
        usedPlatforms = [];
        
        platformData.forEach((data, index) => {
            const platform = document.createElement('div');
            platform.className = 'platform';
            platform.id = data.id;
            platform.dataset.coefficient = data.coefficient;
            platform.dataset.index = index;
            
            platform.style.bottom = `${data.position.bottom}px`;
            platform.style.left = `${data.position.left}px`;
            platform.style.transform = `scale(${data.scale || (1 - (index * 0.03))})`;
            
            const img = document.createElement('img');
            img.src = data.plitka;
            img.className = 'platform-image';
            
            const coefficient = document.createElement('div');
            coefficient.className = 'coefficient';
            const coefImg = document.createElement('img');
            coefImg.src = `${data.coefficient}.png`;
            coefImg.onerror = function() {
                this.remove();
                coefficient.textContent = data.coefficient;
            };
            coefficient.appendChild(coefImg);
            
            platform.appendChild(img);
            platform.appendChild(coefficient);
            platformContainer.appendChild(platform);
            visiblePlatforms.push(platform);
        });
    }

    function jumpTo(platform) {
        if (isJumping || usedPlatforms.includes(platform)) return;
        
        isJumping = true;
        jumpSound.play(); // Play jump sound

        const isPlatformWithCoef3 = platform.dataset.coefficient === '3';
        if (isPlatformWithCoef3) {
            kangaroo.style.backgroundImage = "url('kenguzerk.png')";
        }

        const platformRect = platform.getBoundingClientRect();
        const kangarooRect = kangaroo.getBoundingClientRect();
        let jumpX = platformRect.left + (platformRect.width / 2) - (kangarooRect.width / 2);
        jumpX = Math.max(10, Math.min(jumpX, window.innerWidth - kangarooRect.width - 10));
        const jumpY = platformRect.top - (kangarooRect.height * 0.8);

        kangaroo.style.transition = 'all 0.5s ease-out';
        kangaroo.style.left = `${jumpX}px`;
        kangaroo.style.bottom = `${window.innerHeight - jumpY - kangarooRect.height}px`;

        currentPosition = { x: jumpX, y: window.innerHeight - jumpY - kangarooRect.height };
        usedPlatforms.push(platform);
        platform.style.opacity = '0.5';

        setTimeout(() => {
            kangaroo.classList.add('jump-end');
            setTimeout(() => {
                platform.style.opacity = '0';
                setTimeout(() => {
                    platform.style.display = 'none';
                }, 500);
                
                kangaroo.classList.remove('jump-end');
                isJumping = false;
                
                const coefficient = platform.dataset.coefficient;
                showModal(coefficient);
                
                setTimeout(() => {
                    if (modal.style.display !== 'none') {
                        hideModal();
                        returnToStart();
                    }
                }, 4000); // Auto-return after 4 seconds if modal is still open
            }, 300);
        }, 500);
    }
    
    function startGame() {
        if (isJumping) return;

        if (highMultiplierMode) {
            const highPlatforms = visiblePlatforms.filter(p => {
                const coef = parseFloat(p.dataset.coefficient);
                return coef >= 20 && coef <= 100 && !usedPlatforms.includes(p);
            });
            if (highPlatforms.length === 0) {
                console.log('No available high-multiplier platforms.');
                resetGame();
                return;
            }
            const selectedPlatform = highPlatforms[Math.floor(Math.random() * highPlatforms.length)];
            jumpTo(selectedPlatform);
            return;
        }

        const randomValue = Math.random();
        let targetCoefficient;
        if (randomValue < 0.3) targetCoefficient = 2;
        else if (randomValue < 0.6) targetCoefficient = 3;
        else if (randomValue < 0.8) targetCoefficient = 5;
        else targetCoefficient = 10;
        
        console.log(`🎯 SELECTED MULTIPLIER: ${targetCoefficient}x`);
        
        const targetPlatform = visiblePlatforms.find(p => 
            parseFloat(p.dataset.coefficient) === targetCoefficient && !usedPlatforms.includes(p)
        );
        
        if (targetPlatform) {
            jumpTo(targetPlatform);
        } else {
            console.error(`Platform with coefficient ${targetCoefficient} not found or already used. Trying another.`);
            // Fallback to any available platform from the list if the chosen one is gone
            const available = visiblePlatforms.filter(p => [2,3,5,10].includes(parseFloat(p.dataset.coefficient)) && !usedPlatforms.includes(p));
            if(available.length > 0) {
                jumpTo(available[Math.floor(Math.random() * available.length)]);
            } else {
                resetGame(); // Reset if no valid platforms are left
            }
        }
    }
    
    function resetKangaroo() {
        kangaroo.style.transition = 'none';
        kangaroo.style.left = `${currentPosition.x}px`;
        kangaroo.style.bottom = `${currentPosition.y}px`;
    }
    
    function resetGame() {
        currentPosition = { x: isMobile ? 80 : 120, y: 80 };
        kangaroo.style.backgroundImage = "url('kengu.png')";
        createPlatforms();
        resetKangaroo();
        console.log("Game reset!");
    }
    
    playButton.addEventListener('click', () => {
        if (usedPlatforms.length === visiblePlatforms.length) {
            resetGame();
            setTimeout(startGame, 100);
        } else {
            startGame();
        }
    });

    window.addEventListener('resize', () => {
        platformData = getAdaptedPositions();
        createPlatforms();
        resetKangaroo();
        createStars(); // Regenerate stars for new screen size
    });

    function returnToStart() {
        kangaroo.style.backgroundImage = "url('kengu.png')";
        const startPosition = { x: isMobile ? 80 : 120, y: 80 };
        kangaroo.style.transition = 'all 0.5s ease-out';
        kangaroo.style.left = `${startPosition.x}px`;
        kangaroo.style.bottom = `${startPosition.y}px`;
        currentPosition = startPosition;
        
        setTimeout(() => {
            usedPlatforms = [];
            visiblePlatforms.forEach(platform => {
                platform.style.opacity = '1';
                platform.style.display = 'block';
            });
        }, 500);
    }

    // --- NEW: Function to create animated stars ---
    function createStars() {
        starsContainer.innerHTML = ''; // Clear existing stars
        const starCount = 100; // Number of stars
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 3 + 1; // Star size between 1px and 4px
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.left = `${Math.random() * 100}%`;
            // Randomize animation delay and duration for a natural look
            star.style.animationDelay = `${Math.random() * 2}s`;
            star.style.animationDuration = `${Math.random() * 1 + 1.5}s`; // Duration between 1.5s and 2.5s
            starsContainer.appendChild(star);
        }
    }
    // --- End of Stars function ---

    // Initial setup
    createPlatforms();
    createStars();
    kangaroo.style.backgroundImage = "url('kengu.png')";
});