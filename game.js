
var gamePlay = window.innerWidth

var config = {
    type: Phaser.AUTO,
    width: gamePlay,
    height: gamePlay,
    backgroundColor: 0x000000,
    parent: 'game-container',
    physics: {
        default: 'arcade'
    }
};

var game = new Phaser.Game(config);

// Create your game objects
var circle;
var lines;
var velx = Phaser.Math.RND.integerInRange(-75,75);
var vely = Phaser.Math.RND.integerInRange(-75,75);
var setVel = 75;
var drag = .99;
var moveDirection = null;
var lineCounter = 495;
var lineDelay = 400; // Number of loops to skip before generating a new line
var lineVelMin = 2;
var lineVelMax = 200;
var lineColor = 0xff0000;
var startButton = document.getElementById('start-button');
var restartButton = document.getElementById('restart-button');
var start_clock = false;
var elaspedTime = 0;
var score;
var scoreText;
var scoreDiv;
var hsDivText;
var hsDiv;
var highScore = 0;
var endGame = false;
var blitzCounter = 0;
var blitzTimer = 500;
var startBlitz = true;
var nextBlitz = 0;

var mainScene = new Phaser.Scene('main');



if(localStorage.getItem("highScore")) {
    highScore = localStorage.getItem("highScore");
  }
  

startButton.addEventListener('click', function() {
    startButton.style.display = 'none';
    game.scene.start('main');
    start_clock = game.getTime();
    });

restartButton.addEventListener('click', function() {
    game.scene.start('main');
    restartButton.style.display = 'none';
    circle.body.setVelocity(Phaser.Math.RND.integerInRange(-75,75),
        Phaser.Math.RND.integerInRange(-75,75))
    moveDirection = null;
    start_clock = game.getTime();
    lineCounter = 498;
    lineDelay = 500;
    lineVelMin = 2;
    lineVelMax = 200;
    endGame = false;
    startBlitz = true;
    nextBlitz = 0;
    lineColor = 0xff0000;
});





mainScene.preload = function() {
    // game assets loading
};

mainScene.create = function() {
    // game objects creation
    scoreDiv = document.getElementById('score-box')
    scoreText = this.add.text('Score: 0');
    scoreText.setOrigin(0);

    hsDiv = document.getElementById('high-score-box')
    hsDivText = this.add.text('High Score: 0')
    hsDivText.setOrigin(0);
    
    hsDivText.setText('High Score: ' + highScore)
    hsDiv.innerHTML = hsDivText.text;

    hsDivText.setText('High Score: ' + highScore)
    hsDiv.innerHTML = hsDivText.text;

    // Create array for line sprites
    lines = this.physics.add.group();
    // Create the circle sprite
    circle = this.add.circle(this.cameras.main.centerX, this.cameras.main.centerY, gamePlay*.05, 0xffffff);
    // Set the circle's properties
    circle.setOrigin(0.5);
    circle.setInteractive(); 
    this.physics.add.existing(circle)
    circle.body.setCircle(gamePlay*.05);

    circle.body.setVelocity(velx,
        vely)

            // Add the button controls
    function drawButton(scene, x, y, width, height, color, onClick) {

        var button = scene.add.graphics();

        // Draw the button background
        button.fillStyle(0xffffff, 1);
        button.fillRoundedRect(x, y, width, height, 10);

        // Draw the arrow
        var arrowLength = gamePlay*.08;
        var arrowWidth = 40;
        var centerX = x + width / 2;
        var centerY = y + height / 2;
        var screenCenterX = scene.cameras.main.centerX;
        var screenCenterY = scene.cameras.main.centerY;
        var dx = screenCenterX - centerX;
        var dy = screenCenterY - centerY;
        var angle = Math.atan2(dy, dx);
        var arrowEndX = centerX + arrowLength * Math.cos(angle);
        var arrowEndY = centerY + arrowLength * Math.sin(angle);
        button.lineStyle(2, 0x0000ff);
        button.fillStyle(0x0000ff, 1);
        button.beginPath();
        button.moveTo(centerX, centerY);
        button.lineTo(arrowEndX, arrowEndY);
        button.strokePath();
        button.closePath();
        button.beginPath();
        button.moveTo(arrowEndX, arrowEndY);
        button.lineTo(
            arrowEndX - arrowWidth * Math.cos(angle - Math.PI / 6),
            arrowEndY - arrowWidth * Math.sin(angle - Math.PI / 6)
        );
        button.lineTo(
            arrowEndX - arrowWidth * Math.cos(angle + Math.PI / 6),
            arrowEndY - arrowWidth * Math.sin(angle + Math.PI / 6)
        );
        button.closePath();
        button.fillPath();

        // Set the button as interactive and add the click event handler
        button.setInteractive(new Phaser.Geom.Rectangle(x, y, width, height), Phaser.Geom.Rectangle.Contains);
        button.on('pointerdown', onClick);

        return button;
        }

    // Create the buttons
    var buttonTopLeft = drawButton(this, 0, 0, gamePlay*.1, gamePlay*.1, 0xff0000, function() {
        velx += setVel
        vely += setVel
        moveDirection = 'downRight';
    });

    var buttonTopRight = drawButton(this, config.width - gamePlay*.1, 0, gamePlay*.1, gamePlay*.1, 0xff0000, function() {
        velx -= setVel
        vely += setVel
        moveDirection = 'downLeft';
    });

    var buttonBottomLeft = drawButton(this, 0, config.height - gamePlay*.1, gamePlay*.1, gamePlay*.1, 0xff0000, function() {
        velx += setVel
        vely -= setVel
        moveDirection = 'upRight';
    });

    var buttonBottomRight = drawButton(this, config.width - gamePlay*.1, config.height - gamePlay*.1, gamePlay*.1, gamePlay*.1, 0xff0000, function() {
        velx -= setVel
        vely -= setVel
        moveDirection = 'upLeft';
    });
    
    

};



mainScene.update = function() {


        elaspedTime = Math.floor((game.getTime() - start_clock)/1000)
        scoreText.setText('Score: ' + elaspedTime)
        scoreDiv.innerHTML = scoreText.text;

        lineCounter++;
        
        if (elaspedTime > 30 && endGame == false) {
            lineDelay = 350;
            if (elaspedTime> 60) {
                lineDelay = 300;
                if(elaspedTime> 90){
                    lineDelay = 250;
                    if(elaspedTime>=120) {
                        endGame = true;
                    }
                }
            }
        }

        if (endGame == true) {

            blitzCounter++;

            console.log(lineDelay)

            if (startBlitz==true) {
                lines.clear(true,true);
                this.cameras.main.setBackgroundColor(0xff0000); // set background color to red
                lineColor = 0x000000;
                startBlitz = false;
            }
            lineDelay = 75;
            lineVelMin = 250;
            lineVelMax = 300;

            if (blitzCounter >= blitzTimer) {

                this.cameras.main.setBackgroundColor(0x000000); // set background color to black
                lineColor = 0xff0000;
                lineDelay = 200;
                lineVelMin = 2;
                lineVelMax = 200;

                nextBlitz = blitzTimer + Phaser.Math.RND.integerInRange(1500,2500);

                if (blitzCounter >= nextBlitz){
                    startBlitz = true;
                    blitzTimer = Phaser.Math.RND.integerInRange(400,1000);
                    blitzCounter = 0;

                }


            }




        } 

        // Generate a new line if the lineCounter has reached the lineDelay value
        if (lineCounter >= lineDelay) {
            createLine.call(this);
            lineCounter = 0;
        }

        // Create a collider between the circle and lines
        this.physics.add.collider(circle, lines, function() {
            console.log('Circle collided with a line!');
            console.log(lineDelay)
            this.scene.pause('main')
            restartButton.style.display = 'block';
            if (elaspedTime > highScore) {
                highScore = elaspedTime
                localStorage.setItem("highScore", highScore);
            }
            hsDivText.setText('High Score: ' + highScore)
            hsDiv.innerHTML = hsDivText.text;

        }, null, this);





        if (moveDirection === 'upLeft') {

            velx *= drag
            vely *= drag
  
            circle.body.setVelocity(velx,vely)

            if (circle.x < 50) {
                circle.x = 50;
            }
            if (circle.y < 50) {
                circle.y = 50;
            }
        } else if (moveDirection === 'upRight') {
            velx *= drag
            vely *= drag
  
            circle.body.setVelocity(velx,vely)
            if (circle.x > this.game.config.width-50) {
                circle.x = this.game.config.width-50;
            }
            if (circle.y < 50) {
                circle.y = 50;
            }
        } else if (moveDirection === 'downLeft') {
            velx *= drag
            vely *= drag
  
            circle.body.setVelocity(velx,vely)
            if (circle.x < 50) {
                circle.x = 50;
            }
            if (circle.y > this.game.config.height-50) {
                circle.y = this.game.config.height-50;
            }
        } else if (moveDirection === 'downRight') {
            velx *= drag
            vely *= drag
  
            circle.body.setVelocity(velx,vely)
            if (circle.x > this.game.config.width-50) {
                circle.x = this.game.config.width-50;
            }
            if (circle.y > this.game.config.height-50) {
                circle.y = this.game.config.height-50;
            }
        }


};


function createLine() {

    h_l_line = this.add.rectangle(-gamePlay*.25, Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.9), Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.25), gamePlay*.01, lineColor);
        this.physics.add.existing(h_l_line);
        lines.add(h_l_line);
        h_l_line.body.velocity.x = Phaser.Math.RND.integerInRange(lineVelMin, lineVelMax);

    h_r_line = this.add.rectangle(window.innerWidth+gamePlay*.25, Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.9), Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.25), gamePlay*.01, lineColor);
        this.physics.add.existing(h_r_line);
        lines.add(h_r_line);
        h_r_line.body.velocity.x = Phaser.Math.RND.integerInRange(-lineVelMax,-lineVelMin);
    
    v_t_line = this.add.rectangle(Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.9), -gamePlay*.25, gamePlay*.01, Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.25), lineColor);
        this.physics.add.existing(v_t_line);
        lines.add(v_t_line);
        v_t_line.body.velocity.y = Phaser.Math.RND.integerInRange(lineVelMin, lineVelMax);

    v_b_line = this.add.rectangle(Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.9), window.innerWidth+gamePlay*.25, gamePlay*.01, Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.25), lineColor);
        this.physics.add.existing(v_b_line);
        lines.add(v_b_line);
        v_b_line.body.velocity.y = Phaser.Math.RND.integerInRange(-lineVelMin, -lineVelMax);
















    }




game.scene.add('main', mainScene);

