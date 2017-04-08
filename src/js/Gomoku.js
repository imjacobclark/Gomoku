"use strict";

class Gomoku {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.canvasContext = canvas.getContext('2d');
        this.cellSize = 50;
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
        // TODO: Record offsets into an array so click event can detect where to draw a player
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
}

let gomoku = new Gomoku();
gomoku.drawBoard();