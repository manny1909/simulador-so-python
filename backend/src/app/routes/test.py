# app/routes/users.py
from flask import Blueprint, jsonify, request

test_routes = Blueprint('test', __name__)
items = []

@test_routes.route('/', methods=['GET'])
def getTest():
    from app.services.test import getTest
    test:bool = getTest()
    return jsonify({'result': test}), 200

@test_routes.route('/getAllUsers', methods=['GET'])
def get_all_users():
    return jsonify([{"id": 1, "name": "User 1"}]), 200



@test_routes.route('/items', methods=['GET'])
def get_items():
    return jsonify(items), 200

@test_routes.route('/items', methods=['POST'])
def create_item():
    new_item = request.json  # Recibe datos JSON
    items.append(new_item)
    return jsonify(new_item), 201

@test_routes.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    if 0 <= item_id < len(items):
        return jsonify(items[item_id]), 200
    return jsonify({"error": "Item not found"}), 404

@test_routes.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    if 0 <= item_id < len(items):
        items[item_id] = request.json
        return jsonify(items[item_id]), 200
    return jsonify({"error": "Item not found"}), 404

@test_routes.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    if 0 <= item_id < len(items):
        deleted_item = items.pop(item_id)
        return jsonify(deleted_item), 200
    return jsonify({"error": "Item not found"}), 404

