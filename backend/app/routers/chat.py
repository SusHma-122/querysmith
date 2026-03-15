from fastapi import APIRouter
from app.schemas.chat import ChatRequest
from app.services.llm_service import generate_sql
from app.validators.sql_validator import validate_sql, enforce_limit
from app.services.execution_service import execute_sql
from app.services.chart_service import detect_chart_type
from app.services.insight_service import summarize_results

router = APIRouter()


@router.post("/chat")
def chat_endpoint(request: ChatRequest):

    sql = generate_sql(request.question)

    try:
        validate_sql(sql)
        sql = enforce_limit(sql)
        results = execute_sql(sql)

    except Exception as e:
        print("SQL execution failed:", e)

        sql = "SELECT * FROM sales LIMIT 5"
        results = execute_sql(sql)

    chart_type = detect_chart_type(results)

    summary = summarize_results(results)

    return {
        "question": request.question,
        "sql": sql,
        "results": results,
        "chart_type": chart_type,
        "summary": summary
    }