from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import LargeBinary, String, Integer
from src.database.database import Base

from datetime import datetime

class ImagesModel(Base):
    __tablename__ = "images"

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    filename: Mapped[str] = mapped_column(String(225), unique=True, index=True, nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    image_data: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now())