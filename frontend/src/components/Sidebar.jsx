import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Icônes - Ici, nous allons simplement créer des composants avec des formes basiques
// Dans un vrai projet, vous pourriez utiliser react-icons ou une autre bibliothèque
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const TaskIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClientIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SidebarContainer = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  width: 260px;
  height: 100vh;
  background: ${({ theme }) => theme.colors.backgroundLight};
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  z-index: 100;
  box-shadow: ${({ theme }) => theme.shadows.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    transform: translateX(-100%);
  }
`;

const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  padding: 0 1rem;
  background: ${({ theme }) => theme.colors.gradient.primary};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const NavigationMenu = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: rgba(255, 255, 255, 0.05);
  }
  
  &.active {
    color: ${({ theme }) => theme.colors.text};
    background: rgba(255, 255, 255, 0.05);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 4px;
      height: 100%;
      background: ${({ theme }) => theme.colors.gradient.primary};
      border-radius: 0 2px 2px 0;
    }
  }
`;

const NavText = styled.span`
  font-weight: 500;
`;

const Footer = styled.div`
  margin-top: auto;
  padding: 1rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textDisabled};
  text-align: center;
`;

const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.4,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const Sidebar = () => {
  return (
    <SidebarContainer>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
      >
        <Logo>NexCRM</Logo>
        
        <NavigationMenu>
          <motion.div variants={itemVariants}>
            <StyledNavLink to="/dashboard">
              <DashboardIcon />
              <NavText>Tableau de bord</NavText>
            </StyledNavLink>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StyledNavLink to="/tasks">
              <TaskIcon />
              <NavText>Tâches</NavText>
            </StyledNavLink>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StyledNavLink to="/clients">
              <ClientIcon />
              <NavText>Clients</NavText>
            </StyledNavLink>
          </motion.div>
        </NavigationMenu>
      </motion.div>
      
      <Footer>
        NexCRM v1.0.0 © 2025
      </Footer>
    </SidebarContainer>
  );
};

export default Sidebar; 