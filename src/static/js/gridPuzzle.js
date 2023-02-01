let socketConnection = null;

document.addEventListener("DOMContentLoaded", function()
{
    let url = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
    socketConnection = io.connect(url);

    if(document.getElementById('buttons') !== null)
    {
        initGridPuzzle();
    }
});

function initGridPuzzle()
{
    let gridPuzzle = new GridPuzzle();

    initListeners(gridPuzzle);
}

function initListeners(gridPuzzle)
{
    let buttonLeft = document.getElementById('button-left');
    buttonLeft.onclick = function()
    {
        gridPuzzle.moveLeft();
    };

    let buttonRight = document.getElementById('button-right');
    buttonRight.onclick = function()
    {
        gridPuzzle.moveRight();
    };

    let buttonUp = document.getElementById('button-up');
    buttonUp.onclick = function()
    {
        gridPuzzle.moveUp();
    };

    let buttonDown = document.getElementById('button-down');
    buttonDown.onclick = function()
    {
        gridPuzzle.moveDown();
    };

    let buttonReset = document.getElementById('button-reset');
    buttonReset.onclick = function()
    {
        gridPuzzle.reset();
    };

    window.addEventListener("keydown", (event) =>
    {
        if(event.defaultPrevented)
        {
            return; // Do nothing if the event was already processed
        }

        switch(event.key)
        {
            case "Down": // IE/Edge specific value
            case "ArrowDown":
                event.preventDefault();
                buttonDown.classList.toggle('active', true);
                buttonDown.click();
                break;
            case "Up": // IE/Edge specific value
            case "ArrowUp":
                event.preventDefault();
                buttonUp.classList.toggle('active', true);
                buttonUp.click();
                break;
            case "Left": // IE/Edge specific value
            case "ArrowLeft":
                event.preventDefault();
                buttonLeft.classList.toggle('active', true);
                buttonLeft.click();
                break;
            case "Right": // IE/Edge specific value
            case "ArrowRight":
                event.preventDefault();
                buttonRight.classList.toggle('active', true);
                buttonRight.click();
                break;
            case "r": // IE/Edge specific value
            case "R":
                event.preventDefault();
                buttonReset.classList.toggle('active', true);
                buttonReset.click();
                break;
        }
    });

    window.addEventListener("keyup", (event) =>
    {
        if(event.defaultPrevented)
        {
            return; // Do nothing if the event was already processed
        }

        switch(event.key)
        {
            case "Down": // IE/Edge specific value
            case "ArrowDown":
                event.preventDefault();
                buttonDown.classList.toggle('active', false);
                break;
            case "Up": // IE/Edge specific value
            case "ArrowUp":
                event.preventDefault();
                buttonUp.classList.toggle('active', false);
                break;
            case "Left": // IE/Edge specific value
            case "ArrowLeft":
                event.preventDefault();
                buttonLeft.classList.toggle('active', false);
                break;
            case "Right": // IE/Edge specific value
            case "ArrowRight":
                event.preventDefault();
                buttonRight.classList.toggle('active', false);
                break;
            case "r": // IE/Edge specific value
            case "R":
                event.preventDefault();
                buttonReset.classList.toggle('active', false);
                break;
        }
    });
}

function resetAllArrowButtons()
{
    let buttons = document.querySelectorAll('.arrow-button');
    for(let i = 0; i < buttons.length; i++)
    {
        buttons[i].classList.toggle('active', false);
    }
}

class GridPuzzle
{
    constructor()
    {
        this.maxColumnIndex = this.determineMaxColumnIndex();
        this.maxRowIndex = this.determineMaxRowIndex();
        this.usedPositions = [this.determineStartPosition()];
        this.endPosition = this.determineEndPosition();

        // gameStates
        // 0 = idle
        // 1 = submitting solution
        // 2 = wrong solution
        // 3 = correct solution
        this.gameState = 0;

        this.wrongSolutionCount = 0;
    }

    determineMaxColumnIndex()
    {
        return document.querySelectorAll('#layer-2 div[data-row="0"]').length - 1;
    }

    determineMaxRowIndex()
    {
        return document.querySelectorAll('#layer-2 div[data-column="0"]').length - 1;
    }

    determineStartPosition()
    {
        let isEndLeft = document.querySelector('.end-left') !== null;

        if(isEndLeft)
        {
            return [this.maxRowIndex, 1]
        }

        return [this.maxRowIndex, 0]
    }

    determineEndPosition()
    {
        let endElement = document.querySelector('.end');
        return [parseInt(endElement.dataset.row), parseInt(endElement.dataset.column)];
    }

    getCurrentPosition()
    {
        return this.usedPositions[this.usedPositions.length - 1];
    }

    isPositionUsed(position)
    {
        for(let usedPosition of this.usedPositions)
        {
            if(usedPosition[0] === position[0] && usedPosition[1] === position[1])
            {
                return true;
            }
        }

        return false;
    }

    removePosition(position)
    {
        for(let i = this.usedPositions.length - 1; i >= 0; i--)
        {
            if(this.usedPositions[i][0] === position[0] && this.usedPositions[i][1] === position[1])
            {
                this.usedPositions.splice(i, 1);
            }
        }
    }

    moveUp()
    {
        if(this.gameState !== 0)
        {
            return;
        }

        let currentRow = this.getCurrentPosition()[0];
        let currentColumn = this.getCurrentPosition()[1];

        let newRowEdge = currentRow - 1;
        let newRowCorner = currentRow - 2;

        if(this.checkIsEndPosition(currentRow, currentColumn, newRowEdge, currentColumn, 'up'))
        {
            return;
        }

        // out of bounds
        if(newRowCorner < 0)
        {
            return;
        }

        // is edge already used --> undo
        if(this.isPositionUsed([newRowEdge, currentColumn]))
        {
            this.undoVerticalMovement(currentRow, currentColumn, newRowCorner, newRowEdge);
            return;
        }

        if(this.checkIsGapOrCornerAlreadyUsed(newRowEdge, currentColumn, newRowCorner, currentColumn))
        {
            return;
        }

        this.updateCorner(currentRow, currentColumn, 'up');
        this.updateEdge('edge-vertical', newRowEdge, currentColumn, 'up', true);

        this.usedPositions.push([newRowEdge, currentColumn]);
        this.usedPositions.push([newRowCorner, currentColumn]);

        this.updateCornerTip(newRowCorner, currentColumn);
    }

    moveDown()
    {
        if(this.gameState !== 0)
        {
            return;
        }

        let currentRow = this.getCurrentPosition()[0];
        let currentColumn = this.getCurrentPosition()[1];

        let newRowEdge = currentRow + 1;
        let newRowCorner = currentRow + 2;

        // out of bounds
        if(newRowCorner > this.maxRowIndex)
        {
            return;
        }

        // is edge already used --> undo
        if(this.isPositionUsed([newRowEdge, currentColumn]))
        {
            this.undoVerticalMovement(currentRow, currentColumn, newRowCorner, newRowEdge);
            return;
        }

        if(this.checkIsGapOrCornerAlreadyUsed(newRowEdge, currentColumn, newRowCorner, currentColumn))
        {
            return;
        }

        this.updateCorner(currentRow, currentColumn, 'down');
        this.updateEdge('edge-vertical', newRowEdge, currentColumn, 'down', true);

        this.usedPositions.push([newRowEdge, currentColumn]);
        this.usedPositions.push([newRowCorner, currentColumn]);

        this.updateCornerTip(newRowCorner, currentColumn);
    }

    moveRight()
    {
        if(this.gameState !== 0)
        {
            return;
        }

        let currentRow = this.getCurrentPosition()[0];
        let currentColumn = this.getCurrentPosition()[1];

        let newColumnEdge = currentColumn + 1;
        let newColumnCorner = currentColumn + 2;

        if(this.checkIsEndPosition(currentRow, currentColumn, currentRow, newColumnEdge, 'right'))
        {
            return;
        }

        // out of bounds
        if(newColumnCorner > this.maxColumnIndex)
        {
            return;
        }

        // is edge already used --> undo
        if(this.isPositionUsed([currentRow, newColumnEdge]))
        {
            this.undoHorizontalMovement(currentRow, currentColumn, newColumnCorner, newColumnEdge);
            return;
        }

        if(this.checkIsGapOrCornerAlreadyUsed(currentRow, newColumnEdge, currentRow, newColumnCorner))
        {
            return;
        }

        this.updateCorner(currentRow, currentColumn, 'right');
        this.updateEdge('edge-horizontal', currentRow, newColumnEdge, 'right', true);

        this.usedPositions.push([currentRow, newColumnEdge]);
        this.usedPositions.push([currentRow, newColumnCorner]);

        this.updateCornerTip(currentRow, newColumnCorner);
    }

    moveLeft()
    {
        if(this.gameState !== 0)
        {
            return;
        }

        let currentRow = this.getCurrentPosition()[0];
        let currentColumn = this.getCurrentPosition()[1];

        let newColumnEdge = currentColumn - 1;
        let newColumnCorner = currentColumn - 2;

        if(this.checkIsEndPosition(currentRow, currentColumn, currentRow, newColumnEdge, 'left'))
        {
            return;
        }

        // out of bounds
        if(newColumnCorner < 0)
        {
            return;
        }

        // is edge already used --> undo
        if(this.isPositionUsed([currentRow, newColumnEdge]))
        {
            this.undoHorizontalMovement(currentRow, currentColumn, newColumnCorner, newColumnEdge);
            return;
        }

        if(this.checkIsGapOrCornerAlreadyUsed(currentRow, newColumnEdge, currentRow, newColumnCorner))
        {
            return;
        }

        this.updateCorner(currentRow, currentColumn, 'left');
        this.updateEdge('edge-horizontal', currentRow, newColumnEdge, 'left', true);

        this.usedPositions.push([currentRow, newColumnEdge]);
        this.usedPositions.push([currentRow, newColumnCorner]);

        this.updateCornerTip(currentRow, newColumnCorner);
    }

    checkIsEndPosition(currentRow, currentColumn, row, column, direction)
    {
        if(row === this.endPosition[0] && column === this.endPosition[1])
        {
            this.updateCorner(currentRow, currentColumn, direction);

            let end = document.querySelector('#layer-2 .end');
            end.classList.toggle('edge-highlight', true);
            this.usedPositions.push([row, column]);

            this.onSubmitSolution();
            return true;
        }

        return false;
    }

    checkIsGapOrCornerAlreadyUsed(rowEdge, columnEdge, rowCorner, columnCorner)
    {
        // is gap
        let edge = this.getEdgeElementByPosition(rowEdge, columnEdge);
        if(edge.classList.contains('edge-gap'))
        {
            return true;
        }

        // is corner already used
        return this.isPositionUsed([rowCorner, columnCorner]);
    }

    updateEdge(edgeClass, edgeRow, edgeColumn, showHighlight)
    {
        let edge = document.querySelector('#layer-2 .' + edgeClass + '[data-row="' + edgeRow + '"][data-column="' + edgeColumn + '"]');
        edge.classList.toggle('edge-highlight', showHighlight);
    }

    getEdgeElementByPosition(row, column, layer = 'layer-2')
    {
        return document.querySelector('#' + layer + ' div[data-row="' + row + '"][data-column="' + column + '"]');
    }

    resetCorner(row, column)
    {
        let corner = this.getEdgeElementByPosition(row, column);
        this.resetElement(corner);
    }

    resetElement(element)
    {
        element.classList.toggle('edge-highlight', false);
        element.classList.toggle('edge-highlight-wrong', false);
        element.classList.toggle('edge-highlight-correct', false);

        element.classList.toggle('edge-highlight-tip-up', false);
        element.classList.toggle('edge-highlight-tip-right', false);
        element.classList.toggle('edge-highlight-tip-down', false);
        element.classList.toggle('edge-highlight-tip-left', false);

        element.classList.toggle('edge-corner-top-right', false);
        element.classList.toggle('edge-corner-top-left', false);
        element.classList.toggle('edge-corner-bottom-right', false);
        element.classList.toggle('edge-corner-bottom-left', false);
    }

    updateCornerTip(row, column)
    {
        let corner = this.getEdgeElementByPosition(row, column);
        corner.classList.toggle('edge-highlight', true);
        corner.classList.toggle('edge-highlight-tip-' + this.determinePreviousDirection(row, column), true);
    }

    determinePreviousDirection(row, column)
    {
        if(this.isPositionUsed([row - 1, column]))
        {
            return 'down'
        }
        else if(this.isPositionUsed([row + 1, column]))
        {
            return 'up'
        }
        else if(this.isPositionUsed([row, column - 1]))
        {
            return 'right'
        }
        else if(this.isPositionUsed([row, column + 1]))
        {
            return 'left'
        }
    }

    updateCorner(row, column, direction)
    {
        this.resetCorner(row, column);

        let corner = this.getEdgeElementByPosition(row, column);
        corner.classList.toggle('edge-highlight', true);

        let previousDirection = this.determinePreviousDirection(row, column);

        if(previousDirection === direction)
        {
            return;
        }

        if(previousDirection === 'up' && direction === 'left')
        {
            corner.classList.toggle('edge-corner-top-right', true)
        }
        else if(previousDirection === 'up' && direction === 'right')
        {
            corner.classList.toggle('edge-corner-top-left', true)
        }
        if(previousDirection === 'down' && direction === 'left')
        {
            corner.classList.toggle('edge-corner-bottom-right', true)
        }
        else if(previousDirection === 'down' && direction === 'right')
        {
            corner.classList.toggle('edge-corner-bottom-left', true)
        }
        if(previousDirection === 'left' && direction === 'up')
        {
            corner.classList.toggle('edge-corner-bottom-left', true)
        }
        else if(previousDirection === 'left' && direction === 'down')
        {
            corner.classList.toggle('edge-corner-top-left', true)
        }
        if(previousDirection === 'right' && direction === 'up')
        {
            corner.classList.toggle('edge-corner-bottom-right', true)
        }
        else if(previousDirection === 'right' && direction === 'down')
        {
            corner.classList.toggle('edge-corner-top-right', true)
        }
    }

    undoHorizontalMovement(currentRow, currentColumn, newColumnCorner, newColumnEdge)
    {
        this.resetCorner(currentRow, currentColumn);
        this.updateEdge('edge-horizontal', currentRow, newColumnEdge, false);

        this.removePosition([currentRow, currentColumn]);
        this.removePosition([currentRow, newColumnEdge]);

        this.updateCornerTip(currentRow, newColumnCorner);
    }

    undoVerticalMovement(currentRow, currentColumn, newRowCorner, newRowEdge)
    {
        this.resetCorner(currentRow, currentColumn);
        this.updateEdge('edge-vertical', newRowEdge, currentColumn, false);

        this.removePosition([currentRow, currentColumn]);
        this.removePosition([newRowEdge, currentColumn]);

        this.updateCornerTip(newRowCorner, currentColumn);
    }

    getLevelNumber()
    {
        return parseInt(document.querySelector('.grid-container').dataset.levelNumber);
    }

    onSubmitSolution()
    {
        this.gameState = 1;

        resetAllArrowButtons();

        let self = this;

        let userGameData = JSON.stringify(getUserGameData());
        socketConnection.emit('gridPuzzleSubmitSolution', this.getLevelNumber(), this.usedPositions, userGameData, function(response)
        {
            window.localStorage.setItem('userGameData', JSON.stringify(response.userGameData));

            if(response.isCorrect)
            {
                self.onSolutionCorrect();
            }
            else
            {
                self.onSolutionWrong(response);
            }
        });
    }

    onSolutionCorrect()
    {
        this.gameState = 3;

        // color used positions green
        let usedElements = document.querySelectorAll('.edge-highlight');
        for(let i = 0; i < usedElements.length; i++)
        {
            usedElements[i].classList.toggle('edge-highlight-correct', true);
        }

        let self = this;

        setTimeout(function()
        {
            let currentUrl = window.location.href;
            let newLevelNumber = self.getLevelNumber() + 1;
            let indexOfLastSlash = currentUrl.lastIndexOf('/');

            // end of tutorial levels
            if(newLevelNumber === numberOfTutorialLevels)
            {
                window.location.href = currentUrl.substring(0, indexOfLastSlash);
            }
            else
            {
                window.location.href = currentUrl.substring(0, indexOfLastSlash) + '/' + newLevelNumber;
            }
        }, 2000);

    }

    onSolutionWrong(response)
    {
        this.gameState = 2;
        this.wrongSolutionCount++;

        // color used positions red
        let usedElements = document.querySelectorAll('.edge-highlight');
        for(let i = 0; i < usedElements.length; i++)
        {
            usedElements[i].classList.toggle('edge-highlight-wrong', true);
        }

        // show error positions (mandatory elements)
        for(let position of response.errorMandatoryPositions)
        {
            let dot = this.getEdgeElementByPosition(position[0], position[1], 'layer-1').querySelector('.dot')
            dot.classList.toggle('show-error', true);
        }

        // show error positions (colors)
        for(let position of response.errorColorPositions)
        {
            let square = document.querySelector('#layer-1 .cell[data-row="' + position[0] + '"][data-column="' + position[1] + '"] .square');
            square.classList.toggle('show-error', true);
        }

        let self = this;

        setTimeout(function()
        {
            let hintText = document.getElementById('hint-text').innerText;

            if(self.wrongSolutionCount >= 3 && hintText !== '')
            {
                self.showHintButton();
            }

            self.reset();
        }, 2500);
    }

    reset()
    {
        this.usedPositions = [this.determineStartPosition()];

        let usedElements = document.querySelectorAll('#layer-2 .edge-highlight:not(.start):not(.end)');
        for(let i = 0; i < usedElements.length; i++)
        {
            let element = usedElements[i];
            this.resetCorner(element.dataset.row, element.dataset.column);
        }

        let end = document.querySelector('#layer-2 .end');
        this.resetElement(end);

        let start = document.querySelector('#layer-2 .start');
        this.resetElement(start);
        start.classList.toggle('edge-highlight', true);

        let showErrorElements = document.querySelectorAll('.show-error');
        for(let i = 0; i < showErrorElements.length; i++)
        {
            showErrorElements[i].classList.toggle('show-error', false);
        }

        this.gameState = 0;
    }

    showHintButton()
    {
        let buttonHint = document.getElementById('button-hint');
        buttonHint.classList.toggle('hidden', false);

        buttonHint.onclick = function()
        {
            buttonHint.classList.toggle('hidden', true);

            let hintContainer = document.getElementById('hint');
            hintContainer.classList.toggle('hidden', false);
        };
    }
}
