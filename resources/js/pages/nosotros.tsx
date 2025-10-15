import React from 'react';
import Modal from '@/components/Modal';

type Developer = {
  name: string;
  role: string;
  linkedin: string;
  github: string;
  avatar: string;
  color: string;
};

type DevelopersModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function DevelopersModal({ isOpen, onClose }: DevelopersModalProps) {
  const developers: Developer[] = [
    {
      name: "Daniel Enrique Caceres",
      role: "Developer",
      linkedin: "https://linkedin.com/in/daniel-enrique-caceres-torres-b70ab432b",
      github: "https://github.com/Daniel99c",
      avatar: "https://ui-avatars.com/api/?name=Daniel+Caceres&background=10b981&color=fff&bold=true&size=80",
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Carlos Felipe Suarez",
      role: "Developer",
      linkedin: "https://www.linkedin.com/in/carlos-felipe-suárez-rodriguez-453464353/",
      github: "https://github.com/Felipey55",
      avatar: "https://ui-avatars.com/api/?name=Carlos+Suares&background=6366f1&color=fff&bold=true&size=80",
      color: "from-indigo-500 to-purple-500"
    },
    {
      name: "Roberth Jose Riascos",
      role: "Developer",
      linkedin: "https://linkedin.com/in/roberth-jose-riascos-salcedo-488368378",
      github: "https://github.com/Roberth109j",
      avatar: "https://ui-avatars.com/api/?name=Roberth+Riascos&background=c0392b&color=fff&bold=true&size=80",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Nuestro Equipo de Desarrollo"
      description="Conoce el equipo que hizo posible este proyecto"
    >
      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 
                      scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 
                      scrollbar-track-transparent hover:scrollbar-thumb-gray-500">
        {developers.map((dev, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 
                       bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-lg 
                       hover:border-transparent hover:-translate-y-0.5"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${dev.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            
            <div className="relative flex items-center gap-3 p-3">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${dev.color} rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300`}></div>
                <img
                  src={dev.avatar}
                  alt={dev.name}
                  className="relative w-14 h-14 rounded-full ring-2 ring-gray-100 dark:ring-gray-700 
                           group-hover:ring-4 transition-all duration-300 object-cover
                           shadow-md group-hover:scale-110"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-0.5 truncate
                             group-hover:text-transparent group-hover:bg-clip-text 
                             group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600
                             transition-all duration-300">
                  {dev.name}
                </h4>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                bg-gradient-to-r ${dev.color} text-white`}>
                  {dev.role}
                </span>
              </div>

              <div className="flex gap-1.5">
                <a
                  href={dev.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn flex items-center justify-center w-9 h-9 rounded-lg 
                           bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20
                           hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/40 dark:hover:to-blue-800/40
                           transition-all duration-300 transform hover:scale-110 hover:rotate-3
                           shadow-sm hover:shadow-md"
                  title={`LinkedIn de ${dev.name}`}
                >
                  <svg 
                    className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover/btn:scale-110 transition-transform" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                
                <a
                  href={dev.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn flex items-center justify-center w-9 h-9 rounded-lg 
                           bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800
                           hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700
                           transition-all duration-300 transform hover:scale-110 hover:-rotate-3
                           shadow-sm hover:shadow-md"
                  title={`GitHub de ${dev.name}`}
                >
                  <svg 
                    className="w-4 h-4 text-gray-700 dark:text-gray-300 group-hover/btn:scale-110 transition-transform" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="h-0.5 bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${dev.color} transform -translate-x-full 
                             group-hover:translate-x-0 transition-transform duration-700 ease-out`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            Copyright © 2025 Colegio Liceo de la Merced Maridíaz. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </Modal>
  );
}