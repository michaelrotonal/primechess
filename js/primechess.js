// Load assets
// Game, Board, Tile, Piece, StatusEffect, Collide
//   Selected, Narrative, Lore, MoveSelected
//   Local Multi / AI switch 
function toShuffled(array) {
  let K = array.toSpliced();
  for (let i = 0; i < K.length; i++) {
    let j = i+Math.floor(Math.random()*(K.length-i)); // How pleasing, no off-by-one errors!
    [K[i], K[j]] = [K[j], K[i]];
  }
  return K;
}
let canvas, context;
let currentTurn,boardPieces,boardStates,selectedLocation,primes;
let lightplayertype = 'human';
let darkplayertype = 'human';
let chaosmode = false;
function resetGame() {
 currentTurn = 1;
 boardPieces = [[-2,-1,0,0,0,0,1,2],[-3,-1,0,0,0,0,1,3],[-5,-1,0,0,0,0,1,5],[-7,-1,0,0,0,0,1,7],[-11,-1,0,0,0,0,1,11],[-5,-1,0,0,0,0,1,5],[-3,-1,0,0,0,0,1,3],[-2,-1,0,0,0,0,1,2]];
 boardStates = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];
 selectedLocation = [];
 let P = [2,3,5,7,11,13,17,19];
 if (chaosmode) {
  P = toShuffled(P);
 }
 primes = {
  yellower: P[0],
  mover: P[1],
  uncable: P[2], // uncapturable
  cloner: P[3],
  increment: P[5],
  rounder: P[6],
  timeser: P[7],
  immune: P[4]
 }
 document.getElementById('consolePanel').innerHTML = 'Another game has started.'
 computermovesteps();
}

// i'm thinking negative numbers represent the opponent's pieces and positive numbers represent your pieces
const boardDark = new Image();
boardDark.src = 'img/tiledk.png';

const boardLight = new Image();
boardLight.src = 'img/tilelt.png'; 

function isValidMove(playfield, playstates, starti, startj, endi, endj) {
  if (starti == endi || startj == endj) {
    if ((playfield[endi][endj] * playfield[starti][startj]) > 0) {
      return false;
    } else {
      if (playstates[endi][endj] > 0 && (playfield[starti][startj] % primes.immune != 0)) {
        return false;
      } else {
        if (Math.abs(starti - endi) + Math.abs(startj - endj) < 2 + discreteLog(playfield[starti][startj], primes.mover)) {
          if ((playfield[endi][endj] == 0) || (discreteLog(playfield[starti][startj], primes.uncable) >= discreteLog(playfield[endi][endj], primes.uncable))) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    }
  } else {
    return false;
  }
}

function showSettings() {
  document.getElementById("settingsDialog").showModal();
}

function saveSettings() {
  lightplayertype = document.getElementById("whitePlayer").value;
  darkplayertype = document.getElementById("blackPlayer").value;
  chaosmode = document.getElementById("chaosMode").checked;
  resetGame();
  document.getElementById("settingsDialog").close();
}

function isValidSelection(playfield, turn, i, j) {
  if (playfield[i][j] * turn > 0) {
    return true;
  } else {
    return false;
  }
}

function findallValidMoves(playfield, playstates, turn) {
  let toret = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (isValidSelection(playfield, turn, i, j)) {
        for (let k = 0; k < 8; k++) {
          for (let l = 0; l < 8; l++) {
            if (isValidMove(playfield, playstates, i, j, k, l)) {
              toret.push([i, j, k, l]);
            }
          }
        }
      }
    }
  }
  return toret;
}

function computermovesteps() {
  let m;
  if (currentTurn == 1) {
    m = lightplayertype;
  } else {
    m = darkplayertype;
  }
  if (m != "human") {
    let h = findallValidMoves(boardPieces, boardStates, currentTurn);;
    if (h.length == 0) {
      declareLoss();
    } else {
      let choice;
      if (m == "computer") {
        let minmovescount = Infinity;
        let minmovesmove;
        let X = toShuffled(h);
        for (let i = 0; i < h.length; i++) {
          let q = X[i]; // random move
          let j = makeMove(boardPieces, boardStates, ...q);
          let t = findallValidMoves(...j, -currentTurn).length + (1/findallValidMoves(...j, currentTurn).length); // its first priority is preventing you from doing stuff. its second priority is letting itself do more stuff.
          if (t < minmovescount) {
            minmovesmove = q;
            minmovescount = t;
          }
        }
        choice = minmovesmove;
      } else {
        choice = h[Math.floor(Math.random()*h.length)];
      }
      [boardPieces, boardStates] = makeMove(boardPieces, boardStates, ...choice);
      currentTurn = currentTurn * -1;
      if (findallValidMoves(boardPieces, boardStates, currentTurn).length == 0) {declareLoss();}
      computermovesteps();
      drawBoard();
    }
  }
}

function makeMove(playfield, playstates, starti, startj, endi, endj) {
  let PF = playfield.map(row => row.toSpliced());
  let PS = playstates.map(row => row.toSpliced());
  let startNumber = PF[starti][startj]; 
  let endNumber = PF[endi][endj];
  PS[starti][startj] = 2 * discreteLog(startNumber, primes.yellower);
  if (startNumber % primes.timeser == 0 && PF[endi][endj] != 0) {
    PF[endi][endj] = startNumber * Math.abs(PF[endi][endj]);
  } else {
    PF[endi][endj] = startNumber - PF[endi][endj];
  }
  PF[starti][startj] = -endNumber * discreteLog(startNumber, primes.cloner);
  PF[endi][endj] += discreteLog(startNumber, primes.increment) * Math.sign(startNumber);
  PF[endi][endj] = Math.ceil(Math.abs(PF[endi][endj]) / (primes.rounder ** discreteLog(startNumber, primes.rounder))) * (primes.rounder ** discreteLog(startNumber, primes.rounder)) * Math.sign(startNumber);
  PS = PS.map(ah => ah.map(n => (n > 0 ? n-1 : n)));
  return [PF, PS];
}

function declareLoss() {
  document.getElementById('consolePanel').innerHTML = (currentTurn == 1 ? 'Black wins!' : 'White wins!')
}

function discreteLog(number, prime) { // How many times can the number be divided by the prime?
  if (number == 0) {
    return Infinity; // If you ever get a piece that is worth zero, Good Luck.
  } else {
    let i = 0;
    while (number % prime ** (i + 1) == 0) {
      i++;
    }
    return i;
  }
}

function getDescription(number) {
  let Q = number;
  let toret = '';
  for (let l = 2; l * l <= Math.abs(Q); l++) {
    if (Q % l == 0) {
      toret += getPrimeDescription(Q, l, discreteLog(Q, l));
      Q /= l ** discreteLog(Q, l);
    }
  }
  if (Math.abs(Q) > 1) {toret += getPrimeDescription(Math.abs(number), Math.abs(Q), 1);}
  if (toret == '') {
    toret = "Base piece. Doesn't do anything."
  }
  return toret;
}

function getPrimeDescription(number, prime, power) {
  switch (prime) {
    case primes.yellower:
      return 'Turns the square it left unusable for ' + power + " of your opponent's turns. ";
    case primes.increment:
      return 'Increases by ' + power + ' after moving. ';
    case primes.cloner:
      return 'Leaves behind a clone of any piece it captures. ';
    case primes.mover:
      return 'Can move up to ' + power + ' additional square' + (power > 1 ? 's' : '') + '. ';
    case primes.uncable:
      return 'Cannot be captured by a piece with fewer than ' + power + ' factors of ' + primes.uncable + '. '
    case primes.rounder:
      return 'Rounds up to the nearest multiple of ' + prime ** power + ' after moving. '
    case primes.timeser:
      return 'When capturing, multiplies by the piece it takes instead of adding. '
    case primes.immune:
      return 'Can use squares made unusable by ' + primes.yellower + '. '
    default:
      if (power == 1) {
        return 'Has a useless factor of ' + prime + '. ';
      } else {
        return 'Has ' + power + ' useless factors of ' + prime + '. ';
      }
  }
}

function clickedBoard(e) {
  context.clearRect(0,0,canvas.width, canvas.height);
 

  let x = e.offsetX;
  let y = e.offsetY; 

  let tile = Math.floor(canvas.width/8); 
  let i = Math.floor(x/tile);
  let j = Math.floor(y/tile); 

  let selectedOutline = "#114466";
  let selectedInterior = "#55aacc22";

  let greenOutline = "#005511";
  let greenInterior = "#00ff0011"; 

  if (selectedLocation == []) {
    if (boardPieces[i][j] * currentTurn > 0) {
      selectedLocation = [i, j];
    } else {
      selectedLocation = [];
    }
  } else {
    if (isValidMove(boardPieces, boardStates, selectedLocation[0], selectedLocation[1], i, j)) {
      [boardPieces, boardStates] = makeMove(boardPieces, boardStates, selectedLocation[0], selectedLocation[1], i, j);
      currentTurn = currentTurn * -1;
      if (findallValidMoves(boardPieces, boardStates, currentTurn).length == 0) {declareLoss();}
      computermovesteps();
      selectedLocation = [];
    } else {
      if (boardPieces[i][j] * currentTurn > 0 && (i != selectedLocation[0] || j != selectedLocation[1])) {
        selectedLocation = [i, j];
      } else {
        selectedLocation = [];
      }
    }
  }

  drawBoard();

  if (selectedLocation.length == 2) {
    drawSquare(selectedLocation[0], selectedLocation[1], selectedOutline, selectedInterior);
    document.getElementById("upperPanel").innerHTML = getDescription(boardPieces[selectedLocation[0]][selectedLocation[1]]);
    for (let ii = 0; ii < 8; ii++) {
      for (let jj = 0; jj < 8; jj++) {
        if (isValidMove(boardPieces, boardStates, selectedLocation[0], selectedLocation[1], ii, jj)) {
          drawSquare(ii, jj, greenOutline, greenInterior)
        }
      }
    }
  }
}

function drawSquare(i, j, strokeStyle, fillStyle) {
  if(i < 0 || i > 7) { return; }
  if(j < 0 || j > 7) { return; }


  let tile = Math.floor(canvas.width/8); 
  context.strokeStyle = strokeStyle;   
  context.fillStyle = fillStyle;
  context.lineWidth = 2; 

  context.rect(i*tile, j*tile, tile,tile);
  context.stroke(); 
  context.fill();
  context.beginPath();

}

function drawBoard() {
  let tile = Math.floor(canvas.width/8); 

  for(let i = 0; i < 8; i++) {
    for(let j = 0; j < 8; j++) {
      if( (i + j) % 2 == 0) {
        context.drawImage(boardDark, i*tile, j*tile, tile, tile); 
      } else {
        context.drawImage(boardLight, i*tile, j*tile, tile, tile);
      }
      if(boardStates[i][j] != 0) {
        drawSquare(i, j, '#FFE40000', '#FFE40022')
      }
      if(boardPieces[i][j] != 0) {
        if (Math.abs(boardPieces[i][j]) > 1) {
          context.textAlign = "center";
          context.fillStyle = (boardPieces[i][j] > 0) ? 'white' : 'black'
          context.font = tile / 3 + "px sans-serif"
          context.fillText(Math.abs(boardPieces[i][j]) + '', (i+0.5)*tile, (j+0.5)*tile);
        } else {
          let stone = new Image();
          stone.src = 'img/stone_' + (boardPieces[i][j]) + '.png';
          context.drawImage(stone, i*tile, j*tile, tile, tile);
        }
      }
    }
  }  
}


document.addEventListener("DOMContentLoaded", function() {
  canvas = document.getElementById("gameBoard");
  context = canvas.getContext('2d');

  canvas.addEventListener('mousedown', function(event) { clickedBoard(event); });


  let tile = Math.floor(canvas.width/8); 
  boardDark.addEventListener('load', (e) => {
    for(let i = 0; i < 8; i++) {
      for(let j = 0; j < 8; j++) {
        if( (i + j) % 2 == 0) {
          context.drawImage(boardDark, i*tile, j*tile, tile, tile); 
        }
      }
    }
  });

  boardLight.addEventListener('load', (e) => {
    for(let i = 0; i < 8; i++) {
      for(let j = 0; j < 8; j++) {
        if( (i + j) % 2 == 1) {
          context.drawImage(boardLight, i*tile, j*tile, tile, tile); 
        }
      }
    }
  });

  resetGame();

  document.getElementById("settingsButton").addEventListener('click', showSettings);
  document.getElementById("unsettingsButton").addEventListener('click', saveSettings);
});