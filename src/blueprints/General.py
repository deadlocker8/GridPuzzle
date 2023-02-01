from TheCodeLabs_BaseUtils.DefaultLogger import DefaultLogger
from flask import Blueprint, render_template

from logic import Constants

LOGGER = DefaultLogger().create_logger_if_not_exists(Constants.APP_NAME)


def construct_blueprint():
    general = Blueprint('general', __name__)

    @general.route('/')
    def index():
        LOGGER.debug('New visit @ /')
        return render_template('index.html')

    return general
