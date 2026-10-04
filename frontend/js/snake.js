document.addEventListener("DOMContentLoaded", () => {

    const canvas =
        document.getElementById("snakeCanvas");

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");

    const scoreElement =
        document.getElementById("snakeScore");

    const startButton =
        document.getElementById("snakeStartButton");

    const gridSize = 15;
    const tileCount = canvas.width / gridSize;

    let snake = [{ x: 7, y: 7 }];
    let velocity = { x: 0, y: 0 };
    let food = { x: 10, y: 10 };
    let score = 0;
    let gameLoopId = null;
    let isRunning = false;

    function placeFood() {

        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        const onSnake =
            snake.some(part =>
                part.x === food.x && part.y === food.y
            );

        if (onSnake) {
            placeFood();
        }

    }

    function resetGame() {

        snake = [{ x: 7, y: 7 }];
        velocity = { x: 0, y: 0 };
        score = 0;

        scoreElement.textContent =
            `Рахунок: ${score}`;

        placeFood();

    }

    function draw() {

        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ff6b8a";
        ctx.fillRect(
            food.x * gridSize,
            food.y * gridSize,
            gridSize - 2,
            gridSize - 2
        );

        ctx.fillStyle = "#00e5ff";

        snake.forEach(part => {

            ctx.fillRect(
                part.x * gridSize,
                part.y * gridSize,
                gridSize - 2,
                gridSize - 2
            );

        });

    }

    function gameOver() {

        isRunning = false;

        clearInterval(gameLoopId);

        startButton.textContent = "🔁 Заново";

        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "Гру закінчено 💀",
            canvas.width / 2,
            canvas.height / 2
        );

    }

    function tick() {

        const head = {
            x: snake[0].x + velocity.x,
            y: snake[0].y + velocity.y
        };

        const hitWall =
            head.x < 0 ||
            head.x >= tileCount ||
            head.y < 0 ||
            head.y >= tileCount;

        const hitSelf =
            snake.some(part =>
                part.x === head.x && part.y === head.y
            );

        if (hitWall || hitSelf) {

            gameOver();

            return;

        }

        snake.unshift(head);

        const ateFood =
            head.x === food.x && head.y === food.y;

        if (ateFood) {

            score++;

            scoreElement.textContent =
                `Рахунок: ${score}`;

            placeFood();

        } else {

            snake.pop();

        }

        draw();

    }

    function startGame() {

        if (isRunning) return;

        resetGame();

        velocity = { x: 1, y: 0 };

        isRunning = true;

        startButton.textContent = "⏸ Грається...";

        draw();

        gameLoopId =
            setInterval(tick, 120);

    }

    startButton.addEventListener("click", startGame);

    document.addEventListener("keydown", event => {

        if (!isRunning) return;

        switch (event.key) {

            case "ArrowUp":
                if (velocity.y === 0) velocity = { x: 0, y: -1 };
                break;

            case "ArrowDown":
                if (velocity.y === 0) velocity = { x: 0, y: 1 };
                break;

            case "ArrowLeft":
                if (velocity.x === 0) velocity = { x: -1, y: 0 };
                break;

            case "ArrowRight":
                if (velocity.x === 0) velocity = { x: 1, y: 0 };
                break;

        }

    });

    draw();

});
