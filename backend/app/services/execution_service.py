from sqlalchemy import text
from app.db.database import engine

def execute_sql(query: str):
    print("Executing SQL:", query)

    with engine.connect() as connection:
        result = connection.execute(text(query))
        rows = result.fetchall()
        columns = result.keys()

    print("Columns:", columns)
    print("Rows:", rows)

    data = [dict(zip(columns, row)) for row in rows]
    print("Final Data:", data)

    return data