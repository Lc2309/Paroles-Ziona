import React, { useState } from 'react';

const PresentationCard = ({ title, thumbnail, downloadLink, onView }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* VERSION DESKTOP (Grille de cartes avec images) */}
      <div 
        className="hidden md:flex flex-col relative group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="h-48 w-full bg-[#03438A]/10 relative">
          {thumbnail ? (
            <img 
              src={thumbnail.replace('=s220', '=s600')} 
              alt={title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[#03438A] font-bold">ZIONA</div>
          )}
          <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button onClick={onView} className="bg-ziona-gradient text-white px-8 py-3 rounded-xl font-bold shadow-lg">
              Consulter
            </button>
          </div>
        </div>
        <div className="p-4 flex justify-between items-start bg-white flex-grow">
          <h3 className="font-bold text-gray-800 text-lg line-clamp-2 leading-tight flex-1">{title}</h3>
          <a 
            href={downloadLink} 
            download={`${title}.pptx`}
            className="ml-2 p-2 text-gray-400 hover:text-[#E3161B] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>
      </div>

      {/* VERSION MOBILE (Lignes compactes sans image) */}
      <div className="flex md:hidden w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 items-center gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-800 font-bold text-base leading-snug break-words line-clamp-2">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={onView}
            className="bg-ziona-gradient text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm"
          >
            Voir
          </button>
          <a 
            href={downloadLink} 
            download={`${title}.pptx`}
            className="p-2 text-gray-400 active:text-[#E3161B]"
            onClick={(e) => e.stopPropagation()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
};

export default PresentationCard;