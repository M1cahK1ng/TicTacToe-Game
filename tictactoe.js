// tictactoe.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('[data-cell]');
    const statusDisplay = document.getElementById('status');
    const gameEndScreen = document.getElementById('gameEndScreen');
    const gameEndMessage = document.getElementById('gameEndMessage');
    const restartButton = document.getElementById('restartButton');
    const opponentSelector = document.getElementById('opponent');

    const X_CLASS = 'x';
    const O_CLASS = 'o';

    const WINNING_COMBINATIONS = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    // Game State
    let isOTurn;
    let gameMode; // 'human' or 'ai'

    function startGame() {
        gameMode = opponentSelector.value;
        isOTurn = false;
        cells.forEach(cell => {
            cell.classList.remove(X_CLASS, O_CLASS);
            cell.textContent = ''; // Clear the text content
            cell.removeEventListener('click', handleClick);
            cell.addEventListener('click', handleClick, { once: true });
        });
        board.classList.remove('waiting');
        gameEndScreen.classList.remove('show');
        updateStatus();
    }

    function handleClick(e) {
        const cell = e.target;
        const currentClass = isOTurn ? O_CLASS : X_CLASS;

        // In AI mode, the human (X) can only play when it's their turn.
        if (gameMode === 'ai' && isOTurn) {
            return; // AI's turn, do nothing on click.
        }

        placeMark(cell, currentClass);

        if (checkWin(currentClass)) {
            endGame(false);
        } else if (isDraw()) {
            endGame(true);
        } else {
            swapTurns();
            updateStatus();
            // If it's now the AI's turn, trigger its move.
            if (gameMode === 'ai' && isOTurn) {
                board.classList.add('waiting');
                setTimeout(aiMove, 600); // Delay for realism
            }
        }
    }

    function findWinningOrBlockingMove(classToCheck) {
        for (const combination of WINNING_COMBINATIONS) {
            const combinationCells = combination.map(index => cells[index]);

            const marks = combinationCells.filter(cell => cell.classList.contains(classToCheck));
            const emptyCells = combinationCells.filter(cell => !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS));

            if (marks.length === 2 && emptyCells.length === 1) {
                const moveCell = emptyCells[0];
                return Array.from(cells).indexOf(moveCell);
            }
        }
        return null;
    }

    function aiMove() {
        // Priority 1: Find a winning move for AI (O)
        let moveIndex = findWinningOrBlockingMove(O_CLASS);

        // Priority 2: If no winning move, block the player (X)
        if (moveIndex === null) {
            moveIndex = findWinningOrBlockingMove(X_CLASS);
        }

        // Priority 3: Take the center if available and no strategic move was found
        if (moveIndex === null && !cells[4].classList.contains(X_CLASS) && !cells[4].classList.contains(O_CLASS)) {
            moveIndex = 4;
        }

        let cellToPlay;
        if (moveIndex !== null) {
            cellToPlay = cells[moveIndex];
        } else {
            // Priority 4: Fallback to a random available cell
            const availableCells = [...cells].filter(cell =>
                !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)
            );
            if (availableCells.length === 0) return;
            cellToPlay = availableCells[Math.floor(Math.random() * availableCells.length)];
        }

        // The AI's move doesn't trigger the 'click' event, so the { once: true }
        // listener is never removed. We must remove it manually to prevent bugs.
        cellToPlay.removeEventListener('click', handleClick);
        placeMark(cellToPlay, O_CLASS);

        if (checkWin(O_CLASS)) {
            endGame(false);
        } else if (isDraw()) {
            endGame(true);
        } else {
            swapTurns();
            updateStatus();
            board.classList.remove('waiting');
        }
    }

    function placeMark(cell, currentClass) {
        cell.classList.add(currentClass);
        cell.textContent = currentClass.toUpperCase(); // Add X or O text
    }

    function swapTurns() {
        isOTurn = !isOTurn;
    }

    function updateStatus() {
        if (gameMode === 'ai' && isOTurn) {
            statusDisplay.textContent = "AI is thinking...";
        } else {
            statusDisplay.textContent = `Player ${isOTurn ? "O" : "X"}'s turn`;
        }
    }

    function checkWin(currentClass) {

        return WINNING_COMBINATIONS.some(combination => {
            return combination.every(index => {
                return cells[index].classList.contains(currentClass);
            });
        });
    }

    function isDraw() {
        return [...cells].every(cell => {
            return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
        });
    }

    function endGame(draw) {
        if (draw) {
            gameEndMessage.textContent = 'It\'s a Draw!';
        } else {
            const winner = isOTurn ? "O" : "X";
            if (gameMode === 'ai' && winner === 'O') {
                gameEndMessage.textContent = `The AI Wins!`;
            } else {
                gameEndMessage.textContent = `Player ${winner} Wins!`;
            }
        }
        gameEndScreen.classList.add('show');
    }

    // Event Listeners
    restartButton.addEventListener('click', startGame);
    opponentSelector.addEventListener('change', startGame);
    // Initial game start
    startGame();
});


