
var gamePlay = window.innerWidth

var config = {
    type: Phaser.AUTO,
    width: gamePlay,
    height: gamePlay,
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
var lineCounter = 480;
var lineDelay = 500; // Number of loops to skip before generating a new line
var lineVelMin = 2;
var lineVelMax = 200;
var startButton = document.getElementById('start-button');
var restartButton = document.getElementById('restart-button');
var start_clock = false;
var elaspedTime = 0;
var score;
var scoreText;
var scoreDiv;
var hsDivText;
var hsDiv;
var high_score = 0;

var mainScene = new Phaser.Scene('main');

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
    lineDelay = 500;
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
        button.fillStyle(0xff0000, 1);
        button.fillRect(x, y, width, height);

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
        button.lineStyle(2, 0xffffff);
        button.fillStyle(0xffffff, 1);
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

        if (elaspedTime > 30) {
            lineDelay = 450;
            lineVelMin = 20;
            if (elaspedTime> 60) {
                lineDelay = 400;
                lineVelMin = 80;
                if(elaspedTime> 90){
                    lineDelay = 300;
                    lineVelMin = 160;
                    if(elaspedTime>120 && elaspedTime<125) {
                        lines.clear(true,true)                    
                    }
                }
            }
        }
    
        if (elaspedTime>125) {
               lineDelay = 250;
               lineVelMin = 1200;
               lineVelMax = 1600;
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
            if (elaspedTime > high_score) {
                high_score = elaspedTime
            }
            hsDivText.setText('High Score: ' + high_score)
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

    h_l_line = this.add.rectangle(-10, Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.9), Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.25), gamePlay*.01, 0xffffff);
        this.physics.add.existing(h_l_line);
        lines.add(h_l_line);
        h_l_line.body.velocity.x = Phaser.Math.RND.integerInRange(2, 200);

    h_r_line = this.add.rectangle(window.innerHeight+10, Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.9), Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.25), gamePlay*.01, 0xffffff);
        this.physics.add.existing(h_r_line);
        lines.add(h_r_line);
        h_r_line.body.velocity.x = Phaser.Math.RND.integerInRange(-200,2);
    
    v_t_line = this.add.rectangle(Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.9), -10, gamePlay*.01, Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.25), 0xffffff);
        this.physics.add.existing(v_t_line);
        lines.add(v_t_line);
        v_t_line.body.velocity.y = Phaser.Math.RND.integerInRange(2, 200);

    v_b_line = this.add.rectangle(Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.9), window.innerHeight+10, gamePlay*.01, Phaser.Math.RND.integerInRange(gamePlay*.1, gamePlay*.25), 0xffffff);
        this.physics.add.existing(v_b_line);
        lines.add(v_b_line);
        v_b_line.body.velocity.y = Phaser.Math.RND.integerInRange(2, -200);



    }




game.scene.add('main', mainScene);

