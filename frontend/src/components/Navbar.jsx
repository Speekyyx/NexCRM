import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0 2rem 0;
`;

const Logo = styled(motion.div)`
  font-size: 1.8rem;
  font-weight: 700;
  background: ${({ theme }) => theme.colors.gradient.primary};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.gradient.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  box-shadow: ${({ theme }) => theme.shadows.glow};
`;

const UserName = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.span`
  font-weight: 600;
`;

const Role = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LogoutButton = styled(motion.button)`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  font-size: 0.9rem;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const translateRoleName = (role) => {
  const roleMap = {
    'DEVELOPPEUR': 'Développeur',
    'CHEF_PROJET': 'Chef de Projet',
    'CLIENT': 'Client'
  };
  
  return roleMap[role] || role;
};

const Navbar = () => {
  const user = authService.getCurrentUser();
  
  const handleLogout = () => {
    authService.logout();
  };
  
  const getInitials = (user) => {
    if (!user) return 'U';
    return `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`;
  };
  
  return (
    <NavbarContainer>
      <Logo
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
      </Logo>
      
      <UserInfo>
        <UserName>
          <Name>{user?.prenom} {user?.nom}</Name>
          <Role>{translateRoleName(user?.role)}</Role>
        </UserName>
        
        <Avatar>
          {getInitials(user)}
        </Avatar>
        
        <LogoutButton
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Déconnexion
        </LogoutButton>
      </UserInfo>
    </NavbarContainer>
  );
};

export default Navbar; 