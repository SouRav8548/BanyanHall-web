import { useState, useEffect } from 'react';

export default function HostelSlideshow() {
  // 🔥 Local image paths from public/images folder
  const images = [
    "/images/img1.jpg",
    "/images/img2.jpg",
    "/images/img3.jpg",
    "/images/img4.jpg",
    "/images/img5.jpg",
    "/images/img6.jpg",
    "/images/img7.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // 4 second por por slide hobe
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-48 md:h-56 lg:h-64 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group">
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Hostel Campus ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
          }`}
        />
      ))}
      
      {/* Gradient Overlay for Text Visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none transition-opacity"></div>
      
      {/* Text Content */}
      <div className="absolute bottom-5 left-6 text-white pointer-events-none">
        <h3 className="text-xl font-black tracking-wide drop-shadow-lg flex items-center gap-2">
          <i className="fas fa-building text-emerald-400"></i> BANYAN HALL
        </h3>
        <p className="text-xs font-bold text-slate-200 opacity-90 drop-shadow-sm mt-0.5">Your Home Away From Home</p>
      </div>
      
      {/* Navigation Dots */}
      <div className="absolute bottom-6 right-6 flex gap-1.5 z-10">
        {images.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'bg-emerald-400 w-5 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-white/50 w-2 hover:bg-white'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
}