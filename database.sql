-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Czas generowania: 04 Maj 2022, 02:34
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
  `ID_Internal` int(11) NOT NULL,
  `ID_MAL` int(11) NOT NULL,
  `Title` varchar(120) NOT NULL,
  `Status_ID` int(1) NOT NULL,
  `Avg_Rating` double DEFAULT NULL,
  `Viewers_Count` int(11) NOT NULL,
  `Episodes_Count` int(11) DEFAULT NULL,
  `Year_Broadcast` int(4) NOT NULL,
  `Season` int(1) DEFAULT NULL,
  `Type` int(1) NOT NULL,
  `Genre` int(2) DEFAULT NULL,
  `Image_URL` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Zrzut danych tabeli `anime`
--

INSERT INTO `anime` (`ID_Internal`, `ID_MAL`, `Title`, `Status_ID`, `Avg_Rating`, `Viewers_Count`, `Episodes_Count`, `Year_Broadcast`, `Season`, `Type`, `Genre`, `Image_URL`) VALUES
(1, 1, 'Cowboy Bebop', 3, 8.76, 1594231, 26, 1998, 2, 1, 1, 'https://cdn.myanimelist.net/images/anime/4/19644.jpg'),
(2, 39782, 'Family', 3, 0, 147, 1, 2018, NULL, 6, NULL, 'https://cdn.myanimelist.net/images/anime/1325/100903.jpg'),
(3, 7311, 'Suzumiya Haruhi no Shoushitsu', 3, 8.62, 556254, 1, 2010, NULL, 2, NULL, 'https://cdn.myanimelist.net/images/anime/1248/112352.jpg'),
(4, 849, 'Suzumiya Haruhi no Yuuutsu', 3, 7.84, 839517, 14, 2006, 2, 1, 2, 'https://cdn.myanimelist.net/images/anime/5/75901.jpg');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `genre`
--

CREATE TABLE `genre` (
  `ID` int(2) NOT NULL,
  `Name` varchar(30) NOT NULL,
  `Name_PL` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Zrzut danych tabeli `genre`
--

INSERT INTO `genre` (`ID`, `Name`, `Name_PL`) VALUES
(1, 'Action', 'Akcja'),
(2, 'Comedy', 'Komedia'),
(3, 'Drama', 'Dramat'),
(4, 'Slice of Life', 'Okruchy życia'),
(5, 'Avant Garde', 'Awangarda'),
(6, 'Hentai', 'Hentai'),
(7, 'Adventure', 'Przygodowe');

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
(4, 'fall', 'Jesień');

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
(4, 'Special', 'Special'),
(5, 'OVA', 'OVA'),
(6, 'Music', 'Muzyka');

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `anime`
--
ALTER TABLE `anime`
  ADD PRIMARY KEY (`ID_Internal`),
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
  MODIFY `ID_Internal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT dla tabeli `genre`
--
ALTER TABLE `genre`
  MODIFY `ID` int(2) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  MODIFY `ID` int(1) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
