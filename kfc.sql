-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for kfc_scm
CREATE DATABASE IF NOT EXISTS `kfc_scm` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `kfc_scm`;

-- Dumping structure for table kfc_scm.goods_receipts
CREATE TABLE IF NOT EXISTS `goods_receipts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grnNumber` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `poId` int NOT NULL,
  `receivedDate` datetime NOT NULL,
  `receivedBy` int DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_a4bea96567327d364aadf77859` (`grnNumber`),
  KEY `FK_ce16e0f721f4f895e10199f3351` (`poId`),
  KEY `FK_95cbd9e1a9b8ec9c4309b2f4af2` (`receivedBy`),
  CONSTRAINT `FK_95cbd9e1a9b8ec9c4309b2f4af2` FOREIGN KEY (`receivedBy`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_ce16e0f721f4f895e10199f3351` FOREIGN KEY (`poId`) REFERENCES `purchase_orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table kfc_scm.goods_receipts: ~4 rows (approximately)
INSERT INTO `goods_receipts` (`id`, `grnNumber`, `poId`, `receivedDate`, `receivedBy`, `createdAt`, `deletedAt`) VALUES
	(1, 'GRN-20231220-001', 1, '2025-12-20 17:37:55', 3, '2025-12-20 17:37:55.829037', NULL),
	(2, 'GRN-20231218-002', 2, '2025-12-20 17:37:55', 3, '2025-12-20 17:37:55.829037', NULL),
	(3, 'GRN-1766394822880-PO-13', 13, '2025-12-22 07:00:00', 3, '2025-12-22 16:13:42.884513', NULL),
	(4, 'GRN-1766394836692-PO-12', 12, '2025-12-22 07:00:00', 3, '2025-12-22 16:13:56.694582', NULL),
	(5, 'GRN-1766395140547-PO-1766391797710', 6, '2025-12-22 07:00:00', 3, '2025-12-22 16:19:00.549121', NULL);

-- Dumping structure for table kfc_scm.goods_receipt_items
CREATE TABLE IF NOT EXISTS `goods_receipt_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grnId` int NOT NULL,
  `itemId` int NOT NULL,
  `batchNo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiryDate` datetime(6) NOT NULL,
  `receivedQty` int NOT NULL,
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_7a618ff0e133f6c4533cf36e87f` (`grnId`),
  KEY `FK_dbde794826e06a9d408c7949e6a` (`itemId`),
  CONSTRAINT `FK_7a618ff0e133f6c4533cf36e87f` FOREIGN KEY (`grnId`) REFERENCES `goods_receipts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_dbde794826e06a9d408c7949e6a` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`),
  CONSTRAINT `goods_receipt_items_chk_1` CHECK ((`receivedQty` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table kfc_scm.goods_receipt_items: ~4 rows (approximately)
INSERT INTO `goods_receipt_items` (`id`, `grnId`, `itemId`, `batchNo`, `expiryDate`, `receivedQty`, `deletedAt`) VALUES
	(1, 1, 1, 'BATCH-CHK-20231201', '2024-06-01 00:00:00.000000', 500, NULL),
	(2, 2, 3, 'BATCH-COKE-20231020', '2024-04-20 00:00:00.000000', 10, NULL),
	(3, 3, 1, '123', '2025-12-31 07:00:00.000000', 10, NULL),
	(4, 4, 3, '100', '2026-01-03 07:00:00.000000', 100, NULL),
	(5, 5, 3, 'BEV-22122025', '2025-12-28 07:00:00.000000', 100, NULL);

-- Dumping structure for table kfc_scm.inventory_batches
CREATE TABLE IF NOT EXISTS `inventory_batches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `itemId` int NOT NULL,
  `batchNo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiryDate` datetime(6) NOT NULL,
  `quantityOnHand` int NOT NULL DEFAULT '0',
  `temperature` float DEFAULT NULL,
  `unitCost` decimal(15,2) DEFAULT NULL,
  `status` enum('in_stock','low_stock','out_of_stock','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'in_stock',
  `storeId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_42c4104ea1e6abba3d7dcc7f7c` (`storeId`,`batchNo`),
  KEY `FK_c9ed1acce356a32720c52671826` (`itemId`),
  KEY `IDX_batches_unitCost` (`unitCost`),
  CONSTRAINT `FK_c9ed1acce356a32720c52671826` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`),
  CONSTRAINT `FK_db4b81ed7d2976844d016b1556f` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`),
  CONSTRAINT `inventory_batches_chk_1` CHECK ((`quantityOnHand` >= 0)),
  CONSTRAINT `inventory_batches_chk_2` CHECK (((`temperature` is null) or (`temperature` between -(30) and 50)))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table kfc_scm.inventory_batches: ~7 rows (approximately)
INSERT INTO `inventory_batches` (`id`, `itemId`, `batchNo`, `expiryDate`, `quantityOnHand`, `temperature`, `unitCost`, `status`, `storeId`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
	(1, 1, 'CHK-20231201', '2024-06-01 00:00:00.000000', 390, -4.5, 10000.00, 'in_stock', 1, '2025-12-20 17:37:55.840968', '2025-12-23 22:11:30.000000', NULL),
	(2, 2, 'POT-20231115', '2024-11-15 00:00:00.000000', 200, -3.2, 10000.00, 'in_stock', 1, '2025-12-20 17:37:55.840968', '2025-12-23 22:11:30.000000', NULL),
	(3, 3, 'COKE-20231020', '2024-04-20 00:00:00.000000', 0, -10, 10000.00, 'out_of_stock', 1, '2025-12-20 17:37:55.840968', '2025-12-23 11:36:01.217222', NULL),
	(4, 4, 'VEG-20231225', '2023-12-30 00:00:00.000000', 5, 3.5, 10000.00, 'low_stock', 1, '2025-12-20 17:37:55.840968', '2025-12-23 22:11:30.000000', NULL),
	(5, 1, 'CHK-31122025', '2025-12-31 07:00:00.000000', 10, -4.4, 200000.00, 'in_stock', 1, '2025-12-22 16:13:42.892574', '2025-12-23 22:11:30.000000', NULL),
	(6, 3, 'BEV-03012026', '2026-01-03 07:00:00.000000', 20, 4.1, 10000.00, 'low_stock', 1, '2025-12-22 16:13:56.707335', '2025-12-23 22:11:30.000000', NULL),
	(7, 3, 'BEV-22122025', '2025-12-28 07:00:00.000000', 0, -10, 10000.00, 'out_of_stock', 1, '2025-12-22 16:19:00.554065', '2025-12-23 17:57:07.000000', NULL);

-- Dumping structure for table kfc_scm.inventory_transactions
CREATE TABLE IF NOT EXISTS `inventory_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `batchId` int NOT NULL,
  `itemId` int NOT NULL,
  `transactionType` enum('RECEIPT','ISSUE','ADJUSTMENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `referenceType` enum('PO','GRN','ADJUSTMENT','SALES') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `referenceId` int DEFAULT NULL,
  `createdBy` int DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_95d7efce048d5dcb6d9aa59a248` (`batchId`),
  KEY `FK_d027ed40e39e81b95d21a3e8c98` (`itemId`),
  KEY `FK_8927d776cb7bd98e563a51b2a26` (`createdBy`),
  CONSTRAINT `FK_8927d776cb7bd98e563a51b2a26` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_95d7efce048d5dcb6d9aa59a248` FOREIGN KEY (`batchId`) REFERENCES `inventory_batches` (`id`),
  CONSTRAINT `FK_d027ed40e39e81b95d21a3e8c98` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table kfc_scm.inventory_transactions: ~11 rows (approximately)
INSERT INTO `inventory_transactions` (`id`, `batchId`, `itemId`, `transactionType`, `quantity`, `referenceType`, `referenceId`, `createdBy`, `createdAt`) VALUES
	(1, 1, 1, 'RECEIPT', 500, 'GRN', 1, 3, '2025-12-20 17:37:55.846923'),
	(2, 2, 2, 'RECEIPT', 200, 'ADJUSTMENT', NULL, 3, '2025-12-20 17:37:55.846923'),
	(3, 3, 3, 'RECEIPT', 10, 'GRN', 2, 3, '2025-12-20 17:37:55.846923'),
	(4, 4, 4, 'RECEIPT', 5, 'ADJUSTMENT', NULL, 3, '2025-12-20 17:37:55.846923'),
	(5, 5, 1, 'RECEIPT', 10, 'GRN', 3, 3, '2025-12-22 16:13:42.902788'),
	(6, 6, 3, 'RECEIPT', 100, 'GRN', 4, 3, '2025-12-22 16:13:56.714991'),
	(7, 7, 3, 'RECEIPT', 100, 'GRN', 5, 3, '2025-12-22 16:19:00.560267'),
	(8, 1, 1, 'ISSUE', 100, 'SALES', 2, 2, '2025-12-22 16:48:19.740429'),
	(9, 3, 3, 'ISSUE', -10, 'SALES', 3, 2, '2025-12-22 16:55:10.066446'),
	(10, 7, 3, 'ISSUE', -10, 'SALES', 4, 2, '2025-12-22 16:57:35.359824'),
	(11, 7, 3, 'ISSUE', -10, 'SALES', 5, 2, '2025-12-22 16:57:59.646128');

-- Dumping structure for table kfc_scm.items
CREATE TABLE IF NOT EXISTS `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `itemName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `minStockLevel` int NOT NULL DEFAULT '10',
  `maxStockLevel` int NOT NULL DEFAULT '100',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `safestock` int NOT NULL DEFAULT '50',
  `storageType` enum('cold','frozen') COLLATE utf8mb4_unicode_ci DEFAULT 'cold',
  `minTemperature` float DEFAULT '2',
  `maxTemperature` float DEFAULT '8',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_ed4485e4da7cc242cf46db2e3a` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table kfc_scm.items: ~4 rows (approximately)
INSERT INTO `items` (`id`, `itemName`, `sku`, `category`, `unit`, `minStockLevel`, `maxStockLevel`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`, `safestock`, `storageType`, `minTemperature`, `maxTemperature`) VALUES
	(1, 'Frozen Chicken Wings', 'CHK-WINGS-001', 'Meat', 'kg', 100, 1000, 1, '2025-12-20 17:37:55.809886', '2025-12-23 21:36:40.249019', NULL, 300, 'frozen', -10, 3),
	(2, 'French Fries (Shoestring)', 'POT-FRIES-001', 'Frozen', 'kg', 50, 200, 1, '2025-12-20 17:37:55.809886', '2025-12-23 21:36:41.237781', NULL, 100, 'frozen', -10, 3),
	(3, 'Coca Cola Syrup', 'BEV-COKE-001', 'Beverage', 'box', 30, 200, 1, '2025-12-20 17:37:55.809886', '2025-12-23 18:26:25.000000', NULL, 50, 'cold', 2, 8),
	(4, 'Fresh Iceberg Lettuce', 'VEG-LET-001', 'Vegetables', 'kg', 10, 30, 1, '2025-12-20 17:37:55.809886', '2025-12-20 17:37:55.809886', NULL, 0, 'cold', 2, 8);

-- Dumping structure for table kfc_scm.purchase_orders
CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderDate` datetime NOT NULL,
  `expectedDeliveryDate` datetime(6) DEFAULT NULL,
  `status` enum('draft','pending_approval','approved','sent','confirmed','delivered','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `totalAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `supplierId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `storeId` int NOT NULL,
  `poNumber` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `approvedBy` int DEFAULT NULL,
  `approvedAt` datetime(6) DEFAULT NULL,
  `rejectionReason` text COLLATE utf8mb4_unicode_ci,
  `confirmedBy` int DEFAULT NULL,
  `confirmedAt` datetime(6) DEFAULT NULL,
  `actualDeliveryDate` datetime(6) DEFAULT NULL,
  `supplierNotes` text COLLATE utf8mb4_unicode_ci,
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_2e0fc7a6605393a9bd691cdceb` (`poNumber`),
  KEY `FK_0c3ff892a9f2ed16f59d31cccae` (`supplierId`),
  KEY `FK_33425839ce6c00008f311f2c028` (`storeId`),
  CONSTRAINT `FK_0c3ff892a9f2ed16f59d31cccae` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`),
  CONSTRAINT `FK_33425839ce6c00008f311f2c028` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table kfc_scm.purchase_orders: ~13 rows (approximately)
INSERT INTO `purchase_orders` (`id`, `orderDate`, `expectedDeliveryDate`, `status`, `totalAmount`, `supplierId`, `createdAt`, `updatedAt`, `storeId`, `poNumber`, `notes`, `approvedBy`, `approvedAt`, `rejectionReason`, `confirmedBy`, `confirmedAt`, `actualDeliveryDate`, `supplierNotes`, `deletedAt`) VALUES
	(1, '2025-12-20 17:37:55', '2025-12-22 17:37:55.000000', 'sent', 5000000.00, 1, '2025-12-20 17:37:55.816329', '2025-12-23 12:47:41.538223', 1, 'PO-01', NULL, 2, '2025-12-21 16:02:38.745000', NULL, NULL, NULL, NULL, NULL, NULL),
	(2, '2025-12-18 17:37:55', '2025-12-20 17:37:55.000000', 'delivered', 2500000.00, 2, '2025-12-20 17:37:55.816329', '2025-12-23 11:52:34.116457', 1, 'PO-02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(3, '2025-12-21 07:00:00', '2025-12-25 07:00:00.000000', 'cancelled', 111100.00, 1, '2025-12-21 15:53:22.298966', '2025-12-23 11:52:31.164282', 1, 'PO-03', '', 2, '2025-12-21 16:11:40.560000', 'quá ít', NULL, NULL, NULL, NULL, NULL),
	(4, '2025-12-21 07:00:00', '2025-12-31 07:00:00.000000', 'sent', 1000000.00, 3, '2025-12-21 16:06:14.758986', '2025-12-23 11:52:26.672934', 1, 'PO-04', '', 2, '2025-12-21 16:06:43.284000', NULL, NULL, NULL, NULL, NULL, NULL),
	(5, '2025-12-22 07:00:00', '2026-06-28 07:00:00.000000', 'sent', 2666000.00, 2, '2025-12-22 14:39:42.747101', '2025-12-23 11:52:24.088948', 1, 'PO-05', '', 2, '2025-12-22 14:49:06.588000', NULL, NULL, NULL, NULL, NULL, NULL),
	(6, '2025-12-22 07:00:00', '2025-12-28 07:00:00.000000', 'delivered', 1000000.00, 2, '2025-12-22 15:23:17.728765', '2025-12-23 11:52:20.980461', 1, 'PO-06', '', 2, '2025-12-22 15:30:26.134000', NULL, 3, '2025-12-22 16:16:46.429000', '2025-12-22 16:16:46.429000', NULL, NULL),
	(7, '2025-12-22 15:43:44', '2025-12-31 07:00:00.000000', 'approved', 199000.00, 2, '2025-12-22 15:43:43.674255', '2025-12-23 11:52:17.387436', 1, 'PO-07', 'nhanh', 2, '2025-12-22 15:52:13.019000', NULL, NULL, NULL, NULL, NULL, NULL),
	(8, '2025-12-22 15:43:44', '2025-12-31 07:00:00.000000', 'approved', 1000000.00, 1, '2025-12-22 15:43:43.719445', '2025-12-23 11:52:13.282118', 1, 'PO-08', 'nhanh', 2, '2025-12-22 15:55:48.298000', NULL, NULL, NULL, NULL, NULL, NULL),
	(9, '2025-12-22 15:50:19', '2026-01-02 07:00:00.000000', 'cancelled', 110000000.00, 1, '2025-12-22 15:50:18.530911', '2025-12-23 11:52:06.642536', 1, 'PO-09', 'Tạo từ 2 Stock Request(s)', 2, '2025-12-22 15:53:05.445000', 'nah', NULL, NULL, NULL, NULL, NULL),
	(10, '2025-12-22 15:50:26', '2025-12-31 07:00:00.000000', 'cancelled', 110000000.00, 1, '2025-12-22 15:50:26.195745', '2025-12-23 11:52:02.828179', 1, 'PO-10', 'Tạo từ 2 Stock Request(s)', 2, '2025-12-22 15:53:02.388000', 'nah', NULL, NULL, NULL, NULL, NULL),
	(11, '2025-12-22 15:51:32', '2025-12-26 07:00:00.000000', 'cancelled', 11000000.00, 1, '2025-12-22 15:51:32.337906', '2025-12-22 16:11:21.000000', 1, 'PO-11', 'Tạo từ 2 Stock Request(s)', 2, '2025-12-22 15:52:11.318000', 'không đủ', NULL, NULL, NULL, NULL, NULL),
	(12, '2025-12-22 15:54:36', '2025-12-25 07:00:00.000000', 'delivered', 1000000.00, 2, '2025-12-22 15:54:36.009394', '2025-12-22 16:13:56.000000', 1, 'PO-12', 'Tạo từ 1 Stock Request(s)', 2, '2025-12-22 15:55:16.922000', NULL, 3, '2025-12-22 16:13:05.876000', '2025-12-22 16:13:05.876000', NULL, NULL),
	(13, '2025-12-22 15:54:36', '2025-12-25 07:00:00.000000', 'delivered', 2000000.00, 1, '2025-12-22 15:54:36.052137', '2025-12-22 16:13:42.000000', 1, 'PO-13', 'Tạo từ 1 Stock Request(s)', 2, '2025-12-22 15:55:18.356000', NULL, 3, '2025-12-22 16:10:15.070000', '2025-12-22 16:10:15.070000', NULL, NULL),
	(14, '2025-12-22 23:11:50', '2025-12-26 07:00:00.000000', 'approved', 1000000.00, 2, '2025-12-22 23:11:50.519262', '2025-12-22 23:16:02.000000', 1, 'PO-14', 'Tạo từ 1 Stock Request(s)', 2, '2025-12-22 23:16:02.682000', NULL, NULL, NULL, NULL, NULL, NULL),
	(15, '2025-12-22 23:21:54', '2025-12-31 07:00:00.000000', 'approved', 1000000.00, 2, '2025-12-22 23:21:53.914188', '2025-12-22 23:27:38.000000', 1, 'PO-15', 'Tạo từ 1 Stock Request(s)', 2, '2025-12-22 23:27:38.238000', NULL, NULL, NULL, NULL, NULL, NULL),
	(16, '2025-12-22 23:21:54', '2025-12-31 07:00:00.000000', 'approved', 10000000.00, 1, '2025-12-22 23:21:53.969013', '2025-12-22 23:22:33.000000', 1, 'PO-16', 'Tạo từ 1 Stock Request(s)', 2, '2025-12-22 23:22:33.089000', NULL, NULL, NULL, NULL, NULL, NULL),
	(17, '2025-12-22 23:32:28', '2025-12-31 07:00:00.000000', 'sent', 1000000.00, 1, '2025-12-22 23:32:27.664886', '2025-12-23 13:21:12.000000', 1, 'PO-17', 'Tạo từ 1 Stock Request(s)', 2, '2025-12-22 23:32:37.523000', NULL, NULL, NULL, NULL, NULL, NULL),
	(18, '2025-12-23 12:45:48', '2025-12-31 07:00:00.000000', 'cancelled', 210000000.00, 1, '2025-12-23 12:45:47.627064', '2025-12-23 12:47:17.000000', 1, 'PO-18', 'Tạo từ 1 Stock Request(s)', 2, '2025-12-23 12:47:17.098000', 'nah', NULL, NULL, NULL, NULL, NULL),
	(19, '2025-12-23 12:50:46', '2025-12-27 07:00:00.000000', 'cancelled', 10000.00, 1, '2025-12-23 12:50:46.299540', '2025-12-23 12:51:31.000000', 1, 'PO-19', '100', 2, '2025-12-23 12:51:31.263000', '21312', NULL, NULL, NULL, NULL, NULL),
	(20, '2025-12-23 19:27:24', '2025-12-28 19:27:24.175000', 'sent', 500000.00, 3, '2025-12-23 19:27:24.179272', '2025-12-23 20:03:14.387610', 1, 'PO-20', 'Generated from 1 stock request(s)', 1, '2025-12-23 19:27:24.213000', NULL, NULL, NULL, NULL, NULL, NULL),
	(21, '2025-12-23 20:01:44', '2025-12-28 20:01:43.957000', 'sent', 1000000.00, 2, '2025-12-23 20:01:43.961453', '2025-12-23 20:01:44.000000', 1, 'PO-21', 'Generated from 1 stock request(s)', 1, '2025-12-23 20:01:43.987000', NULL, NULL, NULL, NULL, NULL, NULL);

-- Dumping structure for table kfc_scm.purchase_order_items
CREATE TABLE IF NOT EXISTS `purchase_order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `poId` int NOT NULL,
  `itemId` int NOT NULL,
  `quantity` int NOT NULL,
  `unitPrice` decimal(15,2) NOT NULL,
  `totalAmount` decimal(15,2) NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_303eff42427ac5ccbdc333dedf6` (`poId`),
  KEY `FK_fe5b0e9db9479afaa7320cb836f` (`itemId`),
  CONSTRAINT `FK_303eff42427ac5ccbdc333dedf6` FOREIGN KEY (`poId`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_fe5b0e9db9479afaa7320cb836f` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table kfc_scm.purchase_order_items: ~17 rows (approximately)
INSERT INTO `purchase_order_items` (`id`, `poId`, `itemId`, `quantity`, `unitPrice`, `totalAmount`, `unit`) VALUES
	(1, 1, 1, 100, 50000.00, 5000000.00, 'pcs'),
	(2, 2, 3, 10, 250000.00, 2500000.00, 'pcs'),
	(3, 3, 2, 100, 1111.00, 111100.00, 'pcs'),
	(4, 4, 4, 10, 100000.00, 1000000.00, 'pcs'),
	(5, 5, 1, 100, 10000.00, 1000000.00, 'pcs'),
	(6, 5, 4, 1000, 1666.00, 1666000.00, 'pcs'),
	(7, 6, 3, 100, 10000.00, 1000000.00, 'pcs'),
	(8, 7, 3, 199, 1000.00, 199000.00, 'box'),
	(9, 8, 1, 1000, 1000.00, 1000000.00, 'kg'),
	(10, 9, 1, 100, 100000.00, 10000000.00, 'kg'),
	(11, 9, 1, 1000, 100000.00, 100000000.00, 'kg'),
	(12, 10, 1, 100, 100000.00, 10000000.00, 'kg'),
	(13, 10, 1, 1000, 100000.00, 100000000.00, 'kg'),
	(14, 11, 1, 100, 10000.00, 1000000.00, 'kg'),
	(15, 11, 1, 1000, 10000.00, 10000000.00, 'kg'),
	(16, 12, 3, 100, 10000.00, 1000000.00, 'box'),
	(17, 13, 1, 10, 200000.00, 2000000.00, 'kg'),
	(18, 14, 4, 1000, 1000.00, 1000000.00, 'kg'),
	(19, 15, 2, 100, 10000.00, 1000000.00, 'kg'),
	(20, 16, 1, 1000, 10000.00, 10000000.00, 'kg'),
	(21, 17, 1, 100, 10000.00, 1000000.00, 'kg'),
	(22, 18, 1, 21000, 10000.00, 210000000.00, 'kg'),
	(23, 19, 2, 100, 100.00, 10000.00, 'kg'),
	(24, 20, 4, 100, 5000.00, 500000.00, 'kg'),
	(25, 21, 3, 100, 10000.00, 1000000.00, 'box');

-- Dumping structure for table kfc_scm.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f6d54f95c31b73fb1bdd8e91d0` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table kfc_scm.roles: ~4 rows (approximately)
INSERT INTO `roles` (`id`, `code`, `name`) VALUES
	(1, 'ADMIN', 'System Administrator'),
	(2, 'STORE_MANAGER', 'Store Manager'),
	(3, 'INVENTORY_STAFF', 'Inventory Staff'),
	(4, 'PROCUREMENT_STAFF', 'Procurement Staff');

-- Dumping structure for table kfc_scm.sales_transactions
CREATE TABLE IF NOT EXISTS `sales_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `storeId` int NOT NULL,
  `itemId` int NOT NULL,
  `quantity` int NOT NULL,
  `unitPrice` decimal(15,2) NOT NULL,
  `totalAmount` decimal(15,2) NOT NULL,
  `costPrice` decimal(15,2) DEFAULT NULL,
  `totalCost` decimal(15,2) DEFAULT NULL,
  `grossProfit` decimal(15,2) DEFAULT NULL,
  `saleDate` datetime NOT NULL,
  `createdBy` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_sales_store` (`storeId`),
  KEY `FK_sales_item` (`itemId`),
  KEY `FK_sales_user` (`createdBy`),
  KEY `IDX_sales_saleDate` (`saleDate`),
  CONSTRAINT `FK_6755b51e53df364b2792518d457` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_b28b6800e59e50704ab92a180d3` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`),
  CONSTRAINT `FK_c2d876c0f49cbffc6819de05cdd` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`),
  CONSTRAINT `sales_transactions_chk_1` CHECK ((`quantity` > 0)),
  CONSTRAINT `sales_transactions_chk_2` CHECK ((`unitPrice` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table kfc_scm.sales_transactions: ~4 rows (approximately)
INSERT INTO `sales_transactions` (`id`, `storeId`, `itemId`, `quantity`, `unitPrice`, `totalAmount`, `costPrice`, `totalCost`, `grossProfit`, `saleDate`, `createdBy`, `notes`, `createdAt`, `deletedAt`) VALUES
	(1, 1, 1, 10, 100000.00, 1000000.00, NULL, NULL, NULL, '2025-12-22 07:00:00', 2, NULL, '2025-12-22 16:41:46.159157', NULL),
	(2, 1, 1, 100, 10000.00, 1000000.00, 0.00, 0.00, 1000000.00, '2025-12-22 07:00:00', 2, NULL, '2025-12-22 16:48:19.722071', NULL),
	(3, 1, 3, 10, 10000.00, 100000.00, 0.00, 0.00, 100000.00, '2025-12-22 07:00:00', 2, NULL, '2025-12-22 16:55:10.039724', NULL),
	(4, 1, 3, 10, 10000.00, 100000.00, 10000.00, 100000.00, 0.00, '2025-12-22 07:00:00', 2, NULL, '2025-12-22 16:57:35.342839', NULL),
	(5, 1, 3, 10, 15000.00, 150000.00, 10000.00, 100000.00, 50000.00, '2025-12-22 07:00:00', 2, NULL, '2025-12-22 16:57:59.627291', NULL);

-- Dumping structure for table kfc_scm.stock_requests
CREATE TABLE IF NOT EXISTS `stock_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `storeId` int NOT NULL,
  `itemId` int NOT NULL,
  `requestedQty` int NOT NULL,
  `status` enum('requested','pending_approval','approved','rejected','po_generated','fulfilled','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'requested',
  `priority` enum('low','medium','high') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `requestedBy` int DEFAULT NULL,
  `poId` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_6609c0743d85fbd34941851a64` (`storeId`),
  KEY `IDX_ce7fd1de77d6251ce342e3898c` (`itemId`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table kfc_scm.stock_requests: ~15 rows (approximately)
INSERT INTO `stock_requests` (`id`, `storeId`, `itemId`, `requestedQty`, `status`, `priority`, `requestedBy`, `poId`, `notes`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
	(7, 1, 1, 100, 'cancelled', 'medium', 2, NULL, NULL, '2025-12-22 15:30:52.582856', '2025-12-22 15:33:03.000000', NULL),
	(8, 1, 3, 1000, 'cancelled', 'high', 2, NULL, NULL, '2025-12-22 15:30:59.989569', '2025-12-22 15:33:03.000000', NULL),
	(9, 1, 1, 1000, 'po_generated', 'medium', 2, NULL, NULL, '2025-12-22 15:34:18.864738', '2025-12-22 15:43:43.000000', NULL),
	(10, 1, 3, 199, 'po_generated', 'medium', 2, NULL, NULL, '2025-12-22 15:34:25.807023', '2025-12-22 15:43:43.000000', NULL),
	(11, 1, 1, 1000, 'po_generated', 'high', 2, 16, NULL, '2025-12-22 15:49:35.281744', '2025-12-22 23:21:53.000000', NULL),
	(12, 1, 1, 100, 'po_generated', 'medium', 2, 11, NULL, '2025-12-22 15:49:40.918670', '2025-12-22 15:51:32.000000', NULL),
	(13, 1, 1, 10, 'po_generated', 'medium', 2, 13, NULL, '2025-12-22 15:53:28.221968', '2025-12-22 15:54:36.000000', NULL),
	(14, 1, 3, 100, 'po_generated', 'medium', 2, 12, NULL, '2025-12-22 15:53:34.191245', '2025-12-22 15:54:36.000000', NULL),
	(15, 1, 4, 1000, 'po_generated', 'medium', 2, 14, NULL, '2025-12-22 23:11:23.276048', '2025-12-22 23:11:50.000000', NULL),
	(16, 1, 2, 100, 'po_generated', 'medium', 2, 15, NULL, '2025-12-22 23:20:50.694831', '2025-12-22 23:21:53.000000', NULL),
	(17, 1, 1, 100, 'po_generated', 'medium', 2, 17, NULL, '2025-12-22 23:31:50.818991', '2025-12-22 23:32:27.000000', NULL),
	(18, 1, 1, 1000, 'rejected', 'medium', 2, NULL, '[Rejected: nah]', '2025-12-23 12:43:02.244735', '2025-12-23 12:43:17.000000', NULL),
	(19, 1, 1, 21000, 'po_generated', 'medium', 2, 18, NULL, '2025-12-23 12:45:00.420395', '2025-12-23 12:45:47.000000', NULL),
	(20, 1, 2, 100, 'cancelled', 'medium', 2, NULL, NULL, '2025-12-23 12:48:36.988979', '2025-12-23 12:48:44.000000', NULL),
	(21, 1, 2, 100, 'po_generated', 'medium', 2, 19, NULL, '2025-12-23 12:49:27.895051', '2025-12-23 12:50:46.000000', NULL),
	(22, 1, 3, 70, 'requested', 'medium', NULL, NULL, 'Auto-generated: Safety stock set to 50, current stock: 40', '2025-12-23 18:26:25.881053', '2025-12-23 18:26:25.881053', NULL),
	(23, 1, 4, 30, 'requested', 'high', 2, NULL, 'Express Order - Auto-approved and sent', '2025-12-23 19:24:53.095278', '2025-12-23 19:24:53.095278', NULL),
	(24, 1, 4, 30, 'po_generated', 'high', 2, 20, 'Express Order - Auto-approved and sent', '2025-12-23 19:27:24.167009', '2025-12-23 19:27:24.167000', NULL),
	(25, 1, 3, 70, 'po_generated', 'high', 2, 21, 'Express Order - Auto-approved and sent', '2025-12-23 20:01:43.936148', '2025-12-23 20:01:43.936000', NULL);

-- Dumping structure for table kfc_scm.stores
CREATE TABLE IF NOT EXISTS `stores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_72bdebc754d6a689b3c169cab8` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table kfc_scm.stores: ~1 rows (approximately)
INSERT INTO `stores` (`id`, `code`, `name`, `location`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
	(1, 'KFC-MM-001', 'KFC Mega Market Shop', 'District 2, Ho Chi Minh City', 1, '2025-12-20 17:37:55.778236', '2025-12-20 17:37:55.778236', NULL);

-- Dumping structure for table kfc_scm.suppliers
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactPerson` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leadTimeDays` int NOT NULL DEFAULT '0',
  `reliabilityScore` float NOT NULL DEFAULT '0',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `address` text COLLATE utf8mb4_unicode_ci,
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table kfc_scm.suppliers: ~3 rows (approximately)
INSERT INTO `suppliers` (`id`, `name`, `contactPerson`, `email`, `leadTimeDays`, `reliabilityScore`, `createdAt`, `updatedAt`, `phone`, `isActive`, `address`, `deletedAt`) VALUES
	(1, 'CP Vietnam', 'Mr. A', 'contact@cp.com.vn', 2, 4.8, '2025-12-20 17:37:55.803819', '2025-12-22 23:41:36.200384', '0123456789', 1, 'Số 2, đường 2A, Khu Công nghiệp Biên Hòa II, Phường Long Bình Tân, Thành phố Biên Hòa, Tỉnh Đồng Nai, Việt Nam', NULL),
	(2, 'Coca Cola Beverages', 'Ms. B', 'sales@coke.com.vn', 3, 4.9, '2025-12-20 17:37:55.803819', '2025-12-22 23:42:05.837002', '0123456789', 1, '485 Hanoi Street, Linh Trung Ward, Thu Duc District Ho Chi Minh City', NULL),
	(3, 'Da Lat Veggies', 'Mr. C', 'order@dalatveg.vn', 1, 4.5, '2025-12-20 17:37:55.803819', '2025-12-22 23:42:27.161532', '0123456789', 1, '12/8 Nguyen An Ninh', NULL);

-- Dumping structure for table kfc_scm.supplier_items
CREATE TABLE IF NOT EXISTS `supplier_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supplierId` int NOT NULL,
  `itemId` int NOT NULL,
  `unitPrice` decimal(15,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VND',
  `minOrderQty` int NOT NULL DEFAULT '1',
  `leadTimeDays` int DEFAULT NULL,
  `isPreferred` tinyint(1) NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_5c1008482d719f3e1dac4c07e9` (`supplierId`,`itemId`),
  KEY `IDX_ac68828664c613d8006342ec8b` (`supplierId`),
  KEY `IDX_77db74f768112721851626a2a9` (`itemId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table kfc_scm.supplier_items: ~3 rows (approximately)
INSERT INTO `supplier_items` (`id`, `supplierId`, `itemId`, `unitPrice`, `currency`, `minOrderQty`, `leadTimeDays`, `isPreferred`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
	(1, 1, 1, 200000.00, 'VND', 50, 3, 1, 1, '2025-12-21 13:47:26.401479', '2025-12-22 23:44:06.089245', NULL),
	(2, 1, 2, 15000.00, 'VND', 20, 5, 0, 1, '2025-12-21 13:47:26.401479', '2025-12-22 23:45:19.799879', NULL),
	(3, 2, 3, 10000.00, 'VND', 100, 7, 0, 1, '2025-12-21 13:47:26.401479', '2025-12-22 23:44:40.217260', NULL),
	(4, 3, 4, 5000.00, 'VND', 100, 7, 0, 1, '2025-12-21 13:47:26.401479', '2025-12-23 19:27:07.867455', NULL);

-- Dumping structure for table kfc_scm.temperature_logs
CREATE TABLE IF NOT EXISTS `temperature_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `batchId` int NOT NULL,
  `temperature` float NOT NULL,
  `recordedAt` datetime NOT NULL,
  `isAlert` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `batchId` (`batchId`),
  CONSTRAINT `temperature_logs_ibfk_1` FOREIGN KEY (`batchId`) REFERENCES `inventory_batches` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table kfc_scm.temperature_logs: ~0 rows (approximately)
INSERT INTO `temperature_logs` (`id`, `batchId`, `temperature`, `recordedAt`, `isAlert`, `createdAt`) VALUES
	(1, 1, -1.9, '2025-12-23 22:08:00', 0, '2025-12-23 22:08:00'),
	(2, 1, -1.5, '2025-12-23 22:08:00', 0, '2025-12-23 22:08:00'),
	(3, 2, -2.2, '2025-12-23 22:08:00', 0, '2025-12-23 22:08:00'),
	(4, 2, -5.4, '2025-12-23 22:08:00', 0, '2025-12-23 22:08:00'),
	(5, 4, 5.2, '2025-12-23 22:08:00', 0, '2025-12-23 22:08:00'),
	(6, 4, 5.2, '2025-12-23 22:08:00', 0, '2025-12-23 22:08:00'),
	(7, 5, -3.1, '2025-12-23 22:08:00', 0, '2025-12-23 22:08:00'),
	(8, 5, -5.4, '2025-12-23 22:08:00', 0, '2025-12-23 22:08:00'),
	(9, 6, 5.7, '2025-12-23 22:08:00', 0, '2025-12-23 22:08:00'),
	(10, 6, 4, '2025-12-23 22:08:00', 0, '2025-12-23 22:08:00'),
	(11, 1, -1.6, '2025-12-23 22:08:30', 0, '2025-12-23 22:08:30'),
	(12, 1, -2.2, '2025-12-23 22:08:30', 0, '2025-12-23 22:08:30'),
	(13, 2, -2.3, '2025-12-23 22:08:30', 0, '2025-12-23 22:08:30'),
	(14, 2, -4.7, '2025-12-23 22:08:30', 0, '2025-12-23 22:08:30'),
	(15, 4, 5.1, '2025-12-23 22:08:30', 0, '2025-12-23 22:08:30'),
	(16, 4, 4.8, '2025-12-23 22:08:30', 0, '2025-12-23 22:08:30'),
	(17, 5, -1.9, '2025-12-23 22:08:30', 0, '2025-12-23 22:08:30'),
	(18, 5, -3.1, '2025-12-23 22:08:30', 0, '2025-12-23 22:08:30'),
	(19, 6, 4.1, '2025-12-23 22:08:30', 0, '2025-12-23 22:08:30'),
	(20, 6, 6.4, '2025-12-23 22:08:30', 0, '2025-12-23 22:08:30'),
	(21, 1, -1.5, '2025-12-23 22:09:00', 0, '2025-12-23 22:09:00'),
	(22, 1, -3.4, '2025-12-23 22:09:00', 0, '2025-12-23 22:09:00'),
	(23, 2, -4.8, '2025-12-23 22:09:00', 0, '2025-12-23 22:09:00'),
	(24, 2, -12.6, '2025-12-23 22:09:00', 1, '2025-12-23 22:09:00'),
	(25, 4, 3.9, '2025-12-23 22:09:00', 0, '2025-12-23 22:09:00'),
	(26, 4, 6.2, '2025-12-23 22:09:00', 0, '2025-12-23 22:09:00'),
	(27, 5, -3.2, '2025-12-23 22:09:00', 0, '2025-12-23 22:09:00'),
	(28, 5, -5.2, '2025-12-23 22:09:00', 0, '2025-12-23 22:09:00'),
	(29, 6, 3.4, '2025-12-23 22:09:00', 0, '2025-12-23 22:09:00'),
	(30, 6, 3, '2025-12-23 22:09:00', 0, '2025-12-23 22:09:00'),
	(31, 1, -2, '2025-12-23 22:09:30', 0, '2025-12-23 22:09:30'),
	(32, 1, -5.2, '2025-12-23 22:09:30', 0, '2025-12-23 22:09:30'),
	(33, 2, -4.1, '2025-12-23 22:09:30', 0, '2025-12-23 22:09:30'),
	(34, 2, -4.2, '2025-12-23 22:09:30', 0, '2025-12-23 22:09:30'),
	(35, 4, 3.3, '2025-12-23 22:09:30', 0, '2025-12-23 22:09:30'),
	(36, 4, 4.4, '2025-12-23 22:09:30', 0, '2025-12-23 22:09:30'),
	(37, 5, -2.2, '2025-12-23 22:09:30', 0, '2025-12-23 22:09:30'),
	(38, 5, -4.1, '2025-12-23 22:09:30', 0, '2025-12-23 22:09:30'),
	(39, 6, 6.3, '2025-12-23 22:09:30', 0, '2025-12-23 22:09:30'),
	(40, 6, 5.9, '2025-12-23 22:09:30', 0, '2025-12-23 22:09:30'),
	(41, 1, -4.2, '2025-12-23 22:10:00', 0, '2025-12-23 22:10:00'),
	(42, 1, -2, '2025-12-23 22:10:00', 0, '2025-12-23 22:10:00'),
	(43, 2, -5.4, '2025-12-23 22:10:00', 0, '2025-12-23 22:10:00'),
	(44, 2, -2.5, '2025-12-23 22:10:00', 0, '2025-12-23 22:10:00'),
	(45, 4, 3.7, '2025-12-23 22:10:00', 0, '2025-12-23 22:10:00'),
	(46, 4, 6.7, '2025-12-23 22:10:00', 0, '2025-12-23 22:10:00'),
	(47, 5, -2.9, '2025-12-23 22:10:00', 0, '2025-12-23 22:10:00'),
	(48, 5, -1.5, '2025-12-23 22:10:00', 0, '2025-12-23 22:10:00'),
	(49, 6, 3.8, '2025-12-23 22:10:00', 0, '2025-12-23 22:10:00'),
	(50, 6, 4.4, '2025-12-23 22:10:00', 0, '2025-12-23 22:10:00'),
	(51, 1, -2, '2025-12-23 22:10:30', 0, '2025-12-23 22:10:30'),
	(52, 1, -2.5, '2025-12-23 22:10:30', 0, '2025-12-23 22:10:30'),
	(53, 2, -5.2, '2025-12-23 22:10:30', 0, '2025-12-23 22:10:30'),
	(54, 2, -2.3, '2025-12-23 22:10:30', 0, '2025-12-23 22:10:30'),
	(55, 4, 5.4, '2025-12-23 22:10:30', 0, '2025-12-23 22:10:30'),
	(56, 4, 6.2, '2025-12-23 22:10:30', 0, '2025-12-23 22:10:30'),
	(57, 5, -5.2, '2025-12-23 22:10:30', 0, '2025-12-23 22:10:30'),
	(58, 5, -5, '2025-12-23 22:10:30', 0, '2025-12-23 22:10:30'),
	(59, 6, 5.1, '2025-12-23 22:10:30', 0, '2025-12-23 22:10:30'),
	(60, 6, 4.8, '2025-12-23 22:10:30', 0, '2025-12-23 22:10:30'),
	(61, 1, -4.3, '2025-12-23 22:11:00', 0, '2025-12-23 22:11:00'),
	(62, 1, -1.6, '2025-12-23 22:11:00', 0, '2025-12-23 22:11:00'),
	(63, 2, -4.5, '2025-12-23 22:11:00', 0, '2025-12-23 22:11:00'),
	(64, 2, -3.1, '2025-12-23 22:11:00', 0, '2025-12-23 22:11:00'),
	(65, 4, 6.2, '2025-12-23 22:11:00', 0, '2025-12-23 22:11:00'),
	(66, 4, 5.4, '2025-12-23 22:11:00', 0, '2025-12-23 22:11:00'),
	(67, 5, -4.9, '2025-12-23 22:11:00', 0, '2025-12-23 22:11:00'),
	(68, 5, -2.2, '2025-12-23 22:11:00', 0, '2025-12-23 22:11:00'),
	(69, 6, 13.8, '2025-12-23 22:11:00', 1, '2025-12-23 22:11:00'),
	(70, 6, 6.5, '2025-12-23 22:11:00', 0, '2025-12-23 22:11:00'),
	(71, 1, -2, '2025-12-23 22:11:30', 0, '2025-12-23 22:11:30'),
	(72, 1, -4.5, '2025-12-23 22:11:30', 0, '2025-12-23 22:11:30'),
	(73, 2, -4.2, '2025-12-23 22:11:30', 0, '2025-12-23 22:11:30'),
	(74, 2, -3.2, '2025-12-23 22:11:30', 0, '2025-12-23 22:11:30'),
	(75, 4, 5.4, '2025-12-23 22:11:30', 0, '2025-12-23 22:11:30'),
	(76, 4, 3.5, '2025-12-23 22:11:30', 0, '2025-12-23 22:11:30'),
	(77, 5, -3, '2025-12-23 22:11:30', 0, '2025-12-23 22:11:30'),
	(78, 5, -4.4, '2025-12-23 22:11:30', 0, '2025-12-23 22:11:30'),
	(79, 6, 3.4, '2025-12-23 22:11:30', 0, '2025-12-23 22:11:30'),
	(80, 6, 4.1, '2025-12-23 22:11:30', 0, '2025-12-23 22:11:30');

-- Dumping structure for table kfc_scm.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roleId` int NOT NULL,
  `storeId` int DEFAULT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_fe0bb3f6520ee0469504521e71` (`username`),
  KEY `FK_c82cd4fa8f0ac4a74328abe997a` (`storeId`),
  KEY `FK_368e146b785b574f42ae9e53d5e` (`roleId`),
  CONSTRAINT `FK_368e146b785b574f42ae9e53d5e` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`),
  CONSTRAINT `FK_c82cd4fa8f0ac4a74328abe997a` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table kfc_scm.users: ~6 rows (approximately)
INSERT INTO `users` (`id`, `fullName`, `isActive`, `createdAt`, `updatedAt`, `password_hash`, `roleId`, `storeId`, `username`, `deletedAt`) VALUES
	(1, 'System Admin', 1, '2025-12-20 17:37:55.797280', '2025-12-21 01:06:13.577747', '$2b$10$qwKb4LTrrIE0c/vmTHo2s.YDG9J3sk6hJ750fEAQFs8g7J5BSYj6a', 1, 1, 'admin', NULL),
	(2, 'Manager Duc', 1, '2025-12-20 17:37:55.797280', '2025-12-22 16:56:31.909306', '$2b$10$qwKb4LTrrIE0c/vmTHo2s.YDG9J3sk6hJ750fEAQFs8g7J5BSYj6a', 2, 1, 'mana', NULL),
	(3, 'Inventory Cuong', 1, '2025-12-20 17:37:55.797280', '2025-12-22 16:56:40.357230', '$2b$10$qwKb4LTrrIE0c/vmTHo2s.YDG9J3sk6hJ750fEAQFs8g7J5BSYj6a', 3, 1, 'inven', NULL),
	(4, 'Procurement Giang', 1, '2025-12-20 17:37:55.797280', '2025-12-22 16:56:47.951926', '$2b$10$qwKb4LTrrIE0c/vmTHo2s.YDG9J3sk6hJ750fEAQFs8g7J5BSYj6a', 4, 1, 'pro', NULL),
	(5, 'test', 1, '2025-12-21 01:20:16.527248', '2025-12-21 15:45:49.000000', '$2b$10$V0AKgC3S5E1hPzr68D3MTePsFCjRMuv6.8pmImjruhDTvUtMURv7S', 2, 1, 'test5', '2025-12-21 15:45:49.000000'),
	(6, 'test', 1, '2025-12-22 14:42:44.197155', '2025-12-22 14:42:53.000000', '$2b$10$GliKsFFYFuLw1pg0H/37/OKyLo4CKTSBfSy3.gv9IP0dGgIy99cuC', 1, 1, 'test', '2025-12-22 14:42:53.000000');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
