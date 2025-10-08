document.addEventListener('DOMContentLoaded', () => {

    const getSignalBtn = document.getElementById('getSignalBtn');
    const signalTextElement = document.getElementById('signalText');
    
    let isGenerating = false;
    let cooldownInterval;

    function startCooldownTimer(duration) {
        let timeLeft = Math.ceil(duration / 1000);

        getSignalBtn.textContent = `Wait ${timeLeft}s`;

        cooldownInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) {
                getSignalBtn.textContent = `Wait ${timeLeft}s`;
            } else {
                clearInterval(cooldownInterval);
                signalTextElement.textContent = 'Waiting...';
                getSignalBtn.textContent = 'Get Signal';
                getSignalBtn.disabled = false;
                isGenerating = false;
            }
        }, 1000);
    }

    function generateSignal() {
        if (isGenerating) {
            return;
        }

        isGenerating = true;
        getSignalBtn.disabled = true;
        getSignalBtn.textContent = 'Analysis...';
        signalTextElement.textContent = 'Waiting...';

        const analysisDelay = Math.random() * 2000 + 2000;

        setTimeout(() => {
            const randomMultiplier = (Math.random() * (5.0 - 1.1) + 1.1).toFixed(2);
            const displayText = `${randomMultiplier}x`;
            signalTextElement.textContent = displayText;

            const cooldownTime = 10000;
            startCooldownTimer(cooldownTime);

        }, analysisDelay);
    }

    if (getSignalBtn) {
        getSignalBtn.addEventListener('click', generateSignal);
    } else {
        console.error("Кнопка с ID 'getSignalBtn' не найдена.");
    }
});