import React, { useRef, useState, useEffect } from 'react';
import { ID_SIZES, IDPhotoConfig } from '../types';
import { removeBackgroundAi } from '../services/geminiService';

const IDPhotoMaker: React.FC = () => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [config, setConfig] = useState<IDPhotoConfig>(ID_SIZES[0]);
    const [bgColor, setBgColor] = useState('#ffffff');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Draw the ID Preview
    useEffect(() => {
        if (!image || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const canvas = canvasRef.current;
        // Set canvas to high res based on mm config (10 px per mm approx for screen)
        const scale = 10; 
        canvas.width = config.widthMm * scale;
        canvas.height = config.heightMm * scale;

        // Fill Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate aspect ratio fill
        const ratio = image.width / image.height;
        let newWidth = canvas.width;
        let newHeight = newWidth / ratio;

        if (newHeight < canvas.height) {
            newHeight = canvas.height;
            newWidth = newHeight * ratio;
        }

        const xOffset = (canvas.width - newWidth) / 2;
        const yOffset = (canvas.height - newHeight) / 2;

        ctx.drawImage(image, xOffset, yOffset, newWidth, newHeight);

        // Draw Guide Lines (Face center approximation)
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height * 0.45, canvas.width * 0.25, canvas.height * 0.3, 0, 0, 2 * Math.PI);
        ctx.stroke();

    }, [image, config, bgColor]);

    const handleAutoBackground = async () => {
        if(!image || !canvasRef.current) return;
        setIsProcessing(true);
        try {
            // Send current crop to AI to isolate on white
            const canvas = canvasRef.current;
            const currentData = canvas.toDataURL('image/png').split(',')[1];
            
            // We use the "edit" function to simulate background removal
            const resultBase64 = await removeBackgroundAi(currentData);
            
            const newImg = new Image();
            newImg.onload = () => {
                setImage(newImg);
                setBgColor('#ffffff'); // Set to white for the result
                setIsProcessing(false);
            };
            newImg.src = resultBase64;

        } catch (e) {
            console.error(e);
            alert("AI processing failed.");
            setIsProcessing(false);
        }
    };

    const download = () => {
        if(canvasRef.current) {
             const link = document.createElement('a');
            link.download = `id-photo-${config.name}.png`;
            link.href = canvasRef.current.toDataURL();
            link.click();
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full">
            <div className="w-full lg:w-80 space-y-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="font-bold mb-4">Configuration</h3>
                    
                    <div className="space-y-4">
                        <label className="bg-blue-600 hover:bg-blue-500 w-full block text-center py-2 rounded-lg cursor-pointer text-white">
                            Upload Photo
                            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                        </label>

                        <div>
                            <label className="text-sm text-slate-400">Size Standard</label>
                            <select 
                                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-white"
                                onChange={(e) => setConfig(ID_SIZES.find(s => s.name === e.target.value) || ID_SIZES[0])}
                            >
                                {ID_SIZES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-slate-400">Background Color</label>
                            <div className="flex gap-2 mt-2">
                                {['#ffffff', '#3b82f6', '#ef4444', '#cccccc'].map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => setBgColor(c)}
                                        className={`w-8 h-8 rounded-full border-2 ${bgColor === c ? 'border-white' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleAutoBackground}
                            disabled={!image || isProcessing}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg"
                        >
                            {isProcessing ? 'Processing...' : 'Auto-Remove Background (AI)'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-slate-900 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center p-8 relative">
                {!image ? (
                     <p className="text-slate-500">Upload a selfie to start</p>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <canvas ref={canvasRef} className="shadow-2xl border-4 border-white" />
                        <button onClick={download} className="bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-lg">
                            Download Printable
                        </button>
                        <p className="text-xs text-slate-500">Red outline indicates approximate face position.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IDPhotoMaker;
