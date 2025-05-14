import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { taskService } from '../services/taskService';
import Button from '../components/Button';

const TaskDetailContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const TitleArea = styled.div`
  flex: 1;
`;

const TaskTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  word-break: break-word;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 0.5rem;
  background: ${({ status, theme }) => {
    if (status === 'TERMINEE') return 'rgba(45, 212, 191, 0.15)';
    if (status === 'EN_COURS') return 'rgba(251, 191, 36, 0.15)';
    return 'rgba(255, 122, 80, 0.15)';
  }};
  color: ${({ status, theme }) => {
    if (status === 'TERMINEE') return theme.colors.success;
    if (status === 'EN_COURS') return theme.colors.warning;
    return theme.colors.primary;
  }};
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: pre-wrap;
  line-height: 1.6;
`;

const DetailsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const DetailLabel = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DetailValue = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: 1rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.gradient.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-weight: 500;
`;

const UserRole = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.error};
  background: rgba(244, 63, 94, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4V20H20V13M20 4L8 16M15 9L19 5L15 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6M10 11V17M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const translateStatus = (status) => {
  const statusMap = {
    'A_FAIRE': 'À faire',
    'EN_COURS': 'En cours',
    'TERMINEE': 'Terminée'
  };
  
  return statusMap[status] || status;
};

const translatePriority = (priority) => {
  const priorityMap = {
    'BASSE': 'Basse',
    'MOYENNE': 'Moyenne',
    'HAUTE': 'Haute'
  };
  
  return priorityMap[priority] || priority;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Non définie';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

const getInitials = (user) => {
  if (!user) return '';
  return `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`;
};

const translateRoleName = (role) => {
  const roleMap = {
    'DEVELOPPEUR': 'Développeur',
    'CHEF_PROJET': 'Chef de Projet',
    'CLIENT': 'Client'
  };
  
  return roleMap[role] || role;
};

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchTask = async () => {
      try {
        // Si l'ID est "new", nous sommes en mode création
        if (id === 'new') {
          setLoading(false);
          return;
        }
        
        const taskData = await taskService.getTaskById(id);
        setTask(taskData);
      } catch (err) {
        console.error(`Erreur lors du chargement de la tâche ${id}:`, err);
        setError('Impossible de charger les détails de la tâche. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [id]);
  
  const handleEditClick = () => {
    navigate(`/tasks/edit/${id}`);
  };
  
  const handleDeleteClick = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await taskService.deleteTask(id);
        navigate('/tasks');
      } catch (err) {
        console.error(`Erreur lors de la suppression de la tâche ${id}:`, err);
        setError('Impossible de supprimer la tâche. Veuillez réessayer.');
      }
    }
  };
  
  const handleBackClick = () => {
    navigate('/tasks');
  };
  
  if (loading) {
    return (
      <LoadingContainer>
        Chargement des détails de la tâche...
      </LoadingContainer>
    );
  }
  
  if (error) {
    return (
      <ErrorContainer>
        <h2>Erreur</h2>
        <p>{error}</p>
        <Button 
          variant="primary" 
          onClick={handleBackClick} 
          icon={<BackIcon />}
          style={{ marginTop: '1rem' }}
        >
          Retour à la liste
        </Button>
      </ErrorContainer>
    );
  }
  
  if (!task && id !== 'new') {
    return (
      <ErrorContainer>
        <h2>Tâche non trouvée</h2>
        <p>La tâche que vous recherchez n'existe pas ou a été supprimée.</p>
        <Button 
          variant="primary" 
          onClick={handleBackClick} 
          icon={<BackIcon />}
          style={{ marginTop: '1rem' }}
        >
          Retour à la liste
        </Button>
      </ErrorContainer>
    );
  }
  
  // Formulaire de création de tâche (pour id === 'new')
  if (id === 'new') {
    return (
      <TaskDetailContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <HeaderContainer>
          <TitleArea>
            <TaskTitle>Nouvelle tâche</TaskTitle>
          </TitleArea>
          
          <ButtonGroup>
            <Button 
              variant="text" 
              onClick={handleBackClick} 
              icon={<BackIcon />}
            >
              Retour
            </Button>
          </ButtonGroup>
        </HeaderContainer>
        
        {/* Ajouter ici le formulaire de création de tâche */}
        <Section>
          <SectionTitle>Formulaire de création</SectionTitle>
          <p>Le formulaire de création sera implémenté ultérieurement.</p>
        </Section>
      </TaskDetailContainer>
    );
  }
  
  return (
    <TaskDetailContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <HeaderContainer>
        <TitleArea>
          <TaskTitle>{task.titre}</TaskTitle>
          <StatusBadge status={task.statut}>
            {translateStatus(task.statut)}
          </StatusBadge>
        </TitleArea>
        
        <ButtonGroup>
          <Button 
            variant="text" 
            onClick={handleBackClick} 
            icon={<BackIcon />}
          >
            Retour
          </Button>
          <Button 
            variant="primary" 
            onClick={handleEditClick} 
            icon={<EditIcon />}
          >
            Modifier
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleDeleteClick} 
            icon={<DeleteIcon />}
          >
            Supprimer
          </Button>
        </ButtonGroup>
      </HeaderContainer>
      
      <Section>
        <SectionTitle>Description</SectionTitle>
        <Description>
          {task.description || 'Aucune description fournie.'}
        </Description>
      </Section>
      
      <Section>
        <SectionTitle>Détails</SectionTitle>
        <DetailsList>
          <DetailItem>
            <DetailLabel>Priorité</DetailLabel>
            <DetailValue>{translatePriority(task.priorite)}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Date d'échéance</DetailLabel>
            <DetailValue>{formatDate(task.dateEcheance)}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Date de création</DetailLabel>
            <DetailValue>{formatDate(task.dateCreation)}</DetailValue>
          </DetailItem>
          
          {task.cout && (
            <DetailItem>
              <DetailLabel>Coût</DetailLabel>
              <DetailValue>{task.cout} €</DetailValue>
            </DetailItem>
          )}
        </DetailsList>
      </Section>
      
      {task.assignedUser && (
        <Section>
          <SectionTitle>Assigné à</SectionTitle>
          <UserCard>
            <UserAvatar>{getInitials(task.assignedUser)}</UserAvatar>
            <UserInfo>
              <UserName>{task.assignedUser.prenom} {task.assignedUser.nom}</UserName>
              <UserRole>{translateRoleName(task.assignedUser.role)}</UserRole>
            </UserInfo>
          </UserCard>
        </Section>
      )}
      
      {task.client && (
        <Section>
          <SectionTitle>Client</SectionTitle>
          <DetailsList>
            <DetailItem>
              <DetailLabel>Nom</DetailLabel>
              <DetailValue>{task.client.nom}</DetailValue>
            </DetailItem>
            
            {task.client.email && (
              <DetailItem>
                <DetailLabel>Email</DetailLabel>
                <DetailValue>{task.client.email}</DetailValue>
              </DetailItem>
            )}
            
            {task.client.telephone && (
              <DetailItem>
                <DetailLabel>Téléphone</DetailLabel>
                <DetailValue>{task.client.telephone}</DetailValue>
              </DetailItem>
            )}
          </DetailsList>
        </Section>
      )}
    </TaskDetailContainer>
  );
};

export default TaskDetail; 