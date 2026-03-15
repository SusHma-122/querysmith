def detect_chart_type(results):
    if not results:
        print("DEBUG: No results found")
        return "table"

    first_row = results[0]
    columns = list(first_row.keys())
    values = list(first_row.values())

    print("DEBUG Columns:", columns)
    print("DEBUG Values:", values)
    print("DEBUG Types:", [type(v) for v in values])

    # Date column → line
    for col in columns:
        if "date" in col.lower():
            return "line"

    # Two columns and numeric second column → bar
    if len(columns) == 2:
        if isinstance(values[1], (int, float)):
            return "bar"

    return "table"