"use client";

import { useState, useRef, useEffect } from "react";
import { X, RotateCw, ZoomIn, ZoomOut, Check, Crop } from "lucide-react";

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
}

export default function ImageCropperModal({ isOpen, onClose, imageSrc, onCropComplete }: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getCroppedImage = async () => {
    if (!imageRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed output size for avatar
    const size = 500;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    
    // Fill background (white for transparency fallback)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    const img = imageRef.current;
    
    // Save state
    ctx.save();
    
    // Move to center
    ctx.translate(size / 2, size / 2);
    // Rotate
    ctx.rotate((rotation * Math.PI) / 180);
    // Scale & Offset
    // We need to map the visual offset and zoom back to canvas coordinates
    const scale = zoom * (size / Math.min(img.naturalWidth, img.naturalHeight));
    
    ctx.drawImage(
      img,
      -img.naturalWidth / 2 + (offset.x / scale),
      -img.naturalHeight / 2 + (offset.y / scale),
      img.naturalWidth,
      img.naturalHeight,
      -(img.naturalWidth * scale) / 2,
      -(img.naturalHeight * scale) / 2,
      img.naturalWidth * scale,
      img.naturalHeight * scale
    );

    ctx.restore();

    canvas.toBlob((blob) => {
      if (blob) onCropComplete(blob);
    }, "image/jpeg", 0.9);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#8B0000]">
              <Crop size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Edit Foto Profil</h3>
              <p className="text-xs text-slate-500 font-medium">Geser, putar, dan perbesar foto Anda</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {/* Crop Area */}
          <div 
            ref={containerRef}
            className="relative aspect-square w-full overflow-hidden rounded-[32px] bg-slate-900 shadow-inner cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              className="absolute pointer-events-none origin-center"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                maxWidth: 'none'
              }}
            />
            {/* Guide Overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-full w-full border-[60px] border-black/40 rounded-full" />
              <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full" />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Zoom</label>
                  <span className="text-[10px] font-bold text-slate-400">{Math.round(zoom * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <ZoomOut size={16} className="text-slate-400" />
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.01"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#8B0000]"
                  />
                  <ZoomIn size={16} className="text-slate-400" />
                </div>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Rotasi</label>
                <button 
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="flex h-10 w-24 items-center justify-center gap-2 rounded-xl bg-slate-50 text-sm font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95 border border-slate-200"
                >
                  <RotateCw size={16} />
                  <span>+90°</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={onClose}
                className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-black text-slate-600 hover:bg-slate-50 transition active:scale-95"
              >
                Batal
              </button>
              <button 
                onClick={getCroppedImage}
                className="flex-[2] rounded-2xl bg-[#8B0000] py-3.5 text-sm font-black text-white shadow-lg shadow-red-900/20 hover:bg-red-800 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Check size={20} />
                <span>Simpan Foto</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
