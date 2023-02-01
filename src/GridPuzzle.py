import logging
import os
from typing import Dict, List

from TheCodeLabs_BaseUtils.DefaultLogger import DefaultLogger
from TheCodeLabs_BaseUtils.OverrideDecorator import override
from TheCodeLabs_FlaskUtils import FlaskBaseApp
from flask import Flask
from flask_socketio import SocketIO

from blueprints import General
from logic import Constants, events

LOGGER = DefaultLogger().create_logger_if_not_exists(Constants.APP_NAME)


class GridPuzzle(FlaskBaseApp):
    def __init__(self, appName: str, rootDir: str, logger: logging.Logger):
        super().__init__(appName, rootDir, logger, serveFavicon=False)

        loggingSettings = self._settings['logging']
        if loggingSettings['enableRotatingLogFile']:
            DefaultLogger.add_rotating_file_handler(LOGGER,
                                                    fileName=loggingSettings['fileName'],
                                                    maxBytes=loggingSettings['maxBytes'],
                                                    backupCount=loggingSettings['numberOfBackups'])

    @override
    def _create_flask_app(self):
        app = Flask(self._rootDir)
        socketio = SocketIO(app)

        @socketio.on('gridPuzzleSubmitSolution')
        def OnSubmitSolution(levelNumber: int, usedPositions: List, userGameData: str) -> Dict:
            return events.OnSubmitSolution(levelNumber, usedPositions, userGameData)

        @socketio.on('connect')
        def Connect():
            LOGGER.debug('Client connected')

        return app

    def _register_blueprints(self, app):
        app.register_blueprint(General.construct_blueprint())


if __name__ == '__main__':
    server = GridPuzzle(Constants.APP_NAME, os.path.dirname(__file__), LOGGER)
    server.start_server()
