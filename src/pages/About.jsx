import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import AOS from 'aos';
import 'aos/dist/aos.css';

const About = () => {
  useEffect(() => { AOS.init({ duration: 1000 }); }, []);

  return (
    <div className="bg-cream min-h-screen">
      <Navbar />

      {/* HEADER WITH PARALLAX */}
      <div className="relative h-[60vh] bg-fixed bg-center bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1950&q=80')" }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white">
          <span className="text-schoolGold font-bold uppercase tracking-[0.3em] text-xs mb-4">Our Heritage</span>
          <h1 className="text-6xl md:text-7xl font-serif font-bold" data-aos="fade-up">The Al-Mumin Story</h1>
        </div>
      </div>

      {/* CONTENT: The Narrative */}
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="prose prose-lg mx-auto text-gray-600">
          <h3 className="font-serif text-3xl text-schoolGreen font-bold mb-6 text-center" data-aos="fade-up">"To breed a generation that does not have to choose between Deen and Dunya."</h3>
          <p className="leading-loose mb-8 text-justify" data-aos="fade-up" data-aos-delay="100">
            This was the vision that birthed Al-Mumin (AM) Schools in 2010. We observed a gap in the Nigerian educational sector: schools were either excellent academically but lacking in morals, or strong spiritually but weak in infrastructure.
          </p>
          <p className="leading-loose mb-8 text-justify" data-aos="fade-up" data-aos-delay="200">
            We set out to build a sanctuary. A place where a child learns Robotics in the morning and Tajweed in the afternoon. Today, we are proud to be one of Lagos's leading faith-based institutions, with alumni excelling in Ivy League universities and leading prayers in their communities.
          </p>
        </div>
      </div>

      {/* TIMELINE SECTION */}
      <div className="bg-white py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-schoolGreen">Milestones</h2>
          </div>
          
          <div className="space-y-12 relative border-l-2 border-schoolGold/30 ml-6 md:ml-auto md:w-2/3">
            <TimelineItem year="2010" title="Establishment" desc="Al-Mumin started with 15 students in a rented apartment in Surulere." />
            <TimelineItem year="2015" title="Lekki Campus" desc="Expanded to our permanent site in Lekki Phase 1 with state-of-the-art facilities." />
            <TimelineItem year="2020" title="British Accreditation" desc="Officially accredited to run the Cambridge International Curriculum." />
            <TimelineItem year="2025" title="Top 3 Ranking" desc="Rated among the top 3 faith-based schools in Lagos by the Education Board." />
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineItem = ({ year, title, desc }) => (
  <div className="relative pl-12" data-aos="fade-left">
    <div className="absolute -left-[9px] top-0 w-5 h-5 rounded-full bg-schoolGold border-4 border-white shadow-md"></div>
    <span className="text-schoolGold font-bold text-sm tracking-widest">{year}</span>
    <h3 className="text-2xl font-serif font-bold text-gray-900 mt-1 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
  
);



export default About;