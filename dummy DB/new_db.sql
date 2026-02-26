-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: college_event_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `event_summary`
--

DROP TABLE IF EXISTS `event_summary`;
/*!50001 DROP VIEW IF EXISTS `event_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `event_summary` AS SELECT 
 1 AS `event_id`,
 1 AS `event_name`,
 1 AS `date`,
 1 AS `venue_name`,
 1 AS `coordinator`,
 1 AS `volunteer_count`,
 1 AS `avg_rating`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `event_id` varchar(5) NOT NULL,
  `event_name` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `venue_id` varchar(5) DEFAULT NULL,
  `expected_attendance` int DEFAULT NULL,
  `budget` int DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `coordinator_id` varchar(5) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`event_id`),
  KEY `venue_id` (`venue_id`),
  KEY `coordinator_id` (`coordinator_id`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`venue_id`),
  CONSTRAINT `events_ibfk_2` FOREIGN KEY (`coordinator_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES ('E001','AI Workshop','Technical','CSE','2026-03-01','10:00:00','V004',180,15000,'Planned','U011',NULL,NULL),('E002','Hackathon','Technical','CSE','2026-03-05','09:00:00','V001',500,50000,'Planned','U011',NULL,NULL),('E003','Cultural Fest','Cultural','All','2026-03-10','16:00:00','V010',1000,100000,'Planned','U014',NULL,NULL),('E004','Robotics Expo','Technical','MECH','2026-03-12','11:00:00','V017',200,20000,'Planned','U015',NULL,NULL),('E005','Seminar on ML','Technical','IT','2026-03-15','10:00:00','V002',150,8000,'Planned','U012',NULL,NULL),('E006','Startup Talk','Seminar','MBA','2026-03-18','14:00:00','V019',220,10000,'Planned','U014',NULL,NULL),('E007','Coding Contest','Technical','CSE','2026-03-20','09:30:00','V013',140,6000,'Planned','U011',NULL,NULL),('E008','Drama Night','Cultural','All','2026-03-22','17:00:00','V008',300,15000,'Planned','U014',NULL,NULL),('E009','Sports Meet','Sports','All','2026-03-25','08:00:00','V010',1200,70000,'Planned','U015',NULL,NULL),('E010','Poster Presentation','Academic','ECE','2026-03-27','11:00:00','V003',120,5000,'Planned','U013',NULL,NULL),('E011','Quiz Competition','Academic','CSE','2026-03-29','10:00:00','V011',100,3000,'Planned','U011',NULL,NULL),('E012','Music Fest','Cultural','All','2026-04-01','18:00:00','V009',600,30000,'Planned','U014',NULL,NULL),('E013','Cloud Workshop','Technical','IT','2026-04-03','10:00:00','V014',140,12000,'Planned','U012',NULL,NULL),('E014','Project Expo','Academic','All','2026-04-05','09:00:00','V001',700,40000,'Planned','U011',NULL,NULL),('E015','Debate','Academic','MBA','2026-04-07','11:00:00','V006',80,2000,'Planned','U014',NULL,NULL),('E016','Guest Lecture','Seminar','ECE','2026-04-09','14:00:00','V002',150,5000,'Planned','U013',NULL,NULL),('E017','Design Contest','Technical','MECH','2026-04-11','10:00:00','V018',120,6000,'Planned','U015',NULL,NULL),('E018','Photography Contest','Cultural','All','2026-04-13','15:00:00','V008',250,4000,'Planned','U014',NULL,NULL),('E019','Tech Talk','Seminar','CSE','2026-04-15','12:00:00','V020',110,3000,'Planned','U011',NULL,NULL),('E020','Placement Training','Academic','All','2026-04-17','10:00:00','V020',100,10000,'Planned','U012',NULL,NULL),('E021','Python Bootcamp','Technical','CSE','2026-04-19','10:00:00','V013',140,9000,'Planned','U011',NULL,NULL),('E022','Art Exhibition','Cultural','All','2026-04-21','11:00:00','V005',90,3000,'Planned','U014',NULL,NULL),('E023','Hardware Workshop','Technical','ECE','2026-04-23','09:00:00','V016',60,7000,'Planned','U013',NULL,NULL),('E024','Chess Tournament','Sports','All','2026-04-25','10:00:00','V006',80,2000,'Planned','U015',NULL,NULL),('E025','Entrepreneurship Meet','Seminar','MBA','2026-04-27','14:00:00','V019',200,12000,'Planned','U014',NULL,NULL),('E026','Web Dev Workshop','Technical','IT','2026-04-29','10:00:00','V014',130,10000,'Planned','U012',NULL,NULL),('E027','Poetry Slam','Cultural','All','2026-05-01','16:00:00','V008',250,2000,'Planned','U014',NULL,NULL),('E028','Science Fair','Academic','All','2026-05-03','09:00:00','V001',600,35000,'Planned','U013',NULL,NULL),('E029','Data Science Meetup','Technical','CSE','2026-05-05','11:00:00','V004',180,10000,'Planned','U011',NULL,NULL),('E030','Alumni Meet','Social','All','2026-05-07','17:00:00','V001',700,50000,'Planned','U014',NULL,NULL),('E498','techno','Training',NULL,'2026-03-20',NULL,NULL,NULL,NULL,'Planned',NULL,NULL,NULL),('E513','Bharatam','Cultural',NULL,'2026-01-31',NULL,NULL,NULL,100000,'Planned',NULL,'kalady','big event'),('E717','brahma','Academic','CSE','2005-07-16','10:00:00','V001',10,10000,'Planned','U011',NULL,NULL),('E719','prayag','Workshop',NULL,'2026-02-25',NULL,NULL,NULL,NULL,'Planned',NULL,NULL,NULL),('E720','Dextra','Workshop',NULL,'2026-02-11',NULL,NULL,NULL,100000,'Planned',NULL,'kalady','cultural'),('E732','parag','Meetup',NULL,'2026-10-01',NULL,NULL,NULL,NULL,'Planned',NULL,NULL,NULL),('E738','Brahma \'26','Cultural',NULL,'2026-03-02',NULL,NULL,NULL,100000,'Planned',NULL,'adi shankara','Cultural event'),('E904','brahma','Technical','CSE','2026-07-16','10:00:00','V001',0,0,'Planned','U011',NULL,NULL);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `feedback_id` int NOT NULL AUTO_INCREMENT,
  `event_id` varchar(5) DEFAULT NULL,
  `user_id` varchar(20) DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `sentiment_label` varchar(20) DEFAULT NULL,
  `sentiment_score` float DEFAULT NULL,
  `comments` text,
  PRIMARY KEY (`feedback_id`),
  KEY `event_id` (`event_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
INSERT INTO `feedback` VALUES (3,'E720','STU001',4,NULL,NULL,NULL,'nice'),(4,'E513','STU001',2,NULL,NULL,NULL,'Really nice Experience'),(5,'E738','STU001',3,NULL,NULL,NULL,'Really Impressive'),(6,'E738','STU001',4,NULL,NULL,NULL,'Great Event. Got an opportunity to learn new things,and networked with people');
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `registration_id` varchar(5) NOT NULL,
  `event_id` varchar(5) DEFAULT NULL,
  `user_id` varchar(5) DEFAULT NULL,
  `registration_date` date DEFAULT NULL,
  `attendance_status` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`registration_id`),
  KEY `event_id` (`event_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`),
  CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resources` (
  `resource_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `total_count` int DEFAULT '0',
  `available_count` int DEFAULT '0',
  `category` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`resource_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resources`
--

LOCK TABLES `resources` WRITE;
/*!40000 ALTER TABLE `resources` DISABLE KEYS */;
INSERT INTO `resources` VALUES (1,'Projectors',8,5,'Visual'),(2,'Microphones',12,10,'Audio'),(3,'Audio System',4,3,'Audio'),(4,'Lighting Kits',6,5,'Stage'),(5,'WiFi Routers',10,10,'Tech'),(6,'Cables & Adapters',25,24,'Tech');
/*!40000 ALTER TABLE `resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` varchar(20) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('STU001','Test Student','Student','Computer Science',NULL,NULL),('STU01','Test Student','Student','Computer Science',NULL,NULL),('U0003','Krishna Priya','student',NULL,'krishna@college.com','$2a$10$z4uFURP1pJVoNSkOOb9egu8Lba8k.IzTu8gC.yuNO8k7RNThbFmdW'),('U001','Aisha','Student','CSE',NULL,NULL),('U002','Rahul','Student','CSE',NULL,NULL),('U003','Neha','Student','IT',NULL,NULL),('U004','Arjun','Student','IT',NULL,NULL),('U005','Fathima','Student','ECE',NULL,NULL),('U006','Kiran','Student','ECE',NULL,NULL),('U007','Sneha','Student','MBA',NULL,NULL),('U008','Varun','Student','MBA',NULL,NULL),('U009','Anita','Student','MECH',NULL,NULL),('U010','Rohit','Student','MECH',NULL,NULL),('U011','Dr Kumar','Faculty','CSE',NULL,NULL),('U012','Dr Meera','Faculty','IT',NULL,NULL),('U013','Dr Ravi','Faculty','ECE',NULL,NULL),('U014','Dr Anjali','Faculty','MBA',NULL,NULL),('U015','Dr Suresh','Faculty','MECH',NULL,NULL),('U016','Divya','Student','CSE',NULL,NULL),('U017','Aman','Student','IT',NULL,NULL),('U018','Nithya','Student','ECE',NULL,NULL),('U019','Sanjay','Student','MBA',NULL,NULL),('U020','Harsha','Student','CSE',NULL,NULL),('U021','Kavya','Student','CSE',NULL,NULL),('U022','Manoj','Student','IT',NULL,NULL),('U023','Priya','Student','ECE',NULL,NULL),('U024','Akash','Student','MBA',NULL,NULL),('U025','Ritu','Student','MECH',NULL,NULL),('U026','Deepak','Student','CSE',NULL,NULL),('U027','Swathi','Student','IT',NULL,NULL),('U028','Irfan','Student','ECE',NULL,NULL),('U029','Megha','Student','MBA',NULL,NULL),('U030','Arav','Student','CSE',NULL,NULL),('U031','Farah','Student','CSE',NULL,NULL),('U032','Noel','Student','IT',NULL,NULL),('U033','Sara','Student','ECE',NULL,NULL),('U034','Joel','Student','MECH',NULL,NULL),('U035','Asha','Student','MBA',NULL,NULL),('U036','Leena','Student','CSE',NULL,NULL),('U037','Tom','Student','IT',NULL,NULL),('U038','Riya','Student','ECE',NULL,NULL),('U039','Adil','Student','MBA',NULL,NULL),('U040','Vivek','Student','MECH',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venues`
--

DROP TABLE IF EXISTS `venues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venues` (
  `venue_id` varchar(5) NOT NULL,
  `venue_name` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`venue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venues`
--

LOCK TABLES `venues` WRITE;
/*!40000 ALTER TABLE `venues` DISABLE KEYS */;
INSERT INTO `venues` VALUES ('V001','Main Auditorium','Admin Block',800,'Auditorium'),('V002','Seminar Hall A','CSE Block',150,'Hall'),('V003','Seminar Hall B','IT Block',120,'Hall'),('V004','Innovation Lab','IT Block 2nd Floor',200,'Lab'),('V005','Library Hall','Library Building',90,'Hall'),('V006','Conference Room A','Admin Block',80,'Room'),('V007','Conference Room B','Admin Block',80,'Room'),('V008','Open Stage','Courtyard',300,'Open Area'),('V009','Indoor Stadium','Sports Complex',600,'Stadium'),('V010','Playground','Outdoor Ground',1200,'Ground'),('V011','Smart Classroom 201','CSE Block',100,'Classroom'),('V012','Smart Classroom 202','CSE Block',100,'Classroom'),('V013','Computer Lab 1','IT Block',140,'Lab'),('V014','Computer Lab 2','IT Block',140,'Lab'),('V015','Physics Lab','Science Block',60,'Lab'),('V016','Chemistry Lab','Science Block',60,'Lab'),('V017','Mechanical Workshop','Mechanical Block',180,'Workshop'),('V018','Drawing Hall','Mechanical Block',120,'Hall'),('V019','MBA Seminar Hall','MBA Block',220,'Hall'),('V020','Placement Cell Hall','Admin Block',110,'Hall');
/*!40000 ALTER TABLE `venues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `volunteer_assignments`
--

DROP TABLE IF EXISTS `volunteer_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteer_assignments` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `event_id` varchar(5) DEFAULT NULL,
  `assigned_task` varchar(255) DEFAULT NULL,
  `volunteer_id` varchar(50) DEFAULT NULL,
  `role_assigned` varchar(100) DEFAULT NULL,
  `shift_hours` int DEFAULT NULL,
  PRIMARY KEY (`assignment_id`),
  KEY `event_id` (`event_id`),
  KEY `volunteer_id` (`volunteer_id`),
  CONSTRAINT `volunteer_assignments_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`),
  CONSTRAINT `volunteer_assignments_ibfk_2` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers` (`volunteer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `volunteer_assignments`
--

LOCK TABLES `volunteer_assignments` WRITE;
/*!40000 ALTER TABLE `volunteer_assignments` DISABLE KEYS */;
INSERT INTO `volunteer_assignments` VALUES (9,'E732','Registration Desk Management','VOL001',NULL,NULL),(10,'E732','Stage Lighting & Sound Check','VOL002',NULL,NULL),(11,'E732','Guest Coordination','VOL003',NULL,NULL),(12,'E732','Social Media Live Coverage','VOL004',NULL,NULL),(13,'E732','Registration Desk Management','VOL001',NULL,NULL),(14,'E732','Stage Lighting & Sound Check','VOL002',NULL,NULL),(15,'E732','Guest Coordination','VOL003',NULL,NULL),(16,'E732','Social Media Live Coverage','VOL004',NULL,NULL),(17,'E732','media','VOL017',NULL,NULL),(18,'E732','help desk','VOL002',NULL,NULL),(19,'E720','it support','VOL012',NULL,NULL),(20,'E720','decoration','VOL017',NULL,NULL),(21,'E513','Video Editing','VOL014',NULL,NULL),(22,'E738','Transport','VOL016',NULL,NULL),(23,'E738','Registration desk','VOL017',NULL,NULL);
/*!40000 ALTER TABLE `volunteer_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `volunteers`
--

DROP TABLE IF EXISTS `volunteers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteers` (
  `volunteer_id` varchar(6) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `skills` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`volunteer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `volunteers`
--

LOCK TABLES `volunteers` WRITE;
/*!40000 ALTER TABLE `volunteers` DISABLE KEYS */;
INSERT INTO `volunteers` VALUES ('VOL001','Aditya','Management'),('VOL002','Pooja','Stage Setup'),('VOL003','Rahim','Technical Support'),('VOL004','Ananya','Photography'),('VOL005','Manish','Registration Desk'),('VOL006','Keerthi','Anchoring'),('VOL007','Akhil','Logistics'),('VOL008','Shreya','Decoration'),('VOL009','Sameer','Sound System'),('VOL010','Isha','Coordination'),('VOL011','Faiz','Technical'),('VOL012','Diya','Design'),('VOL013','Sahil','Video Editing'),('VOL014','Naveen','Event Handling'),('VOL015','Lakshmi','Public Speaking'),('VOL016','Tejas','Setup'),('VOL017','Anu','Support'),('VOL018','John','Logistics'),('VOL019','Harini','Creative'),('VOL020','Vikas','IT Support'),('VOL021','Ramesh','Security'),('VOL022','Nisha','Hosting'),('VOL023','Ali','Electrical'),('VOL024','Tina','Documentation'),('VOL025','Pranav','Networking'),('VOL026','Sara','Promotion'),('VOL027','Ajay','Transport'),('VOL028','Meera','Help Desk'),('VOL029','Dev','Media'),('VOL030','Kriti','Organizing');
/*!40000 ALTER TABLE `volunteers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `event_summary`
--

/*!50001 DROP VIEW IF EXISTS `event_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `event_summary` AS select `e`.`event_id` AS `event_id`,`e`.`event_name` AS `event_name`,`e`.`date` AS `date`,`v`.`venue_name` AS `venue_name`,`u`.`name` AS `coordinator`,(select count(0) from `volunteer_assignments` `va` where (`va`.`event_id` = `e`.`event_id`)) AS `volunteer_count`,(select avg(`f`.`rating`) from `feedback` `f` where (`f`.`event_id` = `e`.`event_id`)) AS `avg_rating` from ((`events` `e` join `venues` `v` on((`e`.`venue_id` = `v`.`venue_id`))) join `users` `u` on((`e`.`coordinator_id` = `u`.`user_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-26 19:42:53
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: event_management
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `participant_id` int NOT NULL,
  `check_in_time` datetime DEFAULT NULL,
  `status` enum('present','absent') DEFAULT 'absent',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  KEY `participant_id` (`participant_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`participant_id`) REFERENCES `participants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_invitations`
--

DROP TABLE IF EXISTS `event_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_invitations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `participant_email` varchar(255) NOT NULL,
  `participant_name` varchar(255) DEFAULT NULL,
  `invitation_status` enum('sent','opened','accepted','rejected') DEFAULT 'sent',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `event_invitations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_invitations`
--

LOCK TABLES `event_invitations` WRITE;
/*!40000 ALTER TABLE `event_invitations` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_invitations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_name` varchar(255) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_date` date NOT NULL,
  `predicted_attendance` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'Brahma','Cultural','2026-02-01',447,'2026-02-14 07:21:19','2026-02-14 07:21:19'),(2,'brahma','Cultural','2026-03-06',171,'2026-02-14 07:23:20','2026-02-14 07:23:20'),(3,'parag','Conference','2026-02-24',331,'2026-02-14 08:10:04','2026-02-14 08:10:04'),(4,'parag','Networking','2026-02-24',242,'2026-02-14 08:18:09','2026-02-14 08:18:09'),(5,'parag','Meetup','2026-05-26',422,'2026-02-14 08:20:55','2026-02-14 08:20:55'),(6,'parag','Cultural','2026-02-26',NULL,'2026-02-14 08:22:33','2026-02-14 08:22:33');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `participant_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comments` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  KEY `participant_id` (`participant_id`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`participant_id`) REFERENCES `participants` (`id`) ON DELETE SET NULL,
  CONSTRAINT `feedback_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
INSERT INTO `feedback` VALUES (1,1,NULL,5,'very nice','2026-02-14 07:22:23');
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participants`
--

DROP TABLE IF EXISTS `participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `participant_name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('registered','attended','absent') DEFAULT 'registered',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `participants_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participants`
--

LOCK TABLES `participants` WRITE;
/*!40000 ALTER TABLE `participants` DISABLE KEYS */;
/*!40000 ALTER TABLE `participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource_allocations`
--

DROP TABLE IF EXISTS `resource_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource_allocations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resource_id` int NOT NULL,
  `allocation_event_id` int NOT NULL,
  `allocated_quantity` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `resource_id` (`resource_id`),
  KEY `allocation_event_id` (`allocation_event_id`),
  CONSTRAINT `resource_allocations_ibfk_1` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`id`) ON DELETE CASCADE,
  CONSTRAINT `resource_allocations_ibfk_2` FOREIGN KEY (`allocation_event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource_allocations`
--

LOCK TABLES `resource_allocations` WRITE;
/*!40000 ALTER TABLE `resource_allocations` DISABLE KEYS */;
/*!40000 ALTER TABLE `resource_allocations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `resource_name` varchar(255) NOT NULL,
  `resource_type` varchar(100) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `unit_cost` decimal(10,2) DEFAULT NULL,
  `total_cost` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','allocated','used') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `resources_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resources`
--

LOCK TABLES `resources` WRITE;
/*!40000 ALTER TABLE `resources` DISABLE KEYS */;
/*!40000 ALTER TABLE `resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venues`
--

DROP TABLE IF EXISTS `venues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `venue_name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `amenities` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `venues_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venues`
--

LOCK TABLES `venues` WRITE;
/*!40000 ALTER TABLE `venues` DISABLE KEYS */;
/*!40000 ALTER TABLE `venues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `volunteers`
--

DROP TABLE IF EXISTS `volunteers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `volunteer_name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `assigned_task` text,
  `status` enum('assigned','completed','cancelled') DEFAULT 'assigned',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `volunteers_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `volunteers`
--

LOCK TABLES `volunteers` WRITE;
/*!40000 ALTER TABLE `volunteers` DISABLE KEYS */;
/*!40000 ALTER TABLE `volunteers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-26 19:42:53
