// Index.tsx
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

// Definición de tipos
type Autor = {
  id: number;
  apellidos: string;
  nombres: string;
  libros?: { id: number; titulo: string }[];
};

type FlashMessage = {
  success?: string;
  error?: string;
};

type IndexProps = {
  auth: {
    user: any;
  };
  autores: Autor[];
  flash?: FlashMessage;
};

export default function Index({ auth, autores, flash }: IndexProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAutores = searchTerm 
    ? autores.filter(
        autor => 
          autor.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) || 
          autor.nombres.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : autores;

  // Contenido original con ajustes de espaciado
  const content = (
    <div className="py-8 px-6"> {/* Añadido padding para separar del dashboard */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gestión de Autores</h1>
          
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar autores..."
              className="w-64 pl-10 py-2 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          
          <Link
            href="/autores/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Autor</span>
          </Link>
        </div>
      </div>
      
      {flash?.success && (
        <div className="p-4 bg-green-900/30 border border-green-500 text-green-100 rounded-lg mb-6">
          {flash.success}
        </div>
      )}
      
      {flash?.error && (
        <div className="p-4 bg-red-900/30 border border-red-500 text-red-100 rounded-lg mb-6">
          {flash.error}
        </div>
      )}
      
      <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-lg"> {/* Añadido shadow */}
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Apellidos</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Nombres</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre Completo</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredAutores.length > 0 ? (
              filteredAutores.map((autor) => (
                <tr key={autor.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{autor.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{autor.apellidos}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{autor.nombres}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{`${autor.apellidos}, ${autor.nombres}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-3">
                      <Link
                        href={`/autores/${autor.id}`}
                        className="text-blue-400 hover:text-blue-300"
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/autores/${autor.id}/edit`}
                        className="text-yellow-400 hover:text-yellow-300"
                        title="Editar"
                      >
                        <Pencil className="w-5 h-5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                  No hay autores disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <Head title="Gestión de Autores" />
      {content}
    </AppLayout>
  );
}