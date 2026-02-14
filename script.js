document.addEventListener('DOMContentLoaded', function() {
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
    
    // Make the "No" button move when hovered or clicked
    noBtn.addEventListener('mouseover', moveButton);
    noBtn.addEventListener('mousemove', moveButton);
    noBtn.addEventListener('click', function(e) {
        if (!this.classList.contains('moving')) {
            moveButton();
            e.preventDefault(); // Prevent default button click behavior
        }
    });
    
    startGameBtn.addEventListener('click', startGame);
    
    backToStartBtn.addEventListener('click', function() {
        galleryScreen.classList.remove('active');
        proposalScreen.classList.add('active');
        resetGame();
        firstGameCompleted = false; // Reset the completion flag
    });
    
    // Function to move the "No" button randomly
    function moveButton() {
        const container = document.querySelector('.buttons-container');
        const containerRect = container.getBoundingClientRect();
        
        // Calculate max positions within the container
        const maxX = containerRect.width - noBtn.offsetWidth - 20;
        const maxY = containerRect.height - noBtn.offsetHeight - 20;
        
        // Generate random positions
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);
        
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
    
    // Function to start the heart collection game
    function startGame() {
        gameActive = true;
        startGameBtn.disabled = true;
        heartsContainer.innerHTML = ''; // Clear previous hearts
        score = 0;
        heartsCollected = 0;
        timeLeft = 10; // Changed to 10 seconds
        updateScore();
        updateTimer();
        
        // Create initial hearts
        createHeart();
        
        // Create new hearts periodically
        setInterval(createHeart, 600); // Hearts appear every 600ms
        
        // Start the countdown timer
        timer = setInterval(function() {
            timeLeft--;
            updateTimer();
            
            if (timeLeft <= 0) {
                clearInterval(timer);
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
    
    // Function to create a heart element at a random position
    function createHeart() {
        if (!gameActive) return;
        
        const heart = document.createElement('div');
        heart.className = 'heart falling-heart';
        heart.innerHTML = '❤️';
        
        // Random horizontal position at the top
        const maxX = heartsContainer.clientWidth - 50;
        const randomX = Math.floor(Math.random() * maxX);
        
        heart.style.left = randomX + 'px';
        heart.style.top = '-50px'; // Start above the container
        
        // Random size to make it more challenging (slightly smaller)
        const randomSize = 0.9 + Math.random() * 0.6; // Between 0.9x and 1.5x size
        heart.style.fontSize = `${randomSize}rem`;
        
        // Add click event to collect the heart
        heart.addEventListener('click', function() {
            if (!gameActive) return;
            
            // Remove the heart
            this.remove();
            
            // Increase score
            heartsCollected++;
            updateScore();
            
            // Check if goal is reached (now based on time and score)
            if (heartsCollected >= 10) { // Target of 10 hearts
                clearInterval(timer);
                endGame();
            }
        });
        
        heartsContainer.appendChild(heart);

        // Animate the heart falling
        const fallSpeed = 1 + Math.random() * 4; // Random speed between 1-5px per frame
        const fallInterval = setInterval(() => {
            if (!gameActive || !heart.parentNode) {
                clearInterval(fallInterval);
                return;
            }

            // Get current position
            const currentTop = parseInt(heart.style.top);
            const newTop = currentTop + fallSpeed;

            // Update position (allow going past bottom, will be removed by timeout)
            heart.style.top = newTop + 'px';
        }, 30); // Update every 30ms for smooth animation

        // Auto-remove heart after exactly 2 seconds
        setTimeout(() => {
            if (heart.parentNode && gameActive) {
                clearInterval(fallInterval); // Stop falling
                heart.remove();
            }
        }, 2000); // Heart disappears after 2 seconds if not caught
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
            setTimeout(function() {
                gameScreen.classList.remove('active');
                // Don't show photos yet - wait for second game completion
                // Instead, show the second game screen
                secondGameScreen.classList.add('active');
                initializeMemoryGame();
            }, 1500);
        } else {
            // Just reset the game if they didn't collect enough
            setTimeout(function() {
                resetGame();
            }, 500);
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
            
            // Add click event to open modal
            img.addEventListener('click', function() {
                openModal(photoUrl);
            });
            
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
        timeLeft = 30;
        updateScore();
        updateTimer();
        startGameBtn.disabled = false;
        gameActive = false;
        firstGameCompleted = false; // Reset the completion flag

        if (timer) {
            clearInterval(timer);
        }
    }
    
    // Second game functionality - Memory Card Game
    const secondGameScreen = document.getElementById('second-game-screen');
    const backToGalleryBtn = document.getElementById('back-to-gallery');
    const gameBoard = document.getElementById('game-board');
    const movesDisplay = document.getElementById('moves');
    
    let moves = 0;
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    const totalPairs = 8; // 4x4 grid = 16 cards = 8 pairs
    
    
    backToGalleryBtn.addEventListener('click', function() {
        secondGameScreen.classList.remove('active');
        // Go back to the photos screen since first game was completed
        galleryScreen.classList.add('active');
        // Reset game board when leaving
        gameBoard.innerHTML = '';
    });
    
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
                    setTimeout(() => {
                        // Player wins! Show the photos
                        secondGameScreen.classList.remove('active');
                        galleryScreen.classList.add('active');
                        showPhotos();
                        
                        // Optionally, you could add a celebration effect here
                    }, 500);
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
});