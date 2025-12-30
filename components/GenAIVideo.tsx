import React, { useState } from 'react';
import { generateAiVideo } from '../services/geminiService';
import { GeneratedMedia } from '../types';

interface Props {
  onSave: (media: GeneratedMedia) => void;
}

const GenAIVideo: React.FC<Props> = ({ onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
          if (ev.target?.result) {
              const res = ev.target.result as string;
              // Remove header
              const base64 = res.split(',')[1];
              setSelectedImage(base64);
          }
      }
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setProgress('Initializing Veo...');
    setVideoUrl(null);

    try {
      // 1. Check API Key for Veo
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
             await window.aistudio.openSelectKey();
             // Race condition handling: assume success immediately and proceed.
             // Do not check result as it returns void.
        }
      }

      setProgress('Generating video (this may take a minute)...');
      
      const url = await generateAiVideo(prompt, selectedImage || undefined);
      setVideoUrl(url);
      
      onSave({
        id: Date.now().toString(),
        type: 'video',
        url: url,
        prompt: prompt,
        date: Date.now()
      });

    } catch (err: any) {
      console.error(err);
      setProgress(`Error: ${err.message || 'Failed to generate video'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <span className="text-9xl">🎥</span>
        </div>

        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          Veo AI Video Creator
        </h2>
        
        <p className="text-slate-400 text-sm mb-6">
            Generate high-quality 720p videos. You can start with a text prompt or upload an image to animate it.
            <br/>
            <span className="text-orange-400 text-xs">* Requires a paid GCP Project API Key. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-300">Billing Docs</a></span>
        </p>

        <div className="space-y-4 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cinematic drone shot of a coastline at sunset..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none h-24 resize-none"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-300 mb-2">Reference Image (Optional)</label>
             <div className="flex items-center gap-4">
                 <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600" />
                 {selectedImage && <span className="text-green-400 text-xs">Image Loaded</span>}
             </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || (!prompt && !selectedImage)}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 text-white rounded-lg font-bold transition-all shadow-lg shadow-orange-900/20"
          >
            {loading ? 'Processing...' : 'Generate Video'}
          </button>
          
          {loading && (
             <div className="text-center mt-4">
                 <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                 <p className="text-slate-400 text-sm animate-pulse">{progress}</p>
             </div>
          )}
        </div>
      </div>

      {videoUrl && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4 text-white">Generated Video</h3>
          <div className="rounded-lg overflow-hidden bg-black aspect-video border border-slate-600">
             <video controls src={videoUrl} className="w-full h-full" />
          </div>
          <a 
            href={videoUrl} 
            download={`veo-video-${Date.now()}.mp4`}
            className="mt-4 inline-block bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-slate-200"
          >
            Download MP4
          </a>
        </div>
      )}
    </div>
  );
};

export default GenAIVideo;