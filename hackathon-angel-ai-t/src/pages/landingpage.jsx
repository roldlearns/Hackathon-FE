import React from "react";
import { Heart, Mic, Cloud, Phone } from "lucide-react";
import '../styles/landingpage.css';


const LandingPage = () => {
  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-center py-6 px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-700">
          Angel-AI-t
        </h1>
      </header>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center py-20 md:py-32 px-4">
        <h2 className="text-5xl md:text-7xl font-extrabold text-indigo-700 max-w-3xl leading-tight">
          Find Your Calm in the Chaos
        </h2>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl">
          Angel-AI-t is a smart companion that proactively helps you manage
          stress by detecting real-time changes in your vitals and providing
          personalized calming audio.
        </p>
        <div className="mt-10 flex space-x-4">
          <button
            onClick={goToDashboard}
            className="px-6 py-3 border border-indigo-600 text-indigo-600 font-semibold rounded-full shadow-lg hover:bg-indigo-50 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-indigo-600 uppercase">
              Features
            </span>
            <h3 className="mt-2 text-3xl font-extrabold text-gray-800">
              Designed to Keep You Grounded
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="p-6 bg-white rounded-3xl shadow-xl flex flex-col items-center text-center md:text-left">
              <div className="w-12 h-12 p-3 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Heart className="text-indigo-600" />
              </div>
              <h4 className="mt-4 text-xl font-bold text-gray-800">
                Stress Detection
              </h4>
              <p className="mt-2 text-base text-gray-700">
                Monitors your heart rate in real time to automatically detect
                rising stress levels before you're even aware of them.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="p-6 bg-white rounded-3xl shadow-xl flex flex-col items-center text-center md:text-left">
              <div className="w-12 h-12 p-3 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Mic className="text-indigo-600" />
              </div>
              <h4 className="mt-4 text-xl font-bold text-gray-800">
                Calming Audio
              </h4>
              <p className="mt-2 text-base text-gray-700">
                Instantly plays soothing white noise or your own custom audio
                file to help you relax and recenter.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="p-6 bg-white rounded-3xl shadow-xl flex flex-col items-center text-center md:text-left">
              <div className="w-12 h-12 p-3 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Cloud className="text-indigo-600" />
              </div>
              <h4 className="mt-4 text-xl font-bold text-gray-800">
                AI Integration
              </h4>
              <p className="mt-2 text-base text-gray-700">
                Our intelligent system adapts to your unique stress patterns,
                providing a truly personalized experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div id="cta" className="bg-indigo-700 py-12 px-4 text-center">
        <div className="container mx-auto">
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-6">
            Ready to take control of your stress?
          </h3>
          <a
            href="#"
            className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full text-lg hover:bg-white hover:text-indigo-700 transition-colors"
          >
            Request Early Access
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-indigo-900 text-indigo-200 py-8 px-4">
        <div className="container mx-auto text-center border-t border-indigo-800 pt-8">
          <h4 className="font-extrabold text-2xl text-indigo-100">Angel-AI-t</h4>
          <div className="flex justify-center items-center space-x-4 mt-4">
            <a
              href="#"
              className="text-sm font-medium hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm font-medium hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm font-medium hover:text-white transition-colors"
            >
              <Phone size={16} className="inline-block mr-1" />
              Contact Us
            </a>
          </div>
          <p className="text-sm text-indigo-300 mt-6">
            &copy; {new Date().getFullYear()} Angel-AI-t. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
