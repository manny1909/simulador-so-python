# app/routes/__init__.py
from flask import Blueprint
from app.routes.test import test_routes

def register_routes(app: Blueprint) -> None :
    app.register_blueprint(test_routes, url_prefix='/test')