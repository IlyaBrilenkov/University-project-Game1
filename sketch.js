var gameCharX;
var gameCharY;
var floorPosY;
var isLeft;
var isFalling;
var isRight;
var isPlummeting;
var isJumping;
var tCollectable;
var collectables;
var tCanyon;
var canyons;
var treesX;
var treePosY;	
var clouds;
var mountains;
var mountainScale;
var cameraPosX;
var levelScore;
var flagpole;
var lives;
var groundEnemiesList;
var flyingEnemiesListFire;
var flyingEnemiesListIce;
var iceBalls;
var fireBalls;
var gravityForce;
var characterSpeed;
var level;
var levelsConfig;
var gameScore;

// sound variables
var mainSound;
var congratsSound;

// day and night modes variables
var moon;
var sun;
var darkness;
var sunInitial;
var changeDay;
var timerForDay;

var win;

// preload game music
function preload()
{
    soundFormats('mp3');
    congratsSound = loadSound("assets/congrats music.mp3");
    mainSound = loadSound("assets/main music.mp3"); 
    congratsSound.setVolume(0.7);
    mainSound.setVolume(0.3);
}

function setup()
{
    createCanvas(1024, 576);
    floorPosY = height * 3/4;
    lives = 3;
    level = 1;
    //configuration for level 1 and level 2
    levelsConfig = {1:{"groundEnemies": 3, "flyingEnemiesRate": 0, "icePower": 2}, 
                    2:{"groundEnemies": 3, "flyingEnemiesRate": 0.005, "icePower": 2.2}};
    gameScore = 0;
    mainSound.loop();
    win = false;

    startGame();
}

function draw()
{
    //Character speed recovering
    characterSpeed += 0.005;
    characterSpeed = constrain(characterSpeed, 0, 7);
    
    //update the virtual camera position
    cameraPosX = gameCharX - width/2;
	
    background(100,155,255); //fill the sky blue

    // conditional statements for controlling the movement of the sun
    if (timerForDay > 0 && changeDay == 1 && !flagpole.isReached && lives>0)
    {
        timerForDay = timerForDay-0.005;   
    }
    else if (darkness < 0)
    {
        changeDay = 1;
        timerForDay = 2;
    }
    else if (darkness > 255)
    {
        changeDay = -1;
    }
    // activation the beginning of the night mode
    if (timerForDay < 0)
    {
        darkness = darkness+(changeDay*0.3);
        moon.brightness = (darkness);
        sun.y = sunInitial + darkness*1.5;
        sun.redness = darkness - 30;
    }
    
	//the sun
	fill(255, 255-sun.redness, 0);
	ellipse(sun.x, sun.y, sun.diameter);
    
    // green ground
	fill(0,155,0);
	rect(0, floorPosY, width, height - floorPosY); 
    
    push();
    
    translate(-cameraPosX, 0);
        
    //mountains
    drawMountains();

    // trees
    drawTrees();
    
    //clouds
    drawClouds();
    
    // canyons
    for (var i = 0; i < canyons.length; i++)
    {
        drawCanyon(canyons[i]);
    }
    
    // night mode
    fill(20,20,20,darkness-30);
    rect(-10000,0,20000,height);
    
    //flying enemy appearance
    var flyingEnemyLimit = random(0,1);
    if (levelsConfig[level].flyingEnemiesRate > flyingEnemyLimit)
    {
        var typeOfFlyingEnemy = random(['Ice', 'Fire']);
        
        if (typeOfFlyingEnemy == 'Ice')
        {
            flyingEnemiesListIce.push(new flyingEnemyIce());
        }
        else if (typeOfFlyingEnemy == 'Fire')
        {
            flyingEnemiesListFire.push(new flyingEnemyFire());
        }
    }
    
    //ice flying enemy strike
    for (i=0; i<flyingEnemiesListIce.length; i++)
    {
        flyingEnemiesListIce[i].draw();
        
        var flyingEnemyIceStrikeProb = random(0,1);
        if (flyingEnemyIceStrikeProb > 0.99)
        {
            flyingEnemiesListIce[i].strike();
        }
        
    }
    
    //ice flying enemy disappearance
    for (i=flyingEnemiesListIce.length-1; i>=0; i--)
    {
        if (flyingEnemiesListIce[i].x < 0)
        {
            flyingEnemiesListIce.splice(i, 1);
        }
    } 
    
    //fire flying enemy strike
    for (i=0; i<flyingEnemiesListFire.length; i++)
    {
        flyingEnemiesListFire[i].draw();
        
        var flyingEnemyFireStrikeProb = random(0,1);
        if (flyingEnemyFireStrikeProb > 0.99)
        {
            flyingEnemiesListFire[i].strike();
        }
    }
    
    //fire flying enemy disappearance
    for (i=flyingEnemiesListFire.length-1; i>=0; i--)
    {
        if (flyingEnemiesListFire[i].x < 0)
        {
            flyingEnemiesListFire.splice(i, 1);
        }
    } 
    
    //collectables 
    for (i = 0; i < collectables.length; i++)
    {
        if (collectables[i].isFound == false)
        {
            checkCollectable(collectables[i]);
        }
        if (collectables[i].isFound == false)
        {
            drawCollectable(collectables[i]);
        }
    }
    
    //ground enemy
    for (i=0; i<groundEnemiesList.length; i++)
    {
        groundEnemiesList[i].draw();

        var isContact = groundEnemiesList[i].checkContact(gameCharX, gameCharY);
        
        var isDetected = groundEnemiesList[i].checkDetection(gameCharX, gameCharY);
        
        if (isDetected)
        {
            groundEnemiesList[i].x = min(gameCharX, groundEnemiesList[i].currentX);
            
            var strikeProb = random(0,1);
            if (strikeProb > 0.9)
            {
                var directionOfDetection;
                if (groundEnemiesList[i].currentX > gameCharX)
                {
                    directionOfDetection = -1;
                }
                else
                {
                    directionOfDetection = 1;
                }
                groundEnemiesList[i].strike(directionOfDetection);
            }
        }

        if (isContact)
        {
            if (lives > 0)
            {
                lives --;
                gameScore -= levelScore;
                startGame();
                break;
            }
        }
    }
    
    //ice balls creating and interacting with the character 
    for (i=0; i<iceBalls.length; i++)
    {
        iceBalls[i].draw();
        iceBalls[i].checkContact(gameCharX, gameCharY);
    }
    
    // ice balls disappearance
    for (i=iceBalls.length-1; i>=0; i--)
    {
        if (iceBalls[i].currentY > floorPosY)
        {
            iceBalls.splice(i, 1);
        }
    } 
    
    //fire balls creating and interacting with the character 
    for (i=0; i<fireBalls.length; i++)
    {
        fireBalls[i].draw();
        var fireContact = fireBalls[i].checkContact(gameCharX, gameCharY);
        if (fireContact)
        {
            if (lives > 0)
            {
                lives --;
                gameScore -= levelScore;
                startGame();
                break;
            }
        }
    }
    
    // fire balls disappearance
    for (i=fireBalls.length-1; i>=0; i--)
    {
        if (fireBalls[i].y > floorPosY)
        {
            fireBalls.splice(i, 1);
        }
    } 
    
    drawCharacter();

    // flagpole
    if (flagpole.isReached == false)
    {
        checkFlagpole();    
    }
    
    renderFlagpole(); 

    pop();
    
    //the moon
    fill(250,250,210,moon.brightness);
    ellipse(moon.x,moon.y,moon.diametr);
    
    // checking for game over and level complete
    if (lives < 1)
    {
        textSize(50);
        fill(darkness);

        text("Game over. Press space to retry.", 100, height/2);
        text("Game score: " + gameScore + "/8", 400, height/2+60);
        textSize(12);
        return;
    }
    
    if (flagpole.isReached)
    {
        fill(darkness);
        textSize(50);
        if (level == 2)
        {
            text("Congratulations! You completed the game!", 50, height/2);
            text("Game score: " + gameScore + "/8", 400, height/2+60);
            if (!win)
            {
                congratsSound.play();
                win = true;
            }        
            return;
        }      
        text("Level " + level + " completed. Press space to continue.", 100, height/2);
        textSize(12);
        return ;
    }  
    
    // game statistics
    fill(255);
    noStroke();
    text("Game score: " + gameScore + "/8", 20, 20);
    text("Level score: " + levelScore+ "/4", 20, 40);
    text("Lives: " + lives, 20, 60);
    text("Speed: " + round(characterSpeed/7*100) + "%", 20, 80);
    
    checkPlayerDie();
    
    //conditional statements to move the game character
    if (isLeft)
    {
        if ((!isPlummeting) && (gameCharY <= floorPosY))
        {
            gameCharX -= characterSpeed; 
        }
    }
    if (isRight)
    {            
        if ((!isPlummeting) && (gameCharY <= floorPosY))
        {
            gameCharX += characterSpeed;
        }
    }
    if (gameCharY < floorPosY)
    {
        gameCharY += 4;
        isFalling = true;
    }
    else
    {
        isFalling = false;
    }
    
    for (i = 0; i < canyons.length; i++)
    {
        checkCanyon(canyons[i]);
    }
        
    if (isPlummeting == true)
    {
        if (gameCharY < 500)
        {
            gameCharY += 8;
        }
        else
        {
            isPlummeting = false;
        }
    }
    
    if (isJumping == true)
    {
        gameCharY -= 76;
        isJumping = false;
    }
    
}

function keyPressed()
{
	// conditional statements to control the animation of the character when
	// keys are pressed.
    if (keyCode == 65)
    {
        isLeft = true;
    }
    
    if (keyCode == 68)
    {
        isRight = true;
    }
    if ((keyCode == 87) && (!isPlummeting) && (!isFalling) && 
        (gameCharY<=floorPosY))
    {
        isJumping = true;  
    }
    
    if (flagpole.isReached && keyCode==32 && level==1)
    {
        level ++;
        flagpole.isReached = false;
        startGame();
    }
     
    if (lives == 0 && keyCode==32)
    {
        gameScore = 0;
        level = 1;
        lives = 3;
        startGame();
    }
}

function keyReleased()
{
	// conditional statements to control the animation of the character when
	// keys are released.

    if (keyCode == 65)
    {
        isLeft = false;
    }
    
    if (keyCode == 68)
    {
        isRight = false;
    }
}

function drawClouds()
{
    fill(255, 255, 255);
    for (var c = 0; c < clouds.length; c++)
    {
        ellipse(clouds[c].xPos*clouds[c].scale, 
                clouds[c].yPos, 
                80*clouds[c].scale, 
                80*clouds[c].scale);
        ellipse((clouds[c].xPos-40)*clouds[c].scale, 
                clouds[c].yPos, 
                60*clouds[c].scale, 
                60*clouds[c].scale);
        ellipse((clouds[c].xPos+40)*clouds[c].scale, 
                clouds[c].yPos, 
                60*clouds[c].scale, 
                60*clouds[c].scale);
    }
}

function drawMountains()
{
    fill(100,100,100);
    for (var m = 0; m < mountains.length; m++)
    {
        triangle(mountains[m].xPos-150*mountainScale, 
                 mountains[m].yPos,
                 mountains[m].xPos, 
                 mountains[m].yPos-180*mountainScale, 
                 mountains[m].xPos+150*mountainScale, 
                 mountains[m].yPos);
        triangle(mountains[m].xPos-220*mountainScale, 
                 mountains[m].yPos, 
                 mountains[m].xPos-150*mountainScale, 
                 mountains[m].yPos-110*mountainScale, 
                 mountains[m].xPos-80*mountainScale, 
                 mountains[m].yPos);
        triangle(mountains[m].xPos+220*mountainScale, 
                 mountains[m].yPos, 
                 mountains[m].xPos+150*mountainScale, 
                 mountains[m].yPos-110*mountainScale, 
                 mountains[m].xPos+80*mountainScale, 
                 mountains[m].yPos);
        rect(mountains[m].xPos-220*mountainScale, 
             mountains[m].yPos, 
             440*mountainScale, 
             floorPosY-mountains[m].yPos);
    }
}

function drawTrees()
{
    for (i = 0; i < treesX.length; i++)
    {
        noStroke();
        fill(120,100, 60);
        rect(treesX[i], treePosY, 60, 150);

        fill(0, 155, 0);
        triangle(treesX[i]-50, treePosY+50, 
                 treesX[i]+30, treePosY-50, 
                 treesX[i]+110, treePosY+50);
        triangle(treesX[i]-50, treePosY, 
                 treesX[i]+30, treePosY-100, 
                 treesX[i]+110, treePosY);
    }
}

function drawCollectable(tCollectable)
{
    fill(220, 180, 70);
    stroke(90,90,90);
    ellipse(tCollectable.xPos, tCollectable.yPos, tCollectable.size, tCollectable.size);

    stroke(0,250,0);
    line(tCollectable.xPos-tCollectable.size/2+tCollectable.size*0.02,     
         tCollectable.yPos, 
         tCollectable.xPos+tCollectable.size/2-tCollectable.size*0.02, tCollectable.yPos);
    line(tCollectable.xPos, 
         tCollectable.yPos-tCollectable.size/2+tCollectable.size*0.02, 
         tCollectable.xPos, 
         tCollectable.yPos+tCollectable.size/2-tCollectable.size*0.02);
    noStroke();
}

function drawCanyon(tCanyon)
{
    fill(120, 100, 60);
    beginShape();
    vertex(tCanyon.xPos+tCanyon.width+75, 432);
    vertex(tCanyon.xPos+tCanyon.width+85, 576);    
    vertex(tCanyon.xPos-10, 576);
    vertex(tCanyon.xPos-5, 432);  
    endShape();
    
    fill(0,100,200);
    stroke(120, 100, 60);
    beginShape();
    vertex(tCanyon.xPos+tCanyon.width, 432);
    vertex(tCanyon.xPos+tCanyon.width+30, 500);
    vertex(tCanyon.xPos+tCanyon.width+70, 510);
    vertex(tCanyon.xPos+tCanyon.width+80, 576);    
    vertex(tCanyon.xPos+50, 576);
    vertex(tCanyon.xPos+45, 522);
    vertex(tCanyon.xPos+25, 512);
    vertex(tCanyon.xPos, 432);  
    endShape();
    noStroke();
}

function checkCollectable(tCollectable)
{
    if (dist(gameCharX, gameCharY, tCollectable.xPos, tCollectable.yPos) < 20)
    {
        tCollectable.isFound = true;
        levelScore += 1;
        gameScore += 1;
    }
    
}

function checkCanyon(tCanyon)
{
    if ((tCanyon.xPos-5 < gameCharX) && 
        (gameCharX < tCanyon.xPos+tCanyon.width+75) &&
         (gameCharY >= floorPosY))
    {
        isPlummeting = true;  
    }
}

function renderFlagpole()
{
    push();
    
    for (var h=floorPosY; h>floorPosY-225; h-=25)
    {
        if (h%2==0)
        {
            stroke(120, 100, 60);
            strokeWeight(4);
            line(flagpole.xPos, h, flagpole.xPos, h-25);    
        }
        else
        {
            stroke(255,140,0);
            strokeWeight(4);
            line(flagpole.xPos, h, flagpole.xPos, h-25);  
        }
    }

    if (flagpole.isReached)
    {
        fill(255,140,0);
        noStroke();
        beginShape();
        vertex(flagpole.xPos-2, floorPosY-255);
        vertex(flagpole.xPos+53, floorPosY-255);
        vertex(flagpole.xPos+33, floorPosY-235);
        vertex(flagpole.xPos+53, floorPosY-215);
        vertex(flagpole.xPos-2, floorPosY-215);
        vertex(flagpole.xPos-2, floorPosY-255);
        endShape();
    }
    
    pop();
}

function checkFlagpole()
{
    if (dist(gameCharX, gameCharY, flagpole.xPos, floorPosY-19) < 20)
    {
        flagpole.isReached = true;
    }
}

function checkPlayerDie()
{
    if (gameCharY >= 500) // canyons' bottom
    {
        isPlummeting = false;
        lives --;
        gameScore -= levelScore;
        
        if (lives > 0)
        {
            startGame();
        }
        return true;
    }
}

function startGame()
{
    gameCharX = width/2;
    gameCharY = floorPosY;
    treesX = [70, 300, 700, 1500];
    treePosY = floorPosY-150;
    canyons = [{xPos: 150, width: 0},
               {xPos: 380, width: 0},
               {xPos: 1050, width: 0}];
    mountainScale = 0.4;
    mountains = [{xPos: 0, yPos: 250}, 
                 {xPos: 875, yPos: 250}, 
                 {xPos: 1275, yPos: 250}];    
    cloudScale = 0.9;
    clouds = [{xPos: 200,yPos: 100, scale: 0.9}, 
              {xPos: 600,yPos: 150, scale: 1.1}, 
              {xPos: 900,yPos: 120, scale: 1.0}];
    cameraPosX = 0;
    collectables = [{xPos: 300, yPos: floorPosY, size: 25, isFound: false},
                    {xPos: 600, yPos: floorPosY, size: 25, isFound: false},
                    {xPos: 700, yPos: floorPosY, size: 25, isFound: false},
                    {xPos: 900, yPos: floorPosY, size: 25, isFound: false}];  
    
    levelScore = 0;
    characterSpeed = 7;
    
    groundEnemiesList = [];
    flyingEnemiesListIce = [];
    flyingEnemiesListFire = [];
    iceBalls = [];
    fireBalls = [];   
    
    gravityForce = 10;
    
    enemyLocationX = random(gameCharX+200,gameCharX+500);
    for (var i=0; i<levelsConfig[level].groundEnemies; i++)
    {
        if (i==0)
        {
            groundEnemiesList.push(new Enemy(enemyLocationX, floorPosY-20, 80));
        } 
        else
        {
            enemyLocationX += random(300,600);
            groundEnemiesList.push(new Enemy(enemyLocationX, floorPosY-20, 80));
        }
    }
    
    flagpole = {xPos: 1750, isReached: false};
    
    sunInitial = 70;
    sun = {
		x: 150,
		y: sunInitial,
		diameter: 80,
        redness: 0
	};
    moon = {
        x: 650,
        y: 70,
        diametr: 80,
        brightness: 0
    };
	darkness = 0;
    changeDay = 1;
    timerForDay = 1;
}

function Enemy(x, y, range)
{
    this.x = x;
    this.y = y;
    this.range = range;
    
    this.currentX = x;
    this.inc = random(0.5, 1);
    
    // enemy speed can randomly change after changing the direction
    this.update = function()
    {
        this.currentX += this.inc;
        
        if (this.currentX >= this.x + this.range)
        {
            this.inc = random(-1,-0.5);
        }
        else if (this.currentX < this.x)
        {
            this.inc = random(0.5, 1);
        }
    };
    
    this.draw = function()
    {   
        if (flagpole.isReached == false)
        {
            this.update();
        }
        fill(230,230,230);
        ellipse(this.currentX, this.y, 30, 30);
        stroke(77,255,255);
        line(this.currentX-5, this.y+10, this.currentX-5, this.y+20);
        line(this.currentX-5, this.y+20, this.currentX-15, this.y+20);
        line(this.currentX+5, this.y+10, this.currentX+5, this.y+20);
        line(this.currentX+5, this.y+20, this.currentX+15, this.y+20);
        line(this.currentX-10, this.y, this.currentX-20, this.y-5);
        line(this.currentX-20, this.y-5, this.currentX-25, this.y-20);
        line(this.currentX+10, this.y, this.currentX+20, this.y-5);
        line(this.currentX+20, this.y-5, this.currentX+25, this.y-20);
        ellipse(this.currentX, this.y, 12, 12);
        noStroke();
    };
    
    this.checkContact = function(gc_x, gc_y)
    {
        var d = dist(gc_x, gc_y, this.currentX, this.y);
        if (d < 25)
        {
            return true;
        }
        return false;    
    };
    
    this.strike = function(direction)
    {
        iceBalls.push(new iceBall(this.currentX+25*direction, this.y-20, levelsConfig[level].icePower, 3*direction, -5));
    };
    
    // if an enemy detects the character, it will pursue the caracter. And also will strike
    this.checkDetection = function(gc_x, gc_y)
    {
        var d = dist(gc_x, gc_y, this.currentX, this.y);
        if (d < this.range &&
            !isFalling && // to avoid strike while jumping over enemies
            ((gc_x<this.currentX && this.inc<0) || (gc_x>this.currentX && this.inc>0))) // an enemy can detect you only if goes in your direction
        {
            return true;
        }
        return false;   
    };
}


function flyingEnemyIce()
{
    this.x = 1750;
    this.y = 200;
    
    this.draw = function()
    {
        if (flagpole.isReached == false)
        {
            this.x --;
        }
        
        fill(230,230,230);
        ellipse(this.x, this.y, 20,20);
        ellipse(this.x+25, this.y, 30,20);
        stroke(77,255,255);
        ellipse(this.x, this.y, 12, 12);
        triangle(this.x+25, this.y, this.x+45, this.y-15, this.x+45, this.y-5);
        noStroke();
    };
    
    this.strike = function()
    {
        iceBalls.push(new iceBall(this.x+25, this.y+10, levelsConfig[level].icePower, 0, 0));
    };
}

function flyingEnemyFire()
{
    this.x = 1750;
    this.y = 200;
    
    this.draw = function()
    {
        if (flagpole.isReached == false)
        {
            this.x --;
        }
        fill(255,217,25);
        ellipse(this.x, this.y, 20,20);
        ellipse(this.x+25, this.y, 30,20);
        stroke(255,85,0);
        ellipse(this.x, this.y, 12, 12);
        triangle(this.x+25, this.y, this.x+45, this.y-15, this.x+45, this.y-5);
        noStroke();
    };
    
    this.strike = function()
    {
        fireBalls.push(new fireBall(this.x+25, this.y+10, 0, 0));
    };
}

function iceBall(x, y, icePower, initlVelocityX, initlVelocityY)
{
    this.x = x;
    this.y = y;
    this.icePower = icePower;
    this.currentX = x;
    this.currentY = y;
    this.initTime = 0;
    this.initlVelocityX = initlVelocityX;
    this.initlVelocityY = initlVelocityY;
    
    this.update = function()
    {
        this.initTime += 0.01;
        this.currentX = this.currentX + this.initlVelocityX*this.initTime;
        this.currentY = this.currentY + this.initlVelocityY*this.initTime + 0.5*gravityForce*this.initTime**2;
    };
    
    this.draw = function()
    {
        if (flagpole.isReached == false)
        {
            this.update();
        }
        fill(230,230,230);
        stroke(77,255,255);
        ellipse(this.currentX, this.currentY, 20, 20);
        noStroke();
    };
    
    this.checkContact = function(gc_x, gc_y)
    {
        if (abs(gc_x-this.currentX)<10 && gc_y-75<this.currentY)
        {
            this.currentY = 1000;
            characterSpeed = characterSpeed / this.icePower;
        }
    };
}

function fireBall(x, y)
{
    this.x = x;
    this.y = y;
    this.initTime = 0;
    
    this.update = function()
    {
        this.initTime += 0.01;
        this.y = this.y + 0.5*gravityForce*this.initTime**2;
    };
    
    this.draw = function()
    {
        if (flagpole.isReached == false)
        {
            this.update();
        }
        fill(255,217,25);
        stroke(255,85,0);
        ellipse(this.x, this.y, 20, 20);
        noStroke();
    };
       
    this.checkContact = function(gc_x, gc_y)
    {
        if (abs(gc_x-this.x)<10 && gc_y-75<this.y)
        {
            return true;
        }
        return false;
    };
}

function drawCharacter()
{
    if (characterSpeed < 7)
    {
        stroke(77,255,255);
    }
    else
    {
        noStroke();
    }
        
        
	if((isLeft && isFalling) || (isLeft && isPlummeting))
	{
		// image of the character jumping left
        fill(255,239,213);
        triangle(gameCharX+4,gameCharY-33,
                 gameCharX+4,gameCharY-23,
                 gameCharX-15,gameCharY-38);
        triangle(gameCharX-8,gameCharY-13,
                 gameCharX-15,gameCharY-38,
                 gameCharX,gameCharY-13);
        triangle(gameCharX+4,gameCharY-23,
                 gameCharX-8,gameCharY-27,
                 gameCharX-15,gameCharY-38);

        fill(176,224,230);
        rect(gameCharX-4,gameCharY-53,8,22,20);

        fill(200,200,200);
        rect(gameCharX-2,gameCharY-53,4,20,20);
        ellipse(gameCharX, gameCharY-60,11,13);

        fill(255,140,0);
        triangle(gameCharX-5,gameCharY-64,
                 gameCharX+5,gameCharY-64,
                 gameCharX,gameCharY-68);
        rect(gameCharX-8,gameCharY-66,8,2);
        
        //rollers
        beginShape();
        vertex(gameCharX-7.5, gameCharY-9);
        vertex(gameCharX-8, gameCharY-13);
        vertex(gameCharX, gameCharY-13);
        vertex(gameCharX, gameCharY-9);
        endShape();

        rect(gameCharX-10, gameCharY-9,10,2.5);
        
        fill(0);
        ellipse(gameCharX-1.25, gameCharY-5.25, 2.5, 2.5);
        ellipse(gameCharX-3.75, gameCharY-5.25, 2.5, 2.5);
        ellipse(gameCharX-6.25, gameCharY-5.25, 2.5, 2.5);
        ellipse(gameCharX-8.75, gameCharY-5.25, 2.5, 2.5);
        
	}
	else if((isRight && isFalling) || (isRight && isPlummeting))
	{
		// image of the character jumping right 
        fill(255,239,213);
        triangle(gameCharX-4,gameCharY-33,
                 gameCharX-4,gameCharY-23,
                 gameCharX+15,gameCharY-38);
        triangle(gameCharX+8,gameCharY-13,
                 gameCharX+15,gameCharY-38,
                 gameCharX,gameCharY-13);
        triangle(gameCharX-4,gameCharY-23,
                 gameCharX+8,gameCharY-27,
                 gameCharX+15,gameCharY-38);

        fill(176,224,230);
        rect(gameCharX-4,gameCharY-53,8,22,20);

        fill(200,200,200);
        rect(gameCharX-2,gameCharY-53,4,20,20);
        ellipse(gameCharX, gameCharY-60,11,13);

        fill(255,140,0);
        triangle(gameCharX-5,gameCharY-64,
                 gameCharX+5,gameCharY-64,
                 gameCharX,gameCharY-68);
        rect(gameCharX,gameCharY-66,8,2);
        
        //rollers
        beginShape();
        vertex(gameCharX, gameCharY-9);
        vertex(gameCharX, gameCharY-13);
        vertex(gameCharX+8, gameCharY-13);
        vertex(gameCharX+7.5, gameCharY-9);
        endShape();

        rect(gameCharX, gameCharY-9,10,2.5);
        
        fill(0);
        ellipse(gameCharX+1.25, gameCharY-5.25, 2.5, 2.5);
        ellipse(gameCharX+3.75, gameCharY-5.25, 2.5, 2.5);
        ellipse(gameCharX+6.25, gameCharY-5.25, 2.5, 2.5);
        ellipse(gameCharX+8.75, gameCharY-5.25, 2.5, 2.5);

	}
	else if(isLeft)
	{
		// image of the character walking left
        fill(255,239,213);
        beginShape();
        vertex(gameCharX-4,gameCharY-33);
        vertex(gameCharX+4, gameCharY-33);
        vertex(gameCharX+3.5,gameCharY-9);
        vertex(gameCharX-3.5,gameCharY-9);
        endShape(CLOSE);

        fill(176,224,230);
        rect(gameCharX-4,gameCharY-53,8,22,20);

        fill(200,200,200);
        rect(gameCharX-2,gameCharY-53,4,26,20);
        ellipse(gameCharX, gameCharY-60,11,13);

        fill(255,140,0);
        triangle(gameCharX-5,gameCharY-64,
                 gameCharX+5,gameCharY-64,
                 gameCharX,gameCharY-68);
        rect(gameCharX-8,gameCharY-66,8,2);
        
        //rollers
        beginShape();
        vertex(gameCharX-3.5, gameCharY-5);
        vertex(gameCharX-4, gameCharY-9);
        vertex(gameCharX+4, gameCharY-9);
        vertex(gameCharX+4, gameCharY-5);
        endShape();

        rect(gameCharX-6, gameCharY-5,10,2.5);
        
        fill(0);
        ellipse(gameCharX+2.75, gameCharY-1.25, 2.5, 2.5);
        ellipse(gameCharX+0.25, gameCharY-1.25, 2.5, 2.5);
        ellipse(gameCharX-2.25, gameCharY-1.25, 2.5, 2.5);
        ellipse(gameCharX-4.75, gameCharY-1.25, 2.5, 2.5);
	}
	else if(isRight)
	{
		// image of the character walking right 
        fill(255,239,213);
        beginShape();
        vertex(gameCharX-4,gameCharY-33);
        vertex(gameCharX+4, gameCharY-33);
        vertex(gameCharX+3.5,gameCharY-9);
        vertex(gameCharX-3.5,gameCharY-9);
        endShape(CLOSE);
        
        
        fill(176,224,230);
        rect(gameCharX-4,gameCharY-53,8,22,20);

        fill(200,200,200);
        rect(gameCharX-2,gameCharY-53,4,26,20);
        ellipse(gameCharX, gameCharY-60,11,13);

        fill(255,140,0);
        triangle(gameCharX-5,gameCharY-64,
                 gameCharX+5,gameCharY-64,
                 gameCharX,gameCharY-68);
        rect(gameCharX,gameCharY-66,8,2);
        
        //rollers
        beginShape();
        vertex(gameCharX-4, gameCharY-5);
        vertex(gameCharX-4, gameCharY-9);
        vertex(gameCharX+4, gameCharY-9);
        vertex(gameCharX+3.5, gameCharY-5);
        endShape();

        rect(gameCharX-4, gameCharY-5,10,2.5);
        
        fill(0);
        ellipse(gameCharX-2.75, gameCharY-1.25, 2.5, 2.5);
        ellipse(gameCharX-0.25, gameCharY-1.25, 2.5, 2.5);
        ellipse(gameCharX+2.25, gameCharY-1.25, 2.5, 2.5);
        ellipse(gameCharX+4.75, gameCharY-1.25, 2.5, 2.5);
	}
	else if(isFalling || isPlummeting)
	{
        // image of the character jumping facing forwards 
        fill(200,200,200);
        rect(gameCharX-14,gameCharY-53,4,20,20);
        rect(gameCharX+10,gameCharY-53,4,20,20);
        ellipse(gameCharX, gameCharY-60,11,13);
        
        fill(176,224,230);
        triangle(gameCharX-11,gameCharY-53,
                 gameCharX+1,gameCharY-53,
                 gameCharX-9,gameCharY-28);
        triangle(gameCharX+11,gameCharY-53,
                 gameCharX-1,gameCharY-53,
                 gameCharX+9,gameCharY-28);
        triangle(gameCharX-9,gameCharY-28,
                 gameCharX,gameCharY-53,
                 gameCharX+9,gameCharY-28);

        fill(200,200,200);
        triangle(gameCharX-2,gameCharY-53,
                 gameCharX+2,gameCharY-53,
                 gameCharX,gameCharY-48);
        
        fill(255,239,213);
        beginShape();
        vertex(gameCharX-9,gameCharY-35);
        vertex(gameCharX-0.5, gameCharY-35);
        vertex(gameCharX-2,gameCharY-20);
        vertex(gameCharX-8,gameCharY-20);
        endShape(CLOSE);
        
        beginShape();
        vertex(gameCharX+0.5,gameCharY-32);
        vertex(gameCharX+9, gameCharY-32);
        vertex(gameCharX+8,gameCharY-17);
        vertex(gameCharX+2,gameCharY-17);
        endShape(CLOSE);
        
        fill(255,140,0);
        triangle(gameCharX-5,gameCharY-64,
                 gameCharX+5,gameCharY-64,
                 gameCharX,gameCharY-68);
        
        //rollers
        beginShape();
        vertex(gameCharX-7, gameCharY-16);
        vertex(gameCharX-8, gameCharY-20);
        vertex(gameCharX-2, gameCharY-20);
        vertex(gameCharX-3, gameCharY-16);
        endShape();
        
        rect(gameCharX-7, gameCharY-16,4,2.5);
        
        beginShape();
        vertex(gameCharX+3, gameCharY-13);
        vertex(gameCharX+2, gameCharY-17);
        vertex(gameCharX+8, gameCharY-17);
        vertex(gameCharX+7, gameCharY-13);
        endShape();
        
        rect(gameCharX+3, gameCharY-13,4,2.5);
        
        fill(0);
        ellipse(gameCharX-5, gameCharY-12.25, 2.5, 2.5);
        ellipse(gameCharX+5, gameCharY-9.25, 2.5, 2.5);
	}
	else
	{
    // image of the character standing front facing
        //noStroke();
        fill(200,200,200);
        rect(gameCharX-14,gameCharY-53,4,26,20);
        rect(gameCharX+10,gameCharY-53,4,26,20);
        ellipse(gameCharX, gameCharY-60,11,13);

        fill(255,239,213);
        beginShape();
        vertex(gameCharX-9,gameCharY-33);
        vertex(gameCharX-0.5, gameCharY-33);
        vertex(gameCharX-2,gameCharY-9);
        vertex(gameCharX-8,gameCharY-9);
        endShape(CLOSE);
        
        beginShape();
        vertex(gameCharX+0.5,gameCharY-33);
        vertex(gameCharX+9, gameCharY-33);
        vertex(gameCharX+8,gameCharY-9);
        vertex(gameCharX+2,gameCharY-9);
        endShape(CLOSE);
        
        fill(176,224,230);
        triangle(gameCharX-11,gameCharY-53,
                 gameCharX+1,gameCharY-53,
                 gameCharX-9,gameCharY-28);
        triangle(gameCharX+11,gameCharY-53,
                 gameCharX-1,gameCharY-53,
                 gameCharX+9,gameCharY-28);
        triangle(gameCharX-9,gameCharY-28,
                 gameCharX,gameCharY-53,
                 gameCharX+9,gameCharY-28);

        fill(200,200,200);
        triangle(gameCharX-2,gameCharY-53,
                 gameCharX+2,gameCharY-53,
                 gameCharX,gameCharY-48);

        fill(255,140,0);
        triangle(gameCharX-5,gameCharY-64,
                 gameCharX+5,gameCharY-64,
                 gameCharX,gameCharY-68);
        
        //rollers
        rect(gameCharX-7, gameCharY-5,4,2.5);
        beginShape();
        vertex(gameCharX-7, gameCharY-5);
        vertex(gameCharX-8, gameCharY-9);
        vertex(gameCharX-2, gameCharY-9);
        vertex(gameCharX-3, gameCharY-5);
        endShape();
        
        rect(gameCharX+3, gameCharY-5,4,2.5);
        beginShape();
        vertex(gameCharX+3, gameCharY-5);
        vertex(gameCharX+2, gameCharY-9);
        vertex(gameCharX+8, gameCharY-9);
        vertex(gameCharX+7, gameCharY-5);
        endShape();
        
        fill(0);
        ellipse(gameCharX-5, gameCharY-1.25, 2.5, 2.5);
        ellipse(gameCharX+5, gameCharY-1.25, 2.5, 2.5);
    }
}