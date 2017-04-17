'use strict';

let server = 'http://localhost:8080';
let socket = new SockJS(server + '/ws');
let stompClient = Stomp.over(socket);

let gameUUID = null;
let playerUUID = null;

let disableMoves = false;

stompClient.debug = null;

class GomokuCanvas {
    constructor() {
        let boardSize = 701;

        this.canvas = document.getElementById('canvas');

        this.canvas.width = boardSize * 2;
        this.canvas.height = boardSize * 2;
        this.canvas.style.width = boardSize + 'px';
        this.canvas.style.height = boardSize + 'px';

        this.canvasContext = canvas.getContext('2d');
        this.canvasContext.scale(2, 2);


        this.cellSize = 50;
        this.topLeftXPosistion = 20;
        this.topLeftYPosition = 20;

        document.getElementsByTagName('body')[0].style.margin = this.topLeftXPosistion + 'px';
        this.canvas.style.backgroundColor = '#E5D292';

        this.drawGomokuText();
        this.registerClickEventListener();
        this.registerRedrawWebsocketSubsription();
        this.registerNewGameButtonClickEvent();
        this.registerJoinGameButtonClickEvent();
    }

    registerNewGameButtonClickEvent() {
        document.getElementById("new-game").addEventListener('click', () => {
            document.getElementById("game-controls").style.display = 'none';
            canvas.style.display = 'block';
            this.getInitialBoardState();
        });
    }

    registerJoinGameButtonClickEvent() {
        document.getElementById("join-game").addEventListener('click', () => {
            document.getElementById("join-game-controls").style.display = 'block';

            document.getElementById("game-to-join-go").addEventListener('click', () => {
                document.getElementById("game-controls").style.display = 'none';
                canvas.style.display = 'block';
                gameUUID = document.getElementById("game-to-join-uuid").value;
                this.addPlayerToGame();
            });
        });
    }

    addPlayerToGame() {
        $.post(server + '/games/' + gameUUID + '/players', data => {
            playerUUID = data.uuid;
            gomokuCanvas.writeGameInformationToScreen();
            $.get(server + '/games/' + gameUUID, (data) => {
                data.board.pieces.forEach(stone => {
                    gomokuCanvas.placeStoneOnBoard(stone);
                });
            });
        });
    }

    registerRedrawWebsocketSubsription() {
        stompClient.connect({}, () => {
            stompClient.subscribe('/topic/games/pieces', message => {
                var message = JSON.parse(message.body);

                if (message.uuid === gameUUID) {
                    message.board.pieces.forEach(stone => {
                        gomokuCanvas.placeStoneOnBoard(stone);
                    });
                }
            });

            stompClient.subscribe('/topic/games/events/win', message => {
                var message = JSON.parse(message.body);

                if (message.uuid === gameUUID) {
                    alert("Game has been won!");

                    message.board.pieces.forEach(stone => {
                        gomokuCanvas.placeStoneOnBoard(stone);
                    });

                    disableMoves = true;
                }
            });
        });
    }

    placeStoneOnBoard(stone) {
        gomokuCanvas.drawFilledStone(stone.column * 50, stone.row * 50, stone.pebbleType);
    }

    drawGomokuText() {
        this.canvasContext.font = '30px Arial';
        this.canvasContext.fillStyle = 'black';
        this.canvasContext.textAlign = 'right';

        this.canvasContext.fillText('Gomoku!', 700, 348);
    }

    registerClickEventListener() {
        document.addEventListener('click', (event) => {
            let clickedXPosition = event.clientX;
            let clickedYPosition = event.clientY;
            let wasValidXClick = false;
            let wasValidYClick = false;

            for (let i = 0; i < 15; i++) {
                let isInXBounds = (((clickedXPosition - i) - this.topLeftXPosistion) % this.cellSize === 0);

                if (isInXBounds) {
                    wasValidXClick = true;
                    clickedXPosition = ((clickedXPosition - i) - this.topLeftXPosistion);
                }
            }

            for (let i = 0; i < 15; i++) {
                let isInYBounds = (((clickedYPosition - i) - this.topLeftYPosition) % this.cellSize === 0);

                if (isInYBounds) {
                    wasValidYClick = true;
                    clickedYPosition = ((clickedYPosition - i) - this.topLeftXPosistion);
                }
            }

            if (wasValidXClick && wasValidYClick) {
                let stompPayload = {
                    'playerUuid': playerUUID,
                    'column': clickedXPosition / 50,
                    'row': clickedYPosition / 50
                };

                if (!disableMoves) stompClient.send('/app/games/' + gameUUID + '/pieces', {}, JSON.stringify(stompPayload));
            }
        });
    }

    drawFilledStone(clickedXPosition, clickedYPosition, colour) {
        this.canvasContext.beginPath();
        this.canvasContext.arc(clickedXPosition, clickedYPosition, 10, 0, 2 * Math.PI);
        this.canvasContext.fillStyle = colour;
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

            for (let x = 1; x < 15; x++) {
                this.drawYLine(this.canvasContext, 50, this.cellSize * x, i);
            }
        }

        this.canvasContext.stroke();
    }

    getInitialBoardState() {
        $.post(server + '/games', data => {
            gameUUID = data.uuid;
            playerUUID = data.players[0].uuid;
            gomokuCanvas.writeGameInformationToScreen();
        });
    }

    writeGameInformationToScreen() {
        let gameStatus = (!disableMoves) ? "in play" : "finished";
        document.getElementById("game-info").innerHTML = "Game ID: " + gameUUID + "<br/>Player ID: " + playerUUID + "<br/>Game status: " + gameStatus + ".";
    }
}

let gomokuCanvas = new GomokuCanvas();
gomokuCanvas.drawBoard();
