-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Czas generowania: 08 Maj 2022, 04:39
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
(7, 32, 'Neon Genesis Evangelion: The End of Evangelion', 3, 8.55, 776310, 1, 1997, NULL, 2, 5, 'https://cdn.myanimelist.net/images/anime/1404/98182.jpg'),
(8, 30, 'Neon Genesis Evangelion', 3, 8.34, 1535919, 26, 1995, 4, 1, 1, 'https://cdn.myanimelist.net/images/anime/1314/108941.jpg'),
(11, 5680, 'K-On!', 3, 7.85, 942598, 13, 2009, 2, 1, 2, 'https://cdn.myanimelist.net/images/anime/10/76120.jpg'),
(12, 5081, 'Bakemonogatari', 3, 8.34, 1268016, 15, 2009, 3, 1, 8, 'https://cdn.myanimelist.net/images/anime/11/75274.jpg'),
(13, 31181, 'Owarimonogatari', 3, 8.46, 430269, 12, 2015, 4, 1, 2, 'https://cdn.myanimelist.net/images/anime/8/76479.jpg'),
(15, 934, 'Higurashi no Naku Koro ni', 3, 7.9, 731690, 26, 2006, 2, 1, 12, 'https://cdn.myanimelist.net/images/anime/12/19634.jpg'),
(16, 9260, 'Kizumonogatari I: Tekketsu-hen', 3, 8.38, 464007, 1, 2016, NULL, 2, NULL, 'https://cdn.myanimelist.net/images/anime/1783/112810.jpg'),
(17, 21, 'One Piece', 1, 8.64, 1855718, NULL, 1999, 4, 1, 1, 'https://cdn.myanimelist.net/images/anime/6/73245.jpg'),
(18, 50265, 'Spy x Family', 1, 9.09, 594617, 12, 2022, 2, 1, 1, 'https://cdn.myanimelist.net/images/anime/1441/122795.jpg'),
(19, 10165, 'Nichijou', 3, 8.46, 781076, 26, 2011, 2, 1, 2, 'https://cdn.myanimelist.net/images/anime/3/75617.jpg'),
(20, 20, 'Naruto', 3, 7.97, 2452917, 220, 2002, 4, 1, 1, 'https://cdn.myanimelist.net/images/anime/13/17405.jpg'),
(21, 7311, 'Suzumiya Haruhi no Shoushitsu', 3, 8.62, 557421, 1, 2010, NULL, 2, 8, 'https://cdn.myanimelist.net/images/anime/1248/112352.jpg'),
(22, 7791, 'K-On!!', 3, 8.17, 617359, 26, 2010, 2, 1, 2, 'https://cdn.myanimelist.net/images/anime/12/76121.jpg'),
(23, 23309, 'Rail Wars!', 3, 6.4, 193605, 12, 2014, 3, 1, 1, 'https://cdn.myanimelist.net/images/anime/13/65671.jpg'),
(24, 3220, 'Kanashimi no Belladonna', 3, 7.12, 34914, 1, 1973, NULL, 2, 5, 'https://cdn.myanimelist.net/images/anime/11/24740.jpg'),
(25, 759, 'Tokyo Godfathers', 3, 8.28, 248501, 1, 2003, NULL, 2, 2, 'https://cdn.myanimelist.net/images/anime/1144/93627.jpg'),
(26, 42897, 'Horimiya', 3, 8.21, 999447, 13, 2021, 1, 1, 2, 'https://cdn.myanimelist.net/images/anime/1695/111486.jpg'),
(27, 40911, 'Yuukoku no Moriarty', 3, 8.14, 312269, 11, 2020, 4, 1, 8, 'https://cdn.myanimelist.net/images/anime/1464/108330.jpg'),
(28, 43325, 'Yuukoku no Moriarty Part 2', 3, 8.23, 180602, 13, 2021, 2, 1, 8, 'https://cdn.myanimelist.net/images/anime/1200/111522.jpg'),
(29, 889, 'Black Lagoon', 3, 8.03, 863473, 12, 2006, 2, 1, 1, 'https://cdn.myanimelist.net/images/anime/1906/121592.jpg'),
(30, 40752, 'Bishounen Tanteidan', 3, 7.15, 85237, 12, 2021, 2, 1, 8, 'https://cdn.myanimelist.net/images/anime/1693/115133.jpg'),
(31, 1887, 'Lucky☆Star', 3, 7.74, 596123, 24, 2007, 2, 1, 2, 'https://cdn.myanimelist.net/images/anime/1561/115660.jpg');

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
(7, 'Adventure', 'Przygodowe'),
(8, 'Mystery', 'Tajemnica'),
(9, 'Gourmet', 'Gourmet'),
(10, 'Boys Love', 'Boys Love'),
(11, 'Sports', 'Sportowe'),
(12, 'Horror', 'Horror'),
(13, 'Romance', 'Romans'),
(14, 'Fantasy', 'Fantasy'),
(15, 'Sci-Fi', 'Fikcja naukowa');

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
  MODIFY `ID_Internal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT dla tabeli `genre`
--
ALTER TABLE `genre`
  MODIFY `ID` int(2) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

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
