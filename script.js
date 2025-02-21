// Data Storage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let timeLogs = JSON.parse(localStorage.getItem('timeLogs')) || [];
let habits = JSON.parse(localStorage.getItem('habits')) || [];

// Tasks
function addTask() {
    const input = document.getElementById('task-input');
    const priority = document.getElementById('priority').value;
    if (input.value) {
        tasks.push({ text: input.value, priority, completed: false, created: new Date(), completedAt: null });
        input.value = '';
        saveAndRender();
    }
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    tasks[index].completedAt = tasks[index].completed ? new Date() : null;
    saveAndRender();
}

// Timer
let timer = 0;
let interval;
let currentCategory = '';
function startTimer() {
    currentCategory = document.getElementById('timer-category').value || 'Uncategorized';
    interval = setInterval(() => {
        timer++;
        document.getElementById('timer-display').textContent = new Date(timer * 1000).toISOString().substr(11, 8);
    }, 1000);
}
function stopTimer() {
    clearInterval(interval);
    if (timer > 0) {
        timeLogs.push({ category: currentCategory, seconds: timer, date: new Date() });
        timer = 0;
        saveAndRender();
    }
}

// Habits (simplified for brevity)
function addHabit() {
    const input = document.getElementById('habit-input');
    if (input.value) {
        habits.push({ text: input.value, streak: 0, lastCompleted: null });
        input.value = '';
        saveAndRender();
    }
}

// Stats and Charts
function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('timeLogs', JSON.stringify(timeLogs));
    localStorage.setItem('habits', JSON.stringify(habits));

    renderTasks();
    renderHabits();
    updateStats();
}

function updateStats() {
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTime = timeLogs.reduce((sum, log) => sum + log.seconds, 0) / 3600; // hours
    const habitSuccess = habits.reduce((sum, h) => sum + (h.streak > 0 ? 1 : 0), 0) / habits.length * 100 || 0;
    const grindScore = Math.min(100, (completedTasks * 5 + totalTime * 10 + habitSuccess / 2).toFixed(0));
    document.getElementById('grind-score').textContent = `Grind Score: ${grindScore}%`;

    // Task Chart (Bar)
    const taskCtx = document.getElementById('task-chart').getContext('2d');
    new Chart(taskCtx, {
        type: 'bar',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{ data: [completedTasks, tasks.length - completedTasks], backgroundColor: ['#00ccff', '#ff007f'] }]
        },
        options: { plugins: { legend: { display: false } } }
    });

    // Time Chart (Pie)
    const timeCategories = [...new Set(timeLogs.map(log => log.category))];
    const timeData = timeCategories.map(cat => timeLogs.filter(log => log.category === cat).reduce((sum, log) => sum + log.seconds, 0) / 3600);
    const timeCtx = document.getElementById('time-chart').getContext('2d');
    new Chart(timeCtx, {
        type: 'pie',
        data: {
            labels: timeCategories,
            datasets: [{ data: timeData, backgroundColor: ['#00ccff', '#ff007f', '#ff66cc', '#66ffcc'] }]
        }
    });

    // Habit Chart (Line)
    const habitCtx = document.getElementById('habit-chart').getContext('2d');
    new Chart(habitCtx, {
        type: 'line',
        data: {
            labels: habits.map(h => h.text.slice(0, 5)),
            datasets: [{ data: habits.map(h => h.streak), borderColor: '#00ccff', fill: false }]
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

// Initial Render
window.onload = saveAndRender;