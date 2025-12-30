import React, { useState } from 'react';
import html2canvas from 'html2canvas';

const layouts = [
    { id: 2, name: 'Dual Split', classes: 'grid-cols-2' },
    { id: 4, name: 'Quad Grid', classes: 'grid-cols-2 grid-rows-2' },
    { id: 3, name: 'Triptych', classes: 'grid-cols-3' },
    { id: 6, name: 'Gallery 6', classes: 'grid-cols-3 grid-rows-2' },
];

const CollageMaker: React.FC = () => {
    const [images, setImages] = useState<string[]>([]);
    const [layout, setLayout] = useState(layouts[1]); // Default Quad

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages: string[] = [];
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (ev.target?.result) {
                        setImages(prev => [...prev, ev.target!.result as string]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const downloadCollage = async () => {
        const element = document.getElementById('collage-area');
        if (element) {
            const canvas = await html2canvas(element, { useCORS: true });
            const link = document.createElement('a');
            link.download = 'collage.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex gap-2">
                    <label className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer">
                        Add Images
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                    </label>
                    <button onClick={() => setImages([])} className="text-slate-400 hover:text-white px-4 py-2">Clear</button>
                </div>

                <div className="flex gap-2">
                    {layouts.map(l => (
                        <button 
                            key={l.id} 
                            onClick={() => setLayout(l)}
                            className={`px-3 py-1 rounded border ${layout.id === l.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'}`}
                        >
                            {l.name}
                        </button>
                    ))}
                </div>

                <button onClick={downloadCollage} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg">
                    Export
                </button>
            </div>

            <div className="flex-1 bg-slate-900 border-2 border-dashed border-slate-800 rounded-xl p-8 flex items-center justify-center overflow-auto">
                <div 
                    id="collage-area" 
                    className={`bg-white p-2 gap-2 grid w-full max-w-3xl aspect-square shadow-2xl ${layout.classes}`}
                >
                    {Array.from({ length: layout.id === 6 || layout.id === 4 ? layout.id : layout.id }).map((_, i) => (
                        <div key={i} className="bg-slate-200 relative overflow-hidden flex items-center justify-center group">
                            {images[i] ? (
                                <img src={images[i]} className="w-full h-full object-cover" alt="Collage part" />
                            ) : (
                                <span className="text-slate-400 text-4xl opacity-50">+</span>
                            )}
                            {/* Simple Drag Placeholder Logic omitted for brevity, basic sequential fill */}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CollageMaker;
