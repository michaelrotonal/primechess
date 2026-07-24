// Load assets
// Game, Board, Tile, Piece, StatusEffect, Collide
//   Selected, Narrative, Lore, MoveSelected
//   Local Multi / AI switch 

let canvas, context;

const boardDark = new Image();
boardDark.src = 'img/tiledk.png';

const boardLight = new Image();
boardLight.src = 'img/tilelt.png'; 

function clickedBoard(e) {
  context.clearRect(0,0,canvas.width, canvas.height);
  drawBoard(); 

  let x = e.offsetX;
  let y = e.offsetY; 

  let tile = Math.floor(canvas.width/8); 
  let i = Math.floor(x/tile);
  let j = Math.floor(y/tile); 

  let selectedOutline = "#114466";
  let selectedInterior = "#55aacc22";
  drawSquare(i, j, selectedOutline, selectedInterior);

  let greenOutline = "#005511";
  let greenInterior = "#00ff0011"; 

  drawSquare(i+1, j, greenOutline, greenInterior);
  drawSquare(i-1, j, greenOutline, greenInterior);
  drawSquare(i, j+1, greenOutline, greenInterior);
  drawSquare(i, j-1, greenOutline, greenInterior);
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
      }
    }
  }

  for(let i = 0; i < 8; i++) {
    for(let j = 0; j < 8; j++) {
      if( (i + j) % 2 == 1) {
        context.drawImage(boardLight, i*tile, j*tile, tile, tile); 
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