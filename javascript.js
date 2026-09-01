<script>
// ============================================================
// NUMBER CHASE — Complete JavaScript Game Logic
// ============================================================

// ==================== 1. GAME STATE ====================
const gameState = {
    target: 100,
    total: 0,
    difficulty: 'medium',
    playerScore: 0,
    computerScore: 0,
    round: 1,
    playerTurn: true,
    gameOver: false,
    history: [],
    isActive: false,
    computerThinkingTimeout: null
};

// ==================== 2. DOM REFERENCES ====================
const setupScreen = document.getElementById('setupScreen');
const gameScreen = document.getElementById('gameScreen');
const targetInput = document.getElementById('targetInput');
const targetSlider = document.getElementById('targetSlider');
const targetError = document.getElementById('targetError');
const startGameBtn = document.getElementById('startGameBtn');
const rulesBtnSetup = document.getElementById('rulesBtnSetup');
const rulesBtnGame = document.getElementById('rulesBtnGame');
const newGameBtn = document.getElementById('newGameBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const rulesModal = document.getElementById('rulesModal');
const closeRulesBtn = document.getElementById('closeRulesBtn');
const winOverlay = document.getElementById('winOverlay');
const gameTargetDisplay = document.getElementById('gameTargetDisplay');
const gameTotalDisplay = document.getElementById('gameTotalDisplay');
const gameRemainingDisplay = document.getElementById('gameRemainingDisplay');
const progressFill = document.getElementById('progressFill');
const progressMinLabel = document.getElementById('progressMinLabel');
const progressMaxLabel = document.getElementById('progressMaxLabel');
const turnIndicator = document.getElementById('turnIndicator');
const numberGrid = document.getElementById('numberGrid');
const numberButtons = numberGrid ? numberGrid.querySelectorAll('.number-btn') : [];
const historyContainer = document.getElementById('historyContainer');
const computerThinkingArea = document.getElementById('computerThinkingArea');
const computerChoiceArea = document.getElementById('computerChoiceArea');
const computerChoiceText = document.getElementById('computerChoiceText');
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
const winEmoji = document.getElementById('winEmoji');
const winTitle = document.getElementById('winTitle');
const winSubtitle = document.getElementById('winSubtitle');
const statTarget = document.getElementById('statTarget');
const statDifficulty = document.getElementById('statDifficulty');
const statPlayerScore = document.getElementById('statPlayerScore');
const statComputerScore = document.getElementById('statComputerScore');
const statRounds = document.getElementById('statRounds');
const statWinner = document.getElementById('statWinner');
const winPlayAgainBtn = document.getElementById('winPlayAgainBtn');
const winChangeSettingsBtn = document.getElementById('winChangeSettingsBtn');
const difficultyCards = document.querySelectorAll('.difficulty-card');

// ==================== 3. UTILITY FUNCTIONS ====================
function getMaxAllowed() {
    return Math.min(10, gameState.target - gameState.total);
}

function isValidMove(num) {
    if (num < 1 || num > 10) return false;
    if (gameState.total + num > gameState.target) return false;
    return true;
}

function getRemaining() {
    return gameState.target - gameState.total;
}

function getValidMoves() {
    const moves = [];
    const max = Math.min(10, getRemaining());
    for (let i = 1; i <= max; i++) {
        moves.push(i);
    }
    return moves;
}

function formatNumber(n) {
    return Number.isInteger(n) ? n.toString() : n.toFixed(1);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==================== 4. CONFETTI SYSTEM ====================
let confettiPieces = [];
let confettiAnimationId = null;
let confettiRunning = false;

function setupConfettiCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

function spawnConfetti(count) {
    const colors = ['#6c5ce7', '#00d2ff', '#00e676', '#ffab00', '#ff5252', 
                    '#a78bfa', '#69f0ae', '#ffd740', '#ff8a80', '#ffffff'];
    for (let i = 0; i < count; i++) {
        confettiPieces.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height * -0.5 - 20,
            w: Math.random() * 8 + 4,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 6,
            opacity: Math.random() * 0.5 + 0.5
        });
    }
}

function animateConfetti() {
    if (!confettiRunning || !ctx) return;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;
    for (let i = confettiPieces.length - 1; i >= 0; i--) {
        const p = confettiPieces[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.rotSpeed;
        if (p.y > confettiCanvas.height + 30) {
            confettiPieces.splice(i, 1);
            continue;
        }
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
    }
    if (alive || confettiPieces.length > 0) {
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
        confettiRunning = false;
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

function startConfetti(count) {
    if (!confettiCanvas || !ctx) return;
    spawnConfetti(count);
    if (!confettiRunning) {
        confettiRunning = true;
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    }
}

function stopConfetti() {
    confettiRunning = false;
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        confettiAnimationId = null;
    }
    confettiPieces = [];
    if (ctx) ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

window.addEventListener('resize', setupConfettiCanvas);

// ==================== 5. SCREEN MANAGEMENT ====================
function showScreen(screenId) {
    if (screenId === 'setup') {
        setupScreen.classList.add('active');
        gameScreen.classList.remove('active');
    } else if (screenId === 'game') {
        setupScreen.classList.remove('active');
        gameScreen.classList.add('active');
    }
}

// ==================== 6. TARGET & SLIDER SYNC ====================
function syncTargetInputs(source) {
    const value = parseInt(source.value, 10);
    if (isNaN(value)) return;
    if (source === targetInput) {
        if (value >= 30 && value <= 300) {
            targetSlider.value = value;
            targetInput.classList.remove('error');
            targetError.textContent = '';
        }
    } else if (source === targetSlider) {
        targetInput.value = value;
        targetInput.classList.remove('error');
        targetError.textContent = '';
    }
}

targetSlider.addEventListener('input', function() {
    syncTargetInputs(this);
});

targetInput.addEventListener('input', function() {
    const val = parseInt(this.value, 10);
    if (!isNaN(val) && val >= 30 && val <= 300) {
        targetSlider.value = val;
        this.classList.remove('error');
        targetError.textContent = '';
    }
});

targetInput.addEventListener('blur', function() {
    const val = parseInt(this.value, 10);
    if (isNaN(val) || val < 30 || val > 300) {
        this.classList.add('error');
        targetError.textContent = 'Please choose a target between 30 and 300.';
        this.value = targetSlider.value;
    } else {
        this.value = val;
        targetSlider.value = val;
        this.classList.remove('error');
        targetError.textContent = '';
    }
});

targetInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const val = parseInt(this.value, 10);
        if (!isNaN(val) && val >= 30 && val <= 300) {
            targetSlider.value = val;
            this.classList.remove('error');
            targetError.textContent = '';
            startGame();
        } else {
            this.classList.add('error');
            targetError.textContent = 'Please choose a target between 30 and 300.';
        }
    }
});

// ==================== 7. DIFFICULTY SELECTION ====================
function selectDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    difficultyCards.forEach(function(card) {
        const isSelected = card.dataset.difficulty === difficulty;
        card.classList.toggle('selected', isSelected);
        card.classList.toggle('easy-selected', isSelected && difficulty === 'easy');
        card.classList.toggle('medium-selected', isSelected && difficulty === 'medium');
        card.classList.toggle('hard-selected', isSelected && difficulty === 'hard');
        card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });
}

difficultyCards.forEach(function(card) {
    card.addEventListener('click', function() {
        selectDifficulty(this.dataset.difficulty);
    });
    card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectDifficulty(this.dataset.difficulty);
        }
    });
});

// ==================== 8. RULES MODAL ====================
function openRulesModal() {
    rulesModal.style.display = 'flex';
    rulesModal.classList.remove('closing');
}

function closeRulesModal() {
    rulesModal.classList.add('closing');
    setTimeout(function() {
        rulesModal.style.display = 'none';
        rulesModal.classList.remove('closing');
    }, 250);
}

rulesBtnSetup.addEventListener('click', openRulesModal);
rulesBtnGame.addEventListener('click', openRulesModal);
closeRulesBtn.addEventListener('click', closeRulesModal);

rulesModal.addEventListener('click', function(e) {
    if (e.target === rulesModal) closeRulesModal();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && rulesModal.style.display !== 'none') {
        closeRulesModal();
    }
});

// ==================== 9. COMPUTER AI ====================
function getComputerMove() {
    const validMoves = getValidMoves();
    if (validMoves.length === 0) return 1;
    
    if (gameState.difficulty === 'easy') {
        return getEasyMove(validMoves);
    } else if (gameState.difficulty === 'medium') {
        return getMediumMove(validMoves);
    } else if (gameState.difficulty === 'hard') {
        return getHardMove(validMoves);
    }
    return validMoves[Math.floor(Math.random() * validMoves.length)];
}

function getEasyMove(validMoves) {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
}

function getMediumMove(validMoves) {
    const useStrategy = Math.random() < 0.7;
    if (!useStrategy) {
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
    return getStrategicMove(validMoves);
}

function getHardMove(validMoves) {
    return getStrategicMove(validMoves);
}

function getStrategicMove(validMoves) {
    const remaining = getRemaining();
    
    // Priority 1: Win immediately
    if (validMoves.includes(remaining)) {
        return remaining;
    }
    
    // Priority 2: Try to leave a "bad" position for opponent
    // In this game, leaving remaining % 11 === 1 is a strong position
    for (let move = validMoves.length; move >= 1; move--) {
        const newRemaining = remaining - move;
        if (newRemaining <= 0) continue;
        if (newRemaining % 11 === 1) {
            return move;
        }
    }
    
    // Priority 3: Prefer moves that keep us in a winning position
    const strategicChoices = [];
    for (let move of validMoves) {
        const newRemaining = remaining - move;
        if (newRemaining > 0 && newRemaining % 11 !== 0) {
            strategicChoices.push(move);
        }
    }
    
    if (strategicChoices.length > 0) {
        return Math.max.apply(null, strategicChoices);
    }
    
    // Fallback: random valid move
    return validMoves[Math.floor(Math.random() * validMoves.length)];
}

// ==================== 10. GAME START ====================
function validateTarget() {
    const val = parseInt(targetInput.value, 10);
    if (isNaN(val) || val < 30 || val > 300 || !Number.isInteger(val)) {
        targetInput.classList.add('error');
        targetError.textContent = 'Please choose a target between 30 and 300.';
        return false;
    }
    targetInput.classList.remove('error');
    targetError.textContent = '';
    return true;
}

function startGame() {
    if (!validateTarget()) {
        targetInput.focus();
        return;
    }
    
    gameState.target = parseInt(targetInput.value, 10);
    targetSlider.value = gameState.target;
    
    // Reset game state
    gameState.total = 0;
    gameState.playerScore = 0;
    gameState.computerScore = 0;
    gameState.round = 1;
    gameState.gameOver = false;
    gameState.playerTurn = true;
    gameState.history = [];
    gameState.isActive = true;
    
    // Clear UI
    if (historyContainer) historyContainer.innerHTML = '';
    if (computerThinkingArea) computerThinkingArea.style.display = 'none';
    if (computerChoiceArea) computerChoiceArea.style.display = 'none';
    if (computerChoiceText) computerChoiceText.textContent = '';
    stopConfetti();
    winOverlay.style.display = 'none';
    
    // Update displays
    updateGameUI();
    renderHistory();
    
    // Switch to game screen
    showScreen('game');
    enableNumberButtons();
    setTurnIndicator('player');
}

// ==================== 11. PLAYER MOVE ====================
function handlePlayerMove(number) {
    if (gameState.gameOver || !gameState.playerTurn || !gameState.isActive) return;
    if (!isValidMove(number)) return;
    
    // Disable buttons immediately
    disableNumberButtons();
    
    // Process player move
    gameState.total += number;
    gameState.playerScore += number;
    gameState.playerTurn = false;
    
    // Add to history
    gameState.history.push({
        player: 'User',
        number: number,
        totalAfterMove: gameState.total
    });
    
    // Update UI
    updateGameUI();
    renderHistory();
    
    // Check win
    if (gameState.total === gameState.target) {
        gameState.gameOver = true;
        gameState.isActive = false;
        setTurnIndicator('gameover');
        endGame('player');
        return;
    }
    
    // Computer's turn
    setTurnIndicator('computer');
    showComputerThinking();
    
    gameState.computerThinkingTimeout = setTimeout(function() {
        gameState.computerThinkingTimeout = null;
        hideComputerThinking();
        performComputerMove();
    }, 600 + Math.random() * 400);
}

// ==================== 12. COMPUTER TURN ====================
function performComputerMove() {
    if (gameState.gameOver || gameState.playerTurn || !gameState.isActive) return;
    
    const move = getComputerMove();
    if (!isValidMove(move)) return;
    
    gameState.total += move;
    gameState.computerScore += move;
    
    // Update history
    if (gameState.history.length > 0) {
        const lastEntry = gameState.history[gameState.history.length - 1];
        // If last entry was player, add a new computer entry
        if (lastEntry.player === 'Computer') {
            // Already has computer, this shouldn't happen
        } else {
            gameState.history.push({
                player: 'Computer',
                number: move,
                totalAfterMove: gameState.total
            });
        }
    }
    
    // Show computer choice
    if (computerChoiceText) {
        computerChoiceText.textContent = 'Computer chose: ' + move;
    }
    if (computerChoiceArea) {
        computerChoiceArea.style.display = 'block';
    }
    
    // Update UI
    updateGameUI();
    renderHistory();
    
    // Check computer win
    if (gameState.total === gameState.target) {
        gameState.gameOver = true;
        gameState.isActive = false;
        setTurnIndicator('gameover');
        setTimeout(function() {
            endGame('computer');
        }, 400);
        return;
    }
    
    // Switch back to player
    gameState.round++;
    gameState.playerTurn = true;
    setTurnIndicator('player');
    enableNumberButtons();
    
    if (computerChoiceArea) computerChoiceArea.style.display = 'none';
    if (computerChoiceText) computerChoiceText.textContent = '';
}

// ==================== 13. UI UPDATES ====================
function updateNumberButtons() {
    const max = getMaxAllowed();
    numberButtons.forEach(function(btn) {
        const num = parseInt(btn.dataset.number, 10);
        if (!gameState.isActive || !gameState.playerTurn || gameState.gameOver) {
            btn.disabled = true;
        } else {
            btn.disabled = num > max;
        }
        btn.classList.remove('selected-highlight');
    });
}

function enableNumberButtons() {
    updateNumberButtons();
}

function disableNumberButtons() {
    numberButtons.forEach(function(btn) {
        btn.disabled = true;
    });
}

function setTurnIndicator(state) {
    if (!turnIndicator) return;
    turnIndicator.classList.remove('player-turn', 'computer-turn', 'game-over');
    if (state === 'player') {
        turnIndicator.textContent = '🟢 YOUR TURN';
        turnIndicator.classList.add('player-turn');
    } else if (state === 'computer') {
        turnIndicator.textContent = '🤖 COMPUTER\'S TURN';
        turnIndicator.classList.add('computer-turn');
    } else if (state === 'gameover') {
        turnIndicator.textContent = '🏁 GAME OVER';
        turnIndicator.classList.add('game-over');
    }
}

function showComputerThinking() {
    if (computerThinkingArea) computerThinkingArea.style.display = 'block';
    if (computerChoiceArea) computerChoiceArea.style.display = 'none';
}

function hideComputerThinking() {
    if (computerThinkingArea) computerThinkingArea.style.display = 'none';
}

function updateGameUI() {
    if (gameTargetDisplay) gameTargetDisplay.textContent = formatNumber(gameState.target);
    if (gameTotalDisplay) gameTotalDisplay.textContent = formatNumber(gameState.total);
    const remaining = getRemaining();
    if (gameRemainingDisplay) gameRemainingDisplay.textContent = formatNumber(Math.max(0, remaining));
    
    updateProgress();
    updateNumberButtons();
}

function updateProgress() {
    if (!progressFill) return;
    const percentage = gameState.target > 0 ? 
        Math.min(100, (gameState.total / gameState.target) * 100) : 0;
    progressFill.style.width = percentage + '%';
    if (progressMinLabel) progressMinLabel.textContent = formatNumber(gameState.total);
    if (progressMaxLabel) progressMaxLabel.textContent = formatNumber(gameState.target);
}

function renderHistory() {
    if (!historyContainer) return;
    if (gameState.history.length === 0) {
        historyContainer.innerHTML = '<p class="history-empty">No moves yet. The game begins!</p>';
        return;
    }
    
    // Group history by round
    let html = '';
    let currentRound = 0;
    let roundHtml = '';
    let userMove = null;
    let computerMove = null;
    
    for (let i = 0; i < gameState.history.length; i++) {
        const entry = gameState.history[i];
        const entryRound = Math.floor(i / 2) + 1;
        
        if (entryRound !== currentRound) {
            if (currentRound > 0) {
                html += renderRoundHtml(currentRound, userMove, computerMove);
            }
            currentRound = entryRound;
            userMove = null;
            computerMove = null;
        }
        
        if (entry.player === 'User') {
            userMove = entry;
        } else if (entry.player === 'Computer') {
            computerMove = entry;
        }
    }
    
    // Render the last round
    if (currentRound > 0) {
        html += renderRoundHtml(currentRound, userMove, computerMove);
    }
    
    historyContainer.innerHTML = html;
    historyContainer.scrollTop = historyContainer.scrollHeight;
}

function renderRoundHtml(round, userMove, computerMove) {
    const isNewest = (round === Math.ceil(gameState.history.length / 2));
    const cls = isNewest ? 'history-entry newest' : 'history-entry';
    
    let html = '<div class="' + cls + '">';
    html += '<span class="history-round">Round ' + round + '</span>';
    
    if (userMove) {
        html += '<span class="history-player">You +' + userMove.number + '</span>';
    }
    if (computerMove) {
        html += '<span class="history-computer">Computer +' + computerMove.number + '</span>';
    }
    
    const total = computerMove ? computerMove.totalAfterMove : 
                  (userMove ? userMove.totalAfterMove : 0);
    html += '<span class="history-total">Total: ' + total + '</span>';
    html += '</div>';
    
    return html;
}

// ==================== 14. GAME END ====================
function endGame(winner) {
    gameState.gameOver = true;
    gameState.isActive = false;
    disableNumberButtons();
    stopConfetti();
    
    if (winner === 'player') {
        winEmoji.textContent = '🎉';
        winTitle.textContent = 'YOU WIN!';
        winTitle.className = 'win-title win';
        winSubtitle.textContent = 'You reached ' + gameState.target + '! Congratulations!';
        statWinner.textContent = 'You';
        statWinner.style.color = 'var(--success)';
        startConfetti(150);
    } else {
        winEmoji.textContent = '🤖';
        winTitle.textContent = 'COMPUTER WINS!';
        winTitle.className = 'win-title lose';
        winSubtitle.textContent = 'The computer reached ' + gameState.target + 
            ' first. Better luck next time!';
        statWinner.textContent = 'Computer';
        statWinner.style.color = 'var(--danger)';
    }
    
    statTarget.textContent = formatNumber(gameState.target);
    statDifficulty.textContent = capitalize(gameState.difficulty);
    statPlayerScore.textContent = formatNumber(gameState.playerScore);
    statComputerScore.textContent = formatNumber(gameState.computerScore);
    statRounds.textContent = gameState.round;
    
    winOverlay.style.display = 'flex';
}

function hideWinScreen() {
    winOverlay.style.display = 'none';
    stopConfetti();
}

// ==================== 15. RESET FUNCTIONS ====================
function playAgain() {
    if (gameState.computerThinkingTimeout) {
        clearTimeout(gameState.computerThinkingTimeout);
        gameState.computerThinkingTimeout = null;
    }
    
    stopConfetti();
    winOverlay.style.display = 'none';
    
    gameState.total = 0;
    gameState.playerScore = 0;
    gameState.computerScore = 0;
    gameState.round = 1;
    gameState.gameOver = false;
    gameState.playerTurn = true;
    gameState.history = [];
    gameState.isActive = true;
    
    if (historyContainer) historyContainer.innerHTML = '';
    if (computerThinkingArea) computerThinkingArea.style.display = 'none';
    if (computerChoiceArea) computerChoiceArea.style.display = 'none';
    if (computerChoiceText) computerChoiceText.textContent = '';
    
    updateGameUI();
    renderHistory();
    showScreen('game');
    enableNumberButtons();
    setTurnIndicator('player');
}

function newGame() {
    if (gameState.computerThinkingTimeout) {
        clearTimeout(gameState.computerThinkingTimeout);
        gameState.computerThinkingTimeout = null;
    }
    
    stopConfetti();
    winOverlay.style.display = 'none';
    
    gameState.target = 100;
    gameState.total = 0;
    gameState.playerScore = 0;
    gameState.computerScore = 0;
    gameState.round = 1;
    gameState.gameOver = false;
    gameState.playerTurn = true;
    gameState.history = [];
    gameState.isActive = false;
    gameState.difficulty = 'medium';
    
    targetInput.value = 100;
    targetSlider.value = 100;
    targetInput.classList.remove('error');
    targetError.textContent = '';
    
    selectDifficulty('medium');
    
    if (historyContainer) historyContainer.innerHTML = '';
    if (computerThinkingArea) computerThinkingArea.style.display = 'none';
    if (computerChoiceArea) computerChoiceArea.style.display = 'none';
    if (computerChoiceText) computerChoiceText.textContent = '';
    
    showScreen('setup');
}

// ==================== 16. EVENT LISTENERS ====================
startGameBtn.addEventListener('click', startGame);

numberButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
        const num = parseInt(this.dataset.number, 10);
        if (isValidMove(num) && gameState.playerTurn && !gameState.gameOver && gameState.isActive) {
            handlePlayerMove(num);
        }
    });
});

playAgainBtn.addEventListener('click', playAgain);
newGameBtn.addEventListener('click', newGame);
winPlayAgainBtn.addEventListener('click', playAgain);
winChangeSettingsBtn.addEventListener('click', newGame);

// Keyboard support for number buttons (1-10)
document.addEventListener('keydown', function(e) {
    if (!gameState.isActive || gameState.gameOver || !gameState.playerTurn) return;
    if (e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key, 10);
        if (isValidMove(num)) handlePlayerMove(num);
    } else if (e.key === '0') {
        const num = 10;
        if (isValidMove(num)) handlePlayerMove(num);
    }
});

// ==================== 17. INITIALIZATION ====================
function initializeGame() {
    if (confettiCanvas) setupConfettiCanvas();
    
    targetInput.value = 100;
    targetSlider.value = 100;
    targetInput.classList.remove('error');
    targetError.textContent = '';
    
    selectDifficulty('medium');
    
    if (historyContainer) historyContainer.innerHTML = '';
    if (computerThinkingArea) computerThinkingArea.style.display = 'none';
    if (computerChoiceArea) computerChoiceArea.style.display = 'none';
    if (computerChoiceText) computerChoiceText.textContent = '';
    
    updateGameUI();
    renderHistory();
    showScreen('setup');
    enableNumberButtons();
    setTurnIndicator('player');
    
    gameState.isActive = false;
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

console.log('🎮 Number Chase — JavaScript loaded successfully');
console.log('📋 Initial target: ' + gameState.target + ' | Difficulty: ' + gameState.difficulty);
console.log('🎯 Choose your target. Chase the number. Beat the computer!');
</script>