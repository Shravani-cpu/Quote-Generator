import requests

from flask import Flask, render_template, jsonify
from database import (
    save_quote,
    get_history,
    delete_quote,
    toggle_favorite,
    get_favorites
)

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


# Generate and save a random quote
@app.route("/get_quote")
def get_quote():
    try:
        response = requests.get(
            "https://dummyjson.com/quotes/random",
            timeout=15
        )

        response.raise_for_status()

        data = response.json()

        quote = data["quote"]
        author = data["author"]

        save_quote(quote, author)

        return jsonify({
            "success": True,
            "quote": quote,
            "author": author
        })

    except Exception as error:
        print("QUOTE ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to generate quote. Please try again."
        }), 500


# Get quote history
@app.route("/history")
def history():
    try:
        return jsonify(get_history())

    except Exception as error:
        print("HISTORY ERROR:", error)

        return jsonify({
            "message": "Unable to load quote history."
        }), 500


# Delete a quote
@app.route("/delete/<int:quote_id>", methods=["DELETE"])
def delete(quote_id):
    try:
        deleted = delete_quote(quote_id)

        if not deleted:
            return jsonify({
                "success": False,
                "message": "Quote not found."
            }), 404

        return jsonify({
            "success": True
        })

    except Exception as error:
        print("DELETE ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to delete quote."
        }), 500


# Get favourite quotes
@app.route("/favorites")
def favorites():
    try:
        return jsonify(get_favorites())

    except Exception as error:
        print("FAVORITES ERROR:", error)

        return jsonify({
            "message": "Unable to load favourites."
        }), 500


# Add or remove favourite
@app.route("/favorite/<int:quote_id>", methods=["POST"])
def favorite(quote_id):
    try:
        updated = toggle_favorite(quote_id)

        if not updated:
            return jsonify({
                "success": False,
                "message": "Quote not found."
            }), 404

        return jsonify({
            "success": True
        })

    except Exception as error:
        print("FAVORITE ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to update favourite."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)