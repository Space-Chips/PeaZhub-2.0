// Data Storage
let sessions = JSON.parse(localStorage.getItem('sessions')) || [];
let streaks = JSON.parse(localStorage.getItem('streaks')) || { current: 0, best: 0, lastDate: null };
let totalHours = JSON.parse(localStorage.getItem('totalHours')) || 0;
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Timer and Techniques
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
let targetSessions = 4;
let sessionsCompleted = 0;

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
            if (isWork) {
                sessionsCompleted++;
                sessions.push({ technique: currentTechnique, seconds: work, date: new Date() });
                totalHours += work / 3600;
                updateStreaks();
                updateSessionsCompleted();
            }
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
    updateStreakDisplay();
}

function updateStreakDisplay() {
    document.querySelector('.top-left-panel p:nth-child(1)').textContent = `🔥 Day Streak: ${streaks.current} days`;
    document.querySelector('.top-left-panel p:nth-child(3)').textContent = `⏱️ Focused: ${Math.floor(totalHours * 60)}m`;
}

const LEGENDARY_HOURS = 320; // Target for Legendary status

function saveAndRender() {
    localStorage.setItem('sessions', JSON.stringify(sessions));
    localStorage.setItem('streaks', JSON.stringify(streaks));
    localStorage.setItem('totalHours', JSON.stringify(totalHours));
    localStorage.setItem('tasks', JSON.stringify(tasks));

    document.querySelector('.top-left-panel p:nth-child(1)').textContent = `🔥 Day Streak: ${streaks.current} days`;
    document.querySelector('.top-left-panel p:nth-child(2)').textContent = `● Sessions: ${sessions.length}`;
    document.querySelector('.top-left-panel p:nth-child(3)').textContent = `⏱️ Focused: ${Math.floor(totalHours * 60)}m`;
    const legendaryProgress = Math.min(100, (totalHours / LEGENDARY_HOURS) * 100);
    document.querySelector('.progress-fill').style.width = `${legendaryProgress}%`;
    renderTasks();
    updateStats();
    updateSessionsCompleted();
}

function updateSessionsCompleted() {
    const completed = sessionsCompleted;
    const target = targetSessions;
    document.getElementById('sessions-completed').textContent = `${completed}/${target}`;
    const progress = (completed / target) * 100;
    document.querySelector('#timer-settings .progress-fill').style.width = `${progress}%`;
}

// Tasks
function addTask() {
    const taskInput = prompt('Enter task name:');
    if (taskInput) {
        tasks.push({ text: taskInput, completed: false, rating: 0 });
        saveAndRender();
    }
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveAndRender();
}

function rateTask(index, rating) {
    tasks[index].rating = rating;
    saveAndRender();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveAndRender();
}

function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
            <span>${task.text}</span>
            <div class="star-rating">${Array(5).fill().map((_, i) => `<span class="star${i < task.rating ? ' filled' : ''}" onclick="rateTask(${index}, ${i + 1})">★</span>`).join('')}</div>
            <span class="delete-task" onclick="deleteTask(${index})">❌</span>
        `;
        taskList.appendChild(li);
    });
}

document.querySelector('.add-task').addEventListener('click', addTask);

// Stats and Charts
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

// Underwood Quotes
const quotes = {
    high: "Power is won by those who don’t blink.",
    mid: "The grind is the only currency that matters.",
    low: "Weakness is a choice. Fix it."
};
function updateQuote(score) {
    const quoteEl = document.getElementById('underwood-quote');
    quoteEl.textContent = score > 75 ? quotes.high : score > 50 ? quotes.mid : quotes.low;
}

// Grind Mode (simplified for brevity, can be expanded)
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

// Initial Render
window.onload = saveAndRender;