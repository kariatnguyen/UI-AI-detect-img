import React, { useState } from 'react';
import { generateAiImage } from '../services/geminiService';
import { GeneratedMedia } from '../types';

interface Props {
    onSave: (media: GeneratedMedia) => void;
}

const GenAIImage: React.FC<Props> = ({ onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const base64Image = await generateAiImage(prompt, undefined, aspectRatio);
      setResult(base64Image);
      
      // Save to history automatically
      onSave({
        id: Date.now().toString(),
        type: 'image',
        url: base64Image,
        prompt: prompt,
        date: Date.now()
      });

    } catch (err) {
      setError('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
          AI Image Generator
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city with flying cars, cyberpunk style, neon lights..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-violet-500 outline-none h-32 resize-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
              <div className="flex gap-2">
                {["1:1", "16:9", "9:16"].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio as any)}
                    className={`px-4 py-2 rounded-lg text-sm border ${
                      aspectRatio === ratio 
                      ? 'bg-violet-600 border-violet-500 text-white' 
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-lg font-bold transition-all shadow-lg shadow-violet-900/20"
          >
            {loading ? 'Generating Magic...' : 'Generate Image'}
          </button>
          
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      </div>

      {result && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4 text-white">Result</h3>
          <div className="relative group rounded-lg overflow-hidden border border-slate-600">
            <img src={result} alt="Generated" className="w-full h-auto" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a 
                href={result} 
                download={`ai-gen-${Date.now()}.png`}
                className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-slate-200"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenAIImage;
