// Global Variables
const DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

const rounds = [5];

// The ball object
const Ball = {
    new: function (canvasWidth, canvasHeight, incrementedSpeed) {
        return {
            width: 18,
            height: 18,
            x: (canvasWidth / 2) - 9,
            y: (canvasHeight / 2) - 9,
            moveX: DIRECTION.IDLE,  // Ball's initial direction X (left/right)
            moveY: DIRECTION.IDLE,  // Ball's initial direction Y (up/down)
            speed: incrementedSpeed || 7
        };
    }
};

// The player object
const Player = {
    new: function (side, canvasWidth, canvasHeight) {
        const xPosition = side === 'left' ? 50 : canvasWidth - 50 - 18;
        return {
            width: 18,
            height: 180,
            x: xPosition,
            y: (canvasHeight / 2) - 90,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 8
        };
    }
};

const Game = {
    initialize: function () {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.width = 1400;
        this.canvas.height = 1000;

        this.canvas.style.width = (this.canvas.width / 2) + 'px';
        this.canvas.style.height = (this.canvas.height / 2) + 'px';

        this.player1 = Player.new.call(this, 'left', this.canvas.width, this.canvas.height);
        this.player2 = Player.new.call(this, 'right', this.canvas.width, this.canvas.height);
        this.ball = Ball.new.call(this, this.canvas.width, this.canvas.height);

        this.running = this.over = false;
        this.turn = this.player1; // Başlangıçta topu hareket ettirecek oyuncuyu seçtik
        this.timer = this.round = 0;
        this.color = '#8c52ff';

        this.menu();
        this.listen();
    },

    endGameMenu: async function (text) {
        this.context.font = '45px Courier New';
        this.context.fillStyle = this.color;

        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );

        this.context.fillStyle = '#ffffff';
        this.context.fillText(text,
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );

        setTimeout(() => {
            Object.assign(Pong, Game);
            Pong.initialize();
        }, 3000);
    },

    menu: function () {
        this.draw();

        this.context.font = '50px Courier New';
        this.context.fillStyle = this.color;

        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );

        this.context.fillStyle = '#ffffff';
        this.context.fillText('Press any key to begin',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );
    },

    update: function () {
        if (!this.over) {
            // Topun sol veya sağ kenara çarpması
            if (this.ball.x <= 0) this._resetTurn(this.player2, this.player1);
            if (this.ball.x >= this.canvas.width - this.ball.width) this._resetTurn(this.player1, this.player2);

            // Topun üst veya alt kenara çarpması
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

            // Oyuncuların hareketi
            if (this.player1.move === DIRECTION.UP) this.player1.y -= this.player1.speed;
            else if (this.player1.move === DIRECTION.DOWN) this.player1.y += this.player1.speed;

            if (this.player2.move === DIRECTION.UP) this.player2.y -= this.player2.speed;
            else if (this.player2.move === DIRECTION.DOWN) this.player2.y += this.player2.speed;

            // Oyuncuların kenarlara çarpmasını önleme
            this.player1.y = Math.max(0, Math.min(this.player1.y, this.canvas.height - this.player1.height));
            this.player2.y = Math.max(0, Math.min(this.player2.y, this.canvas.height - this.player2.height));

            // Yeni servis başlangıcı: Başlangıçta topu harekete geçirme
            if (this._turnDelayIsOver() && this.turn) {
                // Servisi başlatan oyuncuya göre topun yönünü ayarla
                this.ball.moveX = this.turn === this.player1 ? DIRECTION.RIGHT : DIRECTION.LEFT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())]; // Yön rastgele yukarı/aşağı
                this.turn = null; // Servis atıldıktan sonra servis atan yok
            }

            // Topun hareketi
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

            // Player1 ve top arasındaki çarpışma
            if (this._isColliding(this.player1, this.ball)) {
                this.ball.x = this.player1.x + this.player1.width;
                this.ball.moveX = DIRECTION.RIGHT;
            }

            // Player2 ve top arasındaki çarpışma
            if (this._isColliding(this.player2, this.ball)) {
                this.ball.x = this.player2.x - this.ball.width;
                this.ball.moveX = DIRECTION.LEFT;
            }
        }

        // Round sonu kontrolü
        if (this.player1.score === rounds[this.round]) {
            if (!rounds[this.round + 1]) {
                this.over = true;
                setTimeout(() => { this.endGameMenu('Player 1 Wins!'); }, 1000);
            } else {
                this._nextRound();
            }
        } else if (this.player2.score === rounds[this.round]) {
            this.over = true;
            setTimeout(() => { this.endGameMenu('Player 2 Wins!'); }, 1000);
        }
    },

    draw: function () {
        // Tuvali temizle
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // Arka planı çiz
        this.context.fillStyle = this.color;
        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // Paddle'lar ve top için beyaz renk
        this.context.fillStyle = '#ffffff';

        // Player 1'i çiz
        this.context.fillRect(
            this.player1.x,
            this.player1.y,
            this.player1.width,
            this.player1.height
        );

        // Player 2'yi çiz
        this.context.fillRect(
            this.player2.x,
            this.player2.y,
            this.player2.width,
            this.player2.height
        );

        // Topu çiz
        if (this._turnDelayIsOver() && this.turn === null) {
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height
            );
        }

        // Ortadaki çizgiyi çiz
        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 50);
        this.context.lineTo((this.canvas.width / 2), 50);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();

        // Sol üst köşeye Player 1 yazısı
        this.context.font = '40px Courier New';  // Daha küçük font ayarı
        this.context.textAlign = 'left';  // Sol hizalama
        this.context.fillText(
            'Player 1',
            70,  // Sol üst köşe için x değeri
            50   // Yükseklik, ekranın üst kısmı
        );

        // Sağ üst köşeye Player 2 yazısı
        this.context.textAlign = 'right';  // Sağ hizalama
        this.context.fillText(
            'Player 2',
            this.canvas.width - 70,  // Sağ üst köşe için x değeri
            50   // Yükseklik, ekranın üst kısmı
        );
        // Skorları çiz
        this.context.font = '100px Courier New';
        this.context.textAlign = 'center';
        this.context.fillText(
            this.player1.score.toString(),
            (this.canvas.width / 2) - 300,
            200
        );
        this.context.fillText(
            this.player2.score.toString(),
            (this.canvas.width / 2) + 300,
            200
        );

        // Round bilgisi
        this.context.font = '30px Courier New';
        this.context.fillText(
            'Round ' + (this.round + 1),
            (this.canvas.width / 2),
            35
        );
    },

    loop: function () {
        this.update();
        this.draw();

        if (!this.over) requestAnimationFrame(this.loop.bind(this));
    },

    listen: function () {
        document.addEventListener('keydown', (key) => {
            if (!this.running) {
                this.running = true;
                this.turn = this.player1; // İlk top hareketini başlatan oyuncu
                this.ball = Ball.new.call(this, this.canvas.width, this.canvas.height);
                this.loop();
            }

            // Player 1 (W ve S tuşları)
            if (key.key === 'w' || key.key === 'W') this.player1.move = DIRECTION.UP;
            if (key.key === 's' || key.key === 'S') this.player1.move = DIRECTION.DOWN;

            // Player 2 (Yukarı ve Aşağı ok tuşları)
            if (key.key === 'ArrowUp') this.player2.move = DIRECTION.UP;
            if (key.key === 'ArrowDown') this.player2.move = DIRECTION.DOWN;
        });

        document.addEventListener('keyup', (key) => {
            if (key.key === 'w' || key.key === 'W') this.player1.move = DIRECTION.IDLE;
            if (key.key === 's' || key.key === 'S') this.player1.move = DIRECTION.IDLE;
            if (key.key === 'ArrowUp') this.player2.move = DIRECTION.IDLE;
            if (key.key === 'ArrowDown') this.player2.move = DIRECTION.IDLE;
        });
    },

    _resetTurn: function (victor, loser) {
        this.ball = Ball.new.call(this, this.canvas.width, this.canvas.height, this.ball.speed);
        this.turn = loser;
        this.timer = Date.now();

        victor.score++;
    },

    _turnDelayIsOver: function () {
        return ((Date.now() - this.timer) >= 1000);
    },

    _generateRoundColor: function () {
        const newColor = colors[Math.floor(Math.random() * colors.length)];
        return newColor === this.color ? this._generateRoundColor() : newColor;
    },

    _isColliding: function (player, ball) {
        return (
            ball.x < player.x + player.width &&
            ball.x + ball.width > player.x &&
            ball.y < player.y + player.height &&
            ball.y + ball.height > player.y
        );
    },

    _nextRound: function () {
        this.color = this._generateRoundColor();
        this.player1.score = this.player2.score = 0;
        this.player1.speed += 0.5;
        this.player2.speed += 0.5;
        this.ball.speed += 1;
        this.round += 1;
    }
};

const Pong = Object.assign({}, Game);
Pong.initialize();
