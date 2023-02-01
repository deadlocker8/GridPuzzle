import json
from typing import Dict, List, Tuple

from TheCodeLabs_BaseUtils.DefaultLogger import DefaultLogger
from werkzeug.exceptions import abort

from logic import Constants
from logic.levels import LEVELS, GetLevel, LEVEL_SELECT
from logic.model import EdgeGapHorizontal, EdgeGapVertical, Corner, EdgeHorizontal, EdgeVertical, Cell, \
    EndSpaceHorizontal, EndSpaceVertical

LOGGER = DefaultLogger().create_logger_if_not_exists(Constants.APP_NAME)


def OnSubmitSolution(levelNumber: int, usedPositions: List, userGameData: str) -> Dict:
    if levelNumber < 0 or levelNumber >= len(LEVELS):
        abort(400)

    userGameData = json.loads(userGameData)
    if not userGameData:
        levelSelectTutorial = LEVEL_SELECT[0]
        levelSelectGeneral = LEVEL_SELECT[1]
        userGameData = __CreateEmptyUserGameData(levelSelectTutorial['numberOfLevels'],
                                                 levelSelectGeneral['numberOfLevels'])

    level = GetLevel(levelNumber)
    levelData = level['data']

    # load used positions
    for position in usedPositions:
        position = tuple(position)
        if position not in levelData:
            abort(400)

        levelData[position].isUsed = True

    result = __CheckValidSolution(level, userGameData)
    if not result['isCorrect']:
        LOGGER.debug(f'Level {levelNumber} finished: invalid solution')
        return result

    result['userGameData'][levelNumber] = True
    LOGGER.debug(f'Level {levelNumber} finished: success')
    return result


def __CheckValidSolution(level, userGameData) -> Dict:
    levelData = level['data']
    endPosition = level['endPosition']

    errorGapPositions = []
    errorCornerUsedEdgePositions = []
    errorMandatoryPositions = []

    for position, element in levelData.items():
        # check if gaps are illegally used
        if isinstance(element, (EdgeGapHorizontal, EdgeGapVertical)):
            if element.isUsed:
                errorGapPositions.append(position)

        # check if corners exist with mote than two used edges
        if isinstance(element, Corner):
            if __CheckCornerUsedEdgeCount(levelData, position):
                errorCornerUsedEdgePositions.append(position)

        # check all mandatory positions are used
        if isinstance(element, (EdgeHorizontal, EdgeVertical, Corner)):
            if element.isMandatory and not element.isUsed:
                errorMandatoryPositions.append(position)

    # check all colors are separated
    errorColorPositions = __CheckColorsSeparated(levelData)

    # check end position is reached
    isEndPositionUsed = levelData[tuple(endPosition)].isUsed

    isCorrect = isEndPositionUsed and not errorGapPositions and not errorCornerUsedEdgePositions and not errorMandatoryPositions and not errorColorPositions

    return {
        'isCorrect': isCorrect,
        'errorGapPositions': errorGapPositions,
        'errorCornerUsedEdgePositions': errorCornerUsedEdgePositions,
        'errorMandatoryPositions': errorMandatoryPositions,
        'errorColorPositions': errorColorPositions,
        'userGameData': userGameData
    }


def __CheckColorsSeparated(levelData: Dict) -> List:
    alreadyCheckedPositions = []
    errorColorPositions = []

    for position, element in levelData.items():
        if position in alreadyCheckedPositions:
            continue

        if isinstance(element, Cell):
            neighbourGroup = __GetNeighbours(levelData, position, alreadyCheckedPositions)
            cellPositionsWithSquares = [cellPosition for cellPosition in neighbourGroup if
                                        isinstance(levelData[cellPosition], Cell) and levelData[
                                            cellPosition].square is not None]
            squareColors = [levelData[cellPos].square.color for cellPos in cellPositionsWithSquares]
            uniqueSquareColors = set(squareColors)

            if len(uniqueSquareColors) > 1:
                errorColorPositions.extend(cellPositionsWithSquares)

    return errorColorPositions


def __GetNeighbours(levelData: Dict, cellPosition: Tuple[int, int], alreadyCheckedPositions: List) -> List:
    neighbours = []

    neighbours.append(cellPosition)
    alreadyCheckedPositions.append(cellPosition)

    topEdgePosition = (cellPosition[0] - 1, cellPosition[1])
    topCellPosition = (cellPosition[0] - 2, cellPosition[1])
    if __IsValidNeighbourAndNotUsed(levelData, topEdgePosition, topCellPosition):
        if topCellPosition not in alreadyCheckedPositions:
            neighbours.append(topCellPosition)
            neighbours.extend(__GetNeighbours(levelData, topCellPosition, alreadyCheckedPositions))

    rightEdgePosition = (cellPosition[0], cellPosition[1] + 1)
    rightCellPosition = (cellPosition[0], cellPosition[1] + 2)
    if __IsValidNeighbourAndNotUsed(levelData, rightEdgePosition, rightCellPosition):
        if rightCellPosition not in alreadyCheckedPositions:
            neighbours.append(rightCellPosition)
            neighbours.extend(__GetNeighbours(levelData, rightCellPosition, alreadyCheckedPositions))

    bottomEdgePosition = (cellPosition[0] + 1, cellPosition[1])
    bottomCellPosition = (cellPosition[0] + 2, cellPosition[1])
    if __IsValidNeighbourAndNotUsed(levelData, bottomEdgePosition, bottomCellPosition):
        if bottomCellPosition not in alreadyCheckedPositions:
            neighbours.append(bottomCellPosition)
            neighbours.extend(__GetNeighbours(levelData, bottomCellPosition, alreadyCheckedPositions))

    leftEdgePosition = (cellPosition[0], cellPosition[1] - 1)
    leftCellPosition = (cellPosition[0], cellPosition[1] - 2)
    if __IsValidNeighbourAndNotUsed(levelData, leftEdgePosition, leftCellPosition):
        if leftCellPosition not in alreadyCheckedPositions:
            neighbours.append(leftCellPosition)
            neighbours.extend(__GetNeighbours(levelData, leftCellPosition, alreadyCheckedPositions))

    return neighbours


def __IsValidNeighbourAndNotUsed(levelData: Dict, edgePosition: Tuple[int, int], cellPosition: Tuple[int, int]) -> bool:
    if edgePosition not in levelData:
        return False

    if cellPosition not in levelData:
        return False

    if isinstance(levelData[edgePosition], (EndSpaceHorizontal, EndSpaceVertical)):
        return False

    return not levelData[edgePosition].isUsed


def __CheckCornerUsedEdgeCount(levelData: Dict, cellPosition: Tuple[int, int]) -> bool:
    topEdgePosition = (cellPosition[0] - 1, cellPosition[1])
    rightEdgePosition = (cellPosition[0], cellPosition[1] + 1)
    bottomEdgePosition = (cellPosition[0] + 1, cellPosition[1])
    leftEdgePosition = (cellPosition[0], cellPosition[1] - 1)

    numberOfUsedEdges = 0
    edgePositions = [topEdgePosition, rightEdgePosition, bottomEdgePosition, leftEdgePosition]
    for position in edgePositions:
        if position not in levelData:
            continue

        if levelData[position].isUsed:
            numberOfUsedEdges += 1

    return numberOfUsedEdges > 2


def __CreateEmptyUserGameData(numberOfTutorialLevels: int, numberOfLevels: int) -> List:
    return [False] * (numberOfTutorialLevels + numberOfLevels)
