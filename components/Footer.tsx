import React from 'react';
import { Hexagon, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Hexagon className="h-6 w-6 text-primary-500 fill-primary-500/20" />
              <span className="font-display font-bold text-lg text-white">
                terreninvendita<span className="text-primary-500">.ai</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              La prima piattaforma immobiliare in Europa guidata dall'Intelligenza Artificiale Generativa. Analizza, valuta e vendi terreni con precisione scientifica.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 font-display">Piattaforma</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="hover:text-primary-400 cursor-pointer transition-colors">Analisi AI</li>
              <li className="hover:text-primary-400 cursor-pointer transition-colors">Marketplace</li>
              <li className="hover:text-primary-400 cursor-pointer transition-colors">Prezzi</li>
              <li className="hover:text-primary-400 cursor-pointer transition-colors">API per Sviluppatori</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 font-display">Risorse</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="hover:text-primary-400 cursor-pointer transition-colors">Blog Tecnico</li>
              <li className="hover:text-primary-400 cursor-pointer transition-colors">Documentazione DEM</li>
              <li className="hover:text-primary-400 cursor-pointer transition-colors">Guide Normative</li>
              <li className="hover:text-primary-400 cursor-pointer transition-colors">Supporto</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 font-display">Legale</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="hover:text-primary-400 cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-primary-400 cursor-pointer transition-colors">Termini di Servizio</li>
              <li className="hover:text-primary-400 cursor-pointer transition-colors">Cookie Policy</li>
            </ul>
            <div className="flex gap-4 mt-6">
                <Twitter className="h-5 w-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
                <Linkedin className="h-5 w-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
                <Instagram className="h-5 w-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 text-center text-xs text-gray-600 font-mono">
          © 2025 terreninvendita.ai - Silicon Valley Style Engineering. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;