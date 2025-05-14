import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { taskService } from '../services/taskService';
import TaskCard from '../components/TaskCard';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const TaskListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.text};
  
  span {
    background: ${({ theme }) => theme.colors.gradient.primary};
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  
  /* Masquer la barre de défilement */
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
`;

const FilterButton = styled.button`
  background: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary : 'rgba(255, 255, 255, 0.05)'};
  color: ${({ isActive, theme }) => 
    isActive ? 'white' : theme.colors.textSecondary};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  white-space: nowrap;
  
  &:hover {
    background: ${({ isActive, theme }) => 
      isActive ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const TaskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-top: 2rem;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const LoadingContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const LoadingDot = styled(motion.div)`
  width: 12px;
  height: 12px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  margin: 0 6px;
`;

const AddIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Animation pour les points de chargement
const loadingVariants = {
  loading: (i) => ({
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      delay: i * 0.1,
    },
  }),
};

// Animation pour la liste des tâches
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchTasks();
  }, [filter]);
  
  const fetchTasks = async () => {
    setLoading(true);
    try {
      let taskData;
      
      if (filter === 'ALL') {
        taskData = await taskService.getAllTasks();
      } else if (['A_FAIRE', 'EN_COURS', 'TERMINEE'].includes(filter)) {
        taskData = await taskService.getTasksByStatus(filter);
      } else if (['BASSE', 'MOYENNE', 'HAUTE'].includes(filter)) {
        taskData = await taskService.getTasksByPriority(filter);
      } else {
        taskData = await taskService.getAllTasks();
      }
      
      setTasks(taskData);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateTask = () => {
    navigate('/tasks/new');
  };
  
  const getFilteredTasks = () => {
    return tasks;
  };
  
  const filteredTasks = getFilteredTasks();
  
  return (
    <TaskListContainer>
      <Header>
        <Title>
          Gestionnaire de <span>Tâches</span>
        </Title>
        
        <Button 
          variant="gradient"
          onClick={handleCreateTask}
          icon={<AddIcon />}
        >
          Nouvelle tâche
        </Button>
      </Header>
      
      <Filters>
        <FilterButton 
          isActive={filter === 'ALL'} 
          onClick={() => setFilter('ALL')}
        >
          Toutes les tâches
        </FilterButton>
        <FilterButton 
          isActive={filter === 'A_FAIRE'} 
          onClick={() => setFilter('A_FAIRE')}
        >
          À faire
        </FilterButton>
        <FilterButton 
          isActive={filter === 'EN_COURS'} 
          onClick={() => setFilter('EN_COURS')}
        >
          En cours
        </FilterButton>
        <FilterButton 
          isActive={filter === 'TERMINEE'} 
          onClick={() => setFilter('TERMINEE')}
        >
          Terminées
        </FilterButton>
        <FilterButton 
          isActive={filter === 'HAUTE'} 
          onClick={() => setFilter('HAUTE')}
        >
          Priorité haute
        </FilterButton>
        <FilterButton 
          isActive={filter === 'MOYENNE'} 
          onClick={() => setFilter('MOYENNE')}
        >
          Priorité moyenne
        </FilterButton>
        <FilterButton 
          isActive={filter === 'BASSE'} 
          onClick={() => setFilter('BASSE')}
        >
          Priorité basse
        </FilterButton>
      </Filters>
      
      {loading ? (
        <LoadingContainer>
          {[0, 1, 2].map((i) => (
            <LoadingDot 
              key={i} 
              custom={i} 
              variants={loadingVariants}
              animate="loading"
            />
          ))}
        </LoadingContainer>
      ) : filteredTasks.length > 0 ? (
        <TaskGrid as={motion.div} variants={containerVariants} initial="hidden" animate="visible">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TaskGrid>
      ) : (
        <EmptyState
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <EmptyStateTitle>Aucune tâche trouvée</EmptyStateTitle>
          <p>Commencez par créer une nouvelle tâche</p>
          <Button 
            variant="primary"
            style={{ marginTop: '1.5rem' }}
            onClick={handleCreateTask}
            icon={<AddIcon />}
          >
            Créer une tâche
          </Button>
        </EmptyState>
      )}
    </TaskListContainer>
  );
};

export default TaskList; 