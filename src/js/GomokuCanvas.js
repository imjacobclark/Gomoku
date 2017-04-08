"use strict";

class GomokuCanvas {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.canvasContext = canvas.getContext('2d');
        this.cellSize = 50;
        this.topLeftXPosistion = 20;
        this.topLeftYPosition = 20;
        this.currentPlayer = "white";

        document.getElementsByTagName('body')[0].style.margin = this.topLeftXPosistion + "px";

        this.registerClickEvent();
    }

    registerClickEvent() {
        document.addEventListener("click", (event) => {
            let clickedXPosition = event.clientX;
            let clickedYPosition = event.clientY;
            let wasValidXClick = false;
            let wasValidYClick = false;

            for (let i = 0; i < 5; i++) {
                let isInXBounds = (((clickedXPosition - i) - this.topLeftXPosistion) % this.cellSize === 0);

                if (isInXBounds) {
                    wasValidXClick = true;
                }
            }

            for (let i = 0; i < 5; i++) {
                let isInYBounds = (((clickedYPosition - i) - this.topLeftYPosition) % this.cellSize === 0);

                if (isInYBounds) {
                    wasValidYClick = true;
                }
            }

            if (wasValidXClick && wasValidYClick) {
                this.drawFilledStone(clickedXPosition, clickedYPosition);
                this.toggleCurrentPlayer();
            }
        });
    }

    drawFilledStone(clickedXPosition, clickedYPosition) {
        this.canvasContext.beginPath();
        this.canvasContext.arc(clickedXPosition - 20, clickedYPosition - 21.2, 10, 0, 2 * Math.PI);
        this.canvasContext.fillStyle = this.currentPlayer;
        this.canvasContext.fill();
        this.canvasContext.stroke();
    }

    drawXLine(canvasContext, start, end, offset) {
        canvasContext.moveTo(start, 0 * offset);
        canvasContext.lineTo(start, end * offset);
    }

    drawYLine(canvasContext, start, end, offset) {
        canvasContext.moveTo(0, start * offset);
        canvasContext.lineTo(end, start * offset);
    }

    drawBoard() {
        for (let i = 0; i < 15; i++) {
            for (let cellOffset = 0.5; cellOffset <= 700.5; cellOffset = cellOffset + 50) {
                this.drawXLine(this.canvasContext, cellOffset, this.cellSize, i);
            }

            for (let x = 0; x < 15; x++) {
                this.drawYLine(this.canvasContext, 50, this.cellSize * x, i);
            }
        }

        this.canvasContext.stroke();
    }

    toggleCurrentPlayer() {
        if (this.currentPlayer === 'white') {
            this.currentPlayer = 'black';
        } else {
            this.currentPlayer = 'white';
        }

        document.getElementById("turnIndicator").innerText = this.currentPlayer + " turn";
    }
}

let gomokuCanvas = new GomokuCanvas();
gomokuCanvas.drawBoard();
