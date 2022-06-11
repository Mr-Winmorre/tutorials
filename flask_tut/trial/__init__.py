import os
from flask import Flask
from flask_meld import Meld


def create_app(test_config=None):
    # create trial
    meld = Meld()
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'db.sqlite'),

    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route('/help')
    def hello():
        return 'Hello, World'

    from . import db
    from . import auth
    db.init_app(app)
    app.register_blueprint(auth.bp)
    meld.init_app(app)
    return app