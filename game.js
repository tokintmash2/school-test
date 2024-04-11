document.addEventListener('DOMContentLoaded', () => {
    // Get static stuff
    const gameArea = document.getElementById('gameArea');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');

    // Create dynamic stuff
    const playerShip = document.createElement('div')
    playerShip.classList.add('player')
    gameArea.appendChild(playerShip)

    const dialogueBox = document.createElement('div')
    dialogueBox.classList.add('dialogue')
    gameArea.appendChild(dialogueBox)

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('dialogue-buttons');

    const startButton = document.createElement('button')
    startButton.innerHTML = 'START'
    startButton.classList.add('start-button')
    gameArea.appendChild(startButton)

    const continueButton = document.createElement('button');
    continueButton.innerHTML = 'RESUME'
    continueButton.classList.add('ctrl-button')

    const restartButton = document.createElement('button');
    restartButton.innerHTML = 'RESTART'
    restartButton.classList.add('ctrl-button')

    // Set the number of invaders
    const invadersNum = 20;
    let hitInvaders = 0;

    // Create invaders
    const invadersGrid = document.createElement('div')
    invadersGrid.classList.add('grid-container')

    for(let i = 0; i < invadersNum; i++) {
        const invaderShip = document.createElement('div')
        invaderShip.classList.add('invader')
        invaderShip.classList.add('grid-item')
        invaderShip.setAttribute('id', i)
        invadersGrid.appendChild(invaderShip)
    }
    
    gameArea.appendChild(invadersGrid)    
    
    let lastTime = 0;
    let gameRunning = false;
    let score = 0;
    let lives = 3;
    let gameTimer = 60;

    let gameDuration = gameTimer * 1000; // 60 seconds in milliseconds
    let lastFrameTime = 0; // Timestamp of the last frame
    let remainingTime = gameDuration; // Time remaining in the game

    let movingLeft = false;
    let movingRight = false;

    initGame();

    function gameLoop(timestamp) {
        if (!gameRunning) return;
        
        if (!lastFrameTime) lastFrameTime = timestamp;
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        remainingTime -= deltaTime;
        if (remainingTime <= 0 || hitInvaders === invadersNum || lives <= 0) {
            endGame();
            return;
        }

        // Update the timer display
        const seconds = Math.ceil(remainingTime / 1000);
        timerDisplay.textContent = `${seconds}`;

        // Move bullets
        const bullets = document.querySelectorAll('.bullet');
        const invaderBullets = document.querySelectorAll('.invader-bullet');
        
        bullets.forEach((bullet) => {
            let currentTop = parseInt(bullet.style.top, 10); // Parse the current top value to an integer
            // console.log('From gameloop:', currentTop);
            bullet.style.top = (currentTop - 5) + 'px';
        });

        invaderBullets.forEach((bullet) => {
            let currentTop = parseInt(bullet.style.top, 10); // Parse the current top value to an integer
            // console.log('From gameloop:', currentTop);
            bullet.style.top = (currentTop + 5) + 'px';
        });

        if (movingLeft) movePlayer('left', deltaTime);
        if (movingRight) movePlayer('right', deltaTime);

        checkCollisions();
        requestAnimationFrame(gameLoop);
    }

    function checkCollisions() {
        const bullets = document.querySelectorAll('.bullet');
        const invaderBullets = document.querySelectorAll('.invader-bullet');
        const invaders = document.querySelectorAll('.invader');
        const player = document.querySelector('.player');
    
        bullets.forEach(plyrBullet => {
            invaders.forEach(invader => {

                // Skip hidden invader
                if (invader.style.visibility === 'hidden') {
                    return;
                }

                // Simple bounding box collision detection
                const bRect = plyrBullet.getBoundingClientRect();
                const iRect = invader.getBoundingClientRect();
                const gRect = gameArea.getBoundingClientRect();
    
                if (bRect.x < iRect.x + iRect.width &&
                    bRect.x + bRect.width > iRect.x &&
                    bRect.y < iRect.y + iRect.height &&
                    bRect.height + bRect.y > iRect.y) {
                    // Collision detected, remove bullet and hide invader
                    plyrBullet.remove();
                    invader.style.visibility = 'hidden';
                    hitInvaders++;
                    console.log('Invaders hit:', hitInvaders)
    
                    // Update score or other game state as needed
                    score += 10; // Example score update
                    scoreDisplay.textContent = score;
                }
                // Remove  bullets that go out of game area
                if (bRect.y - gRect.y <= 0) {
                    plyrBullet.remove();
                }
            });
        });

        invaderBullets.forEach(invaderBullet => {
            // Simple bounding box collision detection
            const bRect = invaderBullet.getBoundingClientRect();
            const gRect = gameArea.getBoundingClientRect();
            const pRect = player.getBoundingClientRect();

            if (bRect.x < pRect.x + pRect.width &&
                bRect.x + bRect.width > pRect.x &&
                bRect.y < pRect.y + pRect.height &&
                bRect.height + bRect.y > pRect.y) {
                // Collision detected, remove bullet and hide invader
                invaderBullet.remove();
                lives--;

                // Update score or other game state as needed
                livesDisplay.textContent = lives;
            }
            // // Remove  bullets that go out of game area
            if (bRect.bottom > gRect.bottom) {
                invaderBullet.remove();
            }
        });
    }

    function startGame() {
        playerShip.style.display = 'block'; // Toggle show ship
        // startButton.style.display = 'none';
        startButton.remove();
        // continueButton.style.display = 'none';
        dialogueBox.style.display = 'none';
        gameRunning = true;
        lastTime = performance.now();
        shootFromInvaders();
        requestAnimationFrame(gameLoop);
    }

    // function pauseGame() {
    //     gameRunning = !gameRunning;
    //     const buttonContainer = document.createElement('div')
    //     buttonContainer.classList.add('dialogue-buttons')
    //     dialogueBox.appendChild(buttonContainer)

    //     dialogueBox.style.display = 'block';
    //     continueButton.style.display = 'block';

    //     buttonContainer.appendChild(continueButton)
    //     buttonContainer.appendChild(restartButton)
    //     if (!gameRunning) requestAnimationFrame(gameLoop);
    // }

    function pauseGame() {
        gameRunning = !gameRunning;
        if (!gameRunning) {
            // Clear previous buttons if any
            buttonContainer.innerHTML = ''; 
            buttonContainer.appendChild(continueButton);
            buttonContainer.appendChild(restartButton);
            // Ensure dialogueBox is set up for button display
            dialogueBox.appendChild(buttonContainer);
            gameArea.appendChild(dialogueBox)
            dialogueBox.style.display = 'flex'; // Ensure flex is enabled for centering
        } else {
            // Optionally, handle the resumption scenario
            dialogueBox.style.display = 'none';
        }
        requestAnimationFrame(gameLoop);
    }

    function endGame() {
        gameRunning = false;
        alert("Game Over!");
    }

    function shootBullet() {
        if(gameRunning) {
            const bullet = document.createElement('div');
            bullet.classList.add('bullet');
            bullet.style.left = playerShip.offsetLeft + playerShip.offsetWidth / 2 - 2.5 + 'px'; // Center the bullet based on its width
            bullet.style.top = (playerShip.offsetTop - 20) + 'px'; // Assuming 20px is the bullet height
            gameArea.appendChild(bullet);
        }
    }


    function shootFromInvaders() {
        const visibleInvaders = Array.from(document.querySelectorAll('.invader'))
            .filter(invader => invader.style.visibility !== 'hidden');
            
        if (visibleInvaders.length > 0) {
            const shooter = visibleInvaders[Math.floor(Math.random() * visibleInvaders.length)];
            createInvaderBullet(shooter);
        }
    
        // Set a random delay for the next shot
        const nextShotDelay = Math.random() * 2000 + 1000; // Between 1 and 3 seconds
        setTimeout(shootFromInvaders, nextShotDelay);
    }
    
    function createInvaderBullet(shooter) {
        if(gameRunning) {
            const bullet = document.createElement('div');
            bullet.classList.add('invader-bullet');
            // Position the bullet at the shooter's location
            bullet.style.left = shooter.offsetLeft + shooter.offsetWidth / 2 + 'px';
            bullet.style.top = shooter.offsetTop + shooter.offsetHeight + 'px';
            gameArea.appendChild(bullet);
        }
    }
    
    // Setup key listeners for game control
    document.addEventListener('keydown', e => {
        if (gameRunning) {
            if (e.code === 'ArrowLeft') movingLeft = true;
            if (e.code === 'ArrowRight') movingRight = true;
            if (e.code === 'Space') shootBullet();
            if (e.code === 'Escape') pauseGame();
        }
    });

    document.addEventListener('keyup', e => {
        if (e.code === 'ArrowLeft') movingLeft = false;
        if (e.code === 'ArrowRight') movingRight = false;
    });

    document.addEventListener('click', e => {
        switch (e.target) {
            case startButton:
                startGame();
                break;
            case continueButton:
                startGame();
                break;
            case restartButton:
                initGame();
                break;
            default:
        }
    })

    // Initialize or reset game state
    function initGame() {

        score = 0;
        lives = 3;
        gameTimer = 60;
        gameRunning = false;
        hitInvaders = 0; // Reset hit invaders count
        lastTime = 0; // Reset last time for deltaTime calculations
        remainingTime = gameDuration; // Reset the remaining time

        // Reset displays and other initializations
        scoreDisplay.textContent = score;
        livesDisplay.textContent = lives;
        timerDisplay.textContent = gameTimer;

        const startPosition = (gameArea.offsetWidth - playerShip.offsetWidth) / 2;
        playerShip.style.left = startPosition + 'px';

        // Remove existing bullets
        document.querySelectorAll('.bullet, .invader-bullet').forEach(bullet => bullet.remove());

        // Reset invaders
        document.querySelectorAll('.invader').forEach((invader, index) => {
            invader.style.visibility = 'visible';
        });

        if (!document.querySelector('.start-button')) {
            // Remove continue&restart and recreate start button
            buttonContainer.remove();
            dialogueBox.remove();
            gameArea.appendChild(startButton); // Assuming startButton still holds a reference to the original button
        }
    }

    function movePlayer(direction, deltaTime) {
        const moveSpeed = 300; // pixels per second
        const moveAmount = (moveSpeed * deltaTime) / 1000; // Adjust based on deltaTime
        const currentPosition = parseInt(playerShip.style.left, 10);
    
        if (direction === 'left' && currentPosition > 0) {
            playerShip.style.left = `${Math.max(0, currentPosition - moveAmount)}px`;
        } else if (direction === 'right' && currentPosition < (gameArea.offsetWidth - playerShip.offsetWidth)) {
            playerShip.style.left = `${Math.min(gameArea.offsetWidth - playerShip.offsetWidth, currentPosition + moveAmount)}px`;
        }
    }
});
