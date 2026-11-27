import mysql.connector


def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Shrav@2699",
        database="quote_generator"
    )


def save_quote(quote, author):
    connection = get_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO quote_history (quote, author)
        VALUES (%s, %s)
    """

    cursor.execute(query, (quote, author))

    connection.commit()
    cursor.close()
    connection.close()


def get_history():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, quote, author, created_at, is_favorite
        FROM quote_history
        ORDER BY id DESC
    """)

    records = cursor.fetchall()

    for item in records:
        item["created_at"] = item["created_at"].strftime(
            "%Y-%m-%d %H:%M:%S"
        )
        item["is_favorite"] = bool(item["is_favorite"])

    cursor.close()
    connection.close()

    return records


def delete_quote(quote_id):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM quote_history WHERE id = %s",
        (quote_id,)
    )

    connection.commit()

    deleted = cursor.rowcount > 0

    cursor.close()
    connection.close()

    return deleted


def toggle_favorite(quote_id):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE quote_history
        SET is_favorite = NOT is_favorite
        WHERE id = %s
    """, (quote_id,))

    connection.commit()

    updated = cursor.rowcount > 0

    cursor.close()
    connection.close()

    return updated


def get_favorites():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, quote, author, created_at, is_favorite
        FROM quote_history
        WHERE is_favorite = TRUE
        ORDER BY id DESC
    """)

    records = cursor.fetchall()

    for item in records:
        item["created_at"] = item["created_at"].strftime(
            "%Y-%m-%d %H:%M:%S"
        )
        item["is_favorite"] = bool(item["is_favorite"])

    cursor.close()
    connection.close()

    return records