import asyncio
import os
import sys
from pathlib import Path

# Добавляем корневую папку в путь
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select, text
from src.database.database import engine, new_session
from src.models.images import ImagesModel


async def load_images_from_folder(folder_path: str):
    """
    Загружает все PNG изображения из папки в базу данных

    Args:
        folder_path: путь к папке с изображениями
    """
    images_dir = Path(folder_path)

    # Проверяем существование папки
    if not images_dir.exists():
        print(f"❌ Папка не найдена: {images_dir.absolute()}")
        return False

    # Ищем все PNG файлы
    image_files = list(images_dir.glob("*.png"))

    if not image_files:
        print(f"⚠️  В папке {images_dir} нет PNG файлов")
        # Показываем содержимое папки для отладки
        all_files = list(images_dir.glob("*"))
        if all_files:
            print(f"   Найдены другие файлы: {[f.name for f in all_files]}")
        return False

    print(f"📁 Найдено {len(image_files)} PNG файлов в {images_dir.absolute()}")

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

        # Сохраняем изменения
        await db.commit()

        print(f"\n📊 Результат:")
        print(f"   ✅ Загружено: {loaded}")
        print(f"   ⏭️  Пропущено: {skipped}")
        print(f"   📁 Всего файлов: {len(image_files)}")

        # Показываем общее количество в БД
        result = await db.execute(text("SELECT COUNT(*) FROM images"))
        total = result.scalar()
        print(f"   💾 Всего в БД: {total}")

        return True


async def clear_images():
    """Очищает таблицу изображений (с подтверждением)"""
    confirm = input("⚠️  Удалить ВСЕ изображения из БД? (yes/no): ")
    if confirm.lower() != 'yes':
        print("❌ Отменено")
        return False

    async with new_session() as db:
        result = await db.execute(text("SELECT COUNT(*) FROM images"))
        count = result.scalar()

        await db.execute(text("DELETE FROM images"))
        await db.commit()

        print(f"🗑️  Удалено {count} изображений из БД")
        return True


async def show_stats():
    """Показывает статистику по изображениям в БД"""
    async with new_session() as db:
        result = await db.execute(text("SELECT COUNT(*) FROM images"))
        total = result.scalar()

        result = await db.execute(text("SELECT SUM(file_size) FROM images"))
        total_size = result.scalar() or 0

        print(f"\n📊 Статистика БД:")
        print(f"   📸 Всего изображений: {total}")
        print(f"   💾 Общий размер: {total_size / (1024 * 1024):.2f} MB")

        if total > 0:
            result = await db.execute(
                text("SELECT filename, file_size FROM images ORDER BY created_at DESC LIMIT 5")
            )
            print(f"\n   🖼️  Последние 5 изображений:")
            for row in result:
                print(f"      - {row[0]} ({row[1]:,} bytes)")


async def main():
    """Основная функция"""
    import argparse

    parser = argparse.ArgumentParser(description='Загрузка изображений в PostgreSQL')
    parser.add_argument(
        '--folder',
        type=str,
        default="src/data/img",  # ✅ правильный путь по умолчанию
        help='Путь к папке с изображениями (по умолчанию: src/data/img)'
    )
    parser.add_argument(
        '--clear',
        action='store_true',
        help='Очистить таблицу перед загрузкой'
    )
    parser.add_argument(
        '--stats',
        action='store_true',
        help='Показать статистику БД'
    )

    args = parser.parse_args()

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

    if args.stats:
        await show_stats()
        return

    if args.clear:
        await clear_images()

    # Загружаем изображения
    success = await load_images_from_folder(args.folder)

    if success:
        await show_stats()

    # Закрываем соединение
    await engine.dispose()
    print("\n✨ Готово!")


if __name__ == "__main__":
    asyncio.run(main())