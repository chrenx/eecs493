// ===================== Winter 2021 EECS 493 Assignment 2 =====================
// This starter code provides a structure and helper functions for implementing
// the game functionality. It is a suggestion meant to help you, and you are not
// required to use all parts of it. You can (and should) add additional functions
// as needed or change existing functions.

// ==============================================
// ============ Page Scoped Globals Here ========
// ==============================================

// Counters
let throwingItemIdx = 1;

// Size Constants
const FLOAT_1_WIDTH = 149;
const FLOAT_2_WIDTH = 101;
const FLOAT_SPEED = 2;
const PERSON_SPEED = 25;
const OBJECT_REFRESH_RATE = 50;  //ms
const SCORE_UNIT = 100;  // scoring is in 100-point units


// Size vars
let maxPersonPosX, maxPersonPosY;
let maxItemPosX;
let maxItemPosY;

// Global Window Handles (gwh__)
let gwhGame, gwhStatus, gwhScore;

// Global Object Handles
let player;
let paradeRoute;
let paradeFloat1;
let paradeFloat2;
let paradeTimer;

/*
 * This is a handy little container trick: use objects as constants to collect
 * vals for easier (and more understandable) reference to later.
 */
const KEYS = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  shift: 16,
  spacebar: 32
};

let createThrowingItemIntervalHandle;
let currentThrowingFrequency = 2000;

let settingsPanel = "<button id='settings-panel' onclick='openSettingsPanel()'>Open settings panel</button>";
let startGameBtn = "<button id='startGame' onclick='startGame()'>Start Game</button>";

let highestScore = 0;

let highestScoreInfo = "<div id='high-score'>Highest Score So far: " + highestScore + "</div>";

// ==============================================
// ============ Functional Code Here ============
// ==============================================

// Main
$(document).ready( function() {
  console.log("Ready!");

  // TODO: Event handlers for the settings panel
  // var settingsPanel = "<button id='settings-panel'>Open settings panel</button>"
  $('.status-window').append(settingsPanel);
  $('.status-window').append(highestScoreInfo);
  // $('#settings-panel').click(openSettingsPanel);

  // document.getElementById('player').style.display = 'none';
  // document.getElementById('paradeRoute').style.display = 'none';

  // TODO: Add a splash screen and delay starting the game
  var splashScreen = "<div id='splash-screen'>Mardi Gras Parade!</div>"
  $('.game-window').append(splashScreen);

  setTimeout( function() {
    console.log("splash screen disappear");
    $('#splash-screen').remove();

    let startGame = "<button id='startGame' onclick='startGame()'>Start Game</button>";
    $('.game-window').append(startGameBtn);

    // $('#actualGame').show();
    // $(window).keydown(keydownRouter);
    // console.log("pressing key is allowed now");
    // startParade();
    // console.log("actual game shows up");
    // createThrowingItemIntervalHandle = setInterval(createThrowingItem, currentThrowingFrequency);
  }, 3000);


  // Set global handles (now that the page is loaded)
  // Allows us to quickly access parts of the DOM tree later
  gwhGame = $('#actualGame');
  gwhStatus = $('.status-window');
  gwhScore = $('#score-box');
  player = $('#player');  // set the global player handle
  paradeRoute = $("#paradeRoute");
  paradeFloat1 = $("#paradeFloat1");
  paradeFloat2 = $("#paradeFloat2");

  // Set global positions for thrown items
  maxItemPosX = $('.game-window').width() - 50;
  maxItemPosY = $('.game-window').height() - 40;

  // Set global positions for the player
  maxPersonPosX = $('.game-window').width() - player.width();
  maxPersonPosY = $('.game-window').height() - player.height();

  /*original keydown place*/
  // Keypress event handler
  // $(window).keydown(keydownRouter);
  
  // Periodically check for collisions with thrown items (instead of checking every position-update)
  setInterval( function() {
    checkCollisions();
  }, 100);

  /*original start parade place*/
  // Move the parade floats
  // startParade();

  // Throw items onto the route at the specified frequency
  // createThrowingItemIntervalHandle = setInterval(createThrowingItem, currentThrowingFrequency);
});


function startGame() {
  $('#startGame').remove();
  $('#actualGame').show();
  $(window).keydown(keydownRouter);
  console.log("pressing key is allowed now");
  startParade();
  console.log("actual game shows up");
  $('#gameOverResult').remove();
  
  createThrowingItemIntervalHandle = setInterval(createThrowingItem, currentThrowingFrequency);

}

function restartGame() {

  clearInterval(createThrowingItemIntervalHandle);
  clearInterval(paradeTimer);
  $(window).off("keydown");
  let gameOverResult = "<div id='gameOverResult'>Game Over</div>";
  $('.game-window').append(gameOverResult);

  let restartBtn = "<button id='gameOver' onclick='resetGame()'>Restart Game</button>";

  let currentScore = parseInt(document.getElementById("score-box").innerHTML);
  if (currentScore > highestScore) {
    highestScore = currentScore;
    let maxScore = document.getElementById("high-score");
    maxScore.innerHTML = "Highest Score So far: " + highestScore;
  }

  $('#gameOverResult').fadeTo(1000, 1,() => {
    $('.game-window').append(restartBtn);
  });
  
}

function resetGame() {
  const allItems = document.querySelectorAll('.throwingItem');
  allItems.forEach(item => {
    item.remove();
  });

  let beadscounter = document.getElementById("beadsCounter");
  let candycounter = document.getElementById("candyCounter");

  beadscounter.innerHTML = 0;
  candycounter.innerHTML = 0;

  $('#gameOver').remove();
  $('#gameOverResult').remove();
  $(window).keydown(keydownRouter);
  clearInterval(paradeTimer);
  player.css("top", 530);
  player.css("left", 122);
  paradeFloat1.css("left", -300);
  paradeFloat2.css("left", -150);
  currentThrowingFrequency = 2000;
  startParade();
  let scoreboard = document.getElementById("score-box");
  let currentScore = parseInt(scoreboard.innerHTML);
  if (currentScore > highestScore) {
    highestScore = currentScore;
  }
  scoreboard.innerHTML = 0;
  createThrowingItemIntervalHandle = setInterval(createThrowingItem, currentThrowingFrequency);
}


// When user clicks the button, open the setting panel
function openSettingsPanel() {
  // TODO: open the settings panel
  let changeBox = "<div class='setting-box'></div>"
  let panel = "<div id='panel'>Item thrown from parade float every <input id='paneltext' type='text' value='" + currentThrowingFrequency + "'> milliseconds (min allowed value: 100)</div>"
  $('#settings-panel').replaceWith(changeBox);
  $('.setting-box').append(panel);

  let saveAndClose = "<button id='save-and-close'>Save and close settings panel</button>";
  $('.setting-box').append(saveAndClose);
  $('#save-and-close').click(() => {
    let inputValue = document.getElementById("paneltext").value;
    console.log("frequency of throwing has changed: " + inputValue);
    if (isNaN(inputValue) || inputValue < 100) {
      alert("Frequency must be a number greater than or equal to 100");
    } else {
      currentThrowingFrequency = inputValue;
      clearInterval(createThrowingItemIntervalHandle);
      createThrowingItemIntervalHandle = setInterval(createThrowingItem, currentThrowingFrequency);
      $('.setting-box').replaceWith(settingsPanel);
    }
    
  });

  let discard = "<button id='discard-and-close'>Discard and close settings panel</button>";
  $('.setting-box').append(discard);
  $('#discard-and-close').click(() => {
    $('.setting-box').replaceWith(settingsPanel);
  });
  
  // currentThrowingFrequency = inputValue;
}


// Key down event handler
// Check which key is pressed and call the associated function
function keydownRouter(e) {
  switch (e.which) {
    case KEYS.shift:
      break;
    case KEYS.spacebar:
      break;
    case KEYS.left:
    case KEYS.right:
    case KEYS.up:
    case KEYS.down:
      movePerson(e.which);
      break;
    default:
      console.log("Invalid input!");
  }
}

// Handle player movement events
// TODO: Stop the player from moving into the parade float. Only update if
// there won't be a collision
function movePerson(arrow) {
  
  switch (arrow) {
    case KEYS.left: { // left arrow
      let newPos = parseInt(player.css('left'))-PERSON_SPEED;
      if (newPos < 0) {
        newPos = 0;
      }
      if (willCollide(player, paradeFloat1, -PERSON_SPEED, 0)) {
        newPos = parseInt(player.css('left'));
      }
      if (willCollide(player, paradeFloat2, -PERSON_SPEED, 0)) {
        newPos = parseInt(player.css('left'));
      }
      player.css('left', newPos);
      break;
    }
    case KEYS.right: { // right arrow
      let newPos = parseInt(player.css('left'))+PERSON_SPEED;
      if (newPos > maxPersonPosX) {
        newPos = maxPersonPosX;
      }
      if (willCollide(player, paradeFloat1, PERSON_SPEED, 0)) {
        newPos = parseInt(player.css('left'));
      }
      if (willCollide(player, paradeFloat2, PERSON_SPEED, 0)) {
        newPos = parseInt(player.css('left'));
      }
      player.css('left', newPos);
      break;
    }
    case KEYS.up: { // up arrow
      let newPos = parseInt(player.css('top'))-PERSON_SPEED;
      if (newPos < 0) {
        newPos = 0;
      }
      if (willCollide(player, paradeFloat1, 0, -PERSON_SPEED)) {
        newPos = parseInt(player.css('top'));
      }
      if (willCollide(player, paradeFloat2, 0, -PERSON_SPEED)) {
        newPos = parseInt(player.css('top'));
      }
      player.css('top', newPos);
      break;
    }
    case KEYS.down: { // down arrow
      let newPos = parseInt(player.css('top'))+PERSON_SPEED;
      if (newPos > maxPersonPosY) {
        newPos = maxPersonPosY;
      }
      if (willCollide(player, paradeFloat1, 0, PERSON_SPEED)) {
        newPos = parseInt(player.css('top'));
      }
      if (willCollide(player, paradeFloat2, 0, PERSON_SPEED)) {
        newPos = parseInt(player.css('top'));
      }
      player.css('top', newPos);
      break;
    }
  }
}

// Check for any collisions with thrown items
// If needed, score and remove the appropriate item
function checkCollisions() {
  // TODO
}

// Move the parade floats (Unless they are about to collide with the player)
function startParade(){
  console.log("Starting parade...");
  paradeTimer = setInterval( function() {

      // TODO: (Depending on current position) update left value for each 
      // parade float, check for collision with player, etc.
      if (!willCollide(paradeFloat2, player, FLOAT_SPEED, 0)) {
        let newPosEnd1 = parseInt(paradeFloat1.css("left")) + FLOAT_SPEED;
        let newPosEnd2 = parseInt(paradeFloat2.css("left")) + FLOAT_SPEED;
        // let newPosFront1 = newPosEnd1 + paradeFloat1.width();
        // let newPosFront2 = newPosEnd2 + paradeFloat2.width();

        let rightBoard = parseInt($(".game-window").css("left")) + $(".game-window").width();
        // let rightBoard = $(".outer-container").width();
        
        if (newPosEnd1 > rightBoard) {
          console.log("Float1 hits the right side of the board");
          newPosEnd1 = -300;  // px
          newPosEnd2 = -150;  // px
        }
        // if (newPosEnd2 > rightBoard) {
        //   console.log("Float2 hits the right side of the board");
        //   newPosEnd2 = -300;  // px
        // }

        paradeFloat1.css("left", newPosEnd1);
        paradeFloat2.css("left", newPosEnd2);
      } else {
        // Game over
        restartGame();
      }

  }, OBJECT_REFRESH_RATE);
}


// Get random position to throw object to, create the item, begin throwing
function createThrowingItem(){
  // TODO
  let newPosFront2 = parseInt(paradeFloat2.css("left")) + paradeFloat2.width();
  let rightBoard = parseInt($(".game-window").css("left")) + $(".game-window").width();
  if (newPosFront2 > rightBoard) {
    return;
  }
  if (newPosFront2 < (parseInt($(".game-window").css("left")) + 10)) {
    return;
  }
  console.log("Starting throwing items...");
  let type = "beads";
  if (throwingItemIdx % 3 === 0) {
    type = "candy";
  }
  let imageString = type + ".png";
  let itemDivStr = createItemDivString(throwingItemIdx, type, imageString);
  $(".game-window").append(itemDivStr);

  let currItem = $("#i-" + throwingItemIdx);
  throwingItemIdx++;
  currItem.css("top", parseInt($("#paradeRoute").css("top")) + 40);
  currItem.css("left", parseInt(paradeFloat2.css("left")) + (paradeFloat2.width() * 3 / 4));

  let finalX = Math.round(getRandomNumber(0, $(".game-window").width()));
  let finalY = Math.round(getRandomNumber(80, 500));

  console.log("item destionation: " + finalX + ", " + finalY);

  let tx = finalX - parseInt(currItem.css("left"));
  let ty = finalY - parseInt(currItem.css("top"));
  let dist = Math.sqrt(tx * tx + ty * ty);
  // let rad = Math.atan2(ty, tx);
  // let angle = rad / Math.PI * 180;

  let item_speed = getRandomNumber(5, 20);

  let xChange = (tx / dist) * item_speed;
  let yChange = (ty / dist) * item_speed;

  let iterationsLeft = 30 - Math.round(item_speed);
  console.log(iterationsLeft);

  console.log("x change: " + xChange + ", yChange: " + yChange);
  updateThrownItemPosition(currItem, xChange, yChange, iterationsLeft);
  // run recursively
  // setTimeout(function throwing() {
  //   console.log("kkkkkkkkkkkkkkk: " + finalX);
  //   updateThrownItemPosition(currItem, xChange, yChange, iterationsLeft);
  //   iterationsLeft--;
  // }, OBJECT_REFRESH_RATE);
}

// Helper function for creating items
// throwingItemIdx - index of the item (a unique identifier)
// type - beads or candy
// imageString - beads.png or candy.png
function createItemDivString(itemIndex, type, imageString){
  return "<div id='i-" + itemIndex + "' class='throwingItem " + type + "'><img src='img/" + imageString + "'/></div>";
}

// Throw the item. Meant to be run recursively using setTimeout, decreasing the 
// number of iterationsLeft each time. You can also use your own implementation.
// If the item is at it's final postion, start removing it.
function updateThrownItemPosition(elementObj, xChange, yChange, iterationsLeft){
  // TODO
  if (iterationsLeft === 0) {
    console.log("finish recursion");
    setTimeout(graduallyFadeAndRemoveElement, 5000, elementObj);
    let scoreInterval = setInterval(function() {
      if(isColliding(elementObj, player)) {
        console.log("player gets the score.");
        let scoreboard = document.getElementById("score-box");
        scoreboard.innerHTML = parseInt(scoreboard.innerHTML) + 100;
        
        elementObj.css("border-radius", "100%");
        elementObj.css("backgroundColor", "yellow");

        let beadscounter = document.getElementById("beadsCounter");
        let candycounter = document.getElementById("candyCounter");

        if (document.getElementById(elementObj.attr('id')).classList.contains("beads")) {
          beadscounter.innerHTML = parseInt(beadscounter.innerHTML) + 1;
        } else {
          candycounter.innerHTML = parseInt(candycounter.innerHTML) + 1;
        }


        elementObj.fadeTo(1000, 0, function(){
          $(this).remove();
        });

        clearInterval(scoreInterval);
      }
    }, 100);
    return;
  }

  elementObj.css("left", parseInt(elementObj.css("left")) + xChange);
  elementObj.css("top", parseInt(elementObj.css("top")) + yChange);
  iterationsLeft--;
  console.log("moving................");
  setTimeout(updateThrownItemPosition, OBJECT_REFRESH_RATE, elementObj, xChange, yChange, iterationsLeft);

  // if (!willCollide(elementObj, $('.game-window'), 1, 1)) {
  //   elementObj.css("left", parseInt(elementObj.css("left")) + xChange);
  //   elementObj.css("top", parseInt(elementObj.css("top")) + yChange);
  //   iterationsLeft--;
  //   console.log("moving................");
  //   setTimeout(updateThrownItemPosition, OBJECT_REFRESH_RATE, elementObj, xChange, yChange, iterationsLeft);
  // } else {
  //   console.log("hit the wall: finish recursion");
  //   return;
  // }
}

function graduallyFadeAndRemoveElement(elementObj){
  // Fade to 0 opacity over 2 seconds
  elementObj.fadeTo(2000, 0, function(){
    $(this).remove();
  });
}

// ==============================================
// =========== Utility Functions Here ===========
// ==============================================

// Are two elements currently colliding?
function isColliding(o1, o2) {
  return isOrWillCollide(o1, o2, 0, 0);
}

// Will two elements collide soon?
// Input: Two elements, upcoming change in position for the moving element
function willCollide(o1, o2, o1_xChange, o1_yChange){
  return isOrWillCollide(o1, o2, o1_xChange, o1_yChange);
}

// Are two elements colliding or will they collide soon?
// Input: Two elements, upcoming change in position for the moving element
// Use example: isOrWillCollide(paradeFloat2, person, FLOAT_SPEED, 0)
function isOrWillCollide(o1, o2, o1_xChange, o1_yChange){
  const o1D = { 'left': o1.offset().left + o1_xChange,
        'right': o1.offset().left + o1.width() + o1_xChange,
        'top': o1.offset().top + o1_yChange,
        'bottom': o1.offset().top + o1.height() + o1_yChange
  };
  const o2D = { 'left': o2.offset().left,
        'right': o2.offset().left + o2.width(),
        'top': o2.offset().top,
        'bottom': o2.offset().top + o2.height()
  };
  // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  if (o1D.left < o2D.right &&
    o1D.right > o2D.left &&
    o1D.top < o2D.bottom &&
    o1D.bottom > o2D.top) {
     // collision detected!
     return true;
  }
  return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max){
  return (Math.random() * (max - min)) + min;
}