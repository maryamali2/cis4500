import psycopg2
import json

# Database connection details
config = {
    "rds_host": "database-2.cy8cgnqxcxev.us-east-1.rds.amazonaws.com",
    "rds_port": "5432",
    "rds_user": "postgres",
    "rds_password": "deNucR+M7j2F",
    "rds_db": "database-2",
    "server_host": "localhost",
    "server_port": "8080"
}

def test_db_connection(config):
    try:
        # Create a connection to the database
        connection = psycopg2.connect(
            host=config["rds_host"],
            port=config["rds_port"],
            user=config["rds_user"],
            password=config["rds_password"],
            dbname=config["rds_db"]
        )
        # Check if the connection was successful
        cursor = connection.cursor()
        cursor.execute("SELECT 1;")
        result = cursor.fetchone()
        if result and result[0] == 1:
            print("Database connection successful!")
        else:
            print("Database connection test query failed.")
    except Exception as e:
        print("Error connecting to the database:", e)
    finally:
        # Close the connection
        if 'connection' in locals() and connection:
            cursor.close()
            connection.close()
            print("Database connection closed.")

# Run the test
test_db_connection(config)
