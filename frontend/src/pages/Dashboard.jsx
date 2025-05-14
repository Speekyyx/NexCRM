import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { taskService } from '../services/taskService';
import { Link } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import Button from '../components/Button';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const WelcomeSection = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const GradientOverlay = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 30%;
  height: 100%;
  background: ${({ theme }) => theme.colors.gradient.primary};
  opacity: 0.1;
  filter: blur(60px);
  border-radius: 50%;
  transform: translateX(20%);
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
  
  span {
    background: ${({ theme }) => theme.colors.gradient.primary};
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const WelcomeSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  max-width: 70%;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: rgba(255, 122, 80, 0.2);
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${({ color, theme }) => {
    if (color === 'primary') return theme.colors.primary;
    if (color === 'warning') return theme.colors.warning;
    if (color === 'success') return theme.colors.success;
    return theme.colors.text;
  }};
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  a {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const TaskScrollContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  
  /* Style de la barre de défilement */
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 10px;
  }
`;

const TaskCardContainer = styled.div`
  min-width: 320px;
  max-width: 320px;
`;

const ChartContainer = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  height: 290px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const ProgressBarContainer = styled.div`
  display: flex;
  width: 100%;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
  margin-top: 1rem;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${({ progress }) => `${progress}%`};
  background: ${({ theme }) => theme.colors.gradient.primary};
  border-radius: 5px;
`;

const TaskProgress = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ProgressStatus = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const ChartPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    highPriority: 0
  });
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Récupérer toutes les tâches
      const allTasks = await taskService.getAllTasks();
      
      // Définir les tâches à afficher (5 plus récentes)
      const recentTasks = allTasks.slice(0, 5);
      setTasks(recentTasks);
      
      // Calculer les statistiques
      const completed = allTasks.filter(task => task.statut === 'TERMINEE').length;
      const inProgress = allTasks.filter(task => task.statut === 'EN_COURS').length;
      const todo = allTasks.filter(task => task.statut === 'A_FAIRE').length;
      const highPriority = allTasks.filter(task => task.priorite === 'HAUTE').length;
      
      setStats({
        total: allTasks.length,
        completed,
        inProgress,
        todo,
        highPriority
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données du tableau de bord:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calcul du pourcentage de tâches terminées
  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;
  
  return (
    <DashboardContainer>
      <WelcomeSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GradientOverlay />
        <WelcomeTitle>
          Bienvenue sur <span>NexCRM</span>
        </WelcomeTitle>
        <WelcomeSubtitle>
          Votre tableau de bord pour gérer efficacement vos tâches et projets
        </WelcomeSubtitle>
        
        <Link to="/tasks">
          <Button variant="gradient">
            Voir toutes les tâches
          </Button>
        </Link>
      </WelcomeSection>
      
      <StatsContainer>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Tâches totales</StatLabel>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatValue color="success">{stats.completed}</StatValue>
          <StatLabel>Tâches terminées</StatLabel>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatValue color="warning">{stats.inProgress}</StatValue>
          <StatLabel>Tâches en cours</StatLabel>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <StatValue color="primary">{stats.highPriority}</StatValue>
          <StatLabel>Tâches prioritaires</StatLabel>
        </StatCard>
      </StatsContainer>
      
      <div>
        <SectionTitle>
          Tâches récentes
          <Link to="/tasks">Voir tout</Link>
        </SectionTitle>
        
        {loading ? (
          <ChartPlaceholder>Chargement des tâches...</ChartPlaceholder>
        ) : tasks.length > 0 ? (
          <TaskScrollContainer>
            {tasks.map(task => (
              <TaskCardContainer key={task.id}>
                <TaskCard task={task} />
              </TaskCardContainer>
            ))}
          </TaskScrollContainer>
        ) : (
          <ChartPlaceholder>
            <p>Aucune tâche trouvée</p>
            <Link to="/tasks/new" style={{ marginTop: '1rem' }}>
              <Button variant="primary" size="sm">Créer une tâche</Button>
            </Link>
          </ChartPlaceholder>
        )}
      </div>
      
      <div>
        <SectionTitle>Progression des tâches</SectionTitle>
        <ChartContainer>
          {loading ? (
            <ChartPlaceholder>Chargement des statistiques...</ChartPlaceholder>
          ) : (
            <TaskProgress>
              <ProgressStatus>
                <span>Progression globale</span>
                <span>{completionRate}%</span>
              </ProgressStatus>
              <ProgressBarContainer>
                <ProgressBar progress={completionRate} />
              </ProgressBarContainer>
              
              <div style={{ marginTop: '2rem' }}>
                <ProgressStatus>
                  <span>À faire</span>
                  <span>{stats.todo}</span>
                </ProgressStatus>
                <ProgressBarContainer>
                  <ProgressBar 
                    progress={stats.total > 0 ? (stats.todo / stats.total) * 100 : 0} 
                  />
                </ProgressBarContainer>
              </div>
              
              <div style={{ marginTop: '1rem' }}>
                <ProgressStatus>
                  <span>En cours</span>
                  <span>{stats.inProgress}</span>
                </ProgressStatus>
                <ProgressBarContainer>
                  <ProgressBar 
                    progress={stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0} 
                  />
                </ProgressBarContainer>
              </div>
              
              <div style={{ marginTop: '1rem' }}>
                <ProgressStatus>
                  <span>Terminées</span>
                  <span>{stats.completed}</span>
                </ProgressStatus>
                <ProgressBarContainer>
                  <ProgressBar 
                    progress={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} 
                  />
                </ProgressBarContainer>
              </div>
            </TaskProgress>
          )}
        </ChartContainer>
      </div>
    </DashboardContainer>
  );
};

export default Dashboard; 