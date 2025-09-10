'use client';

import React from 'react';

function normalizeUrl(url: string): string {
  // Удаляем лишний https:// если есть
  const cleaned = url.replace(/^https?:\/\/https?:\/\//, 'https://');

  // Поддержка ipfs:// ссылок
  if (cleaned.startsWith('ipfs://')) {
    return cleaned.replace('ipfs://', 'https://w3s.link/ipfs/');
  }

  return cleaned;
}

export const Metadata = ({ metadataUrl }: any) => {
  const [metadata, setMetadata] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [contentType, setContentType] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (metadataUrl) {
      const normalizedUrl = normalizeUrl(metadataUrl);
      console.log('Fetching metadata from:', normalizedUrl);

      fetch(normalizedUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const contentType = response.headers.get("Content-Type") || "";
          setContentType(contentType);
          
          if (contentType.includes("application/json")) {
            return response.json();
          } else if (contentType.includes("image/")) {
            throw new Error(`Получен файл изображения (${contentType}), а не JSON метаданные`);
          } else {
            throw new Error(`Ожидался JSON, но получен ${contentType}`);
          }
        })
        .then((data) => {
          setMetadata(data);
          setError(null);
        })
        .catch((err) => {
          console.error("Failed to fetch metadata:", err);
          setError(`Не удалось загрузить метаданные: ${err.message}`);
        });
    }
  }, [metadataUrl]);

  if (error) {
    return (
      <div className="bg-white px-6 pb-6 w-full">
        <div className="text-red-500">{error}</div>
        {contentType && contentType.includes("image/") && (
          <div className="mt-4">
            <p className="text-gray-700 mb-2">Найдено изображение вместо JSON:</p>
            <img src={normalizeUrl(metadataUrl)} alt="Token image" className="max-w-md border rounded" />
          </div>
        )}
      </div>
    );
  }

  return metadata ? (
    <div className="bg-white px-6 pb-6 w-full">
      <div className="bg-white px-6 pb-6">
        <div className="text-sm whitespace-pre font-mono overflow-scroll w-[400px]">{JSON.stringify(metadata, null, 2)}</div>
      </div>
    </div>
  ) : (
    <div className="bg-white px-6 pb-6 w-full">
      <div className="text-gray-500">Загрузка метаданных...</div>
    </div>
  );
}
