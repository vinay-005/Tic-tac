// js code 
const cells = document.querySelectorAll("[data-cell]");
const turnText = document.querySelector(".turn");
const replayBtn = document.querySelector(".replay");
const winLine = document.getElementById("win-line");
const aiToggle = document.getElementById("ai-toggle");
const modeLabel = document.getElementById("mode-label");

const moveSound = document.getElementById("move-sound");
const winSound = document.getElementById("win-sound");
const drawSound = document.getElementById("draw-sound");

let currentPlayer = "X";
let board = Array(9).fill(null);
let gameOver = false;
let vsAI = false;
let gameStarted = false;

const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const winLineStyles = {
    '0,1,2': { top: '50px', left: '0', width: '100%', rotate: '0deg' },
    '3,4,5': { top: 'calc(33.33% + 10px)', left: '0', width: '100%', rotate: '0deg' },
    '6,7,8': { top: 'calc(66.66% + 20px)', left: '0', width: '100%', rotate: '0deg' },
    '0,3,6': { top: '0', left: '50px', width: '100%', rotate: '90deg' },
    '1,4,7': { top: '0', left: 'calc(33.33% + 10px)', width: '100%', rotate: '90deg' },
    '2,5,8': { top: '0', left: 'calc(66.66% + 20px)', width: '100%', rotate: '90deg' },
    '0,4,8': { top: '0', left: '0', width: '140%', rotate: '45deg' },
    '2,4,6': { top: '0', left: '0', width: '140%', rotate: '-45deg' }
};

aiToggle.addEventListener("change", () => {
    vsAI = aiToggle.checked;
    modeLabel.innerText = vsAI ? "Vs AI" : "2 Player";
});

cells.forEach((cell, index) => {
    cell.addEventListener("click", () => handleClick(index));
});

function handleClick(index) {
    if (board[index] || gameOver || (vsAI && currentPlayer === "O")) return;

    if (!gameStarted) {
        vsAI = aiToggle.checked;
        modeLabel.innerText = vsAI ? "Vs AI" : "2 Player";
        aiToggle.disabled = true;
        gameStarted = true;
    }

    makeMove(index, currentPlayer);
    if (checkGameOver(currentPlayer)) return;

    if (vsAI) {
        currentPlayer = "O";
        turnText.innerText = "AI's Turn";
        setTimeout(() => {
            const aiIndex = getBestMove();
            makeMove(aiIndex, "O");
            if (!checkGameOver("O")) {
                currentPlayer = "X";
                turnText.innerText = "Player X's Turn";
            }
        }, 300);
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        turnText.innerText = `Player ${currentPlayer}'s Turn`;
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].innerText = player;
    cells[index].style.color = player === "X" ? "#ff007f" : "#00ff7f";
    cells[index].classList.add("placed");
    moveSound.play();
}

function checkGameOver(player) {
    if (checkWin(player)) {
        gameOver = true;
        winSound.play();
        showFireworks();
        setTimeout(() => {
            Swal.fire({
                title: `${vsAI && player === "O" ? "AI" : `Player ${player}`} Wins! 🎉`,
                icon: "success",
                confirmButtonText: "OK"
            }).then(() => restartGame());
        }, 600);
        return true;
    }

    if (!board.includes(null)) {
        gameOver = true;
        drawSound.play();
        Swal.fire({
            title: "It's a Draw! 😐",
            icon: "info",
            confirmButtonText: "OK"
        }).then(() => restartGame());
        return true;
    }

    return false;
}

function checkWin(player) {
    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] === player && board[b] === player && board[c] === player) {
            drawWinLine([a, b, c]);
            return true;
        }
    }
    return false;
}

function drawWinLine(combo) {
    const [a, , c] = combo;
    const rectA = cells[a].getBoundingClientRect();
    const rectC = cells[c].getBoundingClientRect();
    const containerRect = document.querySelector(".game-container").getBoundingClientRect();

    const x1 = rectA.left + rectA.width / 2 - containerRect.left;
    const y1 = rectA.top + rectA.height / 2 - containerRect.top;
    const x2 = rectC.left + rectC.width / 2 - containerRect.left;
    const y2 = rectC.top + rectC.height / 2 - containerRect.top;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    winLine.style.display = "block";
    winLine.style.width = `${length}px`;
    winLine.style.top = `${y1}px`;
    winLine.style.left = `${x1}px`;
    winLine.style.transform = `rotate(${angle}deg)`;
}


function showFireworks() {
    for (let i = 0; i < 25; i++) {
        const firework = document.createElement("div");
        firework.className = "firework";
        firework.style.left = Math.random() * 100 + "%";
        firework.style.top = Math.random() * 100 + "%";
        firework.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.body.appendChild(firework);
        setTimeout(() => firework.remove(), 1000);
    }
}

function restartGame() {
    board.fill(null);
    gameOver = false;
    currentPlayer = "X";
    gameStarted = false;
    aiToggle.disabled = false;
    turnText.innerText = "Player X's Turn";
    modeLabel.innerText = aiToggle.checked ? "Vs AI" : "2 Player";

    cells.forEach(cell => {
        cell.innerText = "";
        cell.classList.remove("placed");
    });

    winLine.style.display = "none";
}

replayBtn.addEventListener("click", restartGame);

function getBestMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = "O";
            let score = minimax(board, 0, false);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(newBoard, depth, isMaximizing) {
    if (checkWinFor("O", newBoard)) return 10 - depth;
    if (checkWinFor("X", newBoard)) return depth - 10;
    if (!newBoard.includes(null)) return 0;

    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === null) {
                newBoard[i] = "O";
                best = Math.max(best, minimax(newBoard, depth + 1, false));
                newBoard[i] = null;
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === null) {
                newBoard[i] = "X";
                best = Math.min(best, minimax(newBoard, depth + 1, true));
                newBoard[i] = null;
            }
        }
        return best;
    }
}

function checkWinFor(player, testBoard) {
    return winningCombos.some(combo => {
        const [a, b, c] = combo;
        return testBoard[a] === player && testBoard[b] === player && testBoard[c] === player;
    });
}
