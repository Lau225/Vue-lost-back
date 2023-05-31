/*
 Navicat Premium Data Transfer

 Source Server         : LostAndFound
 Source Server Type    : MySQL
 Source Server Version : 80027
 Source Host           : localhost:3306
 Source Schema         : lost

 Target Server Type    : MySQL
 Target Server Version : 80027
 File Encoding         : 65001

 Date: 31/05/2023 20:30:48
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin
-- ----------------------------
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `stuN` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `isverify` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `phone` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `class` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `college` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `role` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `stuN`(`stuN`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of admin
-- ----------------------------
INSERT INTO `admin` VALUES (1, '201911701222', '111', '刘', '1', '15913193664', '软件1192', '数计院', '1');
INSERT INTO `admin` VALUES (2, '2', '2', '2', '1', '2', '2', '2', '2');
INSERT INTO `admin` VALUES (3, '1', '1', '小胖', '1', '1', '1', '1', '3');

-- ----------------------------
-- Table structure for claimthings
-- ----------------------------
DROP TABLE IF EXISTS `claimthings`;
CREATE TABLE `claimthings`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `thingName` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `claimerName` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `claimerNumber` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 24 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of claimthings
-- ----------------------------
INSERT INTO `claimthings` VALUES (1, '1', '2', '2', '不同意');
INSERT INTO `claimthings` VALUES (2, '苹果', '2', '2', '不同意');
INSERT INTO `claimthings` VALUES (3, '苹果', '小胖', '1', '确认');
INSERT INTO `claimthings` VALUES (4, '康老板', '刘', '201911701222', '不同意');
INSERT INTO `claimthings` VALUES (5, '1', '刘', '201911701222', '不同意');
INSERT INTO `claimthings` VALUES (6, '康老板', '刘', '201911701222', '不同意');
INSERT INTO `claimthings` VALUES (7, '1', '刘', '201911701222', '不同意');
INSERT INTO `claimthings` VALUES (8, '康老板', '刘', '201911701222', '确认');
INSERT INTO `claimthings` VALUES (9, '1', '刘', '201911701222', '待招领');

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `comment` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `pickerName` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comments
-- ----------------------------
INSERT INTO `comments` VALUES (1, '数学之美', '刘', '/static/QQ浏览器截图20211108224907.png');

-- ----------------------------
-- Table structure for lostthings
-- ----------------------------
DROP TABLE IF EXISTS `lostthings`;
CREATE TABLE `lostthings`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `type` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `number` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `detail` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `place` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `date` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `picker` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of lostthings
-- ----------------------------
INSERT INTO `lostthings` VALUES (1, '苹果', '水果', '201911701222', '一个红苹果', '/static/微信截图_20230530104221.png', '操场', '2023-05-02', '刘', '确认');
INSERT INTO `lostthings` VALUES (3, '1', '1', '1', '1', '/static/QQ浏览器截图20211108224907.png', '1', '2023-05-05', '小胖', '招领中');
INSERT INTO `lostthings` VALUES (4, '康老板', '动物', '2', '我', '/static/QQ浏览器截图20211108234226.png', '23', '2023-05-04', '2', '确认');
INSERT INTO `lostthings` VALUES (5, '洋娃娃', '玩具', '201911701222', '23131321312312', '/static/QQ浏览器截图20211116135345.png', '操场', '2023-05-04', '刘', '待招领');

-- ----------------------------
-- Table structure for lostthings_user
-- ----------------------------
DROP TABLE IF EXISTS `lostthings_user`;
CREATE TABLE `lostthings_user`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `detail` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `number` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `evidence` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of lostthings_user
-- ----------------------------
INSERT INTO `lostthings_user` VALUES (1, '1', '1111', '201911701222', '招领中', '/static/QQ浏览器截图20211108232600.png');

-- ----------------------------
-- Table structure for replycomments
-- ----------------------------
DROP TABLE IF EXISTS `replycomments`;
CREATE TABLE `replycomments`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `comment` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '要回复的评论',
  `pickerName` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '要回复的回复人的名字',
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '回复人名字',
  `value` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '回复的评论',
  `thingname` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of replycomments
-- ----------------------------
INSERT INTO `replycomments` VALUES (1, '这是一个红苹果', '刘', '刘', '哈哈哈哈哈哈', '苹果');

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `back` int(0) NULL DEFAULT NULL,
  `super` int(0) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of role
-- ----------------------------
INSERT INTO `role` VALUES (1, 1, 1);
INSERT INTO `role` VALUES (2, 0, 0);
INSERT INTO `role` VALUES (3, 1, 0);

SET FOREIGN_KEY_CHECKS = 1;
