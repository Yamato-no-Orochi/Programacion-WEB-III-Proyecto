-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-12-2025 a las 08:38:31
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `kjpop_store`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

CREATE TABLE `carrito` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `agregado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalles_pedido`
--

CREATE TABLE `detalles_pedido` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalles_pedido`
--

INSERT INTO `detalles_pedido` (`id`, `pedido_id`, `producto_id`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(1, 1, 1, 2, 45.00, 90.00),
(2, 2, 2, 1, 12.50, 12.50),
(3, 3, 6, 1, 49.99, 49.99),
(4, 4, 7, 1, 45.99, 45.99),
(5, 4, 6, 1, 49.99, 49.99);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','procesando','enviado','entregado','cancelado') DEFAULT 'pendiente',
  `direccion_envio` text DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `usuario_id`, `total`, `estado`, `direccion_envio`, `telefono`, `notas`, `creado_en`, `actualizado_en`) VALUES
(1, 3, 100.97, 'entregado', 'Calle Falsa 123, Ciudad', '7771234567', NULL, '2025-12-10 03:51:19', '2025-12-10 03:51:19'),
(2, 6, 58.49, 'enviado', 'Avenida Real 456', '7777654321', NULL, '2025-12-10 03:51:19', '2025-12-10 03:51:19'),
(3, 2, 49.99, 'pendiente', '111111', '1111', '111111111', '2025-12-10 05:27:18', '2025-12-10 05:27:18'),
(4, 2, 95.98, 'pendiente', '45453', '4452', '43453453', '2025-12-10 05:28:26', '2025-12-10 05:28:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `categoria` enum('K-pop','J-pop','Merchandise','Álbum') NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `descripcion` text DEFAULT NULL,
  `imagen_url` varchar(500) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `eliminado` tinyint(1) DEFAULT 0,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `categoria`, `precio`, `stock`, `descripcion`, `imagen_url`, `activo`, `eliminado`, `creado_en`) VALUES
(1, 'Álbum BTS - MAP OF THE SOUL', 'K-pop', 45.00, 50, 'Álbum oficial de BTS', NULL, 1, 0, '2025-12-09 23:19:48'),
(2, 'Poster TWICE', 'Merchandise', 12.50, 100, 'Poster tamaño A3', NULL, 1, 0, '2025-12-09 23:19:48'),
(3, 'CD AKB48 - Best Hits', 'J-pop', 32.75, 30, 'CD con los mejores éxitos', NULL, 1, 0, '2025-12-09 23:19:48'),
(4, 'Llavero BLACKPINK', 'Merchandise', 8.99, 200, 'Llavero oficial BLACKPINK', NULL, 1, 0, '2025-12-09 23:19:48'),
(5, 'Álbum BTS - MAP OF THE SOUL', 'K-pop', 0.12, 10, 'sss', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqDxJVD9ZkfrnOpRVsFpiDHF-E5YBHH1Ze1Q&s', 1, 0, '2025-12-10 03:34:45'),
(6, 'Álbum BTS - Map of the Soul: 7', 'K-pop', 49.99, 48, 'Edición especial incluye fotobook y photocards', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop', 1, 0, '2025-12-10 03:51:19'),
(7, 'Álbum BLACKPINK - THE ALBUM', 'K-pop', 45.99, 34, 'Primer álbum completo de BLACKPINK', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop', 1, 0, '2025-12-10 03:51:19'),
(8, 'Poster TWICE Formula of Love', 'Merchandise', 12.50, 200, 'Poster oficial tamaño A2', 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w-400&h=400&fit=crop', 1, 0, '2025-12-10 03:51:19'),
(9, 'Llavero BTS TinyTan', 'Merchandise', 8.99, 150, 'Llavero oficial de TinyTan', NULL, 1, 0, '2025-12-10 03:51:19'),
(10, 'Photocard Set - Stray Kids', 'Merchandise', 25.00, 80, 'Set de 8 photocards aleatorias', NULL, 1, 0, '2025-12-10 03:51:19'),
(11, 'Álbum AKB48 - Best Hits', 'J-pop', 39.99, 40, 'Grandes éxitos de AKB48', NULL, 1, 0, '2025-12-10 03:51:19'),
(12, 'CD Kenshi Yonezu - Stray Sheep', 'J-pop', 34.99, 30, 'Álbum más reciente', NULL, 1, 0, '2025-12-10 03:51:19'),
(13, 'Poster Official Hige Dandism', 'Merchandise', 11.99, 120, 'Poster promocional', NULL, 1, 0, '2025-12-10 03:51:19'),
(14, 'Llavero Vocaloid - Hatsune Miku', 'Merchandise', 9.99, 100, 'Llavero coleccionable', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop', 1, 0, '2025-12-10 03:51:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','vendedor','cliente') DEFAULT 'cliente',
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `activo`, `creado_en`) VALUES
(2, 'dsd', 'alejandrorex.condarcopapucrack@gmail.com', '$2b$10$88CPoIQnzooc8IXYsYrHBeTltRohjZq1ToJ0vXXuiMMTCxhuQgpS.', 'admin', 1, '2025-12-10 01:34:58'),
(3, 'Cliente Demo', 'cliente@kjpop.com', '$2a$10$TuHashDePrueba123456789', 'cliente', 1, '2025-12-10 03:19:09'),
(6, 'Cliente Uno', 'cliente1@kjpop.com', '$2b$10$ylTfgv9yoPYGLSNrFtY9yeQOulI31FLFz8pFv6yWtYphyDvXZFCZu', 'cliente', 1, '2025-12-10 03:51:19'),
(7, 'Cliente Dos', 'cliente2@kjpop.com', '$2b$10$ylTfgv9yoPYGLSNrFtY9yeQOulI31FLFz8pFv6yWtYphyDvXZFCZu', 'cliente', 1, '2025-12-10 03:51:19'),
(8, 'Fan K-pop', 'fan@kjpop.com', '$2b$10$ylTfgv9yoPYGLSNrFtY9yeQOulI31FLFz8pFv6yWtYphyDvXZFCZu', 'cliente', 1, '2025-12-10 03:51:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `pedido_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id`, `producto_id`, `usuario_id`, `cantidad`, `total`, `fecha`, `pedido_id`) VALUES
(1, 6, 2, 1, 49.99, '2025-12-10 05:27:18', 3),
(2, 7, 2, 1, 45.99, '2025-12-10 05:28:26', 4),
(3, 6, 2, 1, 49.99, '2025-12-10 05:28:26', 4);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`,`producto_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `producto_id` (`producto_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `pedido_id` (`pedido_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `carrito_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  ADD CONSTRAINT `detalles_pedido_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  ADD CONSTRAINT `detalles_pedido_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `ventas_ibfk_3` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
