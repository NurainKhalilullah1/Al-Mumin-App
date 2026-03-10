import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ZoomIn, X, Loader2, Camera } from 'lucide-react';

// --- 🔧 CONFIGURATION: YOUR EXACT IMAGE COUNTS ---
const ACADEMICS_COUNT = 10;
const SPORTS_COUNT = 10;
const EVENTS_COUNT = 14;

// --- AUTOMATIC IMAGE GENERATOR ---
const generateImages = () => {
  const images = [];

  // 1. ACADEMICS
  for (let i = 1; i <= ACADEMICS_COUNT; i++) {
    images.push({
      id: `acad-${i}`,
      cat: 'Academics',
      file: `acad-${i}.jpg`,
      title: `Academic Excellence ${i}`
    });
  }

  // 2. SPORTS
  for (let i = 1; i <= SPORTS_COUNT; i++) {
    images.push({
      id: `sport-${i}`,
      cat: 'Sports',
      file: `sport-${i}.jpg`,
      title: `Sports Activity ${i}`
    });
  }

  // 3. EVENTS
  for (let i = 1; i <= EVENTS_COUNT; i++) {
    images.push({
      id: `event-${i}`,
      cat: 'Events',
      file: `event-${i}.jpg`,
      title: `School Event ${i}`
    });
  }

  return images;
};

const galleryImages = generateImages();
const categories = ['All', 'Academics', 'Sports', 'Events'];

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12); // Start by showing 12 images

  useEffect(() => { AOS.init({ duration: 1000 }); }, []);

  // Filter Logic
  const filteredImages = activeFilter === 'All'
    ? galleryImages
    : galleryImages.filter(img => img.cat === activeFilter);

  const visibleImages = filteredImages.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  return (
    <div className="bg-cream min-h-screen font-sans">
      <Navbar />

      {/* --- HERO HEADER --- */}
      <div className="relative pt-40 pb-24 px-6 text-center bg-schoolGreen text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          alt="Students"
        />

        <div className="relative z-10" data-aos="fade-down">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-md border border-white/20">
            <Camera className="text-schoolGold w-6 h-6" />
          </div>
          <span className="text-schoolGold font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Our Campus Life</span>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">The Gallery</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto font-light leading-relaxed">
            A curated collection of moments defining excellence, joy, and brotherhood at Al-Mumin College.
          </p>
        </div>
      </div>

      {/* --- FILTER BUTTONS --- */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-wrap justify-center gap-4 mb-16" data-aos="fade-up">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveFilter(cat); setVisibleCount(12); }}
              className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${activeFilter === cat
                ? 'bg-schoolGreen text-white border-schoolGreen shadow-lg transform scale-105'
                : 'bg-white text-gray-500 border-gray-200 hover:border-schoolGold hover:text-schoolGold'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- MASONRY GRID --- */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {visibleImages.map((img) => (
            <div
              key={img.id}
              className="relative group break-inside-avoid rounded-2xl overflow-hidden shadow-xl cursor-pointer bg-gray-200"
              data-aos="fade-up"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={`/images/${img.file}`}
                alt={img.title}
                loading="lazy"
                className="w-full h-auto transform transition-transform duration-700 group-hover:scale-110"
              />

              {/* Premium Hover Overlay */}
              <div className="absolute inset-0 bg-schoolGreen/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-schoolGold text-[10px] font-bold uppercase tracking-widest mb-2 block border-b border-schoolGold/30 pb-2 w-fit">
                    {img.cat}
                  </span>
                  <h3 className="text-white font-serif font-bold text-2xl">{img.title}</h3>
                </div>

                <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 hover:bg-schoolGold hover:text-white transition-colors">
                  <ZoomIn size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- LOAD MORE BUTTON --- */}
        {visibleImages.length < filteredImages.length && (
          <div className="text-center mt-20">
            <button
              onClick={handleLoadMore}
              className="group inline-flex items-center bg-white text-schoolGreen px-10 py-4 rounded-full font-bold uppercase tracking-widest border border-gray-200 hover:bg-schoolGreen hover:text-white transition-all shadow-xl hover:-translate-y-1"
            >
              Load More Photos
              <Loader2 className="ml-3 w-4 h-4 group-hover:animate-spin" />
            </button>
          </div>
        )}
      </div>

      {/* --- LIGHTBOX MODAL --- */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-schoolGreen/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/70 hover:text-schoolGold transition-colors transform hover:rotate-90 duration-300">
            <X size={48} strokeWidth={1} />
          </button>

          <div className="max-w-6xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={`/images/${selectedImage.file}`}
              alt={selectedImage.title}
              className="max-h-[80vh] w-auto rounded-lg shadow-2xl border-[10px] border-white/10"
            />
            <div className="mt-8 text-center">
              <h3 className="text-white font-serif text-3xl font-bold mb-2 tracking-wide">{selectedImage.title}</h3>
              <span className="inline-block px-4 py-1 border border-schoolGold text-schoolGold text-xs uppercase tracking-[0.2em] rounded-full bg-black/20">
                {selectedImage.cat}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;