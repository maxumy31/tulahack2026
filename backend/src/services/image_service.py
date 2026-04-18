import logging
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.images import ImagesModel

logger = logging.getLogger(__name__)


class ImageService:
    """Сервис для работы с изображениями в PostgreSQL"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_image_by_filename(self, filename: str) -> ImagesModel:
        """
        Получить изображение по имени файла

        Args:
            filename: имя файла (например, "img_3.png")

        Returns:
            ImagesModel: модель изображения

        Raises:
            HTTPException: 404 если изображение не найдено
        """
        result = await self.db.execute(
            select(ImagesModel).where(ImagesModel.filename == filename)
        )
        image = result.scalar_one_or_none()

        if not image:
            logger.error(f"Изображение не найдено: {filename}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found"
            )

        logger.info(f"Изображение найдено: {filename}, размер: {image.file_size} bytes")
        return image

    async def get_image_by_id(self, image_id: int) -> ImagesModel:
        """Получить изображение по ID"""
        result = await self.db.execute(
            select(ImagesModel).where(ImagesModel.id == image_id)
        )
        image = result.scalar_one_or_none()

        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Image with id {image_id} not found"
            )

        return image

    async def get_all_images(
            self,
            skip: int = 0,
            limit: int = 100
    ) -> list[ImagesModel]:
        """Получить список всех изображений"""
        result = await self.db.execute(
            select(ImagesModel).offset(skip).limit(limit)
        )
        return result.scalars().all()

    @staticmethod
    def validate_filename(filename: str) -> bool:
        """Проверка имени файла на безопасность"""
        forbidden = ["..", "/", "\\", "\x00"]
        return not any(char in filename for char in forbidden)