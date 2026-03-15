from sqlalchemy import Column, Integer, Float, String, Date
from app.db.database import Base

class Sales(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    order_date = Column(Date)
    product_category = Column(String)
    revenue = Column(Float)
    region = Column(String)