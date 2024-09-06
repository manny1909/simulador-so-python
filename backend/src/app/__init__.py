# app/__init__.py
from flask import Flask, Blueprint
from app.routes import register_routes
from flask_cors import CORS

def create_app() -> Flask:
    app = Flask(__name__)

    # Crear un blueprint para registrar los blueprints de rutas
    api = Blueprint('api', __name__)
    CORS(app, resources={r"/*": {"origins": ["http://localhost:4200"]}})

    # Registrar los blueprints (módulos de rutas) con el prefijo /api
    register_routes(api)  # Registra los blueprints en el blueprint `api`

    # Registrar el blueprint `api` en la aplicación con el prefijo /api
    app.register_blueprint(api, url_prefix='/api')

    return app
