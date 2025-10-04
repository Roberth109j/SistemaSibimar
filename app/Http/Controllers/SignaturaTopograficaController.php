<?php

namespace App\Http\Controllers;

use App\Models\TemaDewey;
use App\Models\Libro;
use App\Models\Autor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SignaturaTopograficaController extends Controller
{
    /**
     * Tabla de Cutter-Sanborn simplificada para generar códigos
     * Basada en la tabla de tres cifras de Cutter-Sanborn
     */
    private static $cutterTable = [
        'A' => ['A' => 1, 'Ab' => 2, 'Ac' => 3, 'Ad' => 4, 'Ae' => 5, 'Af' => 6, 'Ag' => 7, 'Ah' => 8, 'Ai' => 9, 'Aj' => 10, 'Ak' => 11, 'Al' => 12, 'Am' => 13, 'An' => 14, 'Ao' => 15, 'Ap' => 16, 'Aq' => 17, 'Ar' => 18, 'As' => 19, 'At' => 20, 'Au' => 21, 'Av' => 22, 'Aw' => 23, 'Ax' => 24, 'Ay' => 25, 'Az' => 26],
        'B' => ['B' => 27, 'Ba' => 28, 'Bb' => 29, 'Bc' => 30, 'Bd' => 31, 'Be' => 32, 'Bf' => 33, 'Bg' => 34, 'Bh' => 35, 'Bi' => 36, 'Bj' => 37, 'Bk' => 38, 'Bl' => 39, 'Bm' => 40, 'Bn' => 41, 'Bo' => 42, 'Bp' => 43, 'Bq' => 44, 'Br' => 45, 'Bs' => 46, 'Bt' => 47, 'Bu' => 48, 'Bv' => 49, 'Bw' => 50, 'Bx' => 51, 'By' => 52, 'Bz' => 53],
        'C' => ['C' => 54, 'Ca' => 55, 'Cb' => 56, 'Cc' => 57, 'Cd' => 58, 'Ce' => 59, 'Cf' => 60, 'Cg' => 61, 'Ch' => 62, 'Ci' => 63, 'Cj' => 64, 'Ck' => 65, 'Cl' => 66, 'Cm' => 67, 'Cn' => 68, 'Co' => 69, 'Cp' => 70, 'Cq' => 71, 'Cr' => 72, 'Cs' => 73, 'Ct' => 74, 'Cu' => 75, 'Cv' => 76, 'Cw' => 77, 'Cx' => 78, 'Cy' => 79, 'Cz' => 80],
        'D' => ['D' => 81, 'Da' => 82, 'Db' => 83, 'Dc' => 84, 'Dd' => 85, 'De' => 86, 'Df' => 87, 'Dg' => 88, 'Dh' => 89, 'Di' => 90, 'Dj' => 91, 'Dk' => 92, 'Dl' => 93, 'Dm' => 94, 'Dn' => 95, 'Do' => 96, 'Dp' => 97, 'Dq' => 98, 'Dr' => 99, 'Ds' => 100, 'Dt' => 101, 'Du' => 102, 'Dv' => 103, 'Dw' => 104, 'Dx' => 105, 'Dy' => 106, 'Dz' => 107],
        'E' => ['E' => 108, 'Ea' => 109, 'Eb' => 110, 'Ec' => 111, 'Ed' => 112, 'Ee' => 113, 'Ef' => 114, 'Eg' => 115, 'Eh' => 116, 'Ei' => 117, 'Ej' => 118, 'Ek' => 119, 'El' => 120, 'Em' => 121, 'En' => 122, 'Eo' => 123, 'Ep' => 124, 'Eq' => 125, 'Er' => 126, 'Es' => 127, 'Et' => 128, 'Eu' => 129, 'Ev' => 130, 'Ew' => 131, 'Ex' => 132, 'Ey' => 133, 'Ez' => 134],
        'F' => ['F' => 135, 'Fa' => 136, 'Fb' => 137, 'Fc' => 138, 'Fd' => 139, 'Fe' => 140, 'Ff' => 141, 'Fg' => 142, 'Fh' => 143, 'Fi' => 144, 'Fj' => 145, 'Fk' => 146, 'Fl' => 147, 'Fm' => 148, 'Fn' => 149, 'Fo' => 150, 'Fp' => 151, 'Fq' => 152, 'Fr' => 153, 'Fs' => 154, 'Ft' => 155, 'Fu' => 156, 'Fv' => 157, 'Fw' => 158, 'Fx' => 159, 'Fy' => 160, 'Fz' => 161],
        'G' => ['G' => 162, 'Ga' => 163, 'Gb' => 164, 'Gc' => 165, 'Gd' => 166, 'Ge' => 167, 'Gf' => 168, 'Gg' => 169, 'Gh' => 170, 'Gi' => 171, 'Gj' => 172, 'Gk' => 173, 'Gl' => 174, 'Gm' => 175, 'Gn' => 176, 'Go' => 177, 'Gp' => 178, 'Gq' => 179, 'Gr' => 180, 'Gs' => 181, 'Gt' => 182, 'Gu' => 183, 'Gv' => 184, 'Gw' => 185, 'Gx' => 186, 'Gy' => 187, 'Gz' => 188],
        'H' => ['H' => 189, 'Ha' => 190, 'Hb' => 191, 'Hc' => 192, 'Hd' => 193, 'He' => 194, 'Hf' => 195, 'Hg' => 196, 'Hh' => 197, 'Hi' => 198, 'Hj' => 199, 'Hk' => 200, 'Hl' => 201, 'Hm' => 202, 'Hn' => 203, 'Ho' => 204, 'Hp' => 205, 'Hq' => 206, 'Hr' => 207, 'Hs' => 208, 'Ht' => 209, 'Hu' => 210, 'Hv' => 211, 'Hw' => 212, 'Hx' => 213, 'Hy' => 214, 'Hz' => 215],
        'I' => ['I' => 216, 'Ia' => 217, 'Ib' => 218, 'Ic' => 219, 'Id' => 220, 'Ie' => 221, 'If' => 222, 'Ig' => 223, 'Ih' => 224, 'Ii' => 225, 'Ij' => 226, 'Ik' => 227, 'Il' => 228, 'Im' => 229, 'In' => 230, 'Io' => 231, 'Ip' => 232, 'Iq' => 233, 'Ir' => 234, 'Is' => 235, 'It' => 236, 'Iu' => 237, 'Iv' => 238, 'Iw' => 239, 'Ix' => 240, 'Iy' => 241, 'Iz' => 242],
        'J' => ['J' => 243, 'Ja' => 244, 'Jb' => 245, 'Jc' => 246, 'Jd' => 247, 'Je' => 248, 'Jf' => 249, 'Jg' => 250, 'Jh' => 251, 'Ji' => 252, 'Jj' => 253, 'Jk' => 254, 'Jl' => 255, 'Jm' => 256, 'Jn' => 257, 'Jo' => 258, 'Jp' => 259, 'Jq' => 260, 'Jr' => 261, 'Js' => 262, 'Jt' => 263, 'Ju' => 264, 'Jv' => 265, 'Jw' => 266, 'Jx' => 267, 'Jy' => 268, 'Jz' => 269],
        'K' => ['K' => 270, 'Ka' => 271, 'Kb' => 272, 'Kc' => 273, 'Kd' => 274, 'Ke' => 275, 'Kf' => 276, 'Kg' => 277, 'Kh' => 278, 'Ki' => 279, 'Kj' => 280, 'Kk' => 281, 'Kl' => 282, 'Km' => 283, 'Kn' => 284, 'Ko' => 285, 'Kp' => 286, 'Kq' => 287, 'Kr' => 288, 'Ks' => 289, 'Kt' => 290, 'Ku' => 291, 'Kv' => 292, 'Kw' => 293, 'Kx' => 294, 'Ky' => 295, 'Kz' => 296],
        'L' => ['L' => 297, 'La' => 298, 'Lb' => 299, 'Lc' => 300, 'Ld' => 301, 'Le' => 302, 'Lf' => 303, 'Lg' => 304, 'Lh' => 305, 'Li' => 306, 'Lj' => 307, 'Lk' => 308, 'Ll' => 309, 'Lm' => 310, 'Ln' => 311, 'Lo' => 312, 'Lp' => 313, 'Lq' => 314, 'Lr' => 315, 'Ls' => 316, 'Lt' => 317, 'Lu' => 318, 'Lv' => 319, 'Lw' => 320, 'Lx' => 321, 'Ly' => 322, 'Lz' => 323],
        'M' => ['M' => 324, 'Ma' => 325, 'Mb' => 326, 'Mc' => 327, 'Md' => 328, 'Me' => 329, 'Mf' => 330, 'Mg' => 331, 'Mh' => 332, 'Mi' => 333, 'Mj' => 334, 'Mk' => 335, 'Ml' => 336, 'Mm' => 337, 'Mn' => 338, 'Mo' => 339, 'Mp' => 340, 'Mq' => 341, 'Mr' => 342, 'Ms' => 343, 'Mt' => 344, 'Mu' => 345, 'Mv' => 346, 'Mw' => 347, 'Mx' => 348, 'My' => 349, 'Mz' => 350],
        'N' => ['N' => 351, 'Na' => 352, 'Nb' => 353, 'Nc' => 354, 'Nd' => 355, 'Ne' => 356, 'Nf' => 357, 'Ng' => 358, 'Nh' => 359, 'Ni' => 360, 'Nj' => 361, 'Nk' => 362, 'Nl' => 363, 'Nm' => 364, 'Nn' => 365, 'No' => 366, 'Np' => 367, 'Nq' => 368, 'Nr' => 369, 'Ns' => 370, 'Nt' => 371, 'Nu' => 372, 'Nv' => 373, 'Nw' => 374, 'Nx' => 375, 'Ny' => 376, 'Nz' => 377],
        'O' => ['O' => 378, 'Oa' => 379, 'Ob' => 380, 'Oc' => 381, 'Od' => 382, 'Oe' => 383, 'Of' => 384, 'Og' => 385, 'Oh' => 386, 'Oi' => 387, 'Oj' => 388, 'Ok' => 389, 'Ol' => 390, 'Om' => 391, 'On' => 392, 'Oo' => 393, 'Op' => 394, 'Oq' => 395, 'Or' => 396, 'Os' => 397, 'Ot' => 398, 'Ou' => 399, 'Ov' => 400, 'Ow' => 401, 'Ox' => 402, 'Oy' => 403, 'Oz' => 404],
        'P' => ['P' => 405, 'Pa' => 406, 'Pb' => 407, 'Pc' => 408, 'Pd' => 409, 'Pe' => 410, 'Pf' => 411, 'Pg' => 412, 'Ph' => 413, 'Pi' => 414, 'Pj' => 415, 'Pk' => 416, 'Pl' => 417, 'Pm' => 418, 'Pn' => 419, 'Po' => 420, 'Pp' => 421, 'Pq' => 422, 'Pr' => 423, 'Ps' => 424, 'Pt' => 425, 'Pu' => 426, 'Pv' => 427, 'Pw' => 428, 'Px' => 429, 'Py' => 430, 'Pz' => 431],
        'Q' => ['Q' => 432, 'Qa' => 433, 'Qb' => 434, 'Qc' => 435, 'Qd' => 436, 'Qe' => 437, 'Qf' => 438, 'Qg' => 439, 'Qh' => 440, 'Qi' => 441, 'Qj' => 442, 'Qk' => 443, 'Ql' => 444, 'Qm' => 445, 'Qn' => 446, 'Qo' => 447, 'Qp' => 448, 'Qq' => 449, 'Qr' => 450, 'Qs' => 451, 'Qt' => 452, 'Qu' => 453, 'Qv' => 454, 'Qw' => 455, 'Qx' => 456, 'Qy' => 457, 'Qz' => 458],
        'R' => ['R' => 459, 'Ra' => 460, 'Rb' => 461, 'Rc' => 462, 'Rd' => 463, 'Re' => 464, 'Rf' => 465, 'Rg' => 466, 'Rh' => 467, 'Ri' => 468, 'Rj' => 469, 'Rk' => 470, 'Rl' => 471, 'Rm' => 472, 'Rn' => 473, 'Ro' => 474, 'Rp' => 475, 'Rq' => 476, 'Rr' => 477, 'Rs' => 478, 'Rt' => 479, 'Ru' => 480, 'Rv' => 481, 'Rw' => 482, 'Rx' => 483, 'Ry' => 484, 'Rz' => 485],
        'S' => ['S' => 486, 'Sa' => 487, 'Sb' => 488, 'Sc' => 489, 'Sd' => 490, 'Se' => 491, 'Sf' => 492, 'Sg' => 493, 'Sh' => 494, 'Si' => 495, 'Sj' => 496, 'Sk' => 497, 'Sl' => 498, 'Sm' => 499, 'Sn' => 500, 'So' => 501, 'Sp' => 502, 'Sq' => 503, 'Sr' => 504, 'Ss' => 505, 'St' => 506, 'Su' => 507, 'Sv' => 508, 'Sw' => 509, 'Sx' => 510, 'Sy' => 511, 'Sz' => 512],
        'T' => ['T' => 513, 'Ta' => 514, 'Tb' => 515, 'Tc' => 516, 'Td' => 517, 'Te' => 518, 'Tf' => 519, 'Tg' => 520, 'Th' => 521, 'Ti' => 522, 'Tj' => 523, 'Tk' => 524, 'Tl' => 525, 'Tm' => 526, 'Tn' => 527, 'To' => 528, 'Tp' => 529, 'Tq' => 530, 'Tr' => 531, 'Ts' => 532, 'Tt' => 533, 'Tu' => 534, 'Tv' => 535, 'Tw' => 536, 'Tx' => 537, 'Ty' => 538, 'Tz' => 539],
        'U' => ['U' => 540, 'Ua' => 541, 'Ub' => 542, 'Uc' => 543, 'Ud' => 544, 'Ue' => 545, 'Uf' => 546, 'Ug' => 547, 'Uh' => 548, 'Ui' => 549, 'Uj' => 550, 'Uk' => 551, 'Ul' => 552, 'Um' => 553, 'Un' => 554, 'Uo' => 555, 'Up' => 556, 'Uq' => 557, 'Ur' => 558, 'Us' => 559, 'Ut' => 560, 'Uu' => 561, 'Uv' => 562, 'Uw' => 563, 'Ux' => 564, 'Uy' => 565, 'Uz' => 566],
        'V' => ['V' => 567, 'Va' => 568, 'Vb' => 569, 'Vc' => 570, 'Vd' => 571, 'Ve' => 572, 'Vf' => 573, 'Vg' => 574, 'Vh' => 575, 'Vi' => 576, 'Vj' => 577, 'Vk' => 578, 'Vl' => 579, 'Vm' => 580, 'Vn' => 581, 'Vo' => 582, 'Vp' => 583, 'Vq' => 584, 'Vr' => 585, 'Vs' => 586, 'Vt' => 587, 'Vu' => 588, 'Vv' => 589, 'Vw' => 590, 'Vx' => 591, 'Vy' => 592, 'Vz' => 593],
        'W' => ['W' => 594, 'Wa' => 595, 'Wb' => 596, 'Wc' => 597, 'Wd' => 598, 'We' => 599, 'Wf' => 600, 'Wg' => 601, 'Wh' => 602, 'Wi' => 603, 'Wj' => 604, 'Wk' => 605, 'Wl' => 606, 'Wm' => 607, 'Wn' => 608, 'Wo' => 609, 'Wp' => 610, 'Wq' => 611, 'Wr' => 612, 'Ws' => 613, 'Wt' => 614, 'Wu' => 615, 'Wv' => 616, 'Ww' => 617, 'Wx' => 618, 'Wy' => 619, 'Wz' => 620],
        'X' => ['X' => 621, 'Xa' => 622, 'Xb' => 623, 'Xc' => 624, 'Xd' => 625, 'Xe' => 626, 'Xf' => 627, 'Xg' => 628, 'Xh' => 629, 'Xi' => 630, 'Xj' => 631, 'Xk' => 632, 'Xl' => 633, 'Xm' => 634, 'Xn' => 635, 'Xo' => 636, 'Xp' => 637, 'Xq' => 638, 'Xr' => 639, 'Xs' => 640, 'Xt' => 641, 'Xu' => 642, 'Xv' => 643, 'Xw' => 644, 'Xx' => 645, 'Xy' => 646, 'Xz' => 647],
        'Y' => ['Y' => 648, 'Ya' => 649, 'Yb' => 650, 'Yc' => 651, 'Yd' => 652, 'Ye' => 653, 'Yf' => 654, 'Yg' => 655, 'Yh' => 656, 'Yi' => 657, 'Yj' => 658, 'Yk' => 659, 'Yl' => 660, 'Ym' => 661, 'Yn' => 662, 'Yo' => 663, 'Yp' => 664, 'Yq' => 665, 'Yr' => 666, 'Ys' => 667, 'Yt' => 668, 'Yu' => 669, 'Yv' => 670, 'Yw' => 671, 'Yx' => 672, 'Yy' => 673, 'Yz' => 674],
        'Z' => ['Z' => 675, 'Za' => 676, 'Zb' => 677, 'Zc' => 678, 'Zd' => 679, 'Ze' => 680, 'Zf' => 681, 'Zg' => 682, 'Zh' => 683, 'Zi' => 684, 'Zj' => 685, 'Zk' => 686, 'Zl' => 687, 'Zm' => 688, 'Zn' => 689, 'Zo' => 690, 'Zp' => 691, 'Zq' => 692, 'Zr' => 693, 'Zs' => 694, 'Zt' => 695, 'Zu' => 696, 'Zv' => 697, 'Zw' => 698, 'Zx' => 699, 'Zy' => 700, 'Zz' => 701]
    ];

    /**
     * Generar código Cutter-Sanborn para un autor
     */
    public function generarCutter(Request $request)
    {
        try {
            $autor = $request->input('autor', '');
            
            if (empty($autor)) {
                return response()->json([
                    'error' => 'El nombre del autor es requerido'
                ], 400);
            }

            // Limpiar y normalizar el nombre del autor
            $autor = $this->normalizarAutor($autor);
            
            // Generar código Cutter
            $cutter = $this->calcularCutter($autor);
            
            return response()->json([
                'cutter' => $cutter,
                'autor_normalizado' => $autor
            ]);

        } catch (\Exception $e) {
            Log::error('Error al generar código Cutter:', [
                'error' => $e->getMessage(),
                'autor' => $request->input('autor')
            ]);
            
            return response()->json([
                'error' => 'Error interno al generar el código Cutter'
            ], 500);
        }
    }

    /**
     * Generar signatura topográfica completa
     */
    public function generarSignatura(Request $request)
    {
        try {
            $temaId = $request->input('tema_id');
            $autor = $request->input('autor', '');
            $titulo = $request->input('titulo', '');
            
            if (!$temaId || empty($autor) || empty($titulo)) {
                return response()->json([
                    'error' => 'Tema Dewey, autor y título son requeridos'
                ], 400);
            }

            // Obtener el código Dewey completo
            $tema = TemaDewey::with('subcategoria.categoria')->find($temaId);
            
            if (!$tema) {
                return response()->json([
                    'error' => 'Tema Dewey no encontrado'
                ], 400);
            }

            $codigoDewey = $tema->codigo;
            
            // Generar código Cutter
            $autorNormalizado = $this->normalizarAutor($autor);
            $cutter = $this->calcularCutter($autorNormalizado);
            
            // Obtener primera letra del título (normalizada)
            $tituloNormalizado = $this->normalizarTitulo($titulo);
            $letraTitulo = strtolower(substr($tituloNormalizado, 0, 1));
            
            // Construir signatura topográfica: CDD-CutterTítulo
            $signatura = $codigoDewey . '-' . $cutter . $letraTitulo;
            
            return response()->json([
                'signatura' => $signatura,
                'componentes' => [
                    'codigo_dewey' => $codigoDewey,
                    'cutter' => $cutter,
                    'letra_titulo' => $letraTitulo,
                    'autor_normalizado' => $autorNormalizado,
                    'titulo_normalizado' => $tituloNormalizado
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error al generar signatura topográfica:', [
                'error' => $e->getMessage(),
                'tema_id' => $request->input('tema_id'),
                'autor' => $request->input('autor'),
                'titulo' => $request->input('titulo')
            ]);
            
            return response()->json([
                'error' => 'Error interno al generar la signatura topográfica'
            ], 500);
        }
    }

    /**
     * Normalizar nombre del autor para el cálculo Cutter
     */
    private function normalizarAutor($autor)
    {
        // Remover acentos y caracteres especiales
        $autor = $this->removerAcentos($autor);
        
        // Si tiene formato "Apellido, Nombre", usar solo el apellido
        if (strpos($autor, ',') !== false) {
            $partes = explode(',', $autor);
            $autor = trim($partes[0]);
        } else {
            // Si no hay coma, asumir formato "Nombres Apellidos"
            // Tomar la última palabra como apellido principal
            $palabras = explode(' ', trim($autor));
            if (count($palabras) > 1) {
                // Tomar la última palabra (apellido)
                $autor = end($palabras);
            } else {
                // Si solo hay una palabra, usarla tal como está
                $autor = $palabras[0];
            }
        }
        
        // Capitalizar primera letra
        return ucfirst(strtolower($autor));
    }

    /**
     * Normalizar título para obtener la primera letra
     */
    private function normalizarTitulo($titulo)
    {
        // Remover artículos iniciales comunes
        $articulos = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'the', 'a', 'an'];
        
        $titulo = trim($titulo);
        $palabras = explode(' ', strtolower($titulo));
        
        // Si la primera palabra es un artículo, usar la segunda
        if (count($palabras) > 1 && in_array($palabras[0], $articulos)) {
            $titulo = $palabras[1];
        } else {
            $titulo = $palabras[0];
        }
        
        return $this->removerAcentos($titulo);
    }

    /**
     * Calcular código Cutter basado en el algoritmo Cutter-Sanborn
     */
    private function calcularCutter($autor)
    {
        $autor = strtolower($autor);
        $primeraLetra = strtoupper(substr($autor, 0, 1));
        
        // Si no existe la letra en la tabla, usar un valor por defecto
        if (!isset(self::$cutterTable[$primeraLetra])) {
            return $primeraLetra . '001';
        }
        
        $tabla = self::$cutterTable[$primeraLetra];
        
        // Buscar la mejor coincidencia en la tabla
        $mejorCoincidencia = '';
        $mejorValor = 1;
        
        foreach ($tabla as $patron => $valor) {
            $patronLower = strtolower($patron);
            if (strpos($autor, $patronLower) === 0) {
                if (strlen($patron) > strlen($mejorCoincidencia)) {
                    $mejorCoincidencia = $patron;
                    $mejorValor = $valor;
                }
            }
        }
        
        // Si no se encontró coincidencia exacta, usar la primera letra
        if (empty($mejorCoincidencia)) {
            $mejorValor = $tabla[$primeraLetra] ?? 1;
        }
        
        // Formatear el número con ceros a la izquierda (3 dígitos)
        return $primeraLetra . str_pad($mejorValor, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Remover acentos y caracteres especiales
     */
    private function removerAcentos($texto)
    {
        $acentos = [
            'á' => 'a', 'à' => 'a', 'ä' => 'a', 'â' => 'a', 'ā' => 'a', 'ã' => 'a',
            'é' => 'e', 'è' => 'e', 'ë' => 'e', 'ê' => 'e', 'ē' => 'e',
            'í' => 'i', 'ì' => 'i', 'ï' => 'i', 'î' => 'i', 'ī' => 'i',
            'ó' => 'o', 'ò' => 'o', 'ö' => 'o', 'ô' => 'o', 'ō' => 'o', 'õ' => 'o',
            'ú' => 'u', 'ù' => 'u', 'ü' => 'u', 'û' => 'u', 'ū' => 'u',
            'ñ' => 'n',
            'Á' => 'A', 'À' => 'A', 'Ä' => 'A', 'Â' => 'A', 'Ā' => 'A', 'Ã' => 'A',
            'É' => 'E', 'È' => 'E', 'Ë' => 'E', 'Ê' => 'E', 'Ē' => 'E',
            'Í' => 'I', 'Ì' => 'I', 'Ï' => 'I', 'Î' => 'I', 'Ī' => 'I',
            'Ó' => 'O', 'Ò' => 'O', 'Ö' => 'O', 'Ô' => 'O', 'Ō' => 'O', 'Õ' => 'O',
            'Ú' => 'U', 'Ù' => 'U', 'Ü' => 'U', 'Û' => 'U', 'Ū' => 'U',
            'Ñ' => 'N'
        ];
        
        return strtr($texto, $acentos);
    }

    /**
     * Validar formato de signatura topográfica
     */
    public function validarSignatura(Request $request)
    {
        try {
            $signatura = $request->input('signatura', '');
            
            if (empty($signatura)) {
                return response()->json([
                    'valida' => false,
                    'error' => 'La signatura topográfica es requerida'
                ]);
            }

            // Patrón para validar formato: CDD-CutterTítulo
            // Ejemplo: 900-G216h
            $patron = '/^(\d{3})-([A-Z]\d{3})([a-z])$/';
            
            if (preg_match($patron, $signatura, $matches)) {
                return response()->json([
                    'valida' => true,
                    'componentes' => [
                        'codigo_dewey' => $matches[1],
                        'cutter' => $matches[2],
                        'letra_titulo' => $matches[3]
                    ]
                ]);
            } else {
                return response()->json([
                    'valida' => false,
                    'error' => 'Formato inválido. Use el formato: CDD-CutterTítulo (ej: 900-G216h)'
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Error al validar signatura topográfica:', [
                'error' => $e->getMessage(),
                'signatura' => $request->input('signatura')
            ]);
            
            return response()->json([
                'valida' => false,
                'error' => 'Error interno al validar la signatura'
            ]);
        }
    }
    /**
     * Generar y guardar signatura topográfica para un libro
     */
    public function generarYGuardarSignatura($libroId, $autorId, $temaId, $titulo)
    {
        try {
            // Obtener datos del autor
            $autor = Autor::find($autorId);
            if (!$autor) {
                throw new \Exception('Autor no encontrado');
            }

            // Obtener el código Dewey completo
            $tema = TemaDewey::with('subcategoria.categoria')->find($temaId);
            if (!$tema) {
                throw new \Exception('Tema Dewey no encontrado');
            }

            $codigoDewey = $tema->codigo;
            
            // Generar código Cutter usando el apellido del autor
            $autorNormalizado = $this->normalizarAutor($autor->apellidos);
            $cutter = $this->calcularCutter($autorNormalizado);
            
            // Obtener primera letra del título (normalizada)
            $tituloNormalizado = $this->normalizarTitulo($titulo);
            $letraTitulo = strtolower(substr($tituloNormalizado, 0, 1));
            
            // Construir signatura topográfica: CDD-CutterTítulo
            $signatura = $codigoDewey . '-' . $cutter . $letraTitulo;
            
            // Actualizar el libro con la signatura generada
            $libro = Libro::find($libroId);
            if (!$libro) {
                throw new \Exception('Libro no encontrado');
            }

            $libro->sign_top = $signatura;
            $libro->save();

            Log::info('Signatura topográfica generada y guardada:', [
                'libro_id' => $libroId,
                'signatura' => $signatura,
                'componentes' => [
                    'codigo_dewey' => $codigoDewey,
                    'cutter' => $cutter,
                    'letra_titulo' => $letraTitulo
                ]
            ]);

            return $signatura;

        } catch (\Exception $e) {
            Log::error('Error al generar y guardar signatura topográfica:', [
                'error' => $e->getMessage(),
                'libro_id' => $libroId,
                'autor_id' => $autorId,
                'tema_id' => $temaId,
                'titulo' => $titulo
            ]);
            
            throw $e;
        }
    }

    /**
     * Actualizar signatura topográfica de un libro existente
     */
    public function actualizarSignatura($libroId, $autorId, $temaId, $titulo)
    {
        return $this->generarYGuardarSignatura($libroId, $autorId, $temaId, $titulo);
    }
}