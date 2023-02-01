from TheCodeLabs_BaseUtils.DefaultLogger import DefaultLogger
from flask import Blueprint, render_template, redirect, url_for

from logic import Constants
from logic.levels import LEVELS, GetLevel, LEVEL_SELECT
from logic.model import LevelSelectCell

LOGGER = DefaultLogger().create_logger_if_not_exists(Constants.APP_NAME)

NAME = 'gridPuzzle'


def construct_blueprint():
    general = Blueprint('general', __name__, static_folder='static')

    @general.route('/')
    def grid_puzzle():
        LOGGER.debug(f'New visit @ level select')

        levelSelectTutorial = LEVEL_SELECT[0]
        levelSelectGeneral = LEVEL_SELECT[1]
        numberOfTutorialLevels = LEVEL_SELECT[0]['numberOfLevels']

        return render_template(f'{NAME}LevelSelect.jinja2',
                               levelSelectTutorial=levelSelectTutorial['data'],
                               levelSelect=levelSelectGeneral['data'],
                               numberOfTutorialLevels=numberOfTutorialLevels)

    @general.route(f'/<int:levelNumber>')
    def grid_puzzle_level(levelNumber: int):
        if levelNumber < 0 or levelNumber >= len(LEVELS):
            return redirect(url_for('gridPuzzle.GridPuzzle'))

        LOGGER.debug(f'Level {levelNumber} started')

        level = GetLevel(levelNumber)
        levelData = level['data']
        endPosition = level['endPosition']
        hint = level['hint'] if 'hint' in level else ''

        levelDisplayName = __GetLevelDisplayName(levelNumber)
        numberOfTutorialLevels = LEVEL_SELECT[0]['numberOfLevels']

        return render_template(f'{NAME}.jinja2',
                               levelData=levelData,
                               endPosition=endPosition,
                               levelNumber=levelNumber,
                               levelDisplayName=levelDisplayName,
                               numberOfTutorialLevels=numberOfTutorialLevels,
                               hint=hint)

    def __GetLevelDisplayName(levelNumber: int) -> str:
        levelSelectTutorial = LEVEL_SELECT[0]
        levelSelectGeneral = LEVEL_SELECT[1]

        levelCellsTutorial = [element for element in levelSelectTutorial['data'].values() if
                              isinstance(element, LevelSelectCell)]
        levelCellsGeneral = [element for element in levelSelectGeneral['data'].values() if
                             isinstance(element, LevelSelectCell)]
        levelCells = levelCellsTutorial + levelCellsGeneral
        return [cell for cell in levelCells if cell.levelNumber == levelNumber][0].levelDisplayName

    return general
