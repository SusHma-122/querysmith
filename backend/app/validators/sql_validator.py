def validate_sql(query: str):
    upper = query.upper()

    if not upper.strip().startswith("SELECT"):
        raise ValueError("Only SELECT queries allowed")

    forbidden = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER"]

    for word in forbidden:
        if word in upper:
            raise ValueError(f"{word} not allowed")

    return True

def enforce_limit(query: str, limit: int = 1000) -> str:
    upper = query.upper()

    if "LIMIT" not in upper:
        query = query.strip().rstrip(";")
        query += f" LIMIT {limit}"

    return query