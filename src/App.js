import React, { Component } from 'react';

class GameWrapper extends Component {
  componentDidMount() {
    this.startGame();
  }

  startGame = () => {
    // canvas setup
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 1000;
    canvas.height = 500;

    async function Game() {
      class InputHandler {
        constructor(game) {
          this.game = game;
          //movimento e disparo
          window.addEventListener("keydown", (e) => {
            if (
              (e.key === "ArrowUp" || e.key === "ArrowDown") &&
              this.game.keys.indexOf(e.key) === -1
            ) {
              this.game.keys.push(e.key);
            } else if (e.key === " ") {
              this.game.player.shootTop();
            }
          });
          window.addEventListener("keyup", (e) => {
            if (this.game.keys.indexOf(e.key) > -1) {
              this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
            }
          });
        }
      }
  
      class Projectile {
        constructor(game, x, y) {
          this.game = game;
          this.x = x;
          this.y = y;
          this.width = 10;
          this.height = 3;
          this.speed = 3;
          this.markedForDeletion = false;
        }
  
        //apos uma certa distancia o projetil desaparece
        update() {
          this.x += this.speed;
          if (this.x > this.game.width * 0.8) {
            this.markedForDeletion = true;
          }
        }
  
        //desenho do projetil
        draw(context) {
          context.fillStyle = "Black";
          context.fillRect(this.x, this.y, this.width, this.height);
        }
      }
  
      class Player {
        constructor(game) {
          this.game = game;
          this.width = 90;
          this.height = 90;
          this.x = 20;
          this.y = 120;
          this.speedY = 0;
          this.maxSpeed = 5;
          this.projectiles = [];
        }
  
        //velocidade do player
        update() {
          if (this.game.keys.includes("ArrowUp")) {
            this.speedY = -this.maxSpeed;
          } else if (this.game.keys.includes("ArrowDown")) {
            this.speedY = this.maxSpeed;
          } else {
            this.speedY = 0;
          }
          this.y += this.speedY;
  
          //limites
          if (this.y > this.game.height - this.height) {
            this.y = this.game.height - this.height;
          } else if (this.y < -this.height * 0) {
            this.y = -this.height * 0;
          }
  
          //projeteis
          this.projectiles.forEach((projectile) => {
            projectile.update();
          });
          this.projectiles = this.projectiles.filter(
            (projectile) => !projectile.markedForDeletion
          );
        }
  
        //Desenho Player e projeteis
        draw(context) {
          context.fillStyle = "#18B11D";
          context.fillRect(this.x, this.y, this.width, this.height);
          this.projectiles.forEach((projectile) => {
            projectile.draw(context);
          });
        }
  
        //retirar projeteis apos disparo
        shootTop() {
          if (this.game.ammo > 0) {
            this.projectiles.push(
              new Projectile(this.game, this.x + 80, this.y + 30)
            );
            this.game.ammo--;
          }
        }
      }
  
      class Enemy {
        constructor() {
          this.game = game;
          this.x = this.game.width;
          this.speedX = Math.random() * -1.5 - 0.5;
          this.markedForDeletion = false;
          this.Min = 1;
          this.Max = 5;
          this.lives =
            Math.floor(Math.random() * (this.Max - this.Min + 1)) + this.Min;
          this.score = this.lives;
        }
  
        update() {
          //Se sair do ecra é destruido
          this.x += this.speedX;
          if (this.x + this.width < 0) {
            this.markedForDeletion = true;
          }
        }
  
        draw(context) {
          context.fillStyle = "#B1181B";
          context.fillRect(this.x, this.y, this.width, this.height);
          context.fillStyle = "white";
          context.font = "15px Helvetica";
          context.fillText(this.lives, this.x + 18, this.y + 22);
        }
      }
  
      class Enemy1 extends Enemy {
        constructor(game) {
          super(game);
          this.width = 228 * 0.2;
          this.height = 169 * 0.2;
          //local de spawn
          this.y = Math.random() * (this.game.height * 0.9 - this.height);
        }
      }
  
      class UI {
        constructor(game) {
          this.game = game;
          this.fontSize = 25;
          this.fontFamily = "Helvetica";
          this.color = "white";
        }
  
        draw(context) {
          context.save();
          context.fillStyle = this.color;
          context.font = this.fontSize + "px " + this.fontFamily;
  
          context.shadowOffsetX = 2;
          context.shadowOffsetY = 2;
          context.shadowColor = "black";
  
          //vidas
          context.fillText("Lives: " + this.game.playerLives, 20, 480);
  
          //resultado
          context.fillText("Score: " + this.game.score, 20, 40);
  
          //muniçao
          for (let i = 0; i < this.game.ammo; i++) {
            context.fillRect(20 + 5 * i, 50, 3, 20);
          }
  
          //tempo
          const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
          context.fillText("Timer: " + formattedTime, 20, 100);
  
          //condiçoes
          if (this.game.gameOver) {
            context.textAlign = "center";
            context.font = "50px " + this.fontFamily;
            context.fillText(
              "Finished",
              this.game.width * 0.5,
              this.game.height * 0.5 - 40
            );
          }
  
          context.restore();
        }
      }
  
      class Game {
        constructor(width, height) {
          this.width = width;
          this.height = height;
          this.player = new Player(this);
          this.input = new InputHandler(this);
          this.ui = new UI(this);
          this.keys = [];
          this.enemies = [];
          this.enemyTimer = 0;
          this.enemyInterval = 1000;
          this.ammo = Math.floor(Math.random() * 15 + 5);
          this.maxAmmo = 20;
          this.ammoTimer = 0;
          this.ammoInterval = 1000;
          this.gameOver = false;
          this.score = 0;
          this.playerLives = Math.floor(Math.random() * 5 + 1);
          this.gameTime = 0;
        }
  
        update(deltaTime) {
          if (!this.gameOver) {
            this.gameTime += deltaTime;
          }
          //muniçoes
          this.player.update();
          if (this.ammoTimer > this.ammoInterval) {
            if (this.ammo < this.maxAmmo) {
              this.ammo++;
            }
            this.ammoTimer = 0;
          } else {
            this.ammoTimer += deltaTime;
          }
          //inimigos
          this.enemies.forEach((enemy) => {
            enemy.update();
            if (this.checkCollision(this.player, enemy)) {
              enemy.markedForDeletion = true;
              this.playerLives--;
              if (this.playerLives <= 0) {
                this.playerLives = 0;
                this.gameOver = true;
              }
            }
            this.player.projectiles.forEach((projectile) => {
              if (this.checkCollision(projectile, enemy)) {
                enemy.lives--;
                projectile.markedForDeletion = true;
                if (enemy.lives <= 0) {
                  enemy.markedForDeletion = true;
                  if (!this.gameOver) {
                    this.score += enemy.score;
                  }
                }
              }
            });
          });
          this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
          if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
            this.addEnemy();
            this.enemyTimer = 0;
          } else {
            this.enemyTimer += deltaTime;
          }
        }
  
        draw(context) {
          this.player.draw(context);
          this.enemies.forEach((enemy) => {
            enemy.draw(context);
          });
          this.ui.draw(context);
        }
  
        addEnemy() {
          this.enemies.push(new Enemy1(this));
        }
  
        checkCollision(rect1, rect2) {
          return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.height + rect1.y > rect2.y
          );
        }
      }
  
      const game = new Game(canvas.width, canvas.height);
  
      let lasTime = 0;
  
      //loop das animaçoes
      function animate(timeStamp) {
        const deltaTime = timeStamp - lasTime;
        lasTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
      }
  
      animate(0);
    }
    Game();
  }

  render() {
    return <canvas id="canvas1"></canvas>;
  }
}

export default GameWrapper;