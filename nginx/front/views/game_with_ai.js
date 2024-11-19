export function game_with_ai(appElement) {
  // Referanslar ve durumlar
  let currentGameLoop = null;

  // Oyun döngüsünü durdurma
  function stopCurrentGameLoop() {
      if (currentGameLoop) {
          cancelAnimationFrame(currentGameLoop);
          currentGameLoop = null;
      }
  }

  // Tüm dinleyicileri ve DOM'u temizle
  function cleanupGame() {
      stopCurrentGameLoop();
      appElement.innerHTML = ""; // Oyun içeriğini temizle
      const gameScript = document.getElementById("game-script");
      if (gameScript) {
          gameScript.remove(); // Script'i DOM'dan kaldır
      }
  }

  // Yeni bir oyun başlat
  appElement.innerHTML = `
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins&display=swap');
    * {
        font-family: 'Poppins', sans-serif;
    }
    #body {
        text-align: center;
        background-color: #A381F2;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 80%;
        flex-direction: column;
        width: 100%;
        margin-top: 10%;
    }
    </style>
    <div id="body">
        <canvas></canvas>
        <p>Control the left player by using up and down arrow keys</p>
    </div>
  `;

  // Yeni script ekleme
  const script = document.createElement("script");
  script.src = "./game/with_ai/ai_script.js";
  script.id = "game-script";
  document.body.appendChild(script);

  // Buton dinleyicilerini güncelle
  document.getElementById("local_match_btn").addEventListener("click", () => {
      cleanupGame();
      // local_match oyununu başlatma kodları
  });

  document.getElementById("game_tournament_btn").addEventListener("click", () => {
      cleanupGame();
      // game_tournament oyununu başlatma kodları
  });


}
