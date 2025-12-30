import React, { useRef, useState, useEffect } from 'react';
import { ImageFilter } from '../types';
import { removeBackgroundAi } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [filters, setFilters] = useState<ImageFilter>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    blur: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setImage(img);
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    // Apply filters
    ctx.filter = `
      brightness(${filters.brightness}%) 
      contrast(${filters.contrast}%) 
      saturate(${filters.saturation}%) 
      grayscale(${filters.grayscale}%) 
      blur(${filters.blur}px)
    `;

    ctx.drawImage(image, 0, 0);
  };

  useEffect(() => {
    draw();
  }, [image, filters]);

  const handleFilterChange = (key: keyof ImageFilter, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL('image/png', 0.8); // 0.8 quality for compression
    link.click();
  };

  const handleRemoveBg = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
        // Get current canvas state as base64 (ignoring 'data:image/png;base64,')
        const canvas = canvasRef.current;
        if(!canvas) return;
        
        const currentData = canvas.toDataURL('image/png').split(',')[1];
        const newBg = await removeBackgroundAi(currentData);
        
        const newImg = new Image();
        newImg.onload = () => {
            setImage(newImg);
            setIsProcessing(false);
        };
        newImg.src = newBg;
        
    } catch (e) {
        alert("Failed to process background removal.");
        setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
        <div className="flex gap-2">
            <label className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium">
            Upload Image
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
            {image && (
                <button 
                    onClick={handleRemoveBg}
                    disabled={isProcessing}
                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    {isProcessing ? 'AI Processing...' : '✨ Remove BG'}
                </button>
            )}
        </div>
        <button 
          onClick={downloadImage}
          disabled={!image}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Download Result
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Canvas Area */}
        <div className="flex-1 bg-black/20 rounded-lg flex items-center justify-center p-4 border-2 border-dashed border-slate-700 overflow-hidden relative min-h-[400px]">
          {!image ? (
            <div className="text-slate-500 text-center">
              <span className="text-4xl block mb-2">🖼️</span>
              <p>Upload an image to start editing</p>
            </div>
          ) : (
            <canvas ref={canvasRef} className="max-w-full max-h-[600px] object-contain shadow-2xl" />
          )}
        </div>

        {/* Controls */}
        <div className="w-full lg:w-80 bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-6 h-fit overflow-y-auto">
          <h3 className="font-semibold text-lg text-white">Adjustments</h3>
          
          <div className="space-y-4">
            {[
              { label: 'Brightness', key: 'brightness', min: 0, max: 200 },
              { label: 'Contrast', key: 'contrast', min: 0, max: 200 },
              { label: 'Saturation', key: 'saturation', min: 0, max: 200 },
              { label: 'Grayscale', key: 'grayscale', min: 0, max: 100 },
              { label: 'Blur', key: 'blur', min: 0, max: 20 },
            ].map((control) => (
              <div key={control.key}>
                <div className="flex justify-between mb-1 text-sm text-slate-400">
                  <label>{control.label}</label>
                  <span>{filters[control.key as keyof ImageFilter]}</span>
                </div>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  value={filters[control.key as keyof ImageFilter]}
                  onChange={(e) => handleFilterChange(control.key as keyof ImageFilter, Number(e.target.value))}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            ))}
          </div>

          <button 
            onClick={() => setFilters({ brightness: 100, contrast: 100, saturation: 100, grayscale: 0, blur: 0 })}
            className="w-full py-2 text-slate-400 hover:text-white text-sm border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
