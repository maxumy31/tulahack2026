import asyncio
import sys
from pathlib import Path

# Добавляем корневую папку в путь
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select, text
from src.database.database import engine, new_session
from src.models.images import ImagesModel


async def load_images_from_folder(folder_path: str):
    """Загружает все PNG изображения из папки в базу данных"""
    images_dir = Path(folder_path)

    if not images_dir.exists():
        print(f"❌ Папка не найдена: {images_dir.absolute()}")
        return False

    image_files = list(images_dir.glob("*.png"))

    if not image_files:
        print(f"⚠️  В папке {images_dir} нет PNG файлов")
        return False

    print(f"📁 Найдено {len(image_files)} PNG файлов")

    async with new_session() as db:
        loaded = 0
        skipped = 0

        for img_path in image_files:
            # Проверяем, есть ли уже такое изображение в БД
            result = await db.execute(
                select(ImagesModel).where(ImagesModel.filename == img_path.name)
            )
            existing = result.scalar_one_or_none()

            if existing:
                print(f"⏭️  Пропускаем (уже есть): {img_path.name}")
                skipped += 1
                continue

            # Читаем файл
            with open(img_path, "rb") as f:
                image_data = f.read()

            # Создаём запись в БД
            image = ImagesModel(
                filename=img_path.name,
                content_type="image/png",
                image_data=image_data,
                file_size=len(image_data)
            )

            db.add(image)
            loaded += 1
            print(f"   ✅ Загружено: {img_path.name} ({len(image_data):,} bytes)")

        await db.commit()

        print(f"\n📊 Результат:")
        print(f"   ✅ Загружено: {loaded}")
        print(f"   ⏭️  Пропущено: {skipped}")

        return True


async def main():
    """Основная функция"""
    print("🚀 Загрузка изображений в PostgreSQL")
    print("=" * 50)

    # Проверяем подключение к БД
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print("✅ Подключение к БД установлено")
    except Exception as e:
        print(f"❌ Ошибка подключения к БД: {e}")
        return

    # Создаём таблицы
    from src.database.database import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Таблицы созданы")

    # Загружаем изображения
    await load_images_from_folder("src/data/img")

    await engine.dispose()
    print("\n✨ Готово!")


if __name__ == "__main__":
    asyncio.run(main())