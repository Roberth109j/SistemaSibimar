<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TemaSeeder extends Seeder
{
    public function run(): void
    {
        // Insertar Temas
        $temas = [

            // Temas de la subcategoría '000' (Generalidades)
            ['codigo' => '000', 'nombre' => 'Generales', 'subcategoria_id' => 1],
            ['codigo' => '001', 'nombre' => 'Conocimiento', 'subcategoria_id' => 1],
            ['codigo' => '002', 'nombre' => 'El libro', 'subcategoria_id' => 1],
            ['codigo' => '003', 'nombre' => 'Sistemas y cibernetica', 'subcategoria_id' => 1],
            ['codigo' => '004', 'nombre' => 'Procesamiento de datos', 'subcategoria_id' => 1],
            ['codigo' => '005', 'nombre' => 'Programacion de computadores', 'subcategoria_id' => 1],
            ['codigo' => '006', 'nombre' => 'Metodos especiales de computacion', 'subcategoria_id' => 1],

            // Temas de la subcategoría '010' (Bibliografía)
            ['codigo' => '010', 'nombre' => 'Bibliografía', 'subcategoria_id' => 2],
            ['codigo' => '011', 'nombre' => 'Bibliografías generales y universales', 'subcategoria_id' => 2],
            ['codigo' => '012', 'nombre' => 'Bibliografías y catálogos de individuos', 'subcategoria_id' => 2],
            ['codigo' => '013', 'nombre' => 'Bibliografías y catálogos por categorías específicas de autores', 'subcategoria_id' => 2],
            ['codigo' => '014', 'nombre' => 'Bibliografías y catálogos de obras anónimas o seudónimas', 'subcategoria_id' => 2],
            ['codigo' => '015', 'nombre' => 'Bibliografías y catálogos de obras de lugares específicos', 'subcategoria_id' => 2],
            ['codigo' => '016', 'nombre' => 'Bibliografías y catálogos de obras sobre temas específicos', 'subcategoria_id' => 2],
            ['codigo' => '017', 'nombre' => 'Catálogos generales por materia (sistemáticos)', 'subcategoria_id' => 2],
            ['codigo' => '018', 'nombre' => 'Catálogos ordenados por autor', 'subcategoria_id' => 2],
            ['codigo' => '019', 'nombre' => 'Catálogos diccionario', 'subcategoria_id' => 2],

            // Temas de la subcategoría '020' (Bibliotecología y ciencias de la información)
            ['codigo' => '020', 'nombre' => 'Bibliotecología y ciencias de la información', 'subcategoria_id' => 3],
            ['codigo' => '021', 'nombre' => 'Relaciones de bibliotecas', 'subcategoria_id' => 3],
            ['codigo' => '022', 'nombre' => 'Administración de la planta física', 'subcategoria_id' => 3],
            ['codigo' => '023', 'nombre' => 'Administración de personal', 'subcategoria_id' => 3],
            ['codigo' => '025', 'nombre' => 'Operaciones bibliotecarias', 'subcategoria_id' => 3],
            ['codigo' => '026', 'nombre' => 'Bibliotecas para temas específicos', 'subcategoria_id' => 3],
            ['codigo' => '027', 'nombre' => 'Bibliotecas generales', 'subcategoria_id' => 3],
            ['codigo' => '028', 'nombre' => 'Lectura, uso de otros medios de información', 'subcategoria_id' => 3],

            // Temas de la subcategoría '030' (Enciclopedias generales)
            ['codigo' => '030', 'nombre' => 'Enciclopedias generales', 'subcategoria_id' => 4],
            ['codigo' => '031', 'nombre' => 'Norteamericanas', 'subcategoria_id' => 4],
            ['codigo' => '032', 'nombre' => 'En inglés', 'subcategoria_id' => 4],
            ['codigo' => '033', 'nombre' => 'En otras lenguas germánicas', 'subcategoria_id' => 4],
            ['codigo' => '034', 'nombre' => 'En francés, provenzal, catalán', 'subcategoria_id' => 4],
            ['codigo' => '035', 'nombre' => 'En italiano, rumano, retorromano', 'subcategoria_id' => 4],
            ['codigo' => '036', 'nombre' => 'En español y portugués', 'subcategoria_id' => 4],
            ['codigo' => '037', 'nombre' => 'En lenguas eslavas', 'subcategoria_id' => 4],
            ['codigo' => '038', 'nombre' => 'En lenguas escandinavas', 'subcategoria_id' => 4],
            ['codigo' => '039', 'nombre' => 'En otras lenguas', 'subcategoria_id' => 4],

            // temas de la subcategoria '050' (Publicaciones en serie y generales)
            ['codigo' => '050', 'nombre' => 'Publicaciones en serie generales', 'subcategoria_id' => 5],
            ['codigo' => '051', 'nombre' => 'Norteamericanas', 'subcategoria_id' => 5],
            ['codigo' => '052', 'nombre' => 'En inglés', 'subcategoria_id' => 5],
            ['codigo' => '053', 'nombre' => 'En otras lenguas germánicas', 'subcategoria_id' => 5],
            ['codigo' => '054', 'nombre' => 'En francés, provenzal, catalán', 'subcategoria_id' => 5],
            ['codigo' => '055', 'nombre' => 'En italiano, rumano, retorromano', 'subcategoria_id' => 5],
            ['codigo' => '056', 'nombre' => 'En español y portugués', 'subcategoria_id' => 5],
            ['codigo' => '057', 'nombre' => 'En lenguas eslavas', 'subcategoria_id' => 5],
            ['codigo' => '058', 'nombre' => 'En lenguas escandinavas', 'subcategoria_id' => 5],
            ['codigo' => '059', 'nombre' => 'En otras lenguas', 'subcategoria_id' => 5],

            // temas de la subcategoria '060' (organizaciones generales y museología)
            ['codigo' => '060', 'nombre' => 'Organizaciones generales y museología', 'subcategoria_id' => 6],
            ['codigo' => '061', 'nombre' => 'En América del Norte', 'subcategoria_id' => 6],
            ['codigo' => '062', 'nombre' => 'En las Islas Británicas. En Inglaterra', 'subcategoria_id' => 6],
            ['codigo' => '063', 'nombre' => 'En Europa Central. En Alemania', 'subcategoria_id' => 6],
            ['codigo' => '064', 'nombre' => 'En Francia y Mónaco', 'subcategoria_id' => 6],
            ['codigo' => '065', 'nombre' => 'En Italia y territorios adyacentes', 'subcategoria_id' => 6],
            ['codigo' => '066', 'nombre' => 'En la Península Ibérica e islas adyacentes', 'subcategoria_id' => 6],
            ['codigo' => '067', 'nombre' => 'En Europa Oriental. En Rusia', 'subcategoria_id' => 6],
            ['codigo' => '068', 'nombre' => 'En otras áreas', 'subcategoria_id' => 6],
            ['codigo' => '069', 'nombre' => 'Museología (Ciencia de los Museos)', 'subcategoria_id' => 6],

            // temas de la subcategoria '070' (Medios noticiosos y publicaciones periódicas)
            ['codigo' => '070', 'nombre' => 'Medios noticiosos y publicaciones periódicas', 'subcategoria_id' => 7],
            ['codigo' => '071', 'nombre' => 'En América del Norte', 'subcategoria_id' => 7],
            ['codigo' => '072', 'nombre' => 'En las Islas Británicas. En Inglaterra', 'subcategoria_id' => 7],
            ['codigo' => '073', 'nombre' => 'En Europa Central. En Alemania', 'subcategoria_id' => 7],
            ['codigo' => '074', 'nombre' => 'En Francia y Mónaco', 'subcategoria_id' => 7],
            ['codigo' => '075', 'nombre' => 'En Italia y territorios adyacentes', 'subcategoria_id' => 7],
            ['codigo' => '076', 'nombre' => 'En la Península Ibérica e islas adyacentes', 'subcategoria_id' => 7],
            ['codigo' => '077', 'nombre' => 'En Europa Oriental. En Rusia', 'subcategoria_id' => 7],
            ['codigo' => '078', 'nombre' => 'En escandinavia', 'subcategoria_id' => 7],
            ['codigo' => '079', 'nombre' => 'En otras areas', 'subcategoria_id' => 7],

            // temas de la subcategoria '080' (Colecciones generales)
            ['codigo' => '080', 'nombre' => 'Colecciones generales', 'subcategoria_id' => 8],
            ['codigo' => '081', 'nombre' => 'Norteamericanas', 'subcategoria_id' => 8],
            ['codigo' => '082', 'nombre' => 'En Inglés', 'subcategoria_id' => 8],
            ['codigo' => '083', 'nombre' => 'En otras lenguas Germánicas', 'subcategoria_id' => 8],
            ['codigo' => '084', 'nombre' => 'En Francés, provenzal, catalán', 'subcategoria_id' => 8],
            ['codigo' => '085', 'nombre' => 'En italiano, rumano, retorromano.', 'subcategoria_id' => 8],
            ['codigo' => '086', 'nombre' => 'En español y portugués', 'subcategoria_id' => 8],
            ['codigo' => '087', 'nombre' => 'En lenguas eslavas', 'subcategoria_id' => 8],
            ['codigo' => '088', 'nombre' => 'En lenguas escandinavas', 'subcategoria_id' => 8],
            ['codigo' => '089', 'nombre' => 'En otras lenguas', 'subcategoria_id' => 8],

            // temas de la subcategoria '090' (Manuscritos y libros raros)
            ['codigo' => '090', 'nombre' => 'Manuscritos y libros raros', 'subcategoria_id' => 9],
            ['codigo' => '091', 'nombre' => 'Manuscritos', 'subcategoria_id' => 9],
            ['codigo' => '092', 'nombre' => 'Libros xilográficos', 'subcategoria_id' => 9],
            ['codigo' => '093', 'nombre' => 'Incunables', 'subcategoria_id' => 9],
            ['codigo' => '094', 'nombre' => 'Libros impresos', 'subcategoria_id' => 9],
            ['codigo' => '095', 'nombre' => 'Libros notables por su encuadernación', 'subcategoria_id' => 9],
            ['codigo' => '096', 'nombre' => 'Libros notables por las ilustraciones', 'subcategoria_id' => 9],
            ['codigo' => '097', 'nombre' => 'Libros notables por su propietario u origen', 'subcategoria_id' => 9],
            ['codigo' => '098', 'nombre' => 'Obras prohibidas, falsificaciones, imposturas', 'subcategoria_id' => 9],
            ['codigo' => '099', 'nombre' => 'Libros notables por su formato', 'subcategoria_id' => 9],

            // ..........................................................................................................

            // Temas de la subcategoría '100' (Filosofía y psicología)
            ['codigo' => '100', 'nombre' => 'Filosofía y psicología', 'subcategoria_id' => 10],
            ['codigo' => '101', 'nombre' => 'Teoría de la filosofía', 'subcategoria_id' => 10],
            ['codigo' => '102', 'nombre' => 'Miscelánea de filosofía', 'subcategoria_id' => 10],
            ['codigo' => '103', 'nombre' => 'Diccionarios de filosofía', 'subcategoria_id' => 10],
            ['codigo' => '105', 'nombre' => 'Publicaciones en serie de filosofía', 'subcategoria_id' => 10],
            ['codigo' => '106', 'nombre' => 'Organizaciones en filosofía', 'subcategoria_id' => 10],
            ['codigo' => '107', 'nombre' => 'Educación, investigación en filosofía', 'subcategoria_id' => 10],
            ['codigo' => '108', 'nombre' => 'Clases de personas en filosofía', 'subcategoria_id' => 10],
            ['codigo' => '109', 'nombre' => 'Tratamiento histórico de la filosofía', 'subcategoria_id' => 10],

            // Temas de la subcategoría '110' (Metafisica)
            ['codigo' => '110', 'nombre' => 'Metafísica', 'subcategoria_id' => 11],
            ['codigo' => '111', 'nombre' => 'Ontología', 'subcategoria_id' => 11],
            ['codigo' => '113', 'nombre' => 'Cosmología', 'subcategoria_id' => 11],
            ['codigo' => '114', 'nombre' => 'Espacio', 'subcategoria_id' => 11],
            ['codigo' => '115', 'nombre' => 'Tiempo', 'subcategoria_id' => 11],
            ['codigo' => '116', 'nombre' => 'Cambio', 'subcategoria_id' => 11],
            ['codigo' => '117', 'nombre' => 'Estructura', 'subcategoria_id' => 11],
            ['codigo' => '118', 'nombre' => 'Fuerza y energía', 'subcategoria_id' => 11],
            ['codigo' => '119', 'nombre' => 'Número y cantidad', 'subcategoria_id' => 11],

            // Temas de la subcategoría '120' (Epistemología, causalidad, genero humano)
            ['codigo' => '120', 'nombre' => 'Epistemología, causalidad, género humano', 'subcategoria_id' => 12],
            ['codigo' => '121', 'nombre' => 'Epistemología', 'subcategoria_id' => 12],
            ['codigo' => '122', 'nombre' => 'Causalidad', 'subcategoria_id' => 12],
            ['codigo' => '123', 'nombre' => 'Determinismo e indeterminismo', 'subcategoria_id' => 12],
            ['codigo' => '124', 'nombre' => 'Teleología', 'subcategoria_id' => 12],
            ['codigo' => '126', 'nombre' => 'El yo', 'subcategoria_id' => 12],
            ['codigo' => '127', 'nombre' => 'El inconsciente y el subconsciente', 'subcategoria_id' => 12],
            ['codigo' => '128', 'nombre' => 'Género humano', 'subcategoria_id' => 12],
            ['codigo' => '129', 'nombre' => 'Origen y destino de alma individual', 'subcategoria_id' => 12],

            // Temas de la subcategoría '130' (Fenómenos paranormales)
            ['codigo' => '130', 'nombre' => 'Fenómenos paranormales', 'subcategoria_id' => 13],
            ['codigo' => '131', 'nombre' => 'Métodos ocultos para lograr bienestar', 'subcategoria_id' => 13],
            ['codigo' => '133', 'nombre' => 'Parapsicología y ocultismo', 'subcategoria_id' => 13],
            ['codigo' => '135', 'nombre' => 'Sueños y misterios', 'subcategoria_id' => 13],
            ['codigo' => '137', 'nombre' => 'Grafología adivinatoria', 'subcategoria_id' => 13],
            ['codigo' => '138', 'nombre' => 'Fisionomía', 'subcategoria_id' => 13],
            ['codigo' => '139', 'nombre' => 'Frenología', 'subcategoria_id' => 13],

            // Temas de la subcategoría '140' (Escuelas filosóficas específicas)
            ['codigo' => '140', 'nombre' => 'Escuelas filosóficas específicas', 'subcategoria_id' => 14],
            ['codigo' => '141', 'nombre' => 'Idealismo y sistemas relacionados', 'subcategoria_id' => 14],
            ['codigo' => '142', 'nombre' => 'Filosofía crítica', 'subcategoria_id' => 14],
            ['codigo' => '143', 'nombre' => 'Intuicionismo y bergsonismo', 'subcategoria_id' => 14],
            ['codigo' => '144', 'nombre' => 'Humanismo y sistemas relacionados', 'subcategoria_id' => 14],
            ['codigo' => '145', 'nombre' => 'Sensacionalismo', 'subcategoria_id' => 14],
            ['codigo' => '146', 'nombre' => 'Naturalismo y sistemas relacionados', 'subcategoria_id' => 14],
            ['codigo' => '147', 'nombre' => 'Panteísmo y sistemas relacionados', 'subcategoria_id' => 14],
            ['codigo' => '148', 'nombre' => 'Liberalismo, eclecticismo, tradicionalismo', 'subcategoria_id' => 14],
            ['codigo' => '149', 'nombre' => 'Otros sistemas filosóficos', 'subcategoria_id' => 14],

            // Temas de la subcategoría '150' (Psicología)
            ['codigo' => '150', 'nombre' => 'Psicología', 'subcategoria_id' => 15],
            ['codigo' => '152', 'nombre' => 'Percepción, movimiento, emociones, impulsos.', 'subcategoria_id' => 15],
            ['codigo' => '153', 'nombre' => 'Procesos mentales e inteligencia', 'subcategoria_id' => 15],
            ['codigo' => '154', 'nombre' => 'Subconsciente y estados alterados', 'subcategoria_id' => 15],
            ['codigo' => '155', 'nombre' => 'Psicología diferencial', 'subcategoria_id' => 15],
            ['codigo' => '156', 'nombre' => 'Psicología comparada', 'subcategoria_id' => 15],
            ['codigo' => '158', 'nombre' => 'Psicología aplicada', 'subcategoria_id' => 15],

            // Temas de la subcategoría '160' (Lógica) 
            ['codigo' => '160', 'nombre' => 'Lógica', 'subcategoria_id' => 16],
            ['codigo' => '161', 'nombre' => 'Inducción', 'subcategoria_id' => 16],
            ['codigo' => '162', 'nombre' => 'Deducción', 'subcategoria_id' => 16],
            ['codigo' => '165', 'nombre' => 'Falacias y fuentes de error', 'subcategoria_id' => 16],
            ['codigo' => '166', 'nombre' => 'Silogismos', 'subcategoria_id' => 16],
            ['codigo' => '167', 'nombre' => 'Hipótesis', 'subcategoria_id' => 16],
            ['codigo' => '168', 'nombre' => 'Argumento y persuasión', 'subcategoria_id' => 16],
            ['codigo' => '169', 'nombre' => 'Analogías', 'subcategoria_id' => 16],

            // Temas de la subcategoría '170' (Etica(filosofia moral))
            ['codigo' => '170', 'nombre' => 'Ética (Filosofía moral)', 'subcategoria_id' => 17],
            ['codigo' => '171', 'nombre' => 'Sistemas y doctrinas', 'subcategoria_id' => 17],
            ['codigo' => '172', 'nombre' => 'Ética política', 'subcategoria_id' => 17],
            ['codigo' => '173', 'nombre' => 'Ética de las relaciones familiares', 'subcategoria_id' => 17],
            ['codigo' => '174', 'nombre' => 'Ética económica y profesional', 'subcategoria_id' => 17],
            ['codigo' => '175', 'nombre' => 'Ética de la relación y del tiempo libre', 'subcategoria_id' => 17],
            ['codigo' => '176', 'nombre' => 'Ética sexual y de la reproducción', 'subcategoria_id' => 17],
            ['codigo' => '177', 'nombre' => 'Ética de las relaciones sociales', 'subcategoria_id' => 17],
            ['codigo' => '178', 'nombre' => 'Ética del consumo', 'subcategoria_id' => 17],
            ['codigo' => '179', 'nombre' => 'Otras normas éticas', 'subcategoria_id' => 17],

            // Temas de la subcategoría '180' (Filosofía antigua)
            ['codigo' => '180', 'nombre' => 'Filosofía antigua', 'subcategoria_id' => 18],
            ['codigo' => '181', 'nombre' => 'Filosofía oriental', 'subcategoria_id' => 18],
            ['codigo' => '182', 'nombre' => 'Filosofías griegas presocráticas', 'subcategoria_id' => 18],
            ['codigo' => '183', 'nombre' => 'Filosofías sofista y socrática', 'subcategoria_id' => 18],
            ['codigo' => '184', 'nombre' => 'Filosofía platónica', 'subcategoria_id' => 18],
            ['codigo' => '185', 'nombre' => 'Filosofía aristotélica', 'subcategoria_id' => 18],
            ['codigo' => '186', 'nombre' => 'Filosofía escéptica y neoplatónica', 'subcategoria_id' => 18],
            ['codigo' => '187', 'nombre' => 'Filosofía epicúrea', 'subcategoria_id' => 18],
            ['codigo' => '188', 'nombre' => 'Filosofía estoica', 'subcategoria_id' => 18],
            ['codigo' => '189', 'nombre' => 'Filosofía medieval occidental', 'subcategoria_id' => 18],

            // Temas de la subcategoría '190' (Filosofía moderna occidental)
            ['codigo' => '190', 'nombre' => 'Filosofía moderna occidental', 'subcategoria_id' => 19],
            ['codigo' => '191', 'nombre' => 'Estados Unidos y Canadá', 'subcategoria_id' => 19],
            ['codigo' => '192', 'nombre' => 'Islas Británicas', 'subcategoria_id' => 19],
            ['codigo' => '193', 'nombre' => 'Alemania y Austria', 'subcategoria_id' => 19],
            ['codigo' => '194', 'nombre' => 'Francia', 'subcategoria_id' => 19],
            ['codigo' => '195', 'nombre' => 'Italia', 'subcategoria_id' => 19],
            ['codigo' => '196', 'nombre' => 'España y Portugal', 'subcategoria_id' => 19],
            ['codigo' => '197', 'nombre' => 'Anterior Unión Soviética', 'subcategoria_id' => 19],
            ['codigo' => '198', 'nombre' => 'Escandinavia', 'subcategoria_id' => 19],
            ['codigo' => '199', 'nombre' => 'Otras áreas geográficas', 'subcategoria_id' => 19],

            // ..........................................................................................................

            // Temas de la subcategoría '200' (Religión)
            ['codigo' => '200', 'nombre' => 'Religión', 'subcategoria_id' => 20],
            ['codigo' => '201', 'nombre' => 'Filosofía del cristianismo', 'subcategoria_id' => 20],
            ['codigo' => '202', 'nombre' => 'Miscelánea del cristianismo', 'subcategoria_id' => 20],
            ['codigo' => '203', 'nombre' => 'Diccionario del cristianismo', 'subcategoria_id' => 20],
            ['codigo' => '204', 'nombre' => 'Temas especiales', 'subcategoria_id' => 20],
            ['codigo' => '205', 'nombre' => 'Publicaciones en serie', 'subcategoria_id' => 20],
            ['codigo' => '206', 'nombre' => 'Organizaciones del cristianismo', 'subcategoria_id' => 20],
            ['codigo' => '207', 'nombre' => 'Educación, investigación en cristianismo', 'subcategoria_id' => 20],
            ['codigo' => '208', 'nombre' => 'Clases de personas en el cristianismo', 'subcategoria_id' => 20],
            ['codigo' => '209', 'nombre' => 'Historia y geografía del cristianismo', 'subcategoria_id' => 20],

            // Temas de la subcategoría '210' (Teologia natural)
            ['codigo' => '210', 'nombre' => 'Teología natural', 'subcategoria_id' => 21],
            ['codigo' => '211', 'nombre' => 'Conceptos de Dios', 'subcategoria_id' => 21],
            ['codigo' => '212', 'nombre' => 'Existencia, atributos de Dios', 'subcategoria_id' => 21],
            ['codigo' => '213', 'nombre' => 'Creación', 'subcategoria_id' => 21],
            ['codigo' => '214', 'nombre' => 'Teodicea', 'subcategoria_id' => 21],
            ['codigo' => '215', 'nombre' => 'Ciencia y Religión', 'subcategoria_id' => 21],
            ['codigo' => '216', 'nombre' => 'El bien y el mal', 'subcategoria_id' => 21],
            ['codigo' => '218', 'nombre' => 'El Hombre', 'subcategoria_id' => 21],

            // Temas de la subcategoría '220' (la biblia)
            ['codigo' => '220', 'nombre' => 'La Biblia', 'subcategoria_id' => 22],
            ['codigo' => '221', 'nombre' => 'Antiguo Testamento', 'subcategoria_id' => 22],
            ['codigo' => '222', 'nombre' => 'Libros históricos del Antiguo Testamento', 'subcategoria_id' => 22],
            ['codigo' => '223', 'nombre' => 'Libros poéticos del Antiguo Testamento', 'subcategoria_id' => 22],
            ['codigo' => '224', 'nombre' => 'Libros proféticos del Antiguo Testamento', 'subcategoria_id' => 22],
            ['codigo' => '225', 'nombre' => 'Nuevo Testamento', 'subcategoria_id' => 22],
            ['codigo' => '226', 'nombre' => 'Evangelios y Hechos de los Apóstoles', 'subcategoria_id' => 22],
            ['codigo' => '227', 'nombre' => 'Epístolas', 'subcategoria_id' => 22],
            ['codigo' => '228', 'nombre' => 'Revelación (Apocalipsis de Juan)', 'subcategoria_id' => 22],
            ['codigo' => '229', 'nombre' => 'Apócrifos y pseudoepígrafes', 'subcategoria_id' => 22],

            // Temas de la subcategoría '230' (Teologia cristiana)
            ['codigo' => '230', 'nombre' => 'Teología cristiana', 'subcategoria_id' => 23],
            ['codigo' => '231', 'nombre' => 'Dios', 'subcategoria_id' => 23],
            ['codigo' => '232', 'nombre' => 'Jesucristo y su familia', 'subcategoria_id' => 23],
            ['codigo' => '233', 'nombre' => 'El hombre', 'subcategoria_id' => 23],
            ['codigo' => '234', 'nombre' => 'Salvación (Soteriología) y gracia', 'subcategoria_id' => 23],
            ['codigo' => '235', 'nombre' => 'Seres espirituales', 'subcategoria_id' => 23],
            ['codigo' => '236', 'nombre' => 'Escatología', 'subcategoria_id' => 23],
            ['codigo' => '238', 'nombre' => 'Credos y catecismos', 'subcategoria_id' => 23],

            // Temas de la subcategoría '240' (Moral cristiana)
            ['codigo' => '240', 'nombre' => 'Moral cristiana y teología piadosa', 'subcategoria_id' => 24],
            ['codigo' => '241', 'nombre' => 'Teología moral', 'subcategoria_id' => 24],
            ['codigo' => '242', 'nombre' => 'Literatura piadosa', 'subcategoria_id' => 24],
            ['codigo' => '243', 'nombre' => 'Escritos evangelizadores para individuos', 'subcategoria_id' => 24],
            ['codigo' => '245', 'nombre' => 'Textos de himnos', 'subcategoria_id' => 24],
            ['codigo' => '246', 'nombre' => 'Uso del arte en el cristianismo', 'subcategoria_id' => 24],
            ['codigo' => '247', 'nombre' => 'Mobiliario y artículos eclesiásticos', 'subcategoria_id' => 24],
            ['codigo' => '248', 'nombre' => 'Experiencia, práctica, vida cristianas', 'subcategoria_id' => 24],
            ['codigo' => '249', 'nombre' => 'Observaciones cristianas en la vida familiar', 'subcategoria_id' => 24],

            // Temas de la subcategoría '250' Ordenes cristianas y iglesia local
            ['codigo' => '250', 'nombre' => 'Ordenes cristianas y iglesia local', 'subcategoria_id' => 25],
            ['codigo' => '251', 'nombre' => 'Predicación (Homeoléctica)', 'subcategoria_id' => 25],
            ['codigo' => '252', 'nombre' => 'Textos de sermones', 'subcategoria_id' => 25],
            ['codigo' => '253', 'nombre' => 'Oficio pastoral (Teología pastoral)', 'subcategoria_id' => 25],
            ['codigo' => '254', 'nombre' => 'Gobierno y administración de la parroquia', 'subcategoria_id' => 25],
            ['codigo' => '255', 'nombre' => 'Congregaciones y órdenes religiosas', 'subcategoria_id' => 25],
            ['codigo' => '259', 'nombre' => 'Actividades de la iglesia local', 'subcategoria_id' => 25],

            // Temas de la subcategoría '260' Teología social cristiana
            ['codigo' => '260', 'nombre' => 'Teología social cristiana', 'subcategoria_id' => 26],
            ['codigo' => '261', 'nombre' => 'Teología social', 'subcategoria_id' => 26],
            ['codigo' => '262', 'nombre' => 'Eclesiología', 'subcategoria_id' => 26],
            ['codigo' => '263', 'nombre' => 'Tiempos, lugares de observancia religiosa', 'subcategoria_id' => 26],
            ['codigo' => '264', 'nombre' => 'Culto público', 'subcategoria_id' => 26],
            ['codigo' => '265', 'nombre' => 'Sacramentos, otros ritos y actos', 'subcategoria_id' => 26],
            ['codigo' => '266', 'nombre' => 'Misiones', 'subcategoria_id' => 26],
            ['codigo' => '267', 'nombre' => 'Asociaciones para trabajo religioso', 'subcategoria_id' => 26],
            ['codigo' => '268', 'nombre' => 'Educación religiosa', 'subcategoria_id' => 26],
            ['codigo' => '269', 'nombre' => 'Renovación espiritual', 'subcategoria_id' => 26],

            // Temas de la subcategoría '270' Historia de la iglesia cristiana
            ['codigo' => '270', 'nombre' => 'Historia de la Iglesia cristiana', 'subcategoria_id' => 27],
            ['codigo' => '271', 'nombre' => 'Ordenes religiosas en la historia de la iglesia', 'subcategoria_id' => 27],
            ['codigo' => '272', 'nombre' => 'Persecuciones en la historia de la iglesia', 'subcategoria_id' => 27],
            ['codigo' => '273', 'nombre' => 'Herejías en la historia de la iglesia', 'subcategoria_id' => 27],
            ['codigo' => '274', 'nombre' => 'Iglesia cristiana en Europa', 'subcategoria_id' => 27],
            ['codigo' => '275', 'nombre' => 'Iglesia cristiana en Asia', 'subcategoria_id' => 27],
            ['codigo' => '276', 'nombre' => 'Iglesia cristiana en Africa', 'subcategoria_id' => 27],
            ['codigo' => '277', 'nombre' => 'Iglesia cristiana en América del Norte', 'subcategoria_id' => 27],
            ['codigo' => '278', 'nombre' => 'Iglesia cristiana en América del Sur', 'subcategoria_id' => 27],
            ['codigo' => '279', 'nombre' => 'Iglesia cristiana en otras áreas', 'subcategoria_id' => 27],

            // Temas de la subcategoría '280' Denominaciones y sectas cristianas
            ['codigo' => '280', 'nombre' => 'Denominaciones y sectas cristianas', 'subcategoria_id' => 28],
            ['codigo' => '281', 'nombre' => 'Iglesia primitiva e iglesias orientales', 'subcategoria_id' => 28],
            ['codigo' => '282', 'nombre' => 'Iglesia Católica Romana', 'subcategoria_id' => 28],
            ['codigo' => '283', 'nombre' => 'Iglesias anglicanas', 'subcategoria_id' => 28],
            ['codigo' => '284', 'nombre' => 'Protestantes de origen continental', 'subcategoria_id' => 28],
            ['codigo' => '285', 'nombre' => 'Iglesias Presbiterianas, reformadas,', 'subcategoria_id' => 28],
            ['codigo' => '286', 'nombre' => 'Iglesias bautistas, de los discípulos de Cristo,', 'subcategoria_id' => 28],
            ['codigo' => '287', 'nombre' => 'Iglesias metodistas y relacionadas', 'subcategoria_id' => 28],
            ['codigo' => '289', 'nombre' => 'Otras denominaciones y sectas', 'subcategoria_id' => 28],

            // Temas de la subcategoría '290' Otras y religión comparada
            ['codigo' => '290', 'nombre' => 'Otras y religión comparada', 'subcategoria_id' => 29],
            ['codigo' => '291', 'nombre' => 'Religión comparada', 'subcategoria_id' => 29],
            ['codigo' => '292', 'nombre' => 'Religión clásica (griega y romana)', 'subcategoria_id' => 29],
            ['codigo' => '293', 'nombre' => 'Religión germánica', 'subcategoria_id' => 29],
            ['codigo' => '294', 'nombre' => 'Religiones de origen hindú', 'subcategoria_id' => 29],
            ['codigo' => '295', 'nombre' => 'Zoroastrismo (Mazdeísmo, Parsismo)', 'subcategoria_id' => 29],
            ['codigo' => '296', 'nombre' => 'Judaísmo', 'subcategoria_id' => 29],
            ['codigo' => '297', 'nombre' => 'Islamismo y religiones originadas en él', 'subcategoria_id' => 29],
            ['codigo' => '299', 'nombre' => 'Otras religiones', 'subcategoria_id' => 29],

            // ...........................................................................................................

            // Temas de la subcategoría '300' Ciencias sociales

            ['codigo' => '300', 'nombre' => 'Ciencias Sociales', 'subcategoria_id' => 30],
            ['codigo' => '301', 'nombre' => 'Sociología y Antropología', 'subcategoria_id' => 30],
            ['codigo' => '302', 'nombre' => 'Interacción social. Comunicación', 'subcategoria_id' => 30],
            ['codigo' => '303', 'nombre' => 'Procesos sociales', 'subcategoria_id' => 30],
            ['codigo' => '304', 'nombre' => 'Factores que afectan el comportamiento social', 'subcategoria_id' => 30],
            ['codigo' => '305', 'nombre' => 'Grupos sociales', 'subcategoria_id' => 30],
            ['codigo' => '306', 'nombre' => 'Cultura e instituciones', 'subcategoria_id' => 30],
            ['codigo' => '307', 'nombre' => 'Comunidades', 'subcategoria_id' => 30],

            //Temas de la subcategoría '310' Estadística general
            ['codigo' => '310', 'nombre' => 'Estadística general', 'subcategoria_id' => 31],
            ['codigo' => '314', 'nombre' => 'De Europa', 'subcategoria_id' => 31],
            ['codigo' => '315', 'nombre' => 'De Asia', 'subcategoria_id' => 31],
            ['codigo' => '316', 'nombre' => 'De Africa', 'subcategoria_id' => 31],
            ['codigo' => '317', 'nombre' => 'De América del Norte', 'subcategoria_id' => 31],
            ['codigo' => '318', 'nombre' => 'De América del Sur', 'subcategoria_id' => 31],
            ['codigo' => '319', 'nombre' => 'De otras partes del mundo', 'subcategoria_id' => 31],

            // Temas de la subcategoría '320' Ciencia política y gobierno
            ['codigo' => '320', 'nombre' => 'Ciencia política', 'subcategoria_id' => 32],
            ['codigo' => '321', 'nombre' => 'Sistemas de gobiernos y estados', 'subcategoria_id' => 32],
            ['codigo' => '322', 'nombre' => 'Relaciones del Estado con grupos organizados', 'subcategoria_id' => 32],
            ['codigo' => '323', 'nombre' => 'Derechos civiles y políticos', 'subcategoria_id' => 32],
            ['codigo' => '324', 'nombre' => 'El proceso político', 'subcategoria_id' => 32],
            ['codigo' => '325', 'nombre' => 'Migración internacional y colonización', 'subcategoria_id' => 32],
            ['codigo' => '326', 'nombre' => 'Esclavitud y emancipación', 'subcategoria_id' => 32],
            ['codigo' => '327', 'nombre' => 'Relaciones internacionales', 'subcategoria_id' => 32],
            ['codigo' => '328', 'nombre' => 'El proceso legislativo', 'subcategoria_id' => 32],

            // Temas de la subcategoría '330' Economía
            ['codigo' => '330', 'nombre' => 'Economía', 'subcategoria_id' => 33],
            ['codigo' => '331', 'nombre' => 'Economía laboral', 'subcategoria_id' => 33],
            ['codigo' => '332', 'nombre' => 'Economía financiera', 'subcategoria_id' => 33],
            ['codigo' => '333', 'nombre' => 'Economía de la tierra', 'subcategoria_id' => 33],
            ['codigo' => '334', 'nombre' => 'Cooperativas', 'subcategoria_id' => 33],
            ['codigo' => '335', 'nombre' => 'Socialismo y sistemas relacionados', 'subcategoria_id' => 33],
            ['codigo' => '336', 'nombre' => 'Finanzas públicas', 'subcategoria_id' => 33],
            ['codigo' => '337', 'nombre' => 'Economía internacional', 'subcategoria_id' => 33],
            ['codigo' => '338', 'nombre' => 'Producción', 'subcategoria_id' => 33],
            ['codigo' => '339', 'nombre' => 'Macroeconomía y temas relacionados', 'subcategoria_id' => 33],

            // Temas de la subcategoría '340' Derecho y leyes
            ['codigo' => '340', 'nombre' => 'Derecho', 'subcategoria_id' => 34],
            ['codigo' => '341', 'nombre' => 'Derecho internacional público.', 'subcategoria_id' => 34],
            ['codigo' => '342', 'nombre' => 'Derecho constitucional y administrativo.', 'subcategoria_id' => 34],
            ['codigo' => '343', 'nombre' => 'Derecho militar, tributario, mercantil, industrial.', 'subcategoria_id' => 34],
            ['codigo' => '344', 'nombre' => 'Derecho social, laboral, de bienestar social y', 'subcategoria_id' => 34],
            ['codigo' => '345', 'nombre' => 'Derecho penal.', 'subcategoria_id' => 34],
            ['codigo' => '346', 'nombre' => 'Derechos privado.', 'subcategoria_id' => 34],
            ['codigo' => '347', 'nombre' => 'Procedimiento y tribunales civiles.', 'subcategoria_id' => 34],
            ['codigo' => '348', 'nombre' => 'Leyes (Estatutos),reglamentaciones,', 'subcategoria_id' => 34],
            ['codigo' => '349', 'nombre' => 'Derecho de jurisdicciones y áreas específicas', 'subcategoria_id' => 34],

            // Temas de la subcategoría '350' Administración pública y militar
            ['codigo' => '350', 'nombre' => 'Administración pública', 'subcategoria_id' => 35],
            ['codigo' => '351', 'nombre' => 'De gobiernos centrales.', 'subcategoria_id' => 35],
            ['codigo' => '352', 'nombre' => 'De gobiernos locales.', 'subcategoria_id' => 35],
            ['codigo' => '353', 'nombre' => 'De gobiernos federales y estatales de Estados', 'subcategoria_id' => 35],
            ['codigo' => '354', 'nombre' => 'De gobiernos centrales específicos', 'subcategoria_id' => 35],
            ['codigo' => '355', 'nombre' => 'Ciencia militar', 'subcategoria_id' => 35],
            ['codigo' => '356', 'nombre' => 'Fuerzas y guerra de infantería', 'subcategoria_id' => 35],
            ['codigo' => '357', 'nombre' => 'Fuerzas y guerra montadas', 'subcategoria_id' => 35],
            ['codigo' => '358', 'nombre' => 'Otras fuerzas y servicios especializados', 'subcategoria_id' => 35],
            ['codigo' => '359', 'nombre' => 'Fuerzas de guerra marítimas (navales)', 'subcategoria_id' => 35],

            // Temas de la subcategoría '360' Servicios sociales y asociaciones
            ['codigo' => '360', 'nombre' => 'Servicios sociales; asociaciones', 'subcategoria_id' => 36],
            ['codigo' => '361', 'nombre' => 'Problemas sociales y bienestar social en general.', 'subcategoria_id' => 36],
            ['codigo' => '362', 'nombre' => 'Problemas y servicios de bienestar social', 'subcategoria_id' => 36],
            ['codigo' => '363', 'nombre' => 'Otros problemas y servicios sociales', 'subcategoria_id' => 36],
            ['codigo' => '364', 'nombre' => 'Criminología', 'subcategoria_id' => 36],
            ['codigo' => '365', 'nombre' => 'Instituciones penales y relacionadas', 'subcategoria_id' => 36],
            ['codigo' => '366', 'nombre' => 'Asociaciones.', 'subcategoria_id' => 36],
            ['codigo' => '367', 'nombre' => 'Clubes de caracter general.', 'subcategoria_id' => 36],
            ['codigo' => '368', 'nombre' => 'Seguros', 'subcategoria_id' => 36],
            ['codigo' => '369', 'nombre' => 'Varias clases de asociaciones', 'subcategoria_id' => 36],

            // Temas de la subcategoría '370' Educación y enseñanza
            ['codigo' => '370', 'nombre' => 'Educación', 'subcategoria_id' => 37],
            ['codigo' => '371', 'nombre' => 'Administración escolar: educación especial', 'subcategoria_id' => 37],
            ['codigo' => '372', 'nombre' => 'Educación primaria- preescolar', 'subcategoria_id' => 37],
            ['codigo' => '373', 'nombre' => 'Educación secundaria', 'subcategoria_id' => 37],
            ['codigo' => '374', 'nombre' => 'Educación de adultos', 'subcategoria_id' => 37],
            ['codigo' => '375', 'nombre' => 'Currículos', 'subcategoria_id' => 37],
            ['codigo' => '376', 'nombre' => 'Educación de las mujeres', 'subcategoria_id' => 37],
            ['codigo' => '377', 'nombre' => 'Escuelas y religión', 'subcategoria_id' => 37],
            ['codigo' => '378', 'nombre' => 'Educación superior', 'subcategoria_id' => 37],
            ['codigo' => '379', 'nombre' => 'Reglamentación, control, apoyo', 'subcategoria_id' => 37],

            // Temas de la subcategoría '380' Comercio, comunicaciones y transporte
            ['codigo' => '380', 'nombre' => 'Comercio. comunicaciones. transporte', 'subcategoria_id' => 38],
            ['codigo' => '381', 'nombre' => 'Comercio interno (Comercio doméstico)', 'subcategoria_id' => 38],
            ['codigo' => '382', 'nombre' => 'Comerio internacional (Comercio exterior)', 'subcategoria_id' => 38],
            ['codigo' => '383', 'nombre' => 'Comunicación postal (Correos)', 'subcategoria_id' => 38],
            ['codigo' => '384', 'nombre' => 'Comunicaciones. Telecomunicaciones', 'subcategoria_id' => 38],
            ['codigo' => '385', 'nombre' => 'Transporte ferroviario', 'subcategoria_id' => 38],
            ['codigo' => '386', 'nombre' => 'Transporte por vía acuática interior y en', 'subcategoria_id' => 38],
            ['codigo' => '387', 'nombre' => 'Transporte acuático, aéreo, espacial', 'subcategoria_id' => 38],
            ['codigo' => '388', 'nombre' => 'Transporte. Transporte terrestre', 'subcategoria_id' => 38],
            ['codigo' => '389', 'nombre' => 'Metrología y normalización', 'subcategoria_id' => 38],

            // Temas de la subcategoría '390' Costumbres, etiqueta y folclor         
            ['codigo' => '390', 'nombre' => 'Costumbres. etiqueta. folclor.', 'subcategoria_id' => 39],
            ['codigo' => '391', 'nombre' => 'Traje y apariencia personal.', 'subcategoria_id' => 39],
            ['codigo' => '392', 'nombre' => 'Costumbres del ciclo de vida y de la vida', 'subcategoria_id' => 39],
            ['codigo' => '393', 'nombre' => 'Costumbres mortuorias.', 'subcategoria_id' => 39],
            ['codigo' => '394', 'nombre' => 'Costumbres generales.', 'subcategoria_id' => 39],
            ['codigo' => '395', 'nombre' => 'Etiqueta (Modales).', 'subcategoria_id' => 39],
            ['codigo' => '398', 'nombre' => 'Folclor.', 'subcategoria_id' => 39],
            ['codigo' => '399', 'nombre' => 'Costumbres de guerra y diplomacia.', 'subcategoria_id' => 39],

            // .............................................................................................................

            // Temas de la subcategoría '400' Lenguas
            ['codigo' => '400', 'nombre' => 'Lenguas', 'subcategoria_id' => 40],
            ['codigo' => '401', 'nombre' => 'Filosofía y teoría', 'subcategoria_id' => 40],
            ['codigo' => '402', 'nombre' => 'Miscelánea', 'subcategoria_id' => 40],
            ['codigo' => '403', 'nombre' => 'Diccionario y enciclopedias', 'subcategoria_id' => 40],
            ['codigo' => '404', 'nombre' => 'Temas especiales', 'subcategoria_id' => 40],
            ['codigo' => '405', 'nombre' => 'Publicaciones en serie', 'subcategoria_id' => 40],
            ['codigo' => '406', 'nombre' => 'Organizaciones y administración', 'subcategoria_id' => 40],
            ['codigo' => '407', 'nombre' => 'Educación, investigación, temas relacionados', 'subcategoria_id' => 40],
            ['codigo' => '408', 'nombre' => 'En relación con clases de personas', 'subcategoria_id' => 40],
            ['codigo' => '409', 'nombre' => 'Tratamiento geográfico y de personas .', 'subcategoria_id' => 40],

            // Temas de la subcategoría '410' Lingüística
            ['codigo' => '410', 'nombre' => 'Lingüística', 'subcategoria_id' => 41],
            ['codigo' => '411', 'nombre' => 'Sistemas de escritura', 'subcategoria_id' => 41],
            ['codigo' => '412', 'nombre' => 'Etimología', 'subcategoria_id' => 41],
            ['codigo' => '413', 'nombre' => 'Diccionarios', 'subcategoria_id' => 41],
            ['codigo' => '414', 'nombre' => 'Fonología', 'subcategoria_id' => 41],
            ['codigo' => '415', 'nombre' => 'Sistemas estructurales (Gramática)', 'subcategoria_id' => 41],
            ['codigo' => '417', 'nombre' => 'Dialectología y lingüística histórica', 'subcategoria_id' => 41],
            ['codigo' => '418', 'nombre' => 'Uso estándar. Lingüística aplicada', 'subcategoria_id' => 41],
            ['codigo' => '419', 'nombre' => 'Lenguajes verbales no hablados ni escritos', 'subcategoria_id' => 41],

            // Temas de la subcategoría '420' Inglés e ingles antiguo
            ['codigo' => '420', 'nombre' => 'Inglés e inglés antiguo', 'subcategoria_id' => 42],
            ['codigo' => '421', 'nombre' => 'Sistema de escritura y fonología inglesas', 'subcategoria_id' => 42],
            ['codigo' => '422', 'nombre' => 'Etimología inglesa', 'subcategoria_id' => 42],
            ['codigo' => '423', 'nombre' => 'Diccionarios de inglés', 'subcategoria_id' => 42],
            ['codigo' => '425', 'nombre' => 'Gramática inglesa', 'subcategoria_id' => 42],
            ['codigo' => '427', 'nombre' => 'Variaciones de la lengua inglesa', 'subcategoria_id' => 42],
            ['codigo' => '428', 'nombre' => 'Uso del inglés estándar', 'subcategoria_id' => 42],
            ['codigo' => '429', 'nombre' => 'Inglés antiguo (Anglosajón)', 'subcategoria_id' => 42],

            // Temas de la subcategoría '430' Lenguas germánicas.Alemán
            ['codigo' => '430', 'nombre' => 'Lenguas germánicas. Alemán', 'subcategoria_id' => 43],
            ['codigo' => '431', 'nombre' => 'Sistemas de escritura y fonología alemanas', 'subcategoria_id' => 43],
            ['codigo' => '432', 'nombre' => 'Etimología alemana', 'subcategoria_id' => 43],
            ['codigo' => '433', 'nombre' => 'Diccionarios de alemán', 'subcategoria_id' => 43],
            ['codigo' => '435', 'nombre' => 'Gramática alemana', 'subcategoria_id' => 43],
            ['codigo' => '437', 'nombre' => 'Variaciones de la lengua alemana', 'subcategoria_id' => 43],
            ['codigo' => '438', 'nombre' => 'Uso del alemán estándar.', 'subcategoria_id' => 43],
            ['codigo' => '439', 'nombre' => 'Otras lenguas germánicas', 'subcategoria_id' => 43],

            // Temas de la subcategoría '440' Lenguas romances.Francés
            ['codigo' => '440', 'nombre' => 'Lenguas romances. Francés', 'subcategoria_id' => 44],
            ['codigo' => '441', 'nombre' => 'Sistema de escritura y fonología franceses', 'subcategoria_id' => 44],
            ['codigo' => '442', 'nombre' => 'Etimología francesa', 'subcategoria_id' => 44],
            ['codigo' => '443', 'nombre' => 'Diccionarios de francés', 'subcategoria_id' => 44],
            ['codigo' => '445', 'nombre' => 'Gramática francesa', 'subcategoria_id' => 44],
            ['codigo' => '447', 'nombre' => 'Variaciones del francés', 'subcategoria_id' => 44],
            ['codigo' => '448', 'nombre' => 'Uso del francés estándar.', 'subcategoria_id' => 44],
            ['codigo' => '449', 'nombre' => 'Provenzal y catalán.', 'subcategoria_id' => 44],

            // Temas de la subcategoría '450' Italiano, rumano y retorromano
            ['codigo' => '450', 'nombre' => 'Italiano. rumano. retorromano', 'subcategoria_id' => 45],
            ['codigo' => '451', 'nombre' => 'Sistema de escritura y fonología italianos', 'subcategoria_id' => 45],
            ['codigo' => '452', 'nombre' => 'Etimología italiana', 'subcategoria_id' => 45],
            ['codigo' => '453', 'nombre' => 'Diccionarios de italiano', 'subcategoria_id' => 45],
            ['codigo' => '455', 'nombre' => 'Gramática italiana', 'subcategoria_id' => 45],
            ['codigo' => '457', 'nombre' => 'Variaciones del italiano', 'subcategoria_id' => 45],
            ['codigo' => '458', 'nombre' => 'Uso del italiano estándar', 'subcategoria_id' => 45],
            ['codigo' => '459', 'nombre' => 'Rumano y retorromano', 'subcategoria_id' => 45],

            // Temas de la subcategoría '460' Lenguas española y portuguesa         
            ['codigo' => '460', 'nombre' => 'Lenguas española y portuguesa', 'subcategoria_id' => 46],
            ['codigo' => '461', 'nombre' => 'Sistema de escritura y fonología españoles', 'subcategoria_id' => 46],
            ['codigo' => '462', 'nombre' => 'Etimología española', 'subcategoria_id' => 46],
            ['codigo' => '463', 'nombre' => 'Diccionarios de español', 'subcategoria_id' => 46],
            ['codigo' => '465', 'nombre' => 'Gramática española', 'subcategoria_id' => 46],
            ['codigo' => '467', 'nombre' => 'Variaciones del español', 'subcategoria_id' => 46],
            ['codigo' => '468', 'nombre' => 'Uso del español estándar', 'subcategoria_id' => 46],
            ['codigo' => '469', 'nombre' => 'Portugués', 'subcategoria_id' => 46],

            // Temas de la subcategoría '470' Lenguas italicas.Latin
            ['codigo' => '470', 'nombre' => 'Lenguas itálicas. Latín', 'subcategoria_id' => 47],
            ['codigo' => '471', 'nombre' => 'Escritura y fonología latinas clásicas', 'subcategoria_id' => 47],
            ['codigo' => '472', 'nombre' => 'Etimología latina clásica', 'subcategoria_id' => 47],
            ['codigo' => '473', 'nombre' => 'Diccionarios de latín clásico', 'subcategoria_id' => 47],
            ['codigo' => '475', 'nombre' => 'Gramática latina clásica', 'subcategoria_id' => 47],
            ['codigo' => '477', 'nombre' => 'Latín arcaico, postclásico, vulgar', 'subcategoria_id' => 47],
            ['codigo' => '478', 'nombre' => 'Uso del latín clásico.', 'subcategoria_id' => 47],
            ['codigo' => '479', 'nombre' => 'Otras lenguas itálicas', 'subcategoria_id' => 47],

            // Temas de la subcategoría '480' Lenguas helenicas. Griego clásico
            ['codigo' => '480', 'nombre' => 'Lenguas helénicas. Griego clásico', 'subcategoria_id' => 48],
            ['codigo' => '481', 'nombre' => 'Escritura y fonología griegas clásicas', 'subcategoria_id' => 48],
            ['codigo' => '482', 'nombre' => 'Etimología griega clásica', 'subcategoria_id' => 48],
            ['codigo' => '483', 'nombre' => 'Diccionarios de griego clásico', 'subcategoria_id' => 48],
            ['codigo' => '485', 'nombre' => 'Gramática griega clásica', 'subcategoria_id' => 48],
            ['codigo' => '487', 'nombre' => 'Griego preclásico y postclásico', 'subcategoria_id' => 48],
            ['codigo' => '488', 'nombre' => 'Uso del griego clásico', 'subcategoria_id' => 48],
            ['codigo' => '489', 'nombre' => 'Otras lenguas helénicas', 'subcategoria_id' => 48],

            // Temas de la subcategoría '490' Otras lenguas
            ['codigo' => '490', 'nombre' => 'Otras Lenguas', 'subcategoria_id' => 49],
            ['codigo' => '491', 'nombre' => 'Lenguas indoeuropeas orientales y celtas', 'subcategoria_id' => 49],
            ['codigo' => '492', 'nombre' => 'Lenguas afroasiáticas. Semíticas', 'subcategoria_id' => 49],
            ['codigo' => '493', 'nombre' => 'Lenguas afroasiáticas no semíticas', 'subcategoria_id' => 49],
            ['codigo' => '494', 'nombre' => 'Lenguas uralaltaicas, paleosiberianas,', 'subcategoria_id' => 49],
            ['codigo' => '495', 'nombre' => 'Lenguas del oriente y sudoriente de Asia', 'subcategoria_id' => 49],
            ['codigo' => '496', 'nombre' => 'Lenguas africanas', 'subcategoria_id' => 49],
            ['codigo' => '497', 'nombre' => 'Lenguas nativas de América del Norte.', 'subcategoria_id' => 49],
            ['codigo' => '498', 'nombre' => 'Lenguas nativas de América del Sur.', 'subcategoria_id' => 49],
            ['codigo' => '499', 'nombre' => 'Lenguas varias.', 'subcategoria_id' => 49],

            // ...........................................................................................................

            // Temas de la subcategoría '500' Ciencias naturales y matemáticas
            ['codigo' => '500', 'nombre' => 'Ciencias naturales y matemáticas', 'subcategoria_id' => 50],
            ['codigo' => '501', 'nombre' => 'Filosofía y teoría', 'subcategoria_id' => 50],
            ['codigo' => '502', 'nombre' => 'Miscelánea', 'subcategoria_id' => 50],
            ['codigo' => '503', 'nombre' => 'Diccionarios y enciclopedias', 'subcategoria_id' => 50],
            ['codigo' => '505', 'nombre' => 'Publicaciones en serie', 'subcategoria_id' => 50],
            ['codigo' => '506', 'nombre' => 'Organizaciones y administración', 'subcategoria_id' => 50],
            ['codigo' => '507', 'nombre' => 'Educación, investigación, temas relacionados', 'subcategoria_id' => 50],
            ['codigo' => '508', 'nombre' => 'Historia natural', 'subcategoria_id' => 50],
            ['codigo' => '509', 'nombre' => 'Tratamiento histórico, geográfico, de personas', 'subcategoria_id' => 50],

            // Temas de la subcategoría '510' Matemáticas
            ['codigo' => '510', 'nombre' => 'Matemáticas', 'subcategoria_id' => 51],
            ['codigo' => '511', 'nombre' => 'Principios generales', 'subcategoria_id' => 51],
            ['codigo' => '512', 'nombre' => 'Álgebra y teoría de los números', 'subcategoria_id' => 51],
            ['codigo' => '513', 'nombre' => 'Aritmética', 'subcategoria_id' => 51],
            ['codigo' => '514', 'nombre' => 'Topología', 'subcategoria_id' => 51],
            ['codigo' => '515', 'nombre' => 'Análisis', 'subcategoria_id' => 51],
            ['codigo' => '516', 'nombre' => 'Geometría', 'subcategoria_id' => 51],
            ['codigo' => '519', 'nombre' => 'Probabilidades y matemáticas aplicadas', 'subcategoria_id' => 51],

            // Temas de la subcategoría '520' Astronomía y ciencias afines              
            ['codigo' => '520', 'nombre' => 'Astronomía y ciencias afines', 'subcategoria_id' => 52],
            ['codigo' => '521', 'nombre' => 'Mecánica celeste', 'subcategoria_id' => 52],
            ['codigo' => '522', 'nombre' => 'Técnicas, equipo, materiales', 'subcategoria_id' => 52],
            ['codigo' => '523', 'nombre' => 'Cuerpos y fenómenos celestes específicos', 'subcategoria_id' => 52],
            ['codigo' => '525', 'nombre' => 'La Tierra (Geografía astronómica)', 'subcategoria_id' => 52],
            ['codigo' => '526', 'nombre' => 'Geografía matemática', 'subcategoria_id' => 52],
            ['codigo' => '527', 'nombre' => 'Navegación celeste', 'subcategoria_id' => 52],
            ['codigo' => '528', 'nombre' => 'Efemérides', 'subcategoria_id' => 52],
            ['codigo' => '529', 'nombre' => 'Cronología', 'subcategoria_id' => 52],

            // Temas de la subcategoría '530' Física
            ['codigo' => '530', 'nombre' => 'Física', 'subcategoria_id' => 53],
            ['codigo' => '531', 'nombre' => 'Mecánica clásica. Mecánica de sólidos', 'subcategoria_id' => 53],
            ['codigo' => '532', 'nombre' => 'Mecánica de fluidos. Mecánica de líquidos', 'subcategoria_id' => 53],
            ['codigo' => '533', 'nombre' => 'Mecánica de gases', 'subcategoria_id' => 53],
            ['codigo' => '534', 'nombre' => 'Sonido y vibraciones relacionadas', 'subcategoria_id' => 53],
            ['codigo' => '535', 'nombre' => 'Luz y fenómenos parafóticos', 'subcategoria_id' => 53],
            ['codigo' => '536', 'nombre' => 'Calor', 'subcategoria_id' => 53],
            ['codigo' => '537', 'nombre' => 'Electricidad y electrónica', 'subcategoria_id' => 53],
            ['codigo' => '538', 'nombre' => 'Magnetismo', 'subcategoria_id' => 53],
            ['codigo' => '539', 'nombre' => 'Física moderna', 'subcategoria_id' => 53],

            // Temas de la subcategoría '540' Química y ciencias afines
            ['codigo' => '540', 'nombre' => 'Química y ciencias afines', 'subcategoria_id' => 54],
            ['codigo' => '541', 'nombre' => 'Química física y teórica', 'subcategoria_id' => 54],
            ['codigo' => '542', 'nombre' => 'Técnicas, equipo, materiales', 'subcategoria_id' => 54],
            ['codigo' => '543', 'nombre' => 'Química analítica', 'subcategoria_id' => 54],
            ['codigo' => '544', 'nombre' => 'Análisis cualitativo', 'subcategoria_id' => 54],
            ['codigo' => '545', 'nombre' => 'Análisis cuantitativo', 'subcategoria_id' => 54],
            ['codigo' => '546', 'nombre' => 'Química inorgánica', 'subcategoria_id' => 54],
            ['codigo' => '547', 'nombre' => 'Química orgánica', 'subcategoria_id' => 54],
            ['codigo' => '548', 'nombre' => 'Cristalografía', 'subcategoria_id' => 54],
            ['codigo' => '549', 'nombre' => 'Mineralogía', 'subcategoria_id' => 54],

            // Temas de la subcategoría '550' Ciencias de la tierra          
            ['codigo' => '550', 'nombre' => 'Ciencias de la tierra', 'subcategoria_id' => 55],
            ['codigo' => '551', 'nombre' => 'Geología, hidrología, meteorología', 'subcategoria_id' => 55],
            ['codigo' => '552', 'nombre' => 'Petrología', 'subcategoria_id' => 55],
            ['codigo' => '553', 'nombre' => 'Geología económica', 'subcategoria_id' => 55],
            ['codigo' => '554', 'nombre' => 'Ciencias de la Tierra de Europa', 'subcategoria_id' => 55],
            ['codigo' => '555', 'nombre' => 'De Asia', 'subcategoria_id' => 55],
            ['codigo' => '556', 'nombre' => 'De Africa', 'subcategoria_id' => 55],
            ['codigo' => '557', 'nombre' => 'De América del Norte', 'subcategoria_id' => 55],
            ['codigo' => '558', 'nombre' => 'De América del Sur', 'subcategoria_id' => 55],
            ['codigo' => '559', 'nombre' => 'De otras áreas.', 'subcategoria_id' => 55],

            // Temas de la subcategoría '560' Paleontología y paleozoología          
            ['codigo' => '560', 'nombre' => 'Paleontología. Paleozoología', 'subcategoria_id' => 56],
            ['codigo' => '561', 'nombre' => 'Paleobotánica', 'subcategoria_id' => 56],
            ['codigo' => '562', 'nombre' => 'Invertebrados fósiles', 'subcategoria_id' => 56],
            ['codigo' => '563', 'nombre' => 'Filos (phyla) y fósiles primitivos', 'subcategoria_id' => 56],
            ['codigo' => '564', 'nombre' => 'Moluscos y Moluscoides fósiles', 'subcategoria_id' => 56],
            ['codigo' => '565', 'nombre' => 'Otros invertebrados fósiles', 'subcategoria_id' => 56],
            ['codigo' => '566', 'nombre' => 'Vertebrados fósiles (Craniatos fósiles)', 'subcategoria_id' => 56],
            ['codigo' => '567', 'nombre' => 'Vertebrados de sangre fría fósiles', 'subcategoria_id' => 56],
            ['codigo' => '568', 'nombre' => 'Aves fósiles (Pájaros fósiles)', 'subcategoria_id' => 56],
            ['codigo' => '569', 'nombre' => 'Mamíferos fósiles', 'subcategoria_id' => 56],

            // Temas de la subcategoría '570' Ciencias de la vida              
            ['codigo' => '570', 'nombre' => 'Ciencias de la vida', 'subcategoria_id' => 57],
            ['codigo' => '572', 'nombre' => 'Razas humanas', 'subcategoria_id' => 57],
            ['codigo' => '573', 'nombre' => 'Antropología física', 'subcategoria_id' => 57],
            ['codigo' => '574', 'nombre' => 'Biología', 'subcategoria_id' => 57],
            ['codigo' => '575', 'nombre' => 'Evolución y genética', 'subcategoria_id' => 57],
            ['codigo' => '576', 'nombre' => 'Microbiología', 'subcategoria_id' => 57],
            ['codigo' => '577', 'nombre' => 'Naturaleza general de la vida.', 'subcategoria_id' => 57],
            ['codigo' => '578', 'nombre' => 'Microscopia en biología', 'subcategoria_id' => 57],
            ['codigo' => '579', 'nombre' => 'Colección y preservación', 'subcategoria_id' => 57],

            // Temas de la subcategoría '580' Ciencias Botánicas        
            ['codigo' => '580', 'nombre' => 'Ciencias botánicas', 'subcategoria_id' => 58],
            ['codigo' => '581', 'nombre' => 'Botánica', 'subcategoria_id' => 58],
            ['codigo' => '582', 'nombre' => 'Espermatofitas (Plantas con semilla)', 'subcategoria_id' => 58],
            ['codigo' => '583', 'nombre' => 'Dicotiledóneas', 'subcategoria_id' => 58],
            ['codigo' => '584', 'nombre' => 'Monocotiledóneas', 'subcategoria_id' => 58],
            ['codigo' => '585', 'nombre' => 'Gimnospermas (Pinofitas)', 'subcategoria_id' => 58],
            ['codigo' => '586', 'nombre' => 'Criptógamas (Plantas sin semilla)', 'subcategoria_id' => 58],
            ['codigo' => '587', 'nombre' => 'Pteridofitas (Criptógamas vasculares)', 'subcategoria_id' => 58],
            ['codigo' => '588', 'nombre' => 'Briofitas', 'subcategoria_id' => 58],
            ['codigo' => '589', 'nombre' => 'Talobiontas y procariotas', 'subcategoria_id' => 58],


            // Temas de la subcategoría '590' Ciencias zoológicas
            ['codigo' => '590', 'nombre' => 'Ciencias zoológicas', 'subcategoria_id' => 59],
            ['codigo' => '591', 'nombre' => 'Zoología', 'subcategoria_id' => 59],
            ['codigo' => '592', 'nombre' => 'Invertebrados', 'subcategoria_id' => 59],
            ['codigo' => '593', 'nombre' => 'Protozoos, Equinodermos, filos (phyla)', 'subcategoria_id' => 59],
            ['codigo' => '594', 'nombre' => 'Moluscos y moluscoides', 'subcategoria_id' => 59],
            ['codigo' => '595', 'nombre' => 'Otros invertebrados', 'subcategoria_id' => 59],
            ['codigo' => '596', 'nombre' => 'Vertebrata (Creaneados, vertebrados)', 'subcategoria_id' => 59],
            ['codigo' => '597', 'nombre' => 'Vertebrados de sangre fría. Peces', 'subcategoria_id' => 59],
            ['codigo' => '598', 'nombre' => 'Aves (Pájaros)', 'subcategoria_id' => 59],
            ['codigo' => '599', 'nombre' => 'Mamíferos', 'subcategoria_id' => 59],

            //.............................................................................................................

            // Temas de la subcategoría '600' Tecnología (Ciencias aplicadas)
            ['codigo' => '600', 'nombre' => 'Tecnología (Ciencias aplicadas)', 'subcategoria_id' => 60],
            ['codigo' => '601', 'nombre' => 'Filosofía y teoría', 'subcategoria_id' => 60],
            ['codigo' => '602', 'nombre' => 'Miscelánea', 'subcategoria_id' => 60],
            ['codigo' => '603', 'nombre' => 'Diccionarios y enciclopedias', 'subcategoria_id' => 60],
            ['codigo' => '604', 'nombre' => 'Temas especiales', 'subcategoria_id' => 60],
            ['codigo' => '605', 'nombre' => 'Publicaciones en serie', 'subcategoria_id' => 60],
            ['codigo' => '606', 'nombre' => 'Organizaciones', 'subcategoria_id' => 60],
            ['codigo' => '607', 'nombre' => 'Educación, investigación, temas relacionados', 'subcategoria_id' => 60],
            ['codigo' => '608', 'nombre' => 'Inventos y patentes', 'subcategoria_id' => 60],
            ['codigo' => '609', 'nombre' => 'Tratamiento histórico, geográfico, de personas', 'subcategoria_id' => 60],

            // Temas de la subcategoría '610' Ciencias médicas y Medicina 
            ['codigo' => '610', 'nombre' => 'Ciencias médicas y Medicina', 'subcategoria_id' => 61],
            ['codigo' => '611', 'nombre' => 'Anatomía humana, citología, histología', 'subcategoria_id' => 61],
            ['codigo' => '612', 'nombre' => 'Fisiología humana', 'subcategoria_id' => 61],
            ['codigo' => '613', 'nombre' => 'Promoción de salud (Educación sexual)', 'subcategoria_id' => 61],
            ['codigo' => '614', 'nombre' => 'Incidencia y prevención de la enfermedad', 'subcategoria_id' => 61],
            ['codigo' => '615', 'nombre' => 'Farmacología y terapéutica', 'subcategoria_id' => 61],
            ['codigo' => '616', 'nombre' => 'Enfermedades', 'subcategoria_id' => 61],
            ['codigo' => '617', 'nombre' => 'Varias ramas de la medicina. Cirugía', 'subcategoria_id' => 61],
            ['codigo' => '618', 'nombre' => 'Ginecología y otras especialidades médicas', 'subcategoria_id' => 61],
            ['codigo' => '619', 'nombre' => 'Medicina experimental', 'subcategoria_id' => 61],

            // Temas de la subcategoría '620' Ingeniería y operaciones afines
            ['codigo' => '620', 'nombre' => 'Ingeniería y operaciones afines', 'subcategoria_id' => 62],
            ['codigo' => '621', 'nombre' => 'Física aplicada', 'subcategoria_id' => 62],
            ['codigo' => '622', 'nombre' => 'Minería y operaciones relacionadas', 'subcategoria_id' => 62],
            ['codigo' => '623', 'nombre' => 'Ingeniería militar y naval', 'subcategoria_id' => 62],
            ['codigo' => '624', 'nombre' => 'Ingeniería civil', 'subcategoria_id' => 62],
            ['codigo' => '625', 'nombre' => 'Ingeniería de ferrocarriles, de caminos', 'subcategoria_id' => 62],
            ['codigo' => '627', 'nombre' => 'Ingeniería hidráulica', 'subcategoria_id' => 62],
            ['codigo' => '628', 'nombre' => 'Ingeniería sanitaria y municipal', 'subcategoria_id' => 62],
            ['codigo' => '629', 'nombre' => 'Otras ramas de la ingeniería', 'subcategoria_id' => 62],

            // Temas de la subcategoría '630' Agricultura
            ['codigo' => '630', 'nombre' => 'Agricultura', 'subcategoria_id' => 63],
            ['codigo' => '631', 'nombre' => 'Técnicas, equipo, materiales', 'subcategoria_id' => 63],
            ['codigo' => '632', 'nombre' => 'Lesiones, enfermedades, plagas de las plantas', 'subcategoria_id' => 63],
            ['codigo' => '633', 'nombre' => 'Cultivos de campo y plantación', 'subcategoria_id' => 63],
            ['codigo' => '634', 'nombre' => 'Huertos, frutas silvicultura', 'subcategoria_id' => 63],
            ['codigo' => '635', 'nombre' => 'Cultivos hortícolas (Horticultura)<', 'subcategoria_id' => 63],
            ['codigo' => '636', 'nombre' => 'Producción animal (Zootecnia)', 'subcategoria_id' => 63],
            ['codigo' => '637', 'nombre' => 'Procesamiento lechero y productos relacionados', 'subcategoria_id' => 63],
            ['codigo' => '638', 'nombre' => 'Cultivo de insectos', 'subcategoria_id' => 63],
            ['codigo' => '639', 'nombre' => 'Caza, pesca, conservación', 'subcategoria_id' => 63],

            // Temas de la subcategoría '640' Economía doméstica y vida familiar
            ['codigo' => '640', 'nombre' => 'Economía doméstica y vida familiar', 'subcategoria_id' => 64],
            ['codigo' => '641', 'nombre' => 'Alimentos y bebidas', 'subcategoria_id' => 64],
            ['codigo' => '642', 'nombre' => 'Comidas y servicio a la mesa', 'subcategoria_id' => 64],
            ['codigo' => '643', 'nombre' => 'Vivienda y equipo de la casa', 'subcategoria_id' => 64],
            ['codigo' => '644', 'nombre' => 'Servicios de la casa', 'subcategoria_id' => 64],
            ['codigo' => '645', 'nombre' => 'Dotación de la casa', 'subcategoria_id' => 64],
            ['codigo' => '646', 'nombre' => 'Costura, vestuario, vida personal', 'subcategoria_id' => 64],
            ['codigo' => '647', 'nombre' => 'Administración de viviendas públicas', 'subcategoria_id' => 64],
            ['codigo' => '648', 'nombre' => 'Manejo de la casa', 'subcategoria_id' => 64],
            ['codigo' => '649', 'nombre' => 'Puericultura y atención domiciliaria del enfermo', 'subcategoria_id' => 64],

            // Temas de la subcategoría '650' Administración y servicios auxiliares           
            ['codigo' => '650', 'nombre' => 'Administración y servicios auxiliares', 'subcategoria_id' => 65],
            ['codigo' => '651', 'nombre' => 'Servicios de oficina', 'subcategoria_id' => 65],
            ['codigo' => '652', 'nombre' => 'Procesos de comunicación escrita', 'subcategoria_id' => 65],
            ['codigo' => '653', 'nombre' => 'Taquigrafía', 'subcategoria_id' => 65],
            ['codigo' => '657', 'nombre' => 'Contabilidad', 'subcategoria_id' => 65],
            ['codigo' => '658', 'nombre' => 'Administración general', 'subcategoria_id' => 65],
            ['codigo' => '659', 'nombre' => 'Publicidad y relaciones públicas', 'subcategoria_id' => 65],

            // Temas de la subcategoría '660' Ingeniería química
            ['codigo' => '660', 'nombre' => 'Ingeniería química', 'subcategoria_id' => 66],
            ['codigo' => '661', 'nombre' => 'Tecnología química industrial', 'subcategoria_id' => 66],
            ['codigo' => '662', 'nombre' => 'Tecnología de explosivos y combustibles', 'subcategoria_id' => 66],
            ['codigo' => '663', 'nombre' => 'Tecnología de las bebidas', 'subcategoria_id' => 66],
            ['codigo' => '664', 'nombre' => 'Tecnología de alimentos', 'subcategoria_id' => 66],
            ['codigo' => '665', 'nombre' => 'Aceites industriales,grasas,ceras,gases', 'subcategoria_id' => 66],
            ['codigo' => '666', 'nombre' => 'Cerámica y tecnologías afines', 'subcategoria_id' => 66],
            ['codigo' => '667', 'nombre' => 'Limpieza, color, tecnologías relacionadas', 'subcategoria_id' => 66],
            ['codigo' => '668', 'nombre' => 'Tecnología de otros productos orgánicos', 'subcategoria_id' => 66],
            ['codigo' => '669', 'nombre' => 'Metalurgia', 'subcategoria_id' => 66],

            // Temas de la subcategoría '670' Manufactura
            ['codigo' => '670', 'nombre' => 'Manufactura', 'subcategoria_id' => 67],
            ['codigo' => '671', 'nombre' => 'Metalistería y productos metálicos', 'subcategoria_id' => 67],
            ['codigo' => '672', 'nombre' => 'Hierro, acero, otras aleaciones ferrosas', 'subcategoria_id' => 67],
            ['codigo' => '673', 'nombre' => 'Metales no ferrosos', 'subcategoria_id' => 67],
            ['codigo' => '674', 'nombre' => 'Procesamiento de madera aserrada, productos', 'subcategoria_id' => 67],
            ['codigo' => '675', 'nombre' => 'Procesamiento del cuero y piel', 'subcategoria_id' => 67],
            ['codigo' => '676', 'nombre' => 'Tecnología de la pulpa y del papel', 'subcategoria_id' => 67],
            ['codigo' => '677', 'nombre' => 'Textiles', 'subcategoria_id' => 67],
            ['codigo' => '678', 'nombre' => 'Elastómeros y productos del elastómero', 'subcategoria_id' => 67],
            ['codigo' => '679', 'nombre' => 'Otros productos de materiales específicos.', 'subcategoria_id' => 67],

            // Temas de la subcategoría '680' Manufactura para usos específicos
            ['codigo' => '680', 'nombre' => 'Manufactura para usos específicos', 'subcategoria_id' => 68],
            ['codigo' => '681', 'nombre' => 'Instrumentos de precisión y otros dispositivos', 'subcategoria_id' => 68],
            ['codigo' => '682', 'nombre' => 'Trabajo de forja pequeña (Herrería)', 'subcategoria_id' => 68],
            ['codigo' => '683', 'nombre' => 'Ferretería y aparatos de la casa', 'subcategoria_id' => 68],
            ['codigo' => '684', 'nombre' => 'Muebles y talleres de hogar', 'subcategoria_id' => 68],
            ['codigo' => '685', 'nombre' => 'Productos de cuero, piel, relacionados', 'subcategoria_id' => 68],
            ['codigo' => '686', 'nombre' => 'Imprentas y actividades relacionadas', 'subcategoria_id' => 68],
            ['codigo' => '687', 'nombre' => 'Vestuario', 'subcategoria_id' => 68],
            ['codigo' => '688', 'nombre' => 'Otros productos acabados, empaques', 'subcategoria_id' => 68],

            // Temas de la subcategoría '690' Construcción
            ['codigo' => '690', 'nombre' => 'Construcción', 'subcategoria_id' => 69],
            ['codigo' => '691', 'nombre' => 'Materiales de construcción', 'subcategoria_id' => 69],
            ['codigo' => '692', 'nombre' => 'Prácticas auxiliares de la construcción', 'subcategoria_id' => 69],
            ['codigo' => '693', 'nombre' => 'Materiales y propósitos específicos', 'subcategoria_id' => 69],
            ['codigo' => '694', 'nombre' => 'Construcción en madera. Carpintería', 'subcategoria_id' => 69],
            ['codigo' => '695', 'nombre' => 'Cubiertas (techos)', 'subcategoria_id' => 69],
            ['codigo' => '696', 'nombre' => 'Servicios públicos', 'subcategoria_id' => 69],
            ['codigo' => '697', 'nombre' => 'Calefacción, ventilación, aire acondicionado', 'subcategoria_id' => 69],
            ['codigo' => '698', 'nombre' => 'Detalles de acabado', 'subcategoria_id' => 69],

            //..............................................................................................................

            // Temas de la subcategoría '700' Artes
            ['codigo' => '700', 'nombre' => 'Las artes', 'subcategoria_id' => 70],
            ['codigo' => '701', 'nombre' => 'Filosofía y teoría', 'subcategoria_id' => 70],
            ['codigo' => '702', 'nombre' => 'Miscelanea', 'subcategoria_id' => 70],
            ['codigo' => '703', 'nombre' => 'Diccionarios y enciclopedias', 'subcategoria_id' => 70],
            ['codigo' => '704', 'nombre' => 'Temas especiales', 'subcategoria_id' => 70],
            ['codigo' => '705', 'nombre' => 'Publicaciones en serie', 'subcategoria_id' => 70],
            ['codigo' => '706', 'nombre' => 'Organizaciones y administración', 'subcategoria_id' => 70],
            ['codigo' => '707', 'nombre' => 'Educación, investigación, temas relacionados', 'subcategoria_id' => 70],
            ['codigo' => '708', 'nombre' => 'Galerías, museos, colecciones privadas', 'subcategoria_id' => 70],
            ['codigo' => '709', 'nombre' => 'Tratamiento histórico, gográfico, personas', 'subcategoria_id' => 70],

            // Temas de la subcategoría '710' Urbanismo y arte del paisaje
            ['codigo' => '710', 'nombre' => 'Urbanismo y arte del paisaje', 'subcategoria_id' => 71],
            ['codigo' => '711', 'nombre' => 'Planificación del espacio (Urbanismo)', 'subcategoria_id' => 71],
            ['codigo' => '712', 'nombre' => 'Arquitectura del paisaje', 'subcategoria_id' => 71],
            ['codigo' => '713', 'nombre' => 'Arquitectura del paisaje de las vías de tránsito', 'subcategoria_id' => 71],
            ['codigo' => '714', 'nombre' => 'Aguas ornamentales', 'subcategoria_id' => 71],
            ['codigo' => '715', 'nombre' => 'Plantas leñosas', 'subcategoria_id' => 71],
            ['codigo' => '716', 'nombre' => 'Plantas herbáceas', 'subcategoria_id' => 71],
            ['codigo' => '717', 'nombre' => 'Estructuras', 'subcategoria_id' => 71],
            ['codigo' => '718', 'nombre' => 'Diseño de paisaje de cementerios', 'subcategoria_id' => 71],
            ['codigo' => '719', 'nombre' => 'Paisajes naturales', 'subcategoria_id' => 71],

            // Temas de la subcategoría '720' Arquitectura del paisaje
            ['codigo' => '720', 'nombre' => 'Arquitectura del paisaje', 'subcategoria_id' => 72],
            ['codigo' => '721', 'nombre' => 'Estructura arquitectónica', 'subcategoria_id' => 72],
            ['codigo' => '722', 'nombre' => 'Arquitectura antigua hasta ca. 300', 'subcategoria_id' => 72],
            ['codigo' => '723', 'nombre' => 'Arquitectura desde ca. 300 hasta 1399', 'subcategoria_id' => 72],
            ['codigo' => '724', 'nombre' => 'Arquitectura desde 1400', 'subcategoria_id' => 72],
            ['codigo' => '725', 'nombre' => 'Estructuras públicas', 'subcategoria_id' => 72],
            ['codigo' => '726', 'nombre' => 'Edificios para propósitos religiosos', 'subcategoria_id' => 72],
            ['codigo' => '727', 'nombre' => 'Edificios para educación e investigación', 'subcategoria_id' => 72],
            ['codigo' => '728', 'nombre' => 'Edificios residenciales & relacionados', 'subcategoria_id' => 72],
            ['codigo' => '729', 'nombre' => 'Diseño & decoración', 'subcategoria_id' => 72],

            // Temas de la subcategoría '730' Artes plásticas Escultura
            ['codigo' => '730', 'nombre' => 'Artes plásticas Escultura', 'subcategoria_id' => 73],
            ['codigo' => '731', 'nombre' => 'Procesos, formas, temas de la escultura', 'subcategoria_id' => 73],
            ['codigo' => '732', 'nombre' => 'La escultura hasta ca. 500', 'subcategoria_id' => 73],
            ['codigo' => '733', 'nombre' => 'Escultura griega, etrusca, romana', 'subcategoria_id' => 73],
            ['codigo' => '734', 'nombre' => 'Escultura desde ca. 500 hasta 1399', 'subcategoria_id' => 73],
            ['codigo' => '735', 'nombre' => 'Escultura desde 1400', 'subcategoria_id' => 73],
            ['codigo' => '736', 'nombre' => 'Talla y tallado', 'subcategoria_id' => 73],
            ['codigo' => '737', 'nombre' => 'Numismática y sigilografía', 'subcategoria_id' => 73],
            ['codigo' => '738', 'nombre' => 'Artes cerámicas', 'subcategoria_id' => 73],
            ['codigo' => '739', 'nombre' => 'Arte en metal', 'subcategoria_id' => 73],

            // Temas de la subcategoría '740' Dibujo y artes decorativas
            ['codigo' => '740', 'nombre' => 'Dibujo y artes decorativas', 'subcategoria_id' => 74],
            ['codigo' => '741', 'nombre' => 'Dibujo y dibujos', 'subcategoria_id' => 74],
            ['codigo' => '742', 'nombre' => 'Perspectiva', 'subcategoria_id' => 74],
            ['codigo' => '743', 'nombre' => 'Dibujo y dibujos por tema', 'subcategoria_id' => 74],
            ['codigo' => '745', 'nombre' => 'Artes decorativas', 'subcategoria_id' => 74],
            ['codigo' => '746', 'nombre' => 'Artes textiles', 'subcategoria_id' => 74],
            ['codigo' => '747', 'nombre' => 'Decoración de interiores', 'subcategoria_id' => 74],
            ['codigo' => '748', 'nombre' => 'Vidrio', 'subcategoria_id' => 74],
            ['codigo' => '749', 'nombre' => 'Muebles y accesorios', 'subcategoria_id' => 74],

            // Temas de la subcategoría '750' Pinturas
            ['codigo' => '750', 'nombre' => 'Pintura y pinturas', 'subcategoria_id' => 75],
            ['codigo' => '751', 'nombre' => 'Técnicas, equipo y formas', 'subcategoria_id' => 75],
            ['codigo' => '752', 'nombre' => 'Color', 'subcategoria_id' => 75],
            ['codigo' => '753', 'nombre' => 'Simbolismo, alegoría, mitología, leyenda', 'subcategoria_id' => 75],
            ['codigo' => '754', 'nombre' => 'Pinturas de género', 'subcategoria_id' => 75],
            ['codigo' => '755', 'nombre' => 'Religión y simbolismo religioso', 'subcategoria_id' => 75],
            ['codigo' => '756', 'nombre' => 'Eventos históricos', 'subcategoria_id' => 75],
            ['codigo' => '757', 'nombre' => 'Figuras humanas y sus partes', 'subcategoria_id' => 75],
            ['codigo' => '758', 'nombre' => 'Otros temas', 'subcategoria_id' => 75],
            ['codigo' => '759', 'nombre' => 'Tratamiento histórico, goegráfico, de personas', 'subcategoria_id' => 75],

            // Temas de la subcategoría '760' Artes gráficas. Arte de grabar y grabados  
            ['codigo' => '760', 'nombre' => 'Artes gráficas. Arte de grabar y grabados', 'subcategoria_id' => 76],
            ['codigo' => '761', 'nombre' => 'Procesos en relieve (Grabado en bloque)', 'subcategoria_id' => 76],
            ['codigo' => '763', 'nombre' => 'Procesos litográficos (Planográficos)', 'subcategoria_id' => 76],
            ['codigo' => '764', 'nombre' => 'Cromolitografía y serigrafía', 'subcategoria_id' => 76],
            ['codigo' => '765', 'nombre' => 'Grabado en metal', 'subcategoria_id' => 76],
            ['codigo' => '766', 'nombre' => 'Media tinta y procesos relacionados', 'subcategoria_id' => 76],
            ['codigo' => '767', 'nombre' => 'Aguafuerte y grabado a buril', 'subcategoria_id' => 76],
            ['codigo' => '769', 'nombre' => 'Grabados', 'subcategoria_id' => 76],

            // Temas de la subcategoría '770' Fotografía                       
            ['codigo' => '770', 'nombre' => 'Fotografía y fotografías', 'subcategoria_id' => 77],
            ['codigo' => '771', 'nombre' => 'Técnicas, equipo y materiales', 'subcategoria_id' => 77],
            ['codigo' => '772', 'nombre' => 'Procesos con sales metálicas', 'subcategoria_id' => 77],
            ['codigo' => '773', 'nombre' => 'Procesos de pigmentación de la impresión', 'subcategoria_id' => 77],
            ['codigo' => '774', 'nombre' => 'Holografía', 'subcategoria_id' => 77],
            ['codigo' => '778', 'nombre' => 'Campos y clases de fotografía', 'subcategoria_id' => 77],
            ['codigo' => '779', 'nombre' => 'Fotografías', 'subcategoria_id' => 77],

            // Temas de la subcategoría '780' Música  
            ['codigo' => '780', 'nombre' => 'Música', 'subcategoria_id' => 78],
            ['codigo' => '781', 'nombre' => 'Principios generales y formas musicales', 'subcategoria_id' => 78],
            ['codigo' => '782', 'nombre' => 'Música vocal', 'subcategoria_id' => 78],
            ['codigo' => '783', 'nombre' => 'Música para voces individuales. La voz', 'subcategoria_id' => 78],
            ['codigo' => '784', 'nombre' => 'Instrumentos y conjuntos instrumentales', 'subcategoria_id' => 78],
            ['codigo' => '785', 'nombre' => 'Conjuntos con un solo instrumento por parte', 'subcategoria_id' => 78],
            ['codigo' => '786', 'nombre' => 'Instrumentos de percusión y otros intrumentos', 'subcategoria_id' => 78],
            ['codigo' => '787', 'nombre' => 'Instrumentos de cuerda (Cordófonos)', 'subcategoria_id' => 78],
            ['codigo' => '788', 'nombre' => 'Instrumentos de viento (Aerófonos)', 'subcategoria_id' => 78],
            ['codigo' => '789', 'nombre' => 'Compositores tradiciones de la música', 'subcategoria_id' => 78],

            // Temas de la subcategoría '790' Artes recreativas y de la actuación 
            ['codigo' => '790', 'nombre' => 'Artes recreativas y de la actuación', 'subcategoria_id' => 79],
            ['codigo' => '791', 'nombre' => 'Representaciones públicas', 'subcategoria_id' => 79],
            ['codigo' => '792', 'nombre' => 'Representaciones escénicas', 'subcategoria_id' => 79],
            ['codigo' => '793', 'nombre' => 'Juegos y pasatiempos bajo techo', 'subcategoria_id' => 79],
            ['codigo' => '794', 'nombre' => 'Juegos de destreza bajo techo', 'subcategoria_id' => 79],
            ['codigo' => '795', 'nombre' => 'Juegos de suerte', 'subcategoria_id' => 79],
            ['codigo' => '796', 'nombre' => 'Deportes y juegos atléticos y al aire libre', 'subcategoria_id' => 79],
            ['codigo' => '797', 'nombre' => 'Deportes acuáticos y aéreos', 'subcategoria_id' => 79],
            ['codigo' => '798', 'nombre' => 'Deportes ecuestres', 'subcategoria_id' => 79],
            ['codigo' => '799', 'nombre' => 'Pezca, caza, tiro', 'subcategoria_id' => 79],

            //..................................................................................................................

            // Temas de la subcategoría '800' Literatura y retórica
            ['codigo' => '800', 'nombre' => 'Literatura y retórica', 'subcategoria_id' => 80],
            ['codigo' => '801', 'nombre' => 'Filosofía y teoría', 'subcategoria_id' => 80],
            ['codigo' => '802', 'nombre' => 'Miscelánea', 'subcategoria_id' => 80],
            ['codigo' => '803', 'nombre' => 'Diccionarios y enciclopedias', 'subcategoria_id' => 80],
            ['codigo' => '805', 'nombre' => 'Publicaciones en serie', 'subcategoria_id' => 80],
            ['codigo' => '806', 'nombre' => 'Organizaciones', 'subcategoria_id' => 80],
            ['codigo' => '807', 'nombre' => 'Educación, investigación, temas relacionados', 'subcategoria_id' => 80],
            ['codigo' => '808', 'nombre' => 'Retórica y colecciones de literatura', 'subcategoria_id' => 80],
            ['codigo' => '809', 'nombre' => 'Historia y crítica literarias', 'subcategoria_id' => 80],

            // Temas de la subcategoría '810'Literatura americana en inglés
            ['codigo' => '810', 'nombre' => 'Literatura americana en inglés', 'subcategoria_id' => 81],
            ['codigo' => '811', 'nombre' => 'Poesía', 'subcategoria_id' => 81],
            ['codigo' => '812', 'nombre' => 'Teatro', 'subcategoria_id' => 81],
            ['codigo' => '813', 'nombre' => 'Novelística', 'subcategoria_id' => 81],
            ['codigo' => '814', 'nombre' => 'Ensayo', 'subcategoria_id' => 81],
            ['codigo' => '815', 'nombre' => 'Oratoria', 'subcategoria_id' => 81],
            ['codigo' => '816', 'nombre' => 'Cartas', 'subcategoria_id' => 81],
            ['codigo' => '817', 'nombre' => 'Sátira y humor', 'subcategoria_id' => 81],
            ['codigo' => '818', 'nombre' => 'Escritos varios', 'subcategoria_id' => 81],
            ['codigo' => '819', 'nombre' => 'Literaturas Norteamerica en inglés sin', 'subcategoria_id' => 81],

            // Temas de la subcategoría '820'Literaturas inglesa e inglesa antiguas
            ['codigo' => '820', 'nombre' => 'Literaturas inglesa e inglesa antiguas', 'subcategoria_id' => 82],
            ['codigo' => '821', 'nombre' => 'Poesía inglesa', 'subcategoria_id' => 82],
            ['codigo' => '822', 'nombre' => 'Teatro inglés', 'subcategoria_id' => 82],
            ['codigo' => '823', 'nombre' => 'Novelística', 'subcategoria_id' => 82],
            ['codigo' => '824', 'nombre' => 'Ensayos', 'subcategoria_id' => 82],
            ['codigo' => '825', 'nombre' => 'Oratoria', 'subcategoria_id' => 82],
            ['codigo' => '826', 'nombre' => 'Cartas', 'subcategoria_id' => 82],
            ['codigo' => '827', 'nombre' => 'Sátira y humor', 'subcategoria_id' => 82],
            ['codigo' => '828', 'nombre' => 'Escritos varios', 'subcategoria_id' => 82],
            ['codigo' => '829', 'nombre' => 'Literatura inglesa antigua (anglosajona)', 'subcategoria_id' => 82],

            // Temas de la subcategoría '830'Literaturas de lenguas germánicas
            ['codigo' => '830', 'nombre' => 'Literaturas de lenguas germánicas', 'subcategoria_id' => 83],
            ['codigo' => '831', 'nombre' => 'Poesía', 'subcategoria_id' => 83],
            ['codigo' => '832', 'nombre' => 'Teatro', 'subcategoria_id' => 83],
            ['codigo' => '833', 'nombre' => 'Ficción', 'subcategoria_id' => 83],
            ['codigo' => '834', 'nombre' => 'Ensayos', 'subcategoria_id' => 83],
            ['codigo' => '835', 'nombre' => 'Oratoria', 'subcategoria_id' => 83],
            ['codigo' => '836', 'nombre' => 'Cartas', 'subcategoria_id' => 83],
            ['codigo' => '837', 'nombre' => 'Sátira y humor', 'subcategoria_id' => 83],
            ['codigo' => '838', 'nombre' => 'Escritos varios', 'subcategoria_id' => 83],
            ['codigo' => '839', 'nombre' => 'Otras literaturas germánicas', 'subcategoria_id' => 83],

            // Temas de la subcategoría '840'Literaturas de lenguas romances
            ['codigo' => '840', 'nombre' => 'Literaturas de lenguas romances', 'subcategoria_id' => 84],
            ['codigo' => '841', 'nombre' => 'Poesía francesa', 'subcategoria_id' => 84],
            ['codigo' => '842', 'nombre' => 'Teatro francés', 'subcategoria_id' => 84],
            ['codigo' => '843', 'nombre' => 'Novela francesa', 'subcategoria_id' => 84],
            ['codigo' => '844', 'nombre' => 'Ensayos franceses', 'subcategoria_id' => 84],
            ['codigo' => '845', 'nombre' => 'Oratoria francesa', 'subcategoria_id' => 84],
            ['codigo' => '846', 'nombre' => 'Cartas francesas', 'subcategoria_id' => 84],
            ['codigo' => '847', 'nombre' => 'Sátira y humor franceses', 'subcategoria_id' => 84],
            ['codigo' => '848', 'nombre' => 'Escritos varios franceses', 'subcategoria_id' => 84],
            ['codigo' => '849', 'nombre' => 'Provenzal y catalán', 'subcategoria_id' => 84],

            // Temas de la subcategoría '850'Literaturas italiana, rumana, retorromana
            ['codigo' => '850', 'nombre' => 'Literaturas italiana, rumana, retorromana', 'subcategoria_id' => 85],
            ['codigo' => '851', 'nombre' => 'Poesía italiana', 'subcategoria_id' => 85],
            ['codigo' => '852', 'nombre' => 'Teatro italiano', 'subcategoria_id' => 85],
            ['codigo' => '853', 'nombre' => 'Ficción italiana', 'subcategoria_id' => 85],
            ['codigo' => '854', 'nombre' => 'Ensayos italianos', 'subcategoria_id' => 85],
            ['codigo' => '855', 'nombre' => 'Oratoria italiana', 'subcategoria_id' => 85],
            ['codigo' => '856', 'nombre' => 'Cartas italianas', 'subcategoria_id' => 85],
            ['codigo' => '857', 'nombre' => 'Sátiras y humor italiano', 'subcategoria_id' => 85],
            ['codigo' => '858', 'nombre' => 'Escritos varios italianos', 'subcategoria_id' => 85],
            ['codigo' => '859', 'nombre' => 'Romano y retorromano', 'subcategoria_id' => 85],

            // Temas de la subcategoría '860'Literaturas española y portuguesa
            ['codigo' => '860', 'nombre' => 'Literaturas española y portuguesa', 'subcategoria_id' => 86],
            ['codigo' => '861', 'nombre' => 'Poesía española', 'subcategoria_id' => 86],
            ['codigo' => '862', 'nombre' => 'Teatro español', 'subcategoria_id' => 86],
            ['codigo' => '863', 'nombre' => 'Ficción española', 'subcategoria_id' => 86],
            ['codigo' => '864', 'nombre' => 'Ensayos españoles', 'subcategoria_id' => 86],
            ['codigo' => '865', 'nombre' => 'Oratoria española', 'subcategoria_id' => 86],
            ['codigo' => '866', 'nombre' => 'Cartas españolas', 'subcategoria_id' => 86],
            ['codigo' => '867', 'nombre' => 'Sátira y humor españoles', 'subcategoria_id' => 86],
            ['codigo' => '868', 'nombre' => 'Escritos varios españoles', 'subcategoria_id' => 86],
            ['codigo' => '869', 'nombre' => 'Literatura portuguesa', 'subcategoria_id' => 86],


            // Temas de la subcategoría '870'Literaturas itálicas. Literatura latina 
            ['codigo' => '870', 'nombre' => 'Literaturas itálicas. Literatura latina', 'subcategoria_id' => 87],
            ['codigo' => '871', 'nombre' => 'Poesía latina', 'subcategoria_id' => 87],
            ['codigo' => '872', 'nombre' => 'Poesía dramática', 'subcategoria_id' => 87],
            ['codigo' => '873', 'nombre' => 'Poesía épica y novelística latinas', 'subcategoria_id' => 87],
            ['codigo' => '874', 'nombre' => 'Poesía lírica latina', 'subcategoria_id' => 87],
            ['codigo' => '875', 'nombre' => 'Oratoria latina', 'subcategoria_id' => 87],
            ['codigo' => '876', 'nombre' => 'Cartas latinas', 'subcategoria_id' => 87],
            ['codigo' => '877', 'nombre' => 'Sátira y humor latinos', 'subcategoria_id' => 87],
            ['codigo' => '878', 'nombre' => 'Escritos varios latinos', 'subcategoria_id' => 87],
            ['codigo' => '879', 'nombre' => 'Literaturas de otras lenguas itálicas', 'subcategoria_id' => 87],

            // Temas de la subcategoría '880'Literaturas helénicas. Literatura griega clásica
            ['codigo' => '880', 'nombre' => 'Literaturas helénicas. Literatura griega clásica', 'subcategoria_id' => 88],
            ['codigo' => '881', 'nombre' => 'Poesía griega clásica', 'subcategoria_id' => 88],
            ['codigo' => '882', 'nombre' => 'Teatro griego clásico', 'subcategoria_id' => 88],
            ['codigo' => '883', 'nombre' => 'Poesía épicay novelística griegas clásicas', 'subcategoria_id' => 88],
            ['codigo' => '884', 'nombre' => 'Poesía lírica griega', 'subcategoria_id' => 88],
            ['codigo' => '885', 'nombre' => 'Oratoria griega clásica', 'subcategoria_id' => 88],
            ['codigo' => '886', 'nombre' => 'Cartas griegas clásicas', 'subcategoria_id' => 88],
            ['codigo' => '887', 'nombre' => 'Sátira y humor grigos clásicos', 'subcategoria_id' => 88],
            ['codigo' => '888', 'nombre' => 'Escritos varios griegos clásicos', 'subcategoria_id' => 88],
            ['codigo' => '889', 'nombre' => 'Literatura griega moderna', 'subcategoria_id' => 88],

            // Temas de la subcategoría '890'Literatura de otras lenguas.
            ['codigo' => '890', 'nombre' => 'Literatura de otras lenguas.', 'subcategoria_id' => 89],
            ['codigo' => '891', 'nombre' => 'Indoeuropeos, orientales y célticas', 'subcategoria_id' => 89],
            ['codigo' => '892', 'nombre' => 'Afroasiáticas. Semíticas', 'subcategoria_id' => 89],
            ['codigo' => '893', 'nombre' => 'Afroasiáticas no simíticas', 'subcategoria_id' => 89],
            ['codigo' => '894', 'nombre' => 'Uralaltaicas, paleosiberianas y dravinianas', 'subcategoria_id' => 89],
            ['codigo' => '895', 'nombre' => 'Del oriente y Sudoriente de Asia', 'subcategoria_id' => 89],
            ['codigo' => '896', 'nombre' => 'Literaturas africanas', 'subcategoria_id' => 89],
            ['codigo' => '897', 'nombre' => 'Nativas de América del Norte', 'subcategoria_id' => 89],
            ['codigo' => '898', 'nombre' => 'Nativas de América del Sur', 'subcategoria_id' => 89],
            ['codigo' => '899', 'nombre' => 'Otras lenguas', 'subcategoria_id' => 89],

            //..................................................................................................................

            // Temas de la subcategoría '900' Geografía e historia
            ['codigo' => '900', 'nombre' => 'Geografía e historia', 'subcategoria_id' => 90],
            ['codigo' => '901', 'nombre' => 'Filosofía y teoría de la historia', 'subcategoria_id' => 90],
            ['codigo' => '902', 'nombre' => 'Miscelánea', 'subcategoria_id' => 90],
            ['codigo' => '903', 'nombre' => 'Diccionarios y enciclopedias', 'subcategoria_id' => 90],
            ['codigo' => '904', 'nombre' => 'Colecciones de relatos de eventos', 'subcategoria_id' => 90],
            ['codigo' => '905', 'nombre' => 'Publicaciones en serie', 'subcategoria_id' => 90],
            ['codigo' => '906', 'nombre' => 'Organizaciones y administración', 'subcategoria_id' => 90],
            ['codigo' => '907', 'nombre' => 'Educación, investigación, temas relacionados', 'subcategoria_id' => 90],
            ['codigo' => '908', 'nombre' => 'En relación con clases de personas', 'subcategoria_id' => 90],
            ['codigo' => '909', 'nombre' => 'Historia universal', 'subcategoria_id' => 90],

            // Temas de la subcategoría '910' Geografía y viajes
            ['codigo' => '910', 'nombre' => 'Geografía y viajes', 'subcategoria_id' => 91],
            ['codigo' => '911', 'nombre' => 'Geografía histórica', 'subcategoria_id' => 91],
            ['codigo' => '912', 'nombre' => 'Representaciones gráficas de la tierra', 'subcategoria_id' => 91],
            ['codigo' => '913', 'nombre' => 'Mundo antiguo', 'subcategoria_id' => 91],
            ['codigo' => '914', 'nombre' => 'Europa', 'subcategoria_id' => 91],
            ['codigo' => '915', 'nombre' => 'Asia', 'subcategoria_id' => 91],
            ['codigo' => '916', 'nombre' => 'Africa', 'subcategoria_id' => 91],
            ['codigo' => '917', 'nombre' => 'América del Norte', 'subcategoria_id' => 91],
            ['codigo' => '918', 'nombre' => 'América del Sur', 'subcategoria_id' => 91],
            ['codigo' => '919', 'nombre' => 'Otras áreas.', 'subcategoria_id' => 91],

            // Temas de la subcategoría '920' Biografía, genealogía, emblemas
            ['codigo' => '920', 'nombre' => 'Biografía, genealogía, emblemas', 'subcategoria_id' => 92],
            ['codigo' => '921', 'nombre' => 'Filósofos y Psicólogos', 'subcategoria_id' => 92],
            ['codigo' => '922', 'nombre' => 'Líderes, pensadores, trabajadores religiosos', 'subcategoria_id' => 92],
            ['codigo' => '923', 'nombre' => 'Personas en las ciencias sociales', 'subcategoria_id' => 92],
            ['codigo' => '924', 'nombre' => 'Filósofos y Lexicógrafos', 'subcategoria_id' => 92],
            ['codigo' => '925', 'nombre' => 'Científicos', 'subcategoria_id' => 92],
            ['codigo' => '926', 'nombre' => 'Personas en tecnologías', 'subcategoria_id' => 92],
            ['codigo' => '927', 'nombre' => 'Personas en las artes y la recreación', 'subcategoria_id' => 92],
            ['codigo' => '928', 'nombre' => 'Personas en la literatura, historia, biofrafía', 'subcategoria_id' => 92],
            ['codigo' => '929', 'nombre' => 'Genealogía, nombres, emblemas', 'subcategoria_id' => 92],

            // Temas de la subcategoría '930' Historia del mundo antiguo
            ['codigo' => '930', 'nombre' => 'Historia del mundo antiguo', 'subcategoria_id' => 93],
            ['codigo' => '931', 'nombre' => 'China', 'subcategoria_id' => 93],
            ['codigo' => '932', 'nombre' => 'Egipto', 'subcategoria_id' => 93],
            ['codigo' => '933', 'nombre' => 'Palestina', 'subcategoria_id' => 93],
            ['codigo' => '934', 'nombre' => 'India', 'subcategoria_id' => 93],
            ['codigo' => '935', 'nombre' => 'Mesopotamia y Meseta Iraní', 'subcategoria_id' => 93],
            ['codigo' => '936', 'nombre' => 'Europa del norte y al occidente de Italia', 'subcategoria_id' => 93],
            ['codigo' => '937', 'nombre' => 'Italia y territorios adyacentes', 'subcategoria_id' => 93],
            ['codigo' => '938', 'nombre' => 'Grecia', 'subcategoria_id' => 93],
            ['codigo' => '939', 'nombre' => 'Otras partes del mundo antiguo', 'subcategoria_id' => 93],

            // Temas de la subcategoría '940' Historia general de Europa
            ['codigo' => '940', 'nombre' => 'Historia general de Europa', 'subcategoria_id' => 94],
            ['codigo' => '941', 'nombre' => 'Islas británicas', 'subcategoria_id' => 94],
            ['codigo' => '942', 'nombre' => 'Inglaterra y Gales', 'subcategoria_id' => 94],
            ['codigo' => '943', 'nombre' => 'Europa Central. Alemania', 'subcategoria_id' => 94],
            ['codigo' => '944', 'nombre' => 'Francia y Mónaco', 'subcategoria_id' => 94],
            ['codigo' => '945', 'nombre' => 'Península Itálica e islas adyacentes', 'subcategoria_id' => 94],
            ['codigo' => '946', 'nombre' => 'Península Ibérica e islas adyacentes', 'subcategoria_id' => 94],
            ['codigo' => '947', 'nombre' => 'Europa Oriental. Rusia', 'subcategoria_id' => 94],
            ['codigo' => '948', 'nombre' => 'Europa del norte. Escandinavia', 'subcategoria_id' => 94],
            ['codigo' => '949', 'nombre' => 'Otras partes de Europa', 'subcategoria_id' => 94],

            // Temas de la subcategoría '950' Historia general de Asia. Extremo Oriente
            ['codigo' => '950', 'nombre' => 'Historia general de Asia. Extremo Oriente', 'subcategoria_id' => 95],
            ['codigo' => '951', 'nombre' => 'China y áreas adyacentes', 'subcategoria_id' => 95],
            ['codigo' => '952', 'nombre' => 'Japón', 'subcategoria_id' => 95],
            ['codigo' => '953', 'nombre' => 'Península de Arabia y áreas adyacentes', 'subcategoria_id' => 95],
            ['codigo' => '954', 'nombre' => 'Asia del sur. India', 'subcategoria_id' => 95],
            ['codigo' => '955', 'nombre' => 'Irán', 'subcategoria_id' => 95],
            ['codigo' => '956', 'nombre' => 'Medio Oriente (Cercano Oriente)', 'subcategoria_id' => 95],
            ['codigo' => '957', 'nombre' => 'Siberia (Rusia asiática)', 'subcategoria_id' => 95],
            ['codigo' => '958', 'nombre' => 'Asia Central', 'subcategoria_id' => 95],
            ['codigo' => '959', 'nombre' => 'Asia sudoriental', 'subcategoria_id' => 95],

            // Temas de la subcategoría '960' Historia general de África
            ['codigo' => '960', 'nombre' => 'Historia general de Africa', 'subcategoria_id' => 96],
            ['codigo' => '961', 'nombre' => 'Túnez y Libia', 'subcategoria_id' => 96],
            ['codigo' => '962', 'nombre' => 'Egipto y Sudan', 'subcategoria_id' => 96],
            ['codigo' => '963', 'nombre' => 'Etiopia', 'subcategoria_id' => 96],
            ['codigo' => '964', 'nombre' => 'Marruecos e Islas Canarias', 'subcategoria_id' => 96],
            ['codigo' => '965', 'nombre' => 'Argelia', 'subcategoria_id' => 96],
            ['codigo' => '966', 'nombre' => 'Africa occidental e islas cercanas', 'subcategoria_id' => 96],
            ['codigo' => '967', 'nombre' => 'Africa central e islas cercanas', 'subcategoria_id' => 96],
            ['codigo' => '968', 'nombre' => 'Africa del sur', 'subcategoria_id' => 96],
            ['codigo' => '969', 'nombre' => 'Islas del Océano Indico del Sur', 'subcategoria_id' => 96],

            // Temas de la subcategoría '970' Historia general de América
            ['codigo' => '970', 'nombre' => 'Historia general de América', 'subcategoria_id' => 97],
            ['codigo' => '971', 'nombre' => 'Canadá', 'subcategoria_id' => 97],
            ['codigo' => '972', 'nombre' => 'Mesoamérica. México', 'subcategoria_id' => 97],
            ['codigo' => '973', 'nombre' => 'Estados unidos', 'subcategoria_id' => 97],
            ['codigo' => '974', 'nombre' => 'Noroccidente de Estados Unidos', 'subcategoria_id' => 97],
            ['codigo' => '975', 'nombre' => 'Sudoriente de Estados Unidos', 'subcategoria_id' => 97],
            ['codigo' => '976', 'nombre' => 'Centro-sur de Estados Unidos', 'subcategoria_id' => 97],
            ['codigo' => '977', 'nombre' => 'Centro-norte de Estados Unidos', 'subcategoria_id' => 97],
            ['codigo' => '978', 'nombre' => 'Occidente de Estados Unidos', 'subcategoria_id' => 97],
            ['codigo' => '979', 'nombre' => 'Gran Cuenca y Vertiente del Pacífico', 'subcategoria_id' => 97],

            // Temas de la subcategoría '980' Historia general de América del Sur
            ['codigo' => '980', 'nombre' => 'Historia general de América del Sur', 'subcategoria_id' => 98],
            ['codigo' => '981', 'nombre' => 'Brasil', 'subcategoria_id' => 98],
            ['codigo' => '982', 'nombre' => 'Argentina', 'subcategoria_id' => 98],
            ['codigo' => '983', 'nombre' => 'Chile', 'subcategoria_id' => 98],
            ['codigo' => '984', 'nombre' => 'Bolivia', 'subcategoria_id' => 98],
            ['codigo' => '985', 'nombre' => 'Perú', 'subcategoria_id' => 98],
            ['codigo' => '986', 'nombre' => 'Colombia y Ecuador', 'subcategoria_id' => 98],
            ['codigo' => '987', 'nombre' => 'Venezuela', 'subcategoria_id' => 98],
            ['codigo' => '988', 'nombre' => 'Guayanas', 'subcategoria_id' => 98],
            ['codigo' => '989', 'nombre' => 'Paraguay y Uruguay', 'subcategoria_id' => 98],

            // Temas de la subcategoría '990' Historia general de otras áreas
            ['codigo' => '990', 'nombre' => 'Historia general de otras áreas', 'subcategoria_id' => 99],
            ['codigo' => '993', 'nombre' => 'Nueva Zelanda', 'subcategoria_id' => 99],
            ['codigo' => '994', 'nombre' => 'Australia', 'subcategoria_id' => 99],
            ['codigo' => '995', 'nombre' => 'Melanesia. Nueva Guinea', 'subcategoria_id' => 99],
            ['codigo' => '996', 'nombre' => 'Otras partes del Pacífico. Polinesia', 'subcategoria_id' => 99],
            ['codigo' => '997', 'nombre' => 'Islas del Océano Atlántico', 'subcategoria_id' => 99],
            ['codigo' => '998', 'nombre' => 'Islas árticas y Antártida', 'subcategoria_id' => 99],
            ['codigo' => '999', 'nombre' => 'Mundos extraterrestres', 'subcategoria_id' => 99],
        ];

        DB::table('temas_dewey')->insert($temas);
    }
}
