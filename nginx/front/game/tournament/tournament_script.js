const DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

const rounds = [5];

let players = [];
let activePlayers = [];
let winnerBracket = [];

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
    new: function (side, name, canvasWidth, canvasHeight) {
        const xPosition = side === 'left' ? 50 : canvasWidth - 50 - 18;
        return {
            name: name,
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
        document.querySelector('canvas').style.visibility = 'visible';
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.width = 1400;
        this.canvas.height = 1000;

        this.canvas.style.width = (this.canvas.width / 2) + 'px';
        this.canvas.style.height = (this.canvas.height / 2) + 'px';

        // Oyuncu isimlerini localStorage'dan al
        players = JSON.parse(localStorage.getItem('players'));

        // 4 oyuncuyu oluştur
        this.player1 = Player.new.call(this, 'left', players[0], this.canvas.width, this.canvas.height);
        this.player2 = Player.new.call(this, 'right', players[1], this.canvas.width, this.canvas.height);
        this.player3 = Player.new.call(this, 'left', players[2], this.canvas.width, this.canvas.height);
        this.player4 = Player.new.call(this, 'right', players[3], this.canvas.width, this.canvas.height);

        // İlk turda 1. ve 2. oyuncular oynayacak, sonra 3. ve 4.
        activePlayers = [this.player1, this.player2];
        this.ball = Ball.new.call(this, this.canvas.width, this.canvas.height);

        this.running = this.over = false;
        this.turn = activePlayers[0]; // İlk topu hareket ettirecek oyuncu
        this.timer = this.round = 0;
        this.color = '#8c52ff';

        this.menu();
        this.listen();
    },

    endGameMenu: function (text) {
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
            this.determineNextMatch();
        }, 2000);
    },

    determineNextMatch: function () {
        // İlk maç bittiğinde kazananı kaydet ve ikinci maçı başlat
        if (this.round === 0) {
            if (this.player1.score > this.player2.score) {
                winnerBracket.push(this.player1);
            } else {
                winnerBracket.push(this.player2);
            }
            // İkinci maç, 3. ve 4. oyuncular oynayacak
            activePlayers = [this.player3, this.player4];
        } else if (this.round === 1) {
            if (this.player3.score > this.player4.score) {
                winnerBracket.push(this.player3);
            } else {
                winnerBracket.push(this.player4);
            }
            // Final maçı: Kazananlar doğru taraflara atanacak
            activePlayers = [winnerBracket[0], winnerBracket[1]];
            // Kazananları doğru taraflara yerleştirelim
            this.player1 = winnerBracket[0];  // Sol tarafta oynayacak oyuncu
            this.player1.x = 50;  // Sol tarafta pozisyon
            this.player2 = winnerBracket[1];  // Sağ tarafta oynayacak oyuncu
            this.player2.x = this.canvas.width - 50 - this.player2.width;  // Sağ tarafta pozisyon
            activePlayers = [this.player1, this.player2]; // Final için aktif oyuncular
        } else if (this.round === 2) {
            // Final maçı bitti, kazananı göster
            const finalWinner = activePlayers[0].score > activePlayers[1].score ? activePlayers[0] : activePlayers[1];
            this.endGameMenu(finalWinner.name + ' Wins the Tournament!');
            return;
        }

        // Sıfırla ve sonraki round'u başlat
        this.ball = Ball.new.call(this, this.canvas.width, this.canvas.height);
        this.player1.score = this.player2.score = 0;
        this.round++;
        this.turn = activePlayers[0];
        this.over = false;
        this.running = false;
        alert('Next match is starting!');
        this.menu();
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
            if (this.ball.x <= 0) this._resetTurn(activePlayers[1], activePlayers[0]);
            if (this.ball.x >= this.canvas.width - this.ball.width) this._resetTurn(activePlayers[0], activePlayers[1]);

            // Topun üst veya alt kenara çarpması
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

            // Oyuncuların hareketi
            if (activePlayers[0].move === DIRECTION.UP) activePlayers[0].y -= activePlayers[0].speed;
            else if (activePlayers[0].move === DIRECTION.DOWN) activePlayers[0].y += activePlayers[0].speed;

            if (activePlayers[1].move === DIRECTION.UP) activePlayers[1].y -= activePlayers[1].speed;
            else if (activePlayers[1].move === DIRECTION.DOWN) activePlayers[1].y += activePlayers[1].speed;

            // Oyuncuların kenarlara çarpmasını önleme
            activePlayers[0].y = Math.max(0, Math.min(activePlayers[0].y, this.canvas.height - activePlayers[0].height));
            activePlayers[1].y = Math.max(0, Math.min(activePlayers[1].y, this.canvas.height - activePlayers[1].height));

            // Yeni servis başlangıcı: Başlangıçta topu harekete geçirme
            if (this._turnDelayIsOver() && this.turn) {
                // Servisi başlatan oyuncuya göre topun yönünü ayarla
                this.ball.moveX = this.turn === activePlayers[0] ? DIRECTION.RIGHT : DIRECTION.LEFT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())]; // Yön rastgele yukarı/aşağı
                this.turn = null; // Servis atıldıktan sonra servis atan yok
            }

            // Topun hareketi
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

            // Aktif oyuncular ve top arasındaki çarpışmalar
            if (this._isColliding(activePlayers[0], this.ball)) {
                this.ball.x = activePlayers[0].x + activePlayers[0].width;
                this.ball.moveX = DIRECTION.RIGHT;
            }
            if (this._isColliding(activePlayers[1], this.ball)) {
                this.ball.x = activePlayers[1].x - this.ball.width;
                this.ball.moveX = DIRECTION.LEFT;
            }
        }

        // Round sonu kontrolü
        if (activePlayers[0].score == 5) {
            if (!rounds[this.round + 1]) {
                this.over = true;
                setTimeout(() => { this.endGameMenu(activePlayers[0].name + ' Wins!'); }, 1000);
            } else {
                this._nextRound();
            }
        } else if (activePlayers[1].score == 5) {
            this.over = true;
            setTimeout(() => { this.endGameMenu(activePlayers[1].name + ' Wins!'); }, 1000);
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

        // Aktif oyuncuları çiz
        this.context.fillRect(
            activePlayers[0].x,
            activePlayers[0].y,
            activePlayers[0].width,
            activePlayers[0].height
        );
        this.context.fillRect(
            activePlayers[1].x,
            activePlayers[1].y,
            activePlayers[1].width,
            activePlayers[1].height
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

        // Sol üst köşeye aktif oyuncuların isimlerini yaz
        this.context.font = '40px Courier New';  // Daha küçük font ayarı
        this.context.textAlign = 'left';  // Sol hizalama
        this.context.fillText(
            activePlayers[0].name,
            70,  // Sol üst köşe için x değeri
            50   // Yükseklik, ekranın üst kısmı
        );

        // Sağ üst köşeye aktif oyuncunun ismini yaz
        this.context.textAlign = 'right';  // Sağ hizalama
        this.context.fillText(
            activePlayers[1].name,
            this.canvas.width - 70,  // Sağ üst köşe için x değeri
            50   // Yükseklik, ekranın üst kısmı
        );

        // Skorları çiz
        this.context.font = '100px Courier New';
        this.context.textAlign = 'center';
        this.context.fillText(
            activePlayers[0].score.toString(),
            (this.canvas.width / 2) - 300,
            200
        );
        this.context.fillText(
            activePlayers[1].score.toString(),
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
                this.turn = activePlayers[0]; // İlk top hareketini başlatan oyuncu
                this.ball = Ball.new.call(this, this.canvas.width, this.canvas.height);
                this.loop();
            }

            // Aktif oyuncu 1 (W ve S tuşları)
            if (key.key === 'w' || key.key === 'W') activePlayers[0].move = DIRECTION.UP;
            if (key.key === 's' || key.key === 'S') activePlayers[0].move = DIRECTION.DOWN;

            // Aktif oyuncu 2 (Yukarı ve Aşağı ok tuşları)
            if (key.key === 'ArrowUp') activePlayers[1].move = DIRECTION.UP;
            if (key.key === 'ArrowDown') activePlayers[1].move = DIRECTION.DOWN;
        });

        document.addEventListener('keyup', (key) => {
            if (key.key === 'w' || key.key === 'W') activePlayers[0].move = DIRECTION.IDLE;
            if (key.key === 's' || key.key === 'S') activePlayers[0].move = DIRECTION.IDLE;
            if (key.key === 'ArrowUp') activePlayers[1].move = DIRECTION.IDLE;
            if (key.key === 'ArrowDown') activePlayers[1].move = DIRECTION.IDLE;
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

    _isColliding: function (player, ball) {
        return (
            ball.x < player.x + player.width &&
            ball.x + ball.width > player.x &&
            ball.y < player.y + player.height &&
            ball.y + ball.height > player.y
        );
    }
};

const Pong = Object.assign({}, Game);
