from fastapi import FastAPI
from sqlalchemy.orm import Session
from datetime import date


from app.db.database import engine, Base, SessionLocal
from app.models.sales import Sales
from app.routers import chat
from app.routers import schema
from fastapi.middleware.cors import CORSMiddleware
# Create FastAPI app FIRST
app = FastAPI(title="QuerySmith")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create tables
Base.metadata.create_all(bind=engine)

app.include_router(chat.router)
app.include_router(schema.router)

@app.get("/")
def health():
    return {"status": "QuerySmith backend running"}

@app.get("/seed")
def seed_data():
    db = SessionLocal()

    sample_data = [
        Sales(order_date=date(2024, 1, 10), product_category="Electronics", revenue=1200.5, region="North"),
        Sales(order_date=date(2024, 1, 12), product_category="Clothing", revenue=800.0, region="South"),
        Sales(order_date=date(2024, 1, 15), product_category="Electronics", revenue=500.0, region="North"),
        Sales(order_date=date(2024, 1, 20), product_category="Furniture", revenue=1500.0, region="East"),
        Sales(order_date=date(2024, 2, 5), product_category="Clothing", revenue=700.0, region="South"),
    ]

    db.add_all(sample_data)
    db.commit()
    db.close()

    return {"message": "Sample data inserted"}


@app.get("/sales")
def get_sales():
    db: Session = SessionLocal()
    data = db.query(Sales).all()
    db.close()

    return data

