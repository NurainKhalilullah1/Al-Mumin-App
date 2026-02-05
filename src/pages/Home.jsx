import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ArrowRight, Play, Star, Book, Shield, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';
import IslamicWidget from '../components/IslamicWidget';
import NewsTicker from '../components/NewsTicker'; // <--- IMPORT ADDED

const Home = () => {
  useEffect(() => { AOS.init({ duration: 1200, once: true, offset: 100 }); }, []);

  return (
    <div className="overflow-x-hidden bg-cream font-sans">
      
      {/* 1. NEWS TICKER (Fixed at top) */}
      <NewsTicker />

      {/* 2. NAVBAR */}
      <Navbar />

      {/* --- SECTION 1: CINEMATIC HERO --- */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Animated Background Image */}
        <div className="absolute inset-0 bg-schoolGreen">
           <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
            className="w-full h-full object-cover opacity-40 animate-slow-zoom" 
            alt="Students"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-schoolGreen via-transparent to-black/30"></div>
        </div>
        
        {/* Content - ADDED pt-32 TO PUSH TEXT DOWN */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 pt-32 pb-20">
          <div className="max-w-5xl" data-aos="fade-up">
            <span className="inline-block py-1.5 px-5 border border-white/20 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-schoolGold mb-8 bg-black/40 backdrop-blur-md shadow-lg">
              Est. 2015 • Lagos, Nigeria
            </span>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-white leading-tight mb-8 drop-shadow-2xl">
              Cultivating <br/> <span className="italic text-schoolGold">Noble Minds</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
              An institution where academic brilliance meets spiritual depth. We don't just teach; we transform.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/admissions" className="bg-schoolGold text-schoolGreen px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-schoolGreen transition-all shadow-xl hover:scale-105">
                Apply Now
              </Link>
              <button className="flex items-center justify-center text-white border border-white/30 px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-sm">
                <Play size={16} className="mr-2 fill-current" /> Virtual Tour
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- FLOATING ISLAMIC WIDGET --- */}
      {/* Negative margin pulls it up over the hero image */}
      <div className="relative z-30 px-4 -mt-24 md:-mt-32 mb-16">
        <div className="max-w-6xl mx-auto shadow-2xl rounded-2xl overflow-hidden border border-white/20 ring-1 ring-black/5" data-aos="fade-up">
          <IslamicWidget />
        </div>
      </div>

      {/* --- SECTION 2: THE INTRODUCTION (Clean & Airy) --- */}
      <div className="px-6 md:px-12 pb-24 bg-cream">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div data-aos="fade-right">
            <h4 className="text-schoolGold font-bold uppercase tracking-widest text-xs mb-4">Welcome to Al-Mumin</h4>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-schoolGreen mb-6 leading-tight">
              A Legacy of <br/> Excellence & Faith.
            </h2>
            <div className="h-1 w-20 bg-schoolGold mb-8"></div>
            <p className="text-gray-600 text-lg leading-relaxed mb-6 text-justify">
              Located in the heart of Dalemo, Alakuko, Al-Mumin (AM) Schools offers a unique blend of the <b>National Curriculum</b> and <b>rigorous Islamic scholarship</b>.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-8 text-justify">
              We believe that the modern child needs dual wings to fly: the wing of intellectual competence (Science, Tech, Arts) and the wing of spiritual grounding (Quran, Adab, Fiqh).
            </p>
            <Link to="/about" className="inline-block text-schoolGreen font-bold border-b-2 border-schoolGreen pb-1 hover:text-schoolGold hover:border-schoolGold transition-all">
              Read Our Story &rarr;
            </Link>
          </div>
          
          <div className="relative" data-aos="fade-left">
            <div className="absolute top-10 right-10 w-full h-full border-2 border-schoolGold/30 rounded-full z-0"></div>
            <img 
              src="images/acad-3.jpg" className="relative z-10 w-full rounded-tr-[100px] rounded-bl-[100px] shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* --- SECTION 3: THE BENTO GRID (Rich Features) --- */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-4xl font-serif font-bold text-schoolGreen">Why Parents Trust Us</h2>
            <div className="w-16 h-1 bg-schoolGold mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-auto md:h-[600px]">
            {/* Card 1: Large Vertical */}
            <div className="md:col-span-1 bg-schoolGreen text-white p-10 rounded-3xl relative overflow-hidden group shadow-xl flex flex-col justify-between" data-aos="fade-up" data-aos-delay="0">
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-700">
                <Globe size={150} />
              </div>
              <div className="relative z-10">
                  <Globe size={40} className="text-schoolGold mb-6" />
                  <h3 className="text-2xl font-serif font-bold mb-4">Global Curriculum</h3>
                  <p className="text-gray-300 leading-relaxed">
                    We prepare students for WAEC, JAMB, NECO and GCE ensuring they can gain admission into top universities in Nigeria.
                  </p>
              </div>
              <button className="relative z-10 mt-8 text-sm font-bold uppercase tracking-widest text-schoolGold flex items-center group-hover:translate-x-2 transition-transform">
                Learn More <ArrowRight size={16} className="ml-2" />
              </button>
            </div>

            {/* Card 2 & 3: Stacked */}
            <div className="md:col-span-1 flex flex-col gap-8">
              <div className="flex-1 bg-cream p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all" data-aos="fade-up" data-aos-delay="100">
                <Star size={32} className="text-schoolGold mb-4" />
                <h3 className="text-xl font-serif font-bold text-schoolGreen mb-2">Weekend Hifz Class</h3>
                <p className="text-gray-600 text-sm">Dedicated Quran memorization track integrated into school and weekend hours.</p>
              </div>
              <div className="flex-1 bg-cream p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all" data-aos="fade-up" data-aos-delay="200">
                <Shield size={32} className="text-schoolGold mb-4" />
                <h3 className="text-xl font-serif font-bold text-schoolGreen mb-2">Moral Shield</h3>
                <p className="text-gray-600 text-sm">We enforce a strict code of conduct (Adab) to protect your child from societal vices.</p>
              </div>
            </div>

            {/* Card 4: Large Image Card */}
            <div className="md:col-span-1 relative rounded-3xl overflow-hidden shadow-xl group h-64 md:h-auto" data-aos="fade-up" data-aos-delay="300">
              <img src="images/acad-7.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Lab" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-2xl font-serif font-bold text-white mb-2">STEM & Robotics</h3>
                <p className="text-gray-300 text-sm">State-of-the-art laboratories for Physics, Chemistry, and Coding.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 4: PARALLAX CTA --- */}
      <div className="relative py-32 bg-fixed bg-center bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1950&q=80')" }}>
        <div className="absolute inset-0 bg-schoolGreen/90"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto text-white" data-aos="zoom-in">
          <h2 className="text-5xl font-serif font-bold mb-6">Admissions Open for 2026</h2>
          <p className="text-xl text-gray-200 mb-10">Limited seats available for JSS1 and Transfer students. Join a community of excellence.</p>
          <Link to="/admissions" className="inline-block bg-white text-schoolGreen px-12 py-5 rounded-full font-bold uppercase tracking-widest hover:bg-schoolGold hover:text-white transition-all shadow-2xl hover:-translate-y-1">
            Start Application
          </Link>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-schoolGreen text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-white rounded-full" size={20}>
              <img 
              src="/logo.png" 
              alt="Al-Mumin Logo" 
              className="w-10 h-10 object-contain" 
            />
              </div>
              <span className="font-serif font-bold text-2xl">Al-Mumin (AM) <br />Schools</span>
            </div>
            <p className="text-gray-300 max-w-sm leading-relaxed">
              Raising the next generation of Muslim leaders, grounded in faith and excelling in the world.
            </p>
          </div>
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-schoolGold">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/admissions" className="hover:text-white transition">Admissions</Link></li>
              <li><Link to="/portal" className="hover:text-white transition">Parent Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-schoolGold">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>23a, Agas Road, Dalemo, Alakuko, Lagos</li>
              <li>11, Nureni Akintola, Ewaoluwapo, Mao Junction, Lagos</li>
              <li>+234 802 896 9105, +234 802 439 2224, +234 703 969 7085</li>
              <li>almuminschool2000@gmail.com</li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 text-xs text-gray-400 uppercase tracking-widest">
          © 2026 Al-Mumin (AM) Schools. Excellence in Faith.
        </div>
      </footer>
    </div>
  );
};

export default Home;