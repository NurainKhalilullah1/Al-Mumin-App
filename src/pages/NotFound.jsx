import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 animate-bounce">
                <img src="/logo.png" alt="School Logo" className="w-16 h-16 object-contain" />
            </div>

            <h1 className="text-9xl font-bold text-schoolGreen opacity-20 select-none">404</h1>

            <div className="absolute mt-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Oops! The page you are looking for seems to have gone missing or the link is broken.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="flex items-center justify-center px-6 py-3 bg-schoolGreen text-white rounded-xl font-bold hover:bg-schoolGreen/90 transition shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        <Home size={20} className="mr-2" />
                        Go Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center px-6 py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Go Back
                    </button>
                </div>
            </div>

            <div className="mt-32 text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Al-Mumin School. All rights reserved.
            </div>
        </div>
    );
};

export default NotFound;
