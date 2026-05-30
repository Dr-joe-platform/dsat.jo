-- Database: `dsatuz_db`
CREATE DATABASE IF NOT EXISTS `dsatuz_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dsatuz_db`;

-- Table: `questions`
CREATE TABLE IF NOT EXISTS `questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `passage` text NOT NULL,
  `prompt` text NOT NULL,
  `options_json` json NOT NULL,
  `correct_index` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Mock Data
INSERT INTO `questions` (`passage`, `prompt`, `options_json`, `correct_index`) VALUES
('The following text is from Northrop Frye''s 1957 book Anatomy of Criticism.\n\nEven in lyrics and essays the writer is to some extent a fictional hero with a fictional audience, for if the element of fictional projection disappeared completely, the writing would become direct address, or straight discursive writing, and cease to be literature.', 'As used in the text, what does the word "projection" most nearly mean?', '["Elimination", "Estimation", "Presentation", "Prediction"]', 2),
('In 1934, physicist Eugene Wigner theorized that when electrons in a metal are brought to extremely low temperatures, their repulsive forces dominate their kinetic energy, causing them to freeze into a rigid, crystalline lattice. For decades, this "Wigner crystal" remained purely theoretical, as the conditions required to observe it were impossibly demanding. However, in 2021, physicists ________ evidence of a Wigner crystal by confining electrons within two atomically thin layers of molybdenum diselenide, confirming Wigner''s decades-old prediction.', 'Which choice completes the text with the most logical and precise word or phrase?', '["contrived", "uncovered", "suppressed", "invalidated"]', 1),
('When studying the migration patterns of monarch butterflies, researchers found that the insects rely on a time-compensated sun compass to navigate thousands of miles. This internal mechanism integrates the time of day, maintained by circadian clocks in their antennae, with the sun''s position in the sky. If the antennae are surgically removed, the butterflies continue to fly, but they lose their directional bearing, suggesting that the antennae ________.', 'Which choice most logically completes the text?', '["are primarily responsible for the butterflies'' ability to stay aloft over long distances.", "contain the critical components necessary for interpreting solar navigational cues.", "operate independently of the sun''s position to guide the butterflies southward.", "are less important for navigation than the butterflies'' visual perception of the landscape."]', 1);

-- Table: `test_attempts`
CREATE TABLE IF NOT EXISTS `test_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT 1,
  `score` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
