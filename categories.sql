-- Suppression des catégories existantes (optionnel)
-- TRUNCATE TABLE categories RESTART IDENTITY;

-- Insertion des catégories
INSERT INTO categories (nom, description) VALUES 
('Développement Frontend', 'Tâches liées au développement de l''interface utilisateur'),
('Développement Backend', 'Tâches liées au développement côté serveur'),
('Base de données', 'Tâches liées à la gestion et l''optimisation de la base de données'),
('Tests', 'Tâches liées aux tests unitaires et d''intégration'),
('Documentation', 'Tâches liées à la documentation du projet'),
('Design UI/UX', 'Tâches liées au design et à l''expérience utilisateur'),
('DevOps', 'Tâches liées au déploiement et à l''infrastructure'),
('Maintenance', 'Tâches de maintenance et corrections de bugs'),
('Sécurité', 'Tâches liées à la sécurité de l''application'),
('Optimisation', 'Tâches d''optimisation des performances'),
('Formation', 'Tâches liées à la formation et au transfert de connaissances'),
('Analyse', 'Tâches d''analyse des besoins et spécifications'),
('Gestion de projet', 'Tâches liées à la gestion et coordination du projet'),
('Support client', 'Tâches liées au support et à l''assistance client'); 