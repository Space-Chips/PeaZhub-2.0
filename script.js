// Task Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
function addTask() {
    const input = document.getElementById('task-input');
    if (input.value) {
        tasks.push({ text: input.value, completed: false, timestamp: new Date() });
        input.value = '';
        saveAndRender();
    }
}

function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})"> ${task.text}`;
        taskList.appendChild(li);
    });
    updateStats();
}

// Timer
let timer = 0;
let interval;
function startTimer() {
    interval = setInterval(() => {
        timer++;
        document.getElementById('timer-display').textContent = new Date(timer * 1000).toISOString().substr(11, 8);
    }, 1000);
}
function stopTimer() {
    clearInterval(interval);
    updateStats();
}

// Habits (similar to tasks, omitted for brevity)

// Underwood Quotes
const quotes = [
    "The road to power is paved with hypocrisy and casualties. Keep grinding.",
    "Success is not a gift. It’s a lease. Payment’s due every day.",
    "You don’t win by hoping. You win by doing."
];
function updateQuote() {
    const quoteEl = document.getElementById('underwood-quote');
    quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

// Stats (using Chart.js for retro bar graphs)
function updateStats() {
    const completedTasks = tasks.filter(t => t.completed).length;
    const grindScore = Math.min(100, (completedTasks * 10 + timer / 60).toFixed(0));
    document.getElementById('grind-score').textContent = `Grind Score: ${grindScore}%`;
    updateQuote();
}

window.onload = saveAndRender;