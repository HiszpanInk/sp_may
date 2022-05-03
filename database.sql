-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Czas generowania: 03 Maj 2022, 03:20
-- Wersja serwera: 10.4.22-MariaDB
-- Wersja PHP: 8.1.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `p_mal_v`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `anime`
--

CREATE TABLE `anime` (
  `ID_internal` int(11) NOT NULL,
  `ID_MAL` int(11) NOT NULL,
  `Title` int(11) NOT NULL,
  `Status_ID` int(1) NOT NULL,
  `Avg_Rating` double DEFAULT NULL,
  `Viewers_Count` int(11) NOT NULL,
  `Episodes_Count` int(11) DEFAULT NULL,
  `Year_Broadcast` int(4) NOT NULL,
  `Season` int(1) NOT NULL,
  `Type` int(1) NOT NULL,
  `Genre` int(2) NOT NULL,
  `Image_URL` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `genre`
--

CREATE TABLE `genre` (
  `ID` int(2) NOT NULL,
  `Name` varchar(30) NOT NULL,
  `Name_PL` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `season`
--

CREATE TABLE `season` (
  `ID` int(1) NOT NULL,
  `Name` varchar(12) NOT NULL,
  `Name_PL` varchar(12) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Zrzut danych tabeli `season`
--

INSERT INTO `season` (`ID`, `Name`, `Name_PL`) VALUES
(1, 'winter', 'Zima'),
(2, 'spring', 'Wiosna'),
(3, 'summer', 'Lato'),
(4, 'autumn', 'Jesień');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `status`
--

CREATE TABLE `status` (
  `ID` int(1) NOT NULL,
  `Name` varchar(30) NOT NULL,
  `Name_PL` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Zrzut danych tabeli `status`
--

INSERT INTO `status` (`ID`, `Name`, `Name_PL`) VALUES
(1, 'Currently Airing', 'W trakcie emisji'),
(2, 'Not yet aired', 'Jeszcze niewyemitowana'),
(3, 'Finished Airing', 'Emisja zakończona');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `type`
--

CREATE TABLE `type` (
  `ID` int(1) NOT NULL,
  `Name` varchar(30) NOT NULL,
  `Name_PL` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Zrzut danych tabeli `type`
--

INSERT INTO `type` (`ID`, `Name`, `Name_PL`) VALUES
(1, 'TV', 'Serial TV'),
(2, 'Movie', 'Film'),
(3, 'ONA', 'ONA'),
(4, 'Special', 'Special');

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `anime`
--
ALTER TABLE `anime`
  ADD PRIMARY KEY (`ID_internal`),
  ADD UNIQUE KEY `anime_ID_MAL_IDX` (`ID_MAL`) USING BTREE,
  ADD KEY `anime_Season_IDX` (`Season`) USING BTREE,
  ADD KEY `anime_FK_1` (`Type`),
  ADD KEY `anime_FK_2` (`Genre`),
  ADD KEY `anime_FK_3` (`Status_ID`);

--
-- Indeksy dla tabeli `genre`
--
ALTER TABLE `genre`
  ADD PRIMARY KEY (`ID`);

--
-- Indeksy dla tabeli `season`
--
ALTER TABLE `season`
  ADD PRIMARY KEY (`ID`);

--
-- Indeksy dla tabeli `status`
--
ALTER TABLE `status`
  ADD PRIMARY KEY (`ID`);

--
-- Indeksy dla tabeli `type`
--
ALTER TABLE `type`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT dla zrzuconych tabel
--

--
-- AUTO_INCREMENT dla tabeli `anime`
--
ALTER TABLE `anime`
  MODIFY `ID_internal` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `genre`
--
ALTER TABLE `genre`
  MODIFY `ID` int(2) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `season`
--
ALTER TABLE `season`
  MODIFY `ID` int(1) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT dla tabeli `status`
--
ALTER TABLE `status`
  MODIFY `ID` int(1) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT dla tabeli `type`
--
ALTER TABLE `type`
  MODIFY `ID` int(1) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Ograniczenia dla zrzutów tabel
--

--
-- Ograniczenia dla tabeli `anime`
--
ALTER TABLE `anime`
  ADD CONSTRAINT `anime_FK` FOREIGN KEY (`Season`) REFERENCES `season` (`ID`),
  ADD CONSTRAINT `anime_FK_1` FOREIGN KEY (`Type`) REFERENCES `type` (`ID`),
  ADD CONSTRAINT `anime_FK_2` FOREIGN KEY (`Genre`) REFERENCES `genre` (`ID`),
  ADD CONSTRAINT `anime_FK_3` FOREIGN KEY (`Status_ID`) REFERENCES `status` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
