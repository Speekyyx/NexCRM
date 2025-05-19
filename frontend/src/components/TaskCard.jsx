import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.normal};
  height: 250px; /* Hauteur fixe */
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: rgba(255, 122, 80, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ status, theme }) => {
      if (status === 'TERMINEE') return theme.colors.success;
      if (status === 'EN_COURS') return theme.colors.warning;
      return theme.colors.primary;
    }};
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const Status = styled.span`
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: 600;
  background: ${({ status, theme }) => {
    if (status === 'TERMINEE') return 'rgba(45, 212, 191, 0.1)';
    if (status === 'EN_COURS') return 'rgba(251, 191, 36, 0.1)';
    return 'rgba(255, 122, 80, 0.1)';
  }};
  color: ${({ status, theme }) => {
    if (status === 'TERMINEE') return theme.colors.success;
    if (status === 'EN_COURS') return theme.colors.warning;
    return theme.colors.primary;
  }};
`;

const Priority = styled.span`
  font-size: 0.8rem;
  color: ${({ priority, theme }) => {
    if (priority === 'HAUTE') return theme.colors.error;
    if (priority === 'MOYENNE') return theme.colors.warning;
    return theme.colors.textSecondary;
  }};
`;

const DateInfo = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.5rem;
`;

const UserName = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserInitials = styled.span`
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
`;

const AssignedUsers = styled.div`
  display: flex;
  gap: 0.5rem;
`;

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
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const getInitials = (user) => {
  if (!user) return '';
  return `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`;
};

const TaskCard = ({ task }) => {
  return (
    <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none' }}>
      <Card
        status={task.statut}
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ContentArea>
          <Title>{task.titre}</Title>
          <Description>{task.description}</Description>
          
          {task.assignedUsers && task.assignedUsers.length > 0 && (
            <AssignedUsers>
              {task.assignedUsers.map(user => (
                <UserName key={user.id}>
                  <UserInitials>{getInitials(user)}</UserInitials>
                  {user.prenom} {user.nom}
                </UserName>
              ))}
            </AssignedUsers>
          )}
          
          <DateInfo>
            Échéance: {formatDate(task.dateEcheance)}
          </DateInfo>
        </ContentArea>
        
        <Footer>
          <Status status={task.statut}>
            {translateStatus(task.statut)}
          </Status>
          
          <Priority priority={task.priorite}>
            {translatePriority(task.priorite)}
          </Priority>
        </Footer>
      </Card>
    </Link>
  );
};

export default TaskCard; 