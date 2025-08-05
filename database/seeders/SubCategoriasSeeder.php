<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubCategoriasSeeder extends Seeder
{
    public function run(): void
    {
        // Insertar Subcategorías
        $subcategorias = [
            // Subcategorías de categoría '000' (Generalidades)
            ['codigo' => '000', 'nombre' => 'Generalidades', 'categoria_id' => 1],
            ['codigo' => '010', 'nombre' => 'Bibliografía', 'categoria_id' => 1],
            ['codigo' => '020', 'nombre' => 'Bibliotecología y ciencias de la información', 'categoria_id' => 1],
            ['codigo' => '030', 'nombre' => 'Enciclopedias generales', 'categoria_id' => 1],
            ['codigo' => '050', 'nombre' => 'Publicaciones en serie y generales', 'categoria_id' => 1],
            ['codigo' => '060', 'nombre' => 'Organizaciones y museología', 'categoria_id' => 1],
            ['codigo' => '070', 'nombre' => 'Periodismo y publicaciones periódicas', 'categoria_id' => 1],
            ['codigo' => '080', 'nombre' => 'Colecciones generales', 'categoria_id' => 1],
            ['codigo' => '090', 'nombre' => 'Manuscritos y libros raros', 'categoria_id' => 1],

            // Subcategorías de categoría '100' (Filosofía y psicología)
            ['codigo' => '100', 'nombre' => 'Filosofía y psicología', 'categoria_id' => 2],
            ['codigo' => '110', 'nombre' => 'Metafísica', 'categoria_id' => 2],
            ['codigo' => '120', 'nombre' => 'Epistemología, causalidad, genero humano', 'categoria_id' => 2],
            ['codigo' => '130', 'nombre' => 'Fenómenos paranormales', 'categoria_id' => 2],
            ['codigo' => '140', 'nombre' => 'Escuelas filosóficas específicas', 'categoria_id' => 2],
            ['codigo' => '150', 'nombre' => 'Psicología', 'categoria_id' => 2],
            ['codigo' => '160', 'nombre' => 'Lógica', 'categoria_id' => 2],
            ['codigo' => '170', 'nombre' => 'Ética (Filosofía moral)', 'categoria_id' => 2],
            ['codigo' => '180', 'nombre' => 'Filosofía antigua', 'categoria_id' => 2],
            ['codigo' => '190', 'nombre' => 'Filosofía moderna occidental', 'categoria_id' => 2],
            
            // Subcategorías de categoría '200' (Religión)
            ['codigo' => '200', 'nombre' => 'Religión', 'categoria_id' => 3],
            ['codigo' => '210', 'nombre' => 'Teología natural', 'categoria_id' => 3],
            ['codigo' => '220', 'nombre' => 'La Biblia', 'categoria_id' => 3],
            ['codigo' => '230', 'nombre' => 'Teología cristiana', 'categoria_id' => 3],
            ['codigo' => '240', 'nombre' => 'Moral cristiana y teología piadosa', 'categoria_id' => 3],
            ['codigo' => '250', 'nombre' => 'Ordenes cristianas y iglesia local', 'categoria_id' => 3],
            ['codigo' => '260', 'nombre' => 'Teología social cristiana', 'categoria_id' => 3],
            ['codigo' => '270', 'nombre' => 'Historia de la iglesia cristiana', 'categoria_id' => 3],
            ['codigo' => '280', 'nombre' => 'Denominaciones y sectas cristianas', 'categoria_id' => 3],
            ['codigo' => '290', 'nombre' => 'Otras y religión comparada', 'categoria_id' => 3],

            // Subcategorías de categoría '300' (Ciencias sociales)
            ['codigo' => '300', 'nombre' => 'Ciencias sociales', 'categoria_id' => 4],
            ['codigo' => '310', 'nombre' => 'Estadística general', 'categoria_id' => 4],
            ['codigo' => '320', 'nombre' => 'Ciencia política y gobierno', 'categoria_id' => 4],
            ['codigo' => '330', 'nombre' => 'Economía', 'categoria_id' => 4],
            ['codigo' => '340', 'nombre' => 'Derecho y leyes', 'categoria_id' => 4],
            ['codigo' => '350', 'nombre' => 'Administración pública y militar', 'categoria_id' => 4],
            ['codigo' => '360', 'nombre' => 'Servicios sociales y asociaciones', 'categoria_id' => 4],
            ['codigo' => '370', 'nombre' => 'Educación y enseñanza', 'categoria_id' => 4],
            ['codigo' => '380', 'nombre' => 'Comercio, comunicaciones y transporte', 'categoria_id' => 4],
            ['codigo' => '390', 'nombre' => 'Costumbres, etiqueta y folclor', 'categoria_id' => 4],

            // Subcategorías de categoría '400' (Lenguas)
            ['codigo' => '400', 'nombre' => 'Lenguas', 'categoria_id' => 5],
            ['codigo' => '410', 'nombre' => 'Lingüística', 'categoria_id' => 5],
            ['codigo' => '420', 'nombre' => 'Inglés e ingles antiguo', 'categoria_id' => 5],
            ['codigo' => '430', 'nombre' => 'Lenguas germánicas.Alemán', 'categoria_id' => 5],
            ['codigo' => '440', 'nombre' => 'Lenguas romances.Francés', 'categoria_id' => 5],
            ['codigo' => '450', 'nombre' => 'Italiano, rumano y retorromano', 'categoria_id' => 5],
            ['codigo' => '460', 'nombre' => 'Lenguas española y portuguesa', 'categoria_id' => 5],
            ['codigo' => '470', 'nombre' => 'Lenguas italicas.Latin', 'categoria_id' => 5],
            ['codigo' => '480', 'nombre' => 'Lenguas helenicas. Griego clásico', 'categoria_id' => 5],
            ['codigo' => '490', 'nombre' => 'Otras lenguas', 'categoria_id' => 5],

            // Subcategorías de categoría '500' (Ciencias naturales y matemáticas)
            ['codigo' => '500', 'nombre' => 'Ciencias naturales y matemáticas', 'categoria_id' => 6],
            ['codigo' => '510', 'nombre' => 'Matemáticas', 'categoria_id' => 6],
            ['codigo' => '520', 'nombre' => 'Astronomía y ciencias afines', 'categoria_id' => 6],
            ['codigo' => '530', 'nombre' => 'Física', 'categoria_id' => 6],
            ['codigo' => '540', 'nombre' => 'Química y ciencias afines', 'categoria_id' => 6],
            ['codigo' => '550', 'nombre' => 'Ciencias de la tierra', 'categoria_id' => 6],
            ['codigo' => '560', 'nombre' => 'Paleontología y paleozoología', 'categoria_id' => 6],
            ['codigo' => '570', 'nombre' => 'Ciencias de la vida', 'categoria_id' => 6],
            ['codigo' => '580', 'nombre' => 'Ciencias Botánicas', 'categoria_id' => 6],
            ['codigo' => '590', 'nombre' => 'Ciencias zoológicas', 'categoria_id' => 6],

            // Subcategorías de categoría '600' (Tecnología)
            ['codigo' => '600', 'nombre' => 'Tecnología (Ciencias aplicadas)', 'categoria_id' => 7],
            ['codigo' => '610', 'nombre' => 'Ciencias médicas y Medicina', 'categoria_id' => 7],
            ['codigo' => '620', 'nombre' => 'Ingeniería y operaciones afines', 'categoria_id' => 7],
            ['codigo' => '630', 'nombre' => 'Agricultura', 'categoria_id' => 7],
            ['codigo' => '640', 'nombre' => 'Economía doméstica y vida familiar', 'categoria_id' => 7],
            ['codigo' => '650', 'nombre' => 'Administración y servicios auxiliares', 'categoria_id' => 7],
            ['codigo' => '660', 'nombre' => 'Ingeniería química', 'categoria_id' => 7],
            ['codigo' => '670', 'nombre' => 'Manufactura', 'categoria_id' => 7],
            ['codigo' => '680', 'nombre' => 'Manufactura para usos específicos', 'categoria_id' => 7],
            ['codigo' => '690', 'nombre' => 'Construcción', 'categoria_id' => 7],

            // Subcategorías de categoría '700' (Artes)
            ['codigo' => '700', 'nombre' => 'Artes', 'categoria_id' => 8],
            ['codigo' => '710', 'nombre' => 'Urbanismo y arte del paisaje', 'categoria_id' => 8],
            ['codigo' => '720', 'nombre' => 'Arquitectura del paisaje', 'categoria_id' => 8],
            ['codigo' => '730', 'nombre' => 'Artes plásticas Escultura', 'categoria_id' => 8],
            ['codigo' => '740', 'nombre' => 'Dibujo y artes decorativas', 'categoria_id' => 8],
            ['codigo' => '750', 'nombre' => 'Pinturas', 'categoria_id' => 8],
            ['codigo' => '760', 'nombre' => 'Artes gráficas. Arte de grabar y grabados', 'categoria_id' => 8],
            ['codigo' => '770', 'nombre' => 'Fotografía', 'categoria_id' => 8],
            ['codigo' => '780', 'nombre' => 'Música', 'categoria_id' => 8],
            ['codigo' => '790', 'nombre' => 'Artes recreativas y de la actuación', 'categoria_id' => 8],

            // Subcategorías de categoría '800' (Literatura y retórica)
            ['codigo' => '800', 'nombre' => 'Literatura y retórica', 'categoria_id' => 9],
            ['codigo' => '810', 'nombre' => 'Literatura americana en inglés', 'categoria_id' => 9],
            ['codigo' => '820', 'nombre' => 'Literaturas inglesa e inglesa antiguas', 'categoria_id' => 9],
            ['codigo' => '830', 'nombre' => 'Literaturas de lenguas germánicas', 'categoria_id' => 9],
            ['codigo' => '840', 'nombre' => 'Literaturas de lenguas romances', 'categoria_id' => 9],
            ['codigo' => '850', 'nombre' => 'Literaturas italiana, rumana, retorromana', 'categoria_id' => 9],
            ['codigo' => '860', 'nombre' => 'Literaturas española y portuguesa', 'categoria_id' => 9],
            ['codigo' => '870', 'nombre' => 'Literaturas itálicas. Literatura latina', 'categoria_id' => 9],
            ['codigo' => '880', 'nombre' => 'Literaturas helénicas. Literatura griega clásica', 'categoria_id' => 9],
            ['codigo' => '890', 'nombre' => 'Literatura de otras lenguas.', 'categoria_id' => 9],

            // Subcategorías de categoría '900' (Geografía e Historia)
            ['codigo' => '900', 'nombre' => 'Geografía e historia', 'categoria_id' => 10],
            ['codigo' => '910', 'nombre' => 'Geografía y viajes', 'categoria_id' => 10],
            ['codigo' => '920', 'nombre' => 'Biografía, genealogía, emblemas', 'categoria_id' => 10],
            ['codigo' => '930', 'nombre' => 'Historia del mundo antiguo', 'categoria_id' => 10],
            ['codigo' => '940', 'nombre' => 'Historia general de Europa', 'categoria_id' => 10],
            ['codigo' => '950', 'nombre' => 'Historia general de Asia. Extremo Oriente', 'categoria_id' => 10],
            ['codigo' => '960', 'nombre' => 'Historia general de África', 'categoria_id' => 10],
            ['codigo' => '970', 'nombre' => 'Historia general de América', 'categoria_id' => 10],
            ['codigo' => '980', 'nombre' => 'Historia general de América del Sur', 'categoria_id' => 10],
            ['codigo' => '990', 'nombre' => 'Historia general de otras áreas', 'categoria_id' => 10],
            
        ];

        DB::table('subcategorias_dewey')->insert($subcategorias);
    }
}
