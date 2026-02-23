CREATE DATABASE  IF NOT EXISTS `college_event_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `college_event_db`;
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
INSERT INTO `events` VALUES ('E001','AI Workshop','Technical','CSE','2026-03-01','10:00:00','V004',180,15000,'Planned','U011'),('E002','Hackathon','Technical','CSE','2026-03-05','09:00:00','V001',500,50000,'Planned','U011'),('E003','Cultural Fest','Cultural','All','2026-03-10','16:00:00','V010',1000,100000,'Planned','U014'),('E004','Robotics Expo','Technical','MECH','2026-03-12','11:00:00','V017',200,20000,'Planned','U015'),('E005','Seminar on ML','Technical','IT','2026-03-15','10:00:00','V002',150,8000,'Planned','U012'),('E006','Startup Talk','Seminar','MBA','2026-03-18','14:00:00','V019',220,10000,'Planned','U014'),('E007','Coding Contest','Technical','CSE','2026-03-20','09:30:00','V013',140,6000,'Planned','U011'),('E008','Drama Night','Cultural','All','2026-03-22','17:00:00','V008',300,15000,'Planned','U014'),('E009','Sports Meet','Sports','All','2026-03-25','08:00:00','V010',1200,70000,'Planned','U015'),('E010','Poster Presentation','Academic','ECE','2026-03-27','11:00:00','V003',120,5000,'Planned','U013'),('E011','Quiz Competition','Academic','CSE','2026-03-29','10:00:00','V011',100,3000,'Planned','U011'),('E012','Music Fest','Cultural','All','2026-04-01','18:00:00','V009',600,30000,'Planned','U014'),('E013','Cloud Workshop','Technical','IT','2026-04-03','10:00:00','V014',140,12000,'Planned','U012'),('E014','Project Expo','Academic','All','2026-04-05','09:00:00','V001',700,40000,'Planned','U011'),('E015','Debate','Academic','MBA','2026-04-07','11:00:00','V006',80,2000,'Planned','U014'),('E016','Guest Lecture','Seminar','ECE','2026-04-09','14:00:00','V002',150,5000,'Planned','U013'),('E017','Design Contest','Technical','MECH','2026-04-11','10:00:00','V018',120,6000,'Planned','U015'),('E018','Photography Contest','Cultural','All','2026-04-13','15:00:00','V008',250,4000,'Planned','U014'),('E019','Tech Talk','Seminar','CSE','2026-04-15','12:00:00','V020',110,3000,'Planned','U011'),('E020','Placement Training','Academic','All','2026-04-17','10:00:00','V020',100,10000,'Planned','U012'),('E021','Python Bootcamp','Technical','CSE','2026-04-19','10:00:00','V013',140,9000,'Planned','U011'),('E022','Art Exhibition','Cultural','All','2026-04-21','11:00:00','V005',90,3000,'Planned','U014'),('E023','Hardware Workshop','Technical','ECE','2026-04-23','09:00:00','V016',60,7000,'Planned','U013'),('E024','Chess Tournament','Sports','All','2026-04-25','10:00:00','V006',80,2000,'Planned','U015'),('E025','Entrepreneurship Meet','Seminar','MBA','2026-04-27','14:00:00','V019',200,12000,'Planned','U014'),('E026','Web Dev Workshop','Technical','IT','2026-04-29','10:00:00','V014',130,10000,'Planned','U012'),('E027','Poetry Slam','Cultural','All','2026-05-01','16:00:00','V008',250,2000,'Planned','U014'),('E028','Science Fair','Academic','All','2026-05-03','09:00:00','V001',600,35000,'Planned','U013'),('E029','Data Science Meetup','Technical','CSE','2026-05-05','11:00:00','V004',180,10000,'Planned','U011'),('E030','Alumni Meet','Social','All','2026-05-07','17:00:00','V001',700,50000,'Planned','U014');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `feedback_id` varchar(5) NOT NULL,
  `event_id` varchar(5) DEFAULT NULL,
  `user_id` varchar(5) DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `sentiment_label` varchar(20) DEFAULT NULL,
  `sentiment_score` float DEFAULT NULL,
  PRIMARY KEY (`feedback_id`),
  KEY `event_id` (`event_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`),
  CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` varchar(5) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('U001','Aisha','Student','CSE'),('U002','Rahul','Student','CSE'),('U003','Neha','Student','IT'),('U004','Arjun','Student','IT'),('U005','Fathima','Student','ECE'),('U006','Kiran','Student','ECE'),('U007','Sneha','Student','MBA'),('U008','Varun','Student','MBA'),('U009','Anita','Student','MECH'),('U010','Rohit','Student','MECH'),('U011','Dr Kumar','Faculty','CSE'),('U012','Dr Meera','Faculty','IT'),('U013','Dr Ravi','Faculty','ECE'),('U014','Dr Anjali','Faculty','MBA'),('U015','Dr Suresh','Faculty','MECH'),('U016','Divya','Student','CSE'),('U017','Aman','Student','IT'),('U018','Nithya','Student','ECE'),('U019','Sanjay','Student','MBA'),('U020','Harsha','Student','CSE'),('U021','Kavya','Student','CSE'),('U022','Manoj','Student','IT'),('U023','Priya','Student','ECE'),('U024','Akash','Student','MBA'),('U025','Ritu','Student','MECH'),('U026','Deepak','Student','CSE'),('U027','Swathi','Student','IT'),('U028','Irfan','Student','ECE'),('U029','Megha','Student','MBA'),('U030','Arav','Student','CSE'),('U031','Farah','Student','CSE'),('U032','Noel','Student','IT'),('U033','Sara','Student','ECE'),('U034','Joel','Student','MECH'),('U035','Asha','Student','MBA'),('U036','Leena','Student','CSE'),('U037','Tom','Student','IT'),('U038','Riya','Student','ECE'),('U039','Adil','Student','MBA'),('U040','Vivek','Student','MECH');
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
  `assignment_id` varchar(5) NOT NULL,
  `event_id` varchar(5) DEFAULT NULL,
  `volunteer_id` varchar(6) DEFAULT NULL,
  `role_assigned` varchar(100) DEFAULT NULL,
  `shift_hours` int DEFAULT NULL,
  PRIMARY KEY (`assignment_id`),
  KEY `event_id` (`event_id`),
  KEY `volunteer_id` (`volunteer_id`),
  CONSTRAINT `volunteer_assignments_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`),
  CONSTRAINT `volunteer_assignments_ibfk_2` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers` (`volunteer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `volunteer_assignments`
--

LOCK TABLES `volunteer_assignments` WRITE;
/*!40000 ALTER TABLE `volunteer_assignments` DISABLE KEYS */;
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

-- Dump completed on 2026-02-12 11:07:04
