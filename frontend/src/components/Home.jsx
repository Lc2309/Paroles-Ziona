import React, { useState, useEffect } from 'react';
import PresentationCard from '../components/PresentationCard';

const Home = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fonction pour transformer l'ID en lien de téléchargement direct PPTX
  const getDirectDownloadLink = (id) => {
    return `https://docs.google.com/presentation/d/${id}/export/pptx`;
  };

  const fetchFiles = async (searchTerm = '') => {
    setLoading(true);
    try {
      // CHANGEMENT ICI : Utilisation d'un chemin relatif pour Vercel
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      if (data.results) {
        if (searchTerm === '') setSuggestions(data.results.slice(0, 3));
        else setResults(data.results);
      }
    } catch (error) {
      console.error("Erreur de recherche:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchFiles(''); 
  }, []);

  const handleSearch = () => {
    if (!query.trim()) { 
      setHasSearched(false); 
      return; 
    }
    setHasSearched(true);
    fetchFiles(query);
  };

  return (
    <div className="flex flex-col items-center justify-start py-8 md:py-12 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-5xl w-full">
        
        {/* Section Titre & Recherche */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#03438A] mb-6 uppercase tracking-tight">
            Mitady Paroles?
          </h2>
          
          <div className="relative w-full max-w-2xl mx-auto group">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Titre ou mot-clé..."
              className="w-full px-5 md:px-8 py-4 md:py-5 rounded-full border-2 border-gray-100 shadow-xl focus:border-[#03438A] outline-none text-base md:text-lg pr-16 md:pr-40 transition-all"
            />
            
            <button 
              onClick={handleSearch} 
              className="absolute right-2 top-2 bottom-2 bg-ziona-gradient text-white px-4 md:px-8 rounded-full font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center"
            >
              <span className="hidden md:inline">Rechercher</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sous-titre dynamique */}
        <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-6 md:mb-8 px-4 border-l-4 border-yellow-400">
          {loading ? 'Chargement...' : (hasSearched ? `Résultats (${results.length})` : 'Suggestions')}
        </h3>

        {/* Grille de fichiers responsive (Cards sur PC, Lignes sur Mobile via PresentationCard) */}
        {!loading && hasSearched && results.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-inner">
            <h2 className="text-2xl md:text-4xl font-black text-gray-200 uppercase">Aucun Résultat</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {(!hasSearched ? suggestions : results).map((item) => (
              <PresentationCard 
                key={item.id} 
                title={item.name} 
                thumbnail={item.thumbnailLink}
                downloadLink={getDirectDownloadLink(item.id)}
                onView={() => window.open(item.webViewLink, '_blank')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;