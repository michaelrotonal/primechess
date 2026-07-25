// Load assets
// Game, Board, Tile, Piece, StatusEffect, Collide
//   Selected, Narrative, Lore, MoveSelected
//   Local Multi / AI switch 

let canvas, context;
let currentTurn = 1;
let boardPieces = [[-2,-1,0,0,0,0,1,2],[-3,-1,0,0,0,0,1,3],[-5,-1,0,0,0,0,1,5],[-7,-1,0,0,0,0,1,7],[-11,-1,0,0,0,0,1,11],[-5,-1,0,0,0,0,1,5],[-3,-1,0,0,0,0,1,3],[-2,-1,0,0,0,0,1,2]];
let boardStates = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];
let selectedLocation = [];
let computer = false;
// i'm thinking negative numbers represent the opponent's pieces and positive numbers represent your pieces
const boardDark = new Image();
boardDark.src = 'img/tiledk.png';

const boardLight = new Image();
boardLight.src = 'img/tilelt.png'; 

function isValidMove(starti, startj, endi, endj) {
  if (starti == endi || startj == endj) {
    if ((boardPieces[endi][endj] * boardPieces[starti][startj]) > 0) {
      return false;
    } else {
      if (boardStates[endi][endj] > 0) {
        return false;
      } else {
        if (Math.abs(starti - endi) + Math.abs(startj - endj) < 2 + discreteLog(boardPieces[starti][startj], 3)) {
          if ((boardPieces[endi][endj] == 0) || (discreteLog(boardPieces[starti][startj], 5) >= discreteLog(boardPieces[endi][endj], 5))) {
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

function isValidSelection(i, j) {
  if (boardPieces[i][j] * currentTurn > 0) {
    return true;
  } else {
    return false;
  }
}

function findallValidMoves() {
  let toret = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (isValidSelection(i, j)) {
        for (let k = 0; k < 8; k++) {
          for (let l = 0; l < 8; l++) {
            if (isValidMove(i, j, k, l)) {
              toret.push([i, j, k, l]);
            }
          }
        }
      }
    }
  }
  return toret;
}

function beforemovesteps() {
  boardStates = boardStates.map(ah => ah.map(n => (n > 0 ? n-1 : n)));
  if (computer && (currentTurn == -1)) {
    let h = findallValidMoves();
    if (h.length == 0) {
      declareLoss();
    } else {
      let q = h[Math.floor(Math.random() * h.length)]; // random move
      makeMove(...q);
      drawBoard();
    }
  }
}

function makeMove(starti, startj, endi, endj) {
  let startNumber = boardPieces[starti][startj]; 
  let endNumber = boardPieces[endi][endj];
  boardStates[starti][startj] = 2 * discreteLog(startNumber, 2);
  boardPieces[endi][endj] = startNumber - boardPieces[endi][endj];
  boardPieces[starti][startj] = -endNumber * discreteLog(startNumber, 7);
  boardPieces[endi][endj] += discreteLog(startNumber, 11) * Math.sign(startNumber);
  currentTurn = currentTurn * -1;
  beforemovesteps();
  if (findallValidMoves().length == 0) {declareLoss();}
}

function declareLoss() {
  // uh. figure this out
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
    case 2:
      return 'Turns the square it left unusable for ' + power + " of your opponent's turns. ";
    case 11:
      return 'Increases by ' + power + ' after moving. ';
    case 7:
      return 'Leaves behind a clone of any piece it captures. ';
    case 3:
      return 'Can move up to ' + power + ' additional squares. ';
    case 5:
      return 'Cannot be captured by a piece with fewer than ' + power + ' factors of 5. '
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
    if (isValidMove(selectedLocation[0], selectedLocation[1], i, j)) {
      makeMove(selectedLocation[0], selectedLocation[1], i, j);
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
        if (isValidMove(selectedLocation[0], selectedLocation[1], ii, jj)) {
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
        context.textAlign = "center";
        context.fillStyle = (boardPieces[i][j] > 0) ? 'white' : 'black'
        context.font = tile / 3 + "px sans-serif"
        context.fillText(Math.abs(boardPieces[i][j]) + '', (i+0.5)*tile, (j+0.5)*tile);
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
});