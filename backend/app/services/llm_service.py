def generate_sql(question: str) -> str:
    q = question.lower()

    # Total revenue by region
    if "revenue" in q and "region" in q:
        return """
        SELECT region, SUM(revenue) AS total_revenue
        FROM sales
        GROUP BY region
        """

    # Revenue over time
    if "revenue" in q and ("time" in q or "date" in q):
        return """
        SELECT order_date, SUM(revenue) AS total_revenue
        FROM sales
        GROUP BY order_date
        ORDER BY order_date
        """

    # Revenue by category
    if "revenue" in q and ("category" in q or "product" in q):
        return """
        SELECT product_category, SUM(revenue) AS total_revenue
        FROM sales
        GROUP BY product_category
        """

    # Show all sales
    if "all" in q or "show" in q:
        return "SELECT * FROM sales"

    # Default
    return "SELECT * FROM sales"
