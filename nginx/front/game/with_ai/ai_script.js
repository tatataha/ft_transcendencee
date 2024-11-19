// Global Variables
var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

var rounds = [5];
var colors = ['#1abc9c', '#2ecc71', '#3498db', '#8c52ff', '#9b59b6'];

// The ball object (The cube that bounces back and forth)
var Ball = {
    new: function (incrementedSpeed) {
        return {
            width: 18,
            height: 18,
            x: (this.canvas.width / 2) - 9,
            y: (this.canvas.height / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: incrementedSpeed || 7
        };
    }
};

// The ai object (The two lines that move up and down)
var Ai = {
    new: function (side) {
        return {
            width: 18,
            height: 180,
            x: side === 'left' ? 150 : this.canvas.width - 150,
            y: (this.canvas.height / 2) - 35,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 8
        };
    }
};

var level = null;
var isLevelSelected = false;

var Game = {



    initialize: function () {

        this.level = null;
        this.isLevelSelected = false;

        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.width = 1400;
        this.canvas.height = 1000;

        this.canvas.style.width = (this.canvas.width / 2) + 'px';
        this.canvas.style.height = (this.canvas.height / 2) + 'px';

        this.player = Ai.new.call(this, 'left');
        this.ai = Ai.new.call(this, 'right');
        this.ball = Ball.new.call(this);

        this.ai.speed = 5;
        this.running = this.over = false;
        this.turn = this.ai;
        this.timer = this.round = 0;
        this.color = '#8D5DFE';

        // Zorluk menüsünü göster
        //this.selectDifficulty();
        this.isLevelSelected = true;
        this.level = 'hard'
        this.startGame(13,13,10);
    },


    selectDifficulty: function () {
        // Clear canvas for the difficulty menu
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Display title
        this.context.font = '50px Courier New';
        this.context.fillStyle = '#8D5DFE';
        this.context.textAlign = 'center';
        this.context.fillText('Select Difficulty:', this.canvas.width / 2, this.canvas.height / 2 - 100);

        // Create a container to hold the buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'difficulty-buttons';
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.top = '50%';
        buttonContainer.style.left = '50%';
        buttonContainer.style.transform = 'translate(-50%, -50%)';

        // Difficulty levels
        const difficulties = [
            { label: 'Easy', level: 1, speeds: [7, 7, 3] },
            { label: 'Medium', level: 2, speeds: [10, 10, 5] },
            { label: 'Hard', level: 3, speeds: [13, 13, 7] }
        ];

        difficulties.forEach((difficulty, index) => {
            const button = document.createElement('button');
            //add button id
            button.id = 'difficulty-button-' + index;
            button.textContent = difficulty.label;
            button.style.fontSize = '20px';
            button.style.padding = '10px 20px';
            button.style.marginBottom = '10px';
            button.style.cursor = 'pointer';
            button.style.backgroundColor = '#8D5DFE';
            button.style.color = 'white';
            button.style.border = 'none';

            // Button click event
            button.addEventListener('click', () => {
                document.body.removeChild(buttonContainer);  // Remove the button container
                this.isLevelSelected = true;
                this.level = difficulty.level;
                console.log(`Seviye seçildi: ${difficulty.label}`);
                if(this.isLevelSelected)
                    this.startGame(difficulty.speeds[0], difficulty.speeds[1], difficulty.speeds[2]);
                else
                    console.log('Seviye seçilmedi!');
            });

            // Add button to the container
            buttonContainer.appendChild(button);
        });
        // Add the button container to the body
        document.body.appendChild(buttonContainer);
    },

    startGame: function (playerSpeed, aiSpeed, ballSpeed) {

        if (!this.isLevelSelected) {
            console.log('Lütfen bir seviye seçin!');
            return; // Seviye seçilmeden oyun başlamaz
        }

        console.log("oyun leveli: " + this.isLevelSelected);
        this.color = '#8D5DFE';
        this.player.speed = playerSpeed;
        this.ai.speed = aiSpeed;
        this.ball.speed = ballSpeed;

        clearInterval(this.speedInterval); // Clear the interval if it's already running

        const increaseSpeed = () => {

            if(this.ball.speed <= 20 && Pong.running === true)
            {
            this.ball.speed += 1;
            this.player.speed += 1;
            this.ai.speed += 1;

            let colorIntensity = Math.max(0, 141 - this.ball.speed * 5);  // Hız arttıkça renk koyulaşır
            this.color = `rgb(${colorIntensity}, 93, 254)`;

            console.log(`Hızlar güncellendi! Top: ${this.ball.speed}, Raket: ${this.player.speed}, AI: ${this.ai.speed}`);
            }
        };


        // 10 saniyede bir hız artıran interval
        this.speedInterval = setInterval(increaseSpeed, 10000);


        Pong.menu();
        Pong.listen();
    },

    endGameMenu: async function (text) {
        await fetch('https://127.0.0.1/pong-game/game_over/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({
                opponent: `AI ${Pong.level}`,
                user_score: Pong.player.score,
                opponent_score: Pong.ai.score,
            }),
        })
        // Change the canvas font size and color
        clearInterval(this.speedInterval);

        Pong.context.font = '45px Courier New';
        Pong.context.fillStyle = this.color;

        // Draw the rectangle behind the 'Press any key to begin' text.
        Pong.context.fillRect(
            Pong.canvas.width / 2 - 350,
            Pong.canvas.height / 2 - 48,
            700,
            100
        );

        // Change the canvas color;
        Pong.context.fillStyle = '#ffffff';

        // Draw the end game menu text ('Game Over' and 'Winner')
        Pong.context.fillText(text,
            Pong.canvas.width / 2,
            Pong.canvas.height / 2 + 15
        );


        setTimeout(function () {
            Pong = Object.assign({}, Game);
            Pong.initialize();
        }, 3000);
    },

    menu: function () {
        // Draw all the Pong objects in their current state
        Pong.draw();

        // Change the canvas font size and color
        this.context.font = '50px Courier New';
        this.context.fillStyle = this.color;

        // Draw the rectangle behind the 'Press any key to begin' text.
        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );

        // Change the canvas color;
        this.context.fillStyle = '#ffffff';

        // Draw the 'press any key to begin' text
        this.context.fillText('Press any key to begin',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );
    },

    // Update all objects (move the player, ai, ball, increment the score, etc.)
    update: function () {
        if (!this.over && this.isLevelSelected) {

            let baseColor = { r: 141, g: 93, b: 254 };
            let decrement = Math.min(this.ball.speed, 20);  // Max limit
            this.color = `rgb(${baseColor.r - decrement * 5}, ${baseColor.g - decrement * 3}, ${baseColor.b - decrement * 2})`;


            // If the ball collides with the bound limits - correct the x and y coords.
            if (this.ball.x <= 0) Pong._resetTurn.call(this, this.ai, this.player);
            if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.ai);
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

            // Move player if they player.move value was updated by a keyboard event
            if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
            else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;

            // On new serve (start of each turn) move the ball to the correct side
            // and randomize the direction to add some challenge.
            if (Pong._turnDelayIsOver.call(this) && this.turn) {
                this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                this.turn = null;
            }

            // If the player collides with the bound limits, update the x and y coords.
            if (this.player.y <= 0) this.player.y = 0;
            else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);

            // Move ball in intended direction based on moveY and moveX values
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

            // Handle ai (AI) UP and DOWN movement
            if (this.ai.y > this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y -= this.ai.speed / 1.5;
                else this.ai.y -= this.ai.speed / 4;
            }
            if (this.ai.y < this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y += this.ai.speed / 1.5;
                else this.ai.y += this.ai.speed / 4;
            }
            this.ai.y += 4;
            // Handle ai (AI) wall collision
            if (this.ai.y >= this.canvas.height - this.ai.height) this.ai.y = this.canvas.height - this.ai.height;
            else if (this.ai.y <= 0) this.ai.y = 0;

            // Handle Player-Ball collisions
            if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
                if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
                    this.ball.x = (this.player.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;

                }
            }

            // Handle ai-ball collision
            if (this.ball.x - this.ball.width <= this.ai.x && this.ball.x >= this.ai.x - this.ai.width) {
                if (this.ball.y <= this.ai.y + this.ai.height && this.ball.y + this.ball.height >= this.ai.y) {
                    this.ball.x = (this.ai.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;

                }
            }
        }
        // Handle the end of round transition
        // Check to see if the player won the round.
        if (this.player.score === rounds[this.round]) {
            // Check to see if there are any more rounds/levels left and display the victory screen if
            // there are not.
            if (!rounds[this.round + 1]) {
                this.over = true;
                this.isLevelSelected = false;
                setTimeout(function () { Pong.endGameMenu('Winner!'); }, 1000);
            } else {
                // If there is another round, reset all the values and increment the round number.
                this.color = '#A381F2'
                this.player.score = this.ai.score = 0;
                this.player.speed += 0.5;
                this.ai.speed += 1;
                this.ball.speed += 1;
                this.round += 1;

            }
        }
        // Check to see if the ai/AI has won the round.
        else if (this.ai.score === rounds[this.round]) {
            this.over = true;
            this.isLevelSelected = false;
            setTimeout(function () { Pong.endGameMenu('Game Over!'); }, 1000);
        }
    },

    // Draw the objects to the canvas element
    draw: function () {

        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // Set the fill style to black
        this.context.fillStyle = this.color;

        // Draw the background
        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // Set the fill style to white (For the paddles and the ball)
        this.context.fillStyle = '#ffffff';

        // Draw the Player
        this.context.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );

        // Draw the Ai
        this.context.fillRect(
            this.ai.x,
            this.ai.y,
            this.ai.width,
            this.ai.height
        );

        // Draw the Ball
        if (Pong._turnDelayIsOver.call(this)) {
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height
            );
        }

        // Draw the net (Line in the middle)
        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
        this.context.lineTo((this.canvas.width / 2), 140);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();


        // Sol üst köşeye Player 1 yazısı
        this.context.font = '40px Courier New';  // Daha küçük font ayarı
        this.context.textAlign = 'left';  // Sol hizalama
        this.context.fillText(
            'Player 1',
            200,  // Sol üst köşe için x değeri
            50   // Yükseklik, ekranın üst kısmı
        );

        // Sağ üst köşeye Player 2 yazısı
        this.context.textAlign = 'right';  // Sağ hizalama
        this.context.fillText(
            'ROBERT',
            this.canvas.width - 200,  // Sağ üst köşe için x değeri
            50   // Yükseklik, ekranın üst kısmı
        );

        this.context.font = '100px Courier New';
        this.context.textAlign = 'center';

        // Draw the players score (left)
        this.context.fillText(
            this.player.score.toString(),
            (this.canvas.width / 2) - 300,
            200
        );

        // Draw the paddles score (right)
        this.context.fillText(
            this.ai.score.toString(),
            (this.canvas.width / 2) + 300,
            200
        );

        // Change the font size for the center score text
        this.context.font = '30px Courier New';

        if(Pong.level === 1)
        {
            this.context.fillText(
                'EASY',
                (this.canvas.width / 2),
                35
            );
        }
        else if(Pong.level === 2)
        {
            this.context.fillText(
                'MEDIUM',
                (this.canvas.width / 2),
                35
            );
        }
        else if(Pong.level === 3)
        {
            this.context.fillText(
                'HARD',
                (this.canvas.width / 2),
                35
            );
        }


        // Change the font size for the center score value
        this.context.font = '40px Courier';

        // Draw the current round number
        this.context.fillText(
            rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
            (this.canvas.width / 2),
            100
        );
    },

    loop: function () {
        Pong.update();
        Pong.draw();

        // If the game is not over, draw the next frame.
        if (!Pong.over) requestAnimationFrame(Pong.loop);
    },

    listen: function () {
        document.addEventListener('keydown', function (key) {
            // Handle the 'Press any key to begin' function and start the game.
            if (Pong.running === false && Pong.isLevelSelected === true) {

                Pong.running = true;
                window.requestAnimationFrame(Pong.loop);
            }

            // Handle up arrow and w key events
            if (key.keyCode === 38 || key.keyCode === 87) Pong.player.move = DIRECTION.UP;

            // Handle down arrow and s key events
            if (key.keyCode === 40 || key.keyCode === 83) Pong.player.move = DIRECTION.DOWN;
        });

        // Stop the player from moving when there are no keys being pressed.
        document.addEventListener('keyup', function (key) { Pong.player.move = DIRECTION.IDLE; });
    },

    // Reset the ball location, the player turns and set a delay before the next round begins.
    _resetTurn: function(victor, loser) {
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();

        victor.score++;
    },

    // Wait for a delay to have passed after each turn.
    _turnDelayIsOver: function() {
        return ((new Date()).getTime() - this.timer >= 1000);
    },

};

var Pong = Object.assign({}, Game);
Pong.initialize();
