import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ImageEditor from './components/ImageEditor';
import GenAIImage from './components/GenAIImage';
import GenAIVideo from './components/GenAIVideo';
import CollageMaker from './components/CollageMaker';
import IDPhotoMaker from './components/IDPhotoMaker';
import { AppView, GeneratedMedia } from './types';

const App: React.FC = () => {
  const [currentView, setView] = useState<AppView>(AppView.DASHBOARD);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [history, setHistory] = useState<GeneratedMedia[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('pf_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const addToHistory = (item: GeneratedMedia) => {
    const newHistory = [item, ...history];
    setHistory(newHistory);
    localStorage.setItem('pf_history', JSON.stringify(newHistory));
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            <div 
              onClick={() => setView(AppView.EDITOR)}
              className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-blue-500 cursor-pointer transition-all hover:transform hover:-translate-y-1 group"
            >
              <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">🎨</span>
              <h3 className="text-xl font-bold text-white mb-2">Editor Pro</h3>
              <p className="text-slate-400">Crop, resize, adjust brightness and contrast.</p>
            </div>
            <div 
              onClick={() => setView(AppView.AI_IMAGE)}
              className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-xl border border-slate-700 hover:border-violet-500 cursor-pointer transition-all hover:transform hover:-translate-y-1 group"
            >
               <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">✨</span>
              <h3 className="text-xl font-bold text-white mb-2">AI Image Gen</h3>
              <p className="text-slate-400">Turn text into stunning visuals with Gemini.</p>
            </div>
            <div 
              onClick={() => setView(AppView.AI_VIDEO)}
              className="bg-gradient-to-br from-orange-900 to-slate-900 p-8 rounded-xl border border-slate-700 hover:border-orange-500 cursor-pointer transition-all hover:transform hover:-translate-y-1 group"
            >
               <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">🎬</span>
              <h3 className="text-xl font-bold text-white mb-2">Veo Video</h3>
              <p className="text-slate-400">Generate videos from text or images instantly.</p>
            </div>
             <div 
              onClick={() => setView(AppView.ID_PHOTO)}
              className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-green-500 cursor-pointer transition-all hover:transform hover:-translate-y-1 group"
            >
              <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">🪪</span>
              <h3 className="text-xl font-bold text-white mb-2">ID Photo</h3>
              <p className="text-slate-400">Create passport and visa photos automatically.</p>
            </div>
          </div>
        );
      case AppView.EDITOR:
        return <ImageEditor />;
      case AppView.AI_IMAGE:
        return <GenAIImage onSave={addToHistory} />;
      case AppView.AI_VIDEO:
        return <GenAIVideo onSave={addToHistory} />;
      case AppView.COLLAGE:
        return <CollageMaker />;
      case AppView.ID_PHOTO:
        return <IDPhotoMaker />;
      case AppView.HISTORY:
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {history.length === 0 && <p className="text-slate-500 col-span-full text-center">No history yet.</p>}
            {history.map(item => (
              <div key={item.id} className="bg-slate-800 rounded-lg overflow-hidden group relative">
                 {item.type === 'image' ? (
                   <img src={item.url} alt={item.prompt} className="w-full aspect-square object-cover" />
                 ) : (
                   <video src={item.url} className="w-full aspect-square object-cover bg-black" />
                 )}
                 <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                    <p className="text-xs text-white line-clamp-3">{item.prompt}</p>
                    <a href={item.url} download className="bg-white text-black text-xs font-bold py-1 px-3 rounded text-center">Download</a>
                 </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative md:ml-64 transition-all">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
           <button 
             className="md:hidden text-2xl"
             onClick={() => setIsMobileOpen(true)}
           >
             ☰
           </button>
           <h2 className="font-semibold text-lg">
             {currentView.replace('_', ' ')}
           </h2>
           <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
