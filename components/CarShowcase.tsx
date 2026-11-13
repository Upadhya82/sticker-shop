"use client";

import Image from "next/image";
import { type PointerEvent, useRef, useState } from "react";

const views = [
  {
    src: "/cars/bmw-i8-front.jpg",
    alt: "BMW i8 front three-quarter view with the doors closed",
    label: "FRONT · DOORS CLOSED",
  },
  {
    src: "/cars/bmw-i8-doors-open.jpg",
    alt: "BMW i8 rear three-quarter view with both doors open",
    label: "REAR · DOORS OPEN",
  },
];

export default function CarShowcase() {
  const [activeView, setActiveView] = useState(0);
  const [photoMissing, setPhotoMissing] = useState(false);
  const dragStartX = useRef<number | null>(null);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    dragStartX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    if (dragStartX.current === null) return;
    const distance = event.clientX - dragStartX.current;
    if (Math.abs(distance) > 32) setActiveView(distance < 0 ? 1 : 0);
    dragStartX.current = null;
  }

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#080b11]">
      <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-6 sm:px-8 sm:pt-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.24em] text-sky-300">
            RUWAN STICKER · WALASMULLA
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Take a closer look.
          </h2>
        </div>
        <p className="text-xs text-zinc-400">Drag the photo · Swipe on mobile</p>
      </div>

      <div
        className="relative mx-3 mt-5 aspect-[16/9] touch-pan-y select-none overflow-hidden rounded-2xl bg-black sm:mx-6"
        onPointerDown={startDrag}
        onPointerUp={finishDrag}
        onPointerCancel={() => { dragStartX.current = null; }}
      >
        {!photoMissing ? (
          <Image
            key={views[activeView].src}
            src={views[activeView].src}
            alt={views[activeView].alt}
            fill
            priority={activeView === 0}
            sizes="(max-width: 768px) 100vw, 1100px"
            draggable={false}
            onError={() => setPhotoMissing(true)}
            className="pointer-events-none object-contain transition-opacity duration-300"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center px-6 text-center">
            <div>
              <p className="font-semibold text-white">BMW photos not added to the project yet</p>
              <p className="mt-2 text-sm text-zinc-400">
                Add the two photos in <code>public/cars/</code> using the filenames shown in the setup notes.
              </p>
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/65 px-3 py-1.5 text-[10px] font-semibold tracking-widest text-white backdrop-blur sm:bottom-4 sm:left-4">
          {views[activeView].label}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8 sm:py-5">
        <p className="text-xs text-zinc-500">Two photo angles · Drag left/right or choose a view</p>
        <div className="flex gap-2" aria-label="Choose BMW photo angle">
          {views.map((view, index) => (
            <button
              key={view.src}
              type="button"
              onClick={() => setActiveView(index)}
              aria-pressed={activeView === index}
              className={`rounded-full border px-3 py-2 text-xs font-medium transition ${activeView === index ? "border-sky-300 bg-sky-300/10 text-sky-200" : "border-white/15 text-zinc-300 hover:bg-white/10"}`}
            >
              {index === 0 ? "Front" : "Doors open"}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
