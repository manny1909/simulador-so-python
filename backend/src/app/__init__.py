from flask import Flask, Blueprint, send_from_directory
from app.routes import register_routes
from flask_cors import CORS
import os

def create_app() -> Flask:
    # Configuración de la ruta de los archivos estáticos generados por Angular
    app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static', 'frontend', 'browser'), static_url_path='/static')

    # Crear un blueprint para registrar los blueprints de rutas
    api = Blueprint('api', __name__)
    
    # Permitir CORS para la comunicación entre el frontend y el backend
    CORS(app, resources={r"/*": {"origins": ["http://localhost:4200"]}})

    # Registrar los blueprints (módulos de rutas) con el prefijo /api
    register_routes(api)  # Registra los blueprints en el blueprint `api`

    # Registrar el blueprint `api` en la aplicación con el prefijo /api
    app.register_blueprint(api, url_prefix='/api')

    # Ruta para servir el index.html de Angular
    @app.route('/')
    def serve_index():
        print(f"Buscando archivo estático en: {app.static_folder}")  # Verifica la ruta
        return send_from_directory(app.static_folder, 'index.html')

    # Ruta para servir archivos estáticos como JS, CSS, imágenes, etc.
    @app.route('/<path:path>')
    def static_files(path):
        return send_from_directory(app.static_folder, path)

    return app
