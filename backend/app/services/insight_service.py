
import pandas as pd
import numpy as np


def summarize_results(results):

    if not results:
        return "No data found."

    df = pd.DataFrame(results)

    rows = len(df)
    columns = list(df.columns)

    story = []

    # Basic dataset info
    story.append(f"The query returned {rows} rows.")
    story.append(f"Columns analyzed: {', '.join(columns)}.")

    # Detect numeric columns
    numeric_cols = df.select_dtypes(include=np.number).columns

    if len(numeric_cols) > 0:
        col = numeric_cols[0]

        values = df[col].values

        if len(values) > 2:
            slope = np.polyfit(range(len(values)), values, 1)[0]

            if slope > 0:
                story.append(f"{col} shows an overall upward trend 📈.")
            elif slope < 0:
                story.append(f"{col} shows a downward trend 📉.")

        # Detect spikes
        mean = df[col].mean()
        std = df[col].std()

        spikes = df[df[col] > mean + 2 * std]

        if not spikes.empty:
            story.append(f"A significant spike in {col} was detected.")

    return " ".join(story)

