import mysql.connector

def connect_to_db():
    try:
        connection = mysql.connector.connect(
            host="103.171.243.72",
            user="abishek_navin",
            password="navin123",
            database="abishek_newsdb"
        )
        if connection.is_connected():
            print("Connected to MySQL database")
        return connection

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

if __name__ == "__main__":
    conn = connect_to_db()
    if conn:
        cursor = conn.cursor()
        cursor.execute("SELECT DATABASE();")
        record = cursor.fetchone()
        print(f"You're using database: {record}")

        cursor.close()
        conn.close()
