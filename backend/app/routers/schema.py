from fastapi import APIRouter
from sqlalchemy import inspect
from app.db.database import engine

router = APIRouter()

@router.get("/schema")
def get_schema():

    inspector = inspect(engine)

    schema = {}

    tables = inspector.get_table_names()

    for table in tables:

        columns = inspector.get_columns(table)

        schema[table] = [col["name"] for col in columns]

    return schema