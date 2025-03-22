import { db, collection, addDoc, query, orderBy, limit, getDocs } from './firebase-config.js';

// Game settings
const settings = {
    language: 'en',
    difficulty: 'easy'
};

// Language translations
const translations = {
    en: {
        startGame: 'Start Game',
        time: 'Time',
        progress: 'Progress',
        checkAnswer: 'Check Answer',
        wrong: 'Wrong! Try again!',
        gameComplete: 'Well done! Your time: ',
        newHighScore: 'New High Score!',
        enterName: 'Enter your name',
        submit: 'Submit',
        inputPlaceholder: 'Your answer',
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
        rank: 'Rank',
        name: 'Name',
        time: 'Time',
        difficulty: 'Difficulty',
        easyMode: 'Easy Mode',
        mediumMode: 'Medium Mode',
        hardMode: 'Hard Mode'
    },
    zh: {
        startGame: '开始游戏',
        time: '时间',
        progress: '进度',
        checkAnswer: '检查答案',
        wrong: '错误！再试一次！',
        gameComplete: '做得好！你的时间：',
        newHighScore: '新纪录！',
        enterName: '请输入你的名字',
        submit: '提交',
        inputPlaceholder: '你的答案',
        easy: '简单',
        medium: '中等',
        hard: '困难',
        rank: '排名',
        name: '姓名',
        time: '时间',
        difficulty: '难度',
        easyMode: '简单模式',
        mediumMode: '中等模式',
        hardMode: '困难模式'
    }
};

// Difficulty settings
const difficulties = {
    easy: {
        addition: { min: 1, max: 20 },
        subtraction: { min: 1, max: 20 },
        multiplication: { min: 1, max: 10 }
    },
    medium: {
        addition: { min: 10, max: 50 },
        subtraction: { min: 10, max: 50 },
        multiplication: { min: 2, max: 12 }
    },
    hard: {
        addition: { min: 20, max: 100 },
        subtraction: { min: 20, max: 100 },
        multiplication: { min: 5, max: 15 }
    }
};

// Get DOM elements
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const nameInputDialog = document.getElementById('nameInputDialog');
const num1Element = document.getElementById('num1');
const num2Element = document.getElementById('num2');
const operatorElement = document.getElementById('operator');
const answerInput = document.getElementById('answer');
const checkButton = document.getElementById('check');
const timerElement = document.getElementById('timer');
const progressElement = document.getElementById('progress');
const highScoresTable = document.getElementById('highScoresTable');
const startButton = document.getElementById('startGame');
const playerNameInput = document.getElementById('playerName');
const submitNameButton = document.getElementById('submitName');

// Game variables
let correctAnswers = 0;
let currentAnswer = 0;
let startTime = 0;
let timerInterval;
let finalTime = 0;

// High scores handling
async function getHighScores() {
    try {
        const scoresRef = collection(db, `highScores_${settings.difficulty}`);
        const q = query(scoresRef, orderBy('time', 'asc'), limit(10));
        const querySnapshot = await getDocs(q);
        
        const scores = [];
        querySnapshot.forEach((doc) => {
            scores.push(doc.data());
        });
        return scores;
    } catch (error) {
        console.error('Error getting high scores:', error);
        return [];
    }
}

async function saveHighScore(name, time, difficulty) {
    try {
        const scoresRef = collection(db, `highScores_${difficulty}`);
        await addDoc(scoresRef, {
            name: name,
            time: time,
            timestamp: new Date().toISOString()
        });
        
        // Update display
        await updateHighScoresTable();
    } catch (error) {
        console.error('Error saving high score:', error);
        alert('Failed to save high score. Please try again.');
    }
}

async function updateHighScoresTable() {
    const highScores = await getHighScores();
    const tbody = highScoresTable.querySelector('tbody');
    const thead = highScoresTable.querySelector('thead tr');
    tbody.innerHTML = '';
    
    // Update table header to show current difficulty
    const difficultyText = translations[settings.language][`${settings.difficulty}Mode`];
    thead.querySelector('th[data-en="Time"]').textContent = `${translations[settings.language].time} (${difficultyText})`;
    
    highScores.forEach((score, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.name}</td>
            <td>${formatTime(score.time)}</td>
            <td>${translations[settings.language][settings.difficulty]}</td>
        `;
        tbody.appendChild(row);
    });
}

// Format time from milliseconds to MM:SS
function formatTime(ms) {
    if (!ms) return '--:--';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update timer display
function updateTimer() {
    const currentTime = Date.now() - startTime;
    timerElement.textContent = formatTime(currentTime);
}

// Update text based on selected language
function updateTexts() {
    document.querySelectorAll('[data-en]').forEach(element => {
        const key = element.dataset.en;
        if (translations[settings.language][key]) {
            element.textContent = translations[settings.language][key];
        }
    });
    
    answerInput.placeholder = translations[settings.language].inputPlaceholder;
    updateHighScoresTable();
}

// Generate random number between min and max
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate new problem
function generateProblem() {
    const operators = ['+', '-', '×'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const diff = difficulties[settings.difficulty];
    
    let num1, num2;
    
    switch(operator) {
        case '+':
            num1 = getRandomNumber(diff.addition.min, diff.addition.max);
            num2 = getRandomNumber(diff.addition.min, diff.addition.max);
            currentAnswer = num1 + num2;
            break;
        case '-':
            num1 = getRandomNumber(diff.subtraction.min, diff.subtraction.max);
            num2 = getRandomNumber(diff.subtraction.min, num1);
            currentAnswer = num1 - num2;
            break;
        case '×':
            num1 = getRandomNumber(diff.multiplication.min, diff.multiplication.max);
            num2 = getRandomNumber(diff.multiplication.min, diff.multiplication.max);
            currentAnswer = num1 * num2;
            break;
    }
    
    num1Element.textContent = num1;
    num2Element.textContent = num2;
    operatorElement.textContent = operator;
    answerInput.value = '';
    answerInput.focus();
}

// Check answer
function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    
    if (userAnswer === currentAnswer) {
        correctAnswers++;
        progressElement.textContent = correctAnswers;
        
        if (correctAnswers === 10) {
            finalTime = Date.now() - startTime;
            clearInterval(timerInterval);
            
            // Show name input dialog for all completions
            nameInputDialog.classList.remove('hidden');
            nameInputDialog.style.display = 'flex';
            playerNameInput.focus();
        } else {
            generateProblem();
        }
    } else {
        alert(translations[settings.language].wrong);
    }
}

// Handle name submission
async function handleNameSubmit() {
    const name = playerNameInput.value.trim();
    if (name) {
        await saveHighScore(name, finalTime, settings.difficulty);
        nameInputDialog.classList.add('hidden');
        nameInputDialog.style.display = 'none';
        resetGame();
    }
}

// Reset game
function resetGame() {
    correctAnswers = 0;
    progressElement.textContent = correctAnswers;
    clearInterval(timerInterval);
    timerElement.textContent = '00:00';
    startScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    nameInputDialog.classList.add('hidden');
    nameInputDialog.style.display = 'none';
    playerNameInput.value = '';
}

// Start game
function startGame() {
    correctAnswers = 0;
    progressElement.textContent = correctAnswers;
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    nameInputDialog.classList.add('hidden');
    nameInputDialog.style.display = 'none';
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    generateProblem();
}

// Event listeners
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        settings.language = btn.dataset.lang;
        updateTexts();
    });
});

document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        settings.difficulty = btn.dataset.diff;
        updateHighScoresTable();
    });
});

startButton.addEventListener('click', startGame);
checkButton.addEventListener('click', checkAnswer);
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});
submitNameButton.addEventListener('click', handleNameSubmit);
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleNameSubmit();
    }
});

// Initialize
updateTexts(); 