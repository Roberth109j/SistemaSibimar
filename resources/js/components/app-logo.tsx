export default function AppLogo() {
    return (
      <div className="flex items-center group">
        <img 
          src="/IMG/escudo.png" 
          alt="Escudo del Colegio" 
          className="h-10 w-auto transition-transform duration-300 group-hover:scale-110" 
        />
        <div className="ml-2 flex flex-col justify-center">
          <span className="text-[9px] font-light text-gray-800 dark:text-gray-200 transition-colors duration-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">Colegio</span>
          <h1 className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight transition-colors duration-300 group-hover:text-blue-900 dark:group-hover:text-blue-300">
            Liceo de la Merced Maridiaz
          </h1>
          <span className="text-[9px] font-light text-gray-800 dark:text-gray-200 text-right transition-colors duration-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">Franciscanas</span>
        </div>
      </div>
    );
  }