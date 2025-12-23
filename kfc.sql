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

-- Data exporting was unselected.

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

-- Data exporting was unselected.

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

-- Data exporting was unselected.

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

-- Data exporting was unselected.

-- Dumping structure for table kfc_scm.items
CREATE TABLE IF NOT EXISTS `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `itemName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `minStockLevel` int NOT NULL DEFAULT '10',
  `maxStockLevel` int NOT NULL DEFAULT '100',
  `safetyStock` decimal(10,2) DEFAULT NULL,
  `leadTimeDays` int DEFAULT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_ed4485e4da7cc242cf46db2e3a` (`sku`),
  KEY `IDX_items_safetyStock` (`safetyStock`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table kfc_scm.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f6d54f95c31b73fb1bdd8e91d0` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

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

-- Data exporting was unselected.

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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

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

-- Data exporting was unselected.

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

-- Data exporting was unselected.

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
  `effectiveFrom` date DEFAULT NULL,
  `effectiveTo` date DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_5c1008482d719f3e1dac4c07e9` (`supplierId`,`itemId`),
  KEY `IDX_ac68828664c613d8006342ec8b` (`supplierId`),
  KEY `IDX_77db74f768112721851626a2a9` (`itemId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

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

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
