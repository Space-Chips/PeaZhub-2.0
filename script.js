// Data Storage (unchanged from previous)
let sessions = JSON.parse(localStorage.getItem('sessions')) || [];
let streaks = JSON.parse(localStorage.getItem('streaks')) || { current: 0, best: 0, lastDate: null };
let totalHours = JSON.parse(localStorage.getItem('totalHours')) || 0;

// Timer and Techniques (unchanged from previous)
const techniques = {
    classic: { work: 25 * 60, break: 5 * 60 }, // seconds
    eisenhower: { work: 50 * 60, break: 10 * 60 },
    '5217': { work: 52 * 60, break: 17 * 60 },
    '90min': { work: 90 * 60, break: 20 * 60 },
    timebox: { work: 60 * 60, break: 15 * 60 },
    '3hour': { work: 180 * 60, break: 30 * 60 }
};

let timer = 0;
let interval;
let isWork = true;
let currentTechnique = 'classic';

// Timer Functions (unchanged from previous)
function startTimer() {
    const techniqueSelect = document.getElementById('timer-technique');
    currentTechnique = techniqueSelect.value;
    const { work, break: breakTime } = techniques[currentTechnique];
    timer = isWork ? work : breakTime;
    updateTimerDisplay();
    interval = setInterval(() => {
        timer--;
        if (timer <= 0) {
            isWork = !isWork;
            timer = isWork ? work : breakTime;
            alert(isWork ? 'Work session complete! Take a break.' : 'Break over! Back to work.');
        }
        updateTimerDisplay();
    }, 1000);
    document.getElementById('grind-mode-toggle').disabled = true;
}

function stopTimer() {
    clearInterval(interval);
    if (timer < techniques[currentTechnique].work) {
        const secondsFocused = techniques[currentTechnique].work - timer;
        sessions.push({ technique: currentTechnique, seconds: secondsFocused, date: new Date() });
        totalHours += secondsFocused / 3600;
        updateStreaks();
    }
    timer = 0;
    isWork = true;
    updateTimerDisplay();
    saveAndRender();
    document.getElementById('grind-mode-toggle').disabled = false;
}

function updateTimerDisplay() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    document.getElementById('timer-display').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Streaks and Progress (unchanged from previous)
function updateStreaks() {
    const today = new Date().toDateString();
    if (streaks.lastDate === today) {
        streaks.current++;
    } else {
        streaks.current = 1;
    }
    streaks.best = Math.max(streaks.best, streaks.current);
    streaks.lastDate = today;
    saveAndRender();
}

const LEGENDARY_HOURS = 320; // Target for Legendary status

// Stats and Charts
function saveAndRender() {
    localStorage.setItem('sessions', JSON.stringify(sessions));
    localStorage.setItem('streaks', JSON.stringify(streaks));
    localStorage.setItem('totalHours', JSON.stringify(totalHours));

    document.getElementById('current-streak').textContent = `${streaks.current} days`;
    document.getElementById('best-streak').textContent = `${streaks.best} days`;
    const legendaryProgress = Math.min(100, (totalHours / LEGENDARY_HOURS) * 100);
    document.getElementById('legendary-progress').textContent = `${legendaryProgress.toFixed(1)}%`;
    document.getElementById('progress-fill').style.width = `${legendaryProgress}%`;

    updateStats();
}

function updateStats() {
    const totalSessions = sessions.length;
    const totalTimeHours = totalHours;
    const grindScore = Math.min(100, (totalSessions * 5 + totalTimeHours * 10 + streaks.current * 2).toFixed(0));
    document.getElementById('grind-score').textContent = `Grind Score: ${grindScore}%`;

    // Session Chart (Bar) - Total Sessions
    const sessionCtx = document.getElementById('session-chart').getContext('2d');
    new Chart(sessionCtx, {
        type: 'bar',
        data: {
            labels: ['Total Sessions'],
            datasets: [{
                data: [totalSessions],
                backgroundColor: '#00ffcc',
                borderColor: '#00ffcc',
                borderWidth: 2
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#e0e0ff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                y: { beginAtZero: true, ticks: { color: '#e0e0ff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
            },
            maintainAspectRatio: false
        }
    });

    // Time Chart (Pie) - Distribution by Technique
    const techniquesUsed = [...new Set(sessions.map(s => s.technique))];
    const timeData = techniquesUsed.map(tech => sessions.filter(s => s.technique === tech).reduce((sum, s) => sum + s.seconds, 0) / 3600);
    const timeCtx = document.getElementById('time-chart').getContext('2d');
    new Chart(timeCtx, {
        type: 'pie',
        data: {
            labels: techniquesUsed,
            datasets: [{
                data: timeData,
                backgroundColor: ['#ff66cc', '#00ffcc', '#6600ff', '#ff00ff', '#00ccff', '#ffcc00'],
                borderColor: '#000',
                borderWidth: 1
            }]
        },
        options: {
            plugins: { legend: { labels: { color: '#e0e0ff' } } },
            maintainAspectRatio: false
        }
    });

    // Streak Chart (Line) - Current and Best Streaks
    const streakCtx = document.getElementById('streak-chart').getContext('2d');
    new Chart(streakCtx, {
        type: 'line',
        data: {
            labels: Array.from({ length: streaks.best }, (_, i) => i + 1),
            datasets: [{
                label: 'Current Streak',
                data: Array(streaks.best).fill(streaks.current),
                borderColor: '#00ffcc',
                fill: false,
                tension: 0.1
            }, {
                label: 'Best Streak',
                data: Array(streaks.best).fill(streaks.best),
                borderColor: '#ff66cc',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            plugins: { legend: { labels: { color: '#e0e0ff' } } },
            scales: {
                x: { ticks: { color: '#e0e0ff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                y: { ticks: { color: '#e0e0ff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
            },
            maintainAspectRatio: false
        }
    });

    updateQuote(grindScore);
}

// Underwood Quotes (unchanged from previous)
const quotes = {
    high: "Power is won by those who don’t blink.",
    mid: "The grind is the only currency that matters.",
    low: "Weakness is a choice. Fix it."
};
function updateQuote(score) {
    const quoteEl = document.getElementById('underwood-quote');
    quoteEl.textContent = score > 75 ? quotes.high : score > 50 ? quotes.mid : quotes.low;
}

// Grind Mode (unchanged from previous)
document.getElementById('grind-mode-toggle').addEventListener('click', () => {
    const isGrindMode = document.getElementById('grind-mode-toggle').textContent === 'Grind Mode: Off';
    document.getElementById('grind-mode-toggle').textContent = `Grind Mode: ${isGrindMode ? 'On' : 'Off'}`;
    if (isGrindMode) {
        document.querySelectorAll('.card').forEach(card => card.style.display = 'none');
        document.getElementById('timer').style.display = 'block';
        startTimer();
    } else {
        stopTimer();
        document.querySelectorAll('.card').forEach(card => card.style.display = 'block');
    }
});

// Initial Render (unchanged from previous)
window.onload = saveAndRender;