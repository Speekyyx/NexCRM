import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { taskService } from '../services/taskService';
import api from '../services/api';
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

const FormOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const FormCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.card || '#1e1e2d'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Masquer la barre de défilement */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.75rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.75rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.75rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  option {
    background: #1a1a2e;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [developers, setDevelopers] = useState([]);
  const [clients, setClients] = useState([]);
  const [newTask, setNewTask] = useState({
    titre: '',
    description: '',
    priorite: 'MOYENNE',
    statut: 'A_FAIRE',
    dateEcheance: '',
    dateCreation: new Date().toISOString().split('T')[0],
    assignedUser: { id: '' },
    client: { id: '' }
  });
  
  useEffect(() => {
    fetchTasks();
    fetchDevelopers();
    fetchClients();
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
  
  const fetchDevelopers = async () => {
    try {
      const response = await api.get('/users/dev/list');
      setDevelopers(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des développeurs:', error);
      try {
        const allUsersResponse = await api.get('/users');
        const devs = allUsersResponse.data.filter(user => user.role === 'DEVELOPPEUR');
        setDevelopers(devs);
      } catch (fallbackError) {
        console.error('Échec du plan B:', fallbackError);
      }
    }
  };
  
  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };
  
  const handleCreateTask = () => {
    setShowForm(true);
    setNewTask({
      ...newTask,
      dateCreation: new Date().toISOString().split('T')[0]
    });
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setNewTask({
      titre: '',
      description: '',
      priorite: 'MOYENNE',
      statut: 'A_FAIRE',
      dateEcheance: '',
      dateCreation: new Date().toISOString().split('T')[0],
      assignedUser: { id: '' },
      client: { id: '' }
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'assignedUserId') {
      setNewTask({
        ...newTask,
        assignedUser: { id: value === '' ? null : value }
      });
    } else if (name === 'clientId') {
      setNewTask({
        ...newTask,
        client: { id: value === '' ? null : value }
      });
    } else {
      setNewTask({
        ...newTask,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const createdTask = await taskService.createTask(newTask);
      setTasks([...tasks, createdTask]);
      handleCloseForm();
      fetchTasks();
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
    }
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
      
      {showForm && (
        <FormOverlay onClick={handleCloseForm}>
          <FormCard 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <FormContainer onSubmit={handleSubmit}>
              <FormTitle>Créer une nouvelle tâche</FormTitle>
              
              <FormRow>
                <InputGroup>
                  <Label htmlFor="titre">Titre</Label>
                  <Input 
                    type="text" 
                    id="titre" 
                    name="titre" 
                    value={newTask.titre} 
                    onChange={handleInputChange} 
                    required 
                  />
                </InputGroup>
                
                <InputGroup>
                  <Label htmlFor="dateCreation">Date de création</Label>
                  <Input 
                    type="date" 
                    id="dateCreation" 
                    name="dateCreation" 
                    value={newTask.dateCreation} 
                    onChange={handleInputChange}
                    readOnly
                  />
                </InputGroup>
              </FormRow>
              
              <InputGroup>
                <Label htmlFor="description">Description</Label>
                <TextArea 
                  id="description" 
                  name="description" 
                  value={newTask.description} 
                  onChange={handleInputChange} 
                />
              </InputGroup>
              
              <FormRow>
                <InputGroup>
                  <Label htmlFor="priorite">Priorité</Label>
                  <Select 
                    id="priorite" 
                    name="priorite" 
                    value={newTask.priorite} 
                    onChange={handleInputChange}
                  >
                    <option value="BASSE">Basse</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="HAUTE">Haute</option>
                  </Select>
                </InputGroup>
                
                <InputGroup>
                  <Label htmlFor="dateEcheance">Date d'échéance</Label>
                  <Input 
                    type="date" 
                    id="dateEcheance" 
                    name="dateEcheance" 
                    value={newTask.dateEcheance} 
                    onChange={handleInputChange} 
                  />
                </InputGroup>
              </FormRow>
              
              <FormRow>
                <InputGroup>
                  <Label htmlFor="assignedUserId">Assigner à un développeur</Label>
                  <Select 
                    id="assignedUserId" 
                    name="assignedUserId" 
                    value={newTask.assignedUser.id || ''} 
                    onChange={handleInputChange}
                  >
                    <option value="">Non assigné</option>
                    {developers.map((dev) => (
                      <option key={dev.id} value={dev.id}>
                        {dev.prenom} {dev.nom}
                      </option>
                    ))}
                  </Select>
                </InputGroup>
                
                <InputGroup>
                  <Label htmlFor="clientId">Client</Label>
                  <Select 
                    id="clientId" 
                    name="clientId" 
                    value={newTask.client.id || ''} 
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.nom}
                      </option>
                    ))}
                  </Select>
                </InputGroup>
              </FormRow>
              
              <ButtonGroup>
                <Button 
                  type="submit" 
                  variant="gradient"
                >
                  Créer la tâche
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleCloseForm}
                >
                  Annuler
                </Button>
              </ButtonGroup>
            </FormContainer>
          </FormCard>
        </FormOverlay>
      )}
      
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