'use client';

import React from 'react';

export const Metadata = ({ metadataUrl }: any) => {
  const [metadata, setMetadata] = React.useState<any>(null);

  React.useEffect(() => {
    if (metadataUrl) {
      fetch(metadataUrl)
        .then((response) => response.json())
        .then((data) => {
          setMetadata(data);
        });
    }
  }, [metadataUrl]);

  return metadata ? (
    <div className="bg-white px-6 pb-6 w-full">
      <div className="bg-white px-6 pb-6">
        <div className="text-sm whitespace-pre font-mono overflow-scroll w-[400px]">{JSON.stringify(metadata, null, 2)}</div>
      </div>
    </div>
  ) : null;
}
