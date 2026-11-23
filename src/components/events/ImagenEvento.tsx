/* eslint-disable @next/next/no-img-element -- Se requiere <img> por URLs arbitrarias. */
'use client';

import { useState } from 'react';

type Props = {
  url: string | null;
  alt: string;
};

export default function ImagenEvento({ url, alt }: Props) {
  const [fallo, setFallo] = useState(false);

  if (!url || fallo) {
    return (
      <div className="flex h-56 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        Sin imagen disponible
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      onError={() => setFallo(true)}
      className="h-56 w-full rounded-lg object-cover"
    />
  );
}
