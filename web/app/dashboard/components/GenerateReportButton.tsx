'use client';

import Button from '@/app/components/Button';
import { useState } from 'react';

export default function GenerateReportButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      // 1. Формируем URL к текущей странице (или к конкретному отчету)
      const currentUrl = window.location.href;
      
      // 2. Делаем запрос к нашему новому API
      const response = await fetch(`/api/report?url=${encodeURIComponent(currentUrl)}`);
      
      if (!response.ok) throw new Error('Ошибка генерации PDF');

      // 3. Получаем бинарные данные
      const blob = await response.blob();
      
      // 4. Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Очистка
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при скачивании отчета:', error);
      alert('Не удалось сформировать отчет. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerateReport} 
      disabled={isLoading} 
      className="btn btn-primary w-full"
    >
      {isLoading ? 'Генерация на сервере...' : 'Скачать PDF-отчет'}
    </Button>
  );
}