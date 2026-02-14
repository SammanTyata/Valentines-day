document.addEventListener('DOMContentLoaded', function() {
    // Create love animation background
    createLoveAnimation();
    
    // DOM elements
    const proposalScreen = document.getElementById('proposal-screen');
    const gameScreen = document.getElementById('game-screen');
    const galleryScreen = document.getElementById('gallery-screen');
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const heartsContainer = document.getElementById('hearts-container');
    const scoreCount = document.getElementById('score-count');
    const timerDisplay = document.getElementById('timer');
    const backToStartBtn = document.getElementById('back-to-start');
    const balloonScreen = document.getElementById('balloon-screen');
    
    // Game variables
    let score = 0;
    let heartsCollected = 0;
    let timeLeft = 30; // 30 seconds to collect hearts
    let gameActive = false;
    let timer;
    
    // Array of photos (add your photos to the photos folder)
    const photos = [
        'photos/photo1.jpg',
        'photos/photo2.jpg',
        'photos/photo3.jpg',
        'photos/photo4.jpg',
        'photos/photo5.jpg',
        'photos/photo6.jpg'
    ];
    
    // Event listeners
    yesBtn.addEventListener('click', function() {
        proposalScreen.classList.remove('active');
        gameScreen.classList.add('active');
    });
    
    // Counter for how many times "No" has been pressed
    let noClickCount = 0;
    
    // Store the current scale of the buttons
    let noButtonScale = 1;
    let yesButtonScale = 1;
    
    // Humorous messages array with funny emojis
    const noMessages = [
        "Are you sure? 😢",
        "Think again! 🥺",
        "Don't break my heart! 💔",
        "You're breaking my heart! 😭",
        "Are you really sure? 🤔",
        "I'll keep asking! 😄",
        "My heart is breaking! 💔😭",
        "You're killing me softly! 😅",
        "This is getting painful! 😰",
        "I'm not giving up! 😎",
        "You're so mean to me! 😡",
        "I'll just keep growing! 🌱",
        "You're my destiny! ✨",
        "I believe in us! 💑",
        "Love conquers all! ❤️",
        "You can't resist forever! 😏",
        "I'm persistent! 🙌",
        "You're my soulmate! 👫",
        "I'll wait forever! ⏳",
        "You're stuck with me! 😜"
    ];
    
    // Make the "No" button just shrink when clicked (no movement)
    noBtn.addEventListener('click', function(e) {
        if (!this.classList.contains('shrinking')) {
            e.preventDefault(); // Prevent default button click behavior
            
            // Increment click counter
            noClickCount++;
            
            // Reduce button size - ensure it accumulates properly
            noButtonScale = Math.max(noButtonScale - 0.05, 0.3); // Reduce by 5%, minimum 30%
            
            // Apply transform to the entire button to make it shrink
            this.style.transform = `scale(${noButtonScale})`;
            this.style.transformOrigin = 'center center';
            
            this.classList.add('shrinking'); // Add class to prevent rapid clicking
            
            // Grow the Yes button
            yesButtonScale = Math.min(yesButtonScale + 0.04, 3); // Grow by 4%, max 3x
            yesBtn.style.transform = `scale(${yesButtonScale})`;
            yesBtn.style.transformOrigin = 'center center';

            // Show humorous message or start floating if messages are done
            if (noClickCount <= noMessages.length) {
                const message = noMessages[noClickCount - 1];
                showMessage(message);

                // Remove the shrinking class after a short delay to allow for repeated clicks
                setTimeout(() => {
                    this.classList.remove('shrinking');
                }, 300);
            } else {
                // Messages are done — remove No button, show permanent message
                showMessage("Yes is the only option 💕", true);
                this.classList.remove('shrinking');
                this.style.display = 'none';

                // Center the Yes button
                yesBtn.style.display = 'block';
                yesBtn.style.margin = '0 auto';
            }
        }
    });

    
    // Track the hide timeout so we can clear it on repeated clicks
    let messageTimeout = null;

    // Function to display message when "No" is clicked
    // If permanent is true, the message stays until Yes is clicked
    function showMessage(message, permanent) {
        const messageDiv = document.getElementById('no-message');
        if (messageDiv) {
            // Clear any existing timeout so it doesn't hide early
            if (messageTimeout) {
                clearTimeout(messageTimeout);
                messageTimeout = null;
            }

            messageDiv.textContent = message;
            messageDiv.classList.add('visible');

            if (!permanent) {
                // Hide message after 4 seconds
                messageTimeout = setTimeout(() => {
                    messageDiv.classList.remove('visible');
                    messageTimeout = null;
                }, 4000);
            }
        }
    }
    
    startGameBtn.addEventListener('click', startGame);

    backToStartBtn.addEventListener('click', function() {
        galleryScreen.classList.remove('active');
        proposalScreen.classList.add('active');
        resetGame();
        firstGameCompleted = false; // Reset the completion flag
        
        // Reset button scales and floating state
        noButtonScale = 1;
        yesButtonScale = 1;
        noClickCount = 0;

        const noBtnEl = document.getElementById('no-btn');
        if (noBtnEl) {
            noBtnEl.style.transform = '';
            noBtnEl.style.transition = '';
            noBtnEl.style.display = '';
        }
        yesBtn.style.transform = 'scale(1)';
        yesBtn.style.display = '';
        yesBtn.style.margin = '';
    });
    
    // Function to move the "No" button randomly
    function moveButton() {
        const container = document.querySelector('.buttons-container');
        const containerRect = container.getBoundingClientRect();

        // Calculate max positions within the container
        const maxX = containerRect.width - noBtn.offsetWidth - 20;
        const maxY = containerRect.height - noBtn.offsetHeight - 20;

        // Generate random positions (but not too far)
        const randomX = Math.floor(Math.random() * (maxX * 0.7)); // Keep within 70% of max
        const randomY = Math.floor(Math.random() * (maxY * 0.7)); // Keep within 70% of max

        // Apply new position
        noBtn.style.position = 'absolute';
        noBtn.style.left = randomX + 'px';
        noBtn.style.top = randomY + 'px';
        noBtn.classList.add('moving');

        // Remove the moving class after animation completes to allow repositioning
        setTimeout(() => {
            noBtn.classList.remove('moving');
        }, 300);
    }
    
    let heartSpawner;

    // Function to start the heart collection game
    function startGame() {
        gameActive = true;
        startGameBtn.disabled = true;
        heartsContainer.innerHTML = '';
        score = 0;
        heartsCollected = 0;
        timeLeft = 10;
        updateScore();
        updateTimer();

        // Create hearts periodically
        createHeart();
        heartSpawner = setInterval(createHeart, 500);

        // Start the countdown timer
        timer = setInterval(function() {
            timeLeft--;
            updateTimer();
            if (timeLeft <= 0) {
                clearInterval(timer);
                clearInterval(heartSpawner);
                endGame();
            }
        }, 1000);
    }
    
    // Function to update the timer display
    function updateTimer() {
        if (timerDisplay) {
            timerDisplay.textContent = `Time: ${timeLeft}s`;
        }
    }
    
    // Heart emojis for variety
    const gameHearts = ['❤️', '💖', '💗', '💓', '💕'];

    // Function to create a heart element at a random position
    function createHeart() {
        if (!gameActive) return;

        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = gameHearts[Math.floor(Math.random() * gameHearts.length)];

        // Random horizontal position
        const maxX = heartsContainer.clientWidth - 40;
        const randomX = Math.floor(Math.random() * maxX);
        heart.style.left = randomX + 'px';
        heart.style.top = '-40px';

        // Random size — bigger for easier tapping
        const randomSize = 2.5 + Math.random() * 1;
        heart.style.fontSize = `${randomSize}rem`;

        // Random fall duration (CSS animation) — 3s to 5s (slower)
        const duration = 3 + Math.random() * 2;
        heart.style.animationDuration = duration + 's';

        // Collect on tap/click
        heart.addEventListener('click', function(e) {
            if (!gameActive) return;

            // Burst animation
            const rect = this.getBoundingClientRect();
            const containerRect = heartsContainer.getBoundingClientRect();
            const cx = rect.left - containerRect.left + rect.width / 2;
            const cy = rect.top - containerRect.top + rect.height / 2;
            this.remove();
            createBurst(cx, cy);

            heartsCollected++;
            updateScore();
            if (heartsCollected >= 10) {
                clearInterval(timer);
                clearInterval(heartSpawner);
                endGame();
            }
        });

        heartsContainer.appendChild(heart);

        // Remove after animation ends
        heart.addEventListener('animationend', function() {
            if (heart.parentNode) heart.remove();
        });
    }

    // Create a burst of mini hearts when a heart is tapped
    function createBurst(x, y) {
        const burstEmojis = ['💕', '✨', '💗', '💖', '🥰'];
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'burst-particle';
            particle.textContent = burstEmojis[Math.floor(Math.random() * burstEmojis.length)];
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';

            // Random direction
            const angle = (Math.PI * 2 * i) / 6;
            const dist = 40 + Math.random() * 30;
            particle.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
            particle.style.setProperty('--ty', Math.sin(angle) * dist + 'px');

            heartsContainer.appendChild(particle);
            particle.addEventListener('animationend', function() {
                particle.remove();
            });
        }
    }
    
    
    // Function to update the score display
    function updateScore() {
        scoreCount.textContent = heartsCollected;
    }
    
    // Variable to track if first game is completed
    let firstGameCompleted = false;
    
    // Function to end the game and show the photo gallery
    function endGame() {
        gameActive = false;

        // Show the photo gallery if player collected enough hearts
        if (heartsCollected >= 10) {
            firstGameCompleted = true;

            // Show win message and confetti
            showWinMessage();
            createConfetti();

            setTimeout(function() {
                gameScreen.classList.remove('active');
                secondGameScreen.classList.add('active');
                initializeMemoryGame();
                // Clean up confetti
                document.querySelectorAll('.confetti').forEach(c => c.remove());
            }, 3000);
        } else {
            // Just reset the game if they didn't collect enough
            setTimeout(function() {
                resetGame();
            }, 500);
        }
    }

    // Show win message overlay
    function showWinMessage() {
        const msg = document.createElement('div');
        msg.className = 'win-message';
        msg.innerHTML = '💘 You stole my heart! 🥰💕';
        heartsContainer.appendChild(msg);
    }

    // Create confetti shower
    function createConfetti() {
        const confettiEmojis = ['🎉', '🎊', '💖', '💗', '✨', '💕', '🥰', '💘', '❤️', '🩷'];
        const container = heartsContainer;

        for (let i = 0; i < 40; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.textContent = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
            confetti.style.animationDuration = (1.5 + Math.random() * 2) + 's';
            confetti.style.animationDelay = (Math.random() * 0.8) + 's';
            container.appendChild(confetti);
        }
    }
    
    // Function to display photos in the gallery
    function showPhotos() {
        const photosContainer = document.getElementById('photos-container');
        photosContainer.innerHTML = '';

        photos.forEach(photoUrl => {
            const img = document.createElement('img');
            img.src = photoUrl;
            img.alt = 'Valentine Memory';
            img.className = 'photo';
            img.loading = 'lazy'; // Improve loading performance
            
            // Add click event to open modal
            img.addEventListener('click', function() {
                openModal(photoUrl);
            });
            
            // Handle image loading errors
            img.onerror = function() {
                // Fallback if image fails to load
                this.src = 'https://placehold.co/300x300/ffafbd/ffffff?text=Image+Not+Found';
                this.alt = 'Image not loaded';
            };
            
            photosContainer.appendChild(img);
        });
    }
    
    // Modal functionality
    const modal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.getElementById('close-modal');
    
    function openModal(imageSrc) {
        modalImg.src = imageSrc;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
    
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    });
    
    // Close modal when clicking outside the image
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        }
    });

    // Function to reset the game state
    function resetGame() {
        heartsContainer.innerHTML = '';
        score = 0;
        heartsCollected = 0;
        timeLeft = 10;
        updateScore();
        updateTimer();
        startGameBtn.disabled = false;
        gameActive = false;
        firstGameCompleted = false;
        if (heartSpawner) {
            clearInterval(heartSpawner);
        }

        if (timer) {
            clearInterval(timer);
        }
    }
    
    // Second game functionality - Memory Card Game
    const secondGameScreen = document.getElementById('second-game-screen');
    const gameBoard = document.getElementById('game-board');
    const movesDisplay = document.getElementById('moves');

    let moves = 0;
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    const totalPairs = 8; // 4x4 grid = 16 cards = 8 pairs
    
    // Initialize the memory game
    function initializeMemoryGame() {
        moves = 0;
        flippedCards = [];
        matchedPairs = 0;
        updateMovesDisplay();
        
        // Create card values (pairs of hearts)
        const emojis = ['❤️', '💖', '💘', '💝', '💗', '💓', '💞', '💕'];
        let gameEmojis = [...emojis, ...emojis]; // Duplicate for pairs
        gameEmojis = shuffleArray(gameEmojis);
        
        // Create the game board
        gameBoard.innerHTML = '';
        cards = [];
        
        for (let i = 0; i < gameEmojis.length; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.value = gameEmojis[i];
            card.dataset.index = i;
            
            card.addEventListener('click', flipCard);
            
            gameBoard.appendChild(card);
            cards.push(card);
        }
    }
    
    // Flip a card
    function flipCard() {
        const index = this.dataset.index;
        
        // Don't flip if already flipped or matched
        if (this.classList.contains('flipped') || this.classList.contains('matched') || flippedCards.length >= 2) {
            return;
        }
        
        // Flip the card
        this.classList.add('flipped');
        this.textContent = this.dataset.value;
        flippedCards.push(this);
        
        // Check for match when two cards are flipped
        if (flippedCards.length === 2) {
            moves++;
            updateMovesDisplay();
            
            const card1 = flippedCards[0];
            const card2 = flippedCards[1];
            
            if (card1.dataset.value === card2.dataset.value) {
                // Match found
                card1.classList.add('matched');
                card2.classList.add('matched');
                flippedCards = [];
                matchedPairs++;
                
                // Check for win
                if (matchedPairs === totalPairs) {
                    // Show win message
                    const msg = document.createElement('div');
                    msg.className = 'memory-win-message';
                    msg.innerHTML = '🧠✨ You are a genius! ✨💕';
                    gameBoard.parentNode.appendChild(msg);

                    // Launch fireworks
                    createFireworks(secondGameScreen);

                    setTimeout(() => {
                        msg.remove();
                        secondGameScreen.querySelectorAll('.fw-trail, .fw-particle').forEach(f => f.remove());
                        secondGameScreen.classList.remove('active');
                        balloonScreen.classList.add('active');
                    }, 5000);
                }
            } else {
                // No match, flip cards back after delay
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    card1.textContent = '';
                    card2.textContent = '';
                    flippedCards = [];
                }, 1000);
            }
        }
    }
    
    // Update moves display
    function updateMovesDisplay() {
        movesDisplay.textContent = moves;
    }
    
    // Utility function to shuffle array
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    // Create actual firework particle animation
    function createFireworks(container) {
        const colors = ['#ff4081', '#e040fb', '#ff6e40', '#ffab40', '#69f0ae', '#40c4ff', '#ffd740', '#ff1744'];

        function launchFirework() {
            // Random origin at bottom
            const originX = 10 + Math.random() * 80; // % from left
            const burstY = 10 + Math.random() * 40; // % from top where it bursts

            // Create the trail (rocket going up)
            const trail = document.createElement('div');
            trail.className = 'fw-trail';
            trail.style.left = originX + '%';
            trail.style.setProperty('--burst-y', burstY + '%');
            container.appendChild(trail);

            // After trail reaches top, create burst particles
            setTimeout(() => {
                if (trail.parentNode) trail.remove();
                const color = colors[Math.floor(Math.random() * colors.length)];
                const particleCount = 30 + Math.floor(Math.random() * 20);

                for (let i = 0; i < particleCount; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'fw-particle';
                    particle.style.left = originX + '%';
                    particle.style.top = burstY + '%';
                    particle.style.backgroundColor = color;
                    particle.style.boxShadow = `0 0 6px ${color}, 0 0 12px ${color}`;

                    const angle = (Math.PI * 2 * i) / particleCount;
                    const dist = 70 + Math.random() * 100;
                    particle.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
                    particle.style.setProperty('--ty', Math.sin(angle) * dist + 'px');

                    container.appendChild(particle);
                    particle.addEventListener('animationend', () => particle.remove());
                }
            }, 400);
        }

        // Launch multiple fireworks with staggered timing
        for (let i = 0; i < 6; i++) {
            setTimeout(launchFirework, i * 500);
        }
    }

    // ========== BALLOON DODGE GAME ==========
    const balloonArea = document.getElementById('balloon-area');
    const balloon = document.getElementById('balloon');
    const balloonTimerDisplay = document.getElementById('balloon-timer');
    const startBalloonBtn = document.getElementById('start-balloon-btn');
    const balloonMessage = document.getElementById('balloon-message');

    let balloonGameActive = false;
    let balloonTimer = null;
    let needleSpawner = null;
    let collisionChecker = null;
    let balloonTimeLeft = 30;

    startBalloonBtn.addEventListener('click', startBalloonGame);

    function startBalloonGame() {
        balloonGameActive = true;
        balloonTimeLeft = 30;
        startBalloonBtn.style.display = 'none';
        balloonMessage.textContent = '';
        balloonArea.classList.remove('hit');

        // Clear any existing needles
        balloonArea.querySelectorAll('.needle').forEach(n => n.remove());

        // Reset balloon position
        balloon.style.left = '50%';

        updateBalloonTimer();

        // Spawn needles
        needleSpawner = setInterval(spawnNeedle, 600);

        // Countdown
        balloonTimer = setInterval(function() {
            balloonTimeLeft--;
            updateBalloonTimer();

            // Last 10 seconds — increase difficulty
            if (balloonTimeLeft === 10) {
                clearInterval(needleSpawner);
                needleSpawner = setInterval(spawnNeedle, 350);
            }

            if (balloonTimeLeft <= 0) {
                balloonWin();
            }
        }, 1000);

        // Collision detection loop
        collisionChecker = requestAnimationFrame(checkCollisions);
    }

    function updateBalloonTimer() {
        balloonTimerDisplay.textContent = `⏳ ${balloonTimeLeft}s`;
    }

    // Balloon follows mouse/touch
    balloonArea.addEventListener('mousemove', function(e) {
        if (!balloonGameActive) return;
        const rect = balloonArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const clamped = Math.max(20, Math.min(x, rect.width - 20));
        balloon.style.left = clamped + 'px';
        balloon.style.transform = 'translateX(-50%)';
    });

    balloonArea.addEventListener('touchmove', function(e) {
        if (!balloonGameActive) return;
        e.preventDefault();
        const rect = balloonArea.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const clamped = Math.max(20, Math.min(x, rect.width - 20));
        balloon.style.left = clamped + 'px';
        balloon.style.transform = 'translateX(-50%)';
    }, { passive: false });

    function spawnNeedle() {
        if (!balloonGameActive) return;

        const needle = document.createElement('div');
        needle.className = 'needle';
        needle.innerHTML = '<span>📌</span>';

        const maxX = balloonArea.clientWidth - 30;
        needle.style.left = Math.floor(Math.random() * maxX) + 'px';
        needle.style.top = '-30px';

        // Faster fall in last 10 seconds
        const duration = balloonTimeLeft <= 10 ? (1 + Math.random() * 1) : (2 + Math.random() * 2);
        needle.style.animationDuration = duration + 's';

        balloonArea.appendChild(needle);

        needle.addEventListener('animationend', function() {
            if (needle.parentNode) needle.remove();
        });
    }

    function checkCollisions() {
        if (!balloonGameActive) return;

        const bRect = balloon.getBoundingClientRect();
        // Shrink balloon hitbox for fairness
        const bHitbox = {
            left: bRect.left + 8,
            right: bRect.right - 8,
            top: bRect.top + 8,
            bottom: bRect.bottom - 5
        };

        const needles = balloonArea.querySelectorAll('.needle');
        for (const needle of needles) {
            const nRect = needle.getBoundingClientRect();
            // Check overlap
            if (
                bHitbox.left < nRect.right &&
                bHitbox.right > nRect.left &&
                bHitbox.top < nRect.bottom &&
                bHitbox.bottom > nRect.top
            ) {
                balloonGameOver();
                return;
            }
        }

        collisionChecker = requestAnimationFrame(checkCollisions);
    }

    function balloonGameOver() {
        balloonGameActive = false;
        clearInterval(balloonTimer);
        clearInterval(needleSpawner);
        balloonArea.classList.add('hit');
        balloonMessage.textContent = 'You popped my heart 😭💔 Try again!';
        startBalloonBtn.textContent = 'Retry';
        startBalloonBtn.style.display = '';
    }

    function balloonWin() {
        balloonGameActive = false;
        clearInterval(balloonTimer);
        clearInterval(needleSpawner);
        if (collisionChecker) cancelAnimationFrame(collisionChecker);

        // Clear needles
        balloonArea.querySelectorAll('.needle').forEach(n => n.remove());

        // Show win message popup
        const msg = document.createElement('div');
        msg.className = 'balloon-win-message';
        msg.innerHTML = '🛡️💖 You saved my heart! 💖🥰';
        balloonScreen.appendChild(msg);

        // Confetti shower
        createRealConfetti(balloonScreen);

        setTimeout(function() {
            msg.remove();
            balloonScreen.querySelectorAll('.real-confetti').forEach(c => c.remove());
            balloonScreen.classList.remove('active');
            galleryScreen.classList.add('active');
            showPhotos();
        }, 4000);
    }

    // Actual confetti shower with colored strips
    function createRealConfetti(container) {
        const colors = ['#ff4081', '#e040fb', '#448aff', '#69f0ae', '#ffd740', '#ff6e40', '#f50057', '#00e5ff'];

        for (let i = 0; i < 60; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'real-confetti';
            const color = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.backgroundColor = color;
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.width = (5 + Math.random() * 5) + 'px';
            confetti.style.height = (10 + Math.random() * 15) + 'px';
            confetti.style.animationDuration = (1.5 + Math.random() * 2) + 's';
            confetti.style.animationDelay = (Math.random() * 1.5) + 's';
            // Random horizontal drift
            const drift = -30 + Math.random() * 60;
            confetti.style.setProperty('--drift', drift + 'px');
            container.appendChild(confetti);
        }
    }

    // ========== DEBUG SHORTCUTS ==========
    // Ctrl+Shift+N — trigger win animation + auto-transition to next screen
    // Ctrl+Shift+S — instant skip (no animation)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'N') {
            e.preventDefault();

            if (gameScreen.classList.contains('active')) {
                // Trigger catch my love win
                gameActive = false;
                clearInterval(timer);
                clearInterval(heartSpawner);
                heartsCollected = 10;
                updateScore();
                showWinMessage();
                createConfetti();
                setTimeout(function() {
                    gameScreen.classList.remove('active');
                    document.querySelectorAll('.confetti').forEach(c => c.remove());
                    secondGameScreen.classList.add('active');
                    initializeMemoryGame();
                }, 3000);
            } else if (secondGameScreen.classList.contains('active')) {
                // Trigger heart match win
                const msg = document.createElement('div');
                msg.className = 'memory-win-message';
                msg.innerHTML = '🧠✨ You are a genius! ✨💕';
                gameBoard.parentNode.appendChild(msg);
                createFireworks(secondGameScreen);
                setTimeout(() => {
                    msg.remove();
                    secondGameScreen.querySelectorAll('.fw-trail, .fw-particle').forEach(f => f.remove());
                    secondGameScreen.classList.remove('active');
                    balloonScreen.classList.add('active');
                }, 5000);
            } else if (balloonScreen.classList.contains('active')) {
                // Trigger balloon win
                balloonGameActive = false;
                clearInterval(balloonTimer);
                clearInterval(needleSpawner);
                if (collisionChecker) cancelAnimationFrame(collisionChecker);
                balloonArea.querySelectorAll('.needle').forEach(n => n.remove());

                const msg = document.createElement('div');
                msg.className = 'balloon-win-message';
                msg.innerHTML = '🛡️💖 You saved my heart! 💖🥰';
                balloonScreen.appendChild(msg);
                createRealConfetti(balloonScreen);

                setTimeout(function() {
                    msg.remove();
                    balloonScreen.querySelectorAll('.real-confetti').forEach(c => c.remove());
                    balloonScreen.classList.remove('active');
                    galleryScreen.classList.add('active');
                    showPhotos();
                }, 4000);
            }
        }

        // Instant skip — no animations
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();

            if (gameScreen.classList.contains('active')) {
                gameActive = false;
                clearInterval(timer);
                clearInterval(heartSpawner);
                gameScreen.classList.remove('active');
                secondGameScreen.classList.add('active');
                initializeMemoryGame();
            } else if (secondGameScreen.classList.contains('active')) {
                secondGameScreen.classList.remove('active');
                balloonScreen.classList.add('active');
            } else if (balloonScreen.classList.contains('active')) {
                balloonGameActive = false;
                clearInterval(balloonTimer);
                clearInterval(needleSpawner);
                if (collisionChecker) cancelAnimationFrame(collisionChecker);
                balloonScreen.classList.remove('active');
                galleryScreen.classList.add('active');
                showPhotos();
            }
        }
    });

    // ========== LOVE ANIMATION ==========

    // Function to create love animation background
    function createLoveAnimation() {
        const container = document.getElementById('love-hearts');
        const heartEmojis = ['❤️', '💖', '💘', '💝', '💗', '💓', '💞', '💕'];
        
        // Create 30 hearts initially
        for (let i = 0; i < 30; i++) {
            createFloatingHeart(container, heartEmojis);
        }
        
        // Create new hearts periodically
        setInterval(() => {
            createFloatingHeart(container, heartEmojis);
        }, 800);
    }
    
    // Function to create a single floating heart
    function createFloatingHeart(container, heartEmojis) {
        const heart = document.createElement('div');
        heart.className = 'love-heart';
        
        // Random heart emoji
        const randomHeart = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        heart.textContent = randomHeart;
        
        // Random position
        const startPos = Math.random() * 100;
        heart.style.left = `${startPos}%`;
        
        // Random size
        const size = 1.5 + Math.random() * 1.5; // Between 1.5x and 3x
        heart.style.fontSize = `${size}rem`;
        
        // Random animation duration
        const duration = 8 + Math.random() * 12; // Between 8-20 seconds
        heart.style.animationDuration = `${duration}s`;
        
        container.appendChild(heart);
        
        // Remove heart after animation completes to prevent too many elements
        setTimeout(() => {
            if (heart.parentNode) {
                heart.remove();
            }
        }, duration * 1000);
    }
});