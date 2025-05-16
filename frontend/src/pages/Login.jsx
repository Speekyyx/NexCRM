import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import Button from '../components/Button';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  position: relative;
  overflow: hidden;
`;

const GradientBlur = styled.div`
  position: absolute;
  width: 30vw;
  height: 30vw;
  border-radius: 50%;
  background: ${({ theme, position }) => position === 'top' 
    ? theme.colors.gradient.primary
    : theme.colors.gradient.secondary};
  filter: blur(80px);
  opacity: 0.2;
  top: ${({ position }) => position === 'top' ? '-15vw' : 'auto'};
  bottom: ${({ position }) => position === 'bottom' ? '-15vw' : 'auto'};
  left: ${({ position }) => position === 'left' ? '-15vw' : 'auto'};
  right: ${({ position }) => position === 'right' ? '-15vw' : 'auto'};
`;

const LoginCard = styled(motion.div)`
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 700;
  background: ${({ theme }) => theme.colors.gradient.primary};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  margin-bottom: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => theme.colors.text};
  transition: all ${({ theme }) => theme.transitions.normal};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(255, 122, 80, 0.3);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textDisabled};
  }
`;

const ErrorMessage = styled(motion.div)`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(244, 63, 94, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: 0.5rem;
    width: 20px;
    height: 20px;
  }
`;

const SuccessMessage = styled(motion.div)`
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(34, 197, 94, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: 0.5rem;
    width: 20px;
    height: 20px;
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SuccessIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12L11 15L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Vérifier si un message est passé via l'état de navigation
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Effacer le state pour éviter que le message réapparaisse à chaque rendu
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    setLoading(true);
    try {
      const result = await authService.login(username, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Identifiants incorrects');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <LoginContainer>
      <GradientBlur position="top right" />
      <GradientBlur position="bottom left" />
      
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo>NexCRM</Logo>
        <Title>Connexion</Title>
        <Subtitle>Connectez-vous à votre compte pour continuer</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              type="text"
              placeholder="Entrez votre nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormGroup>
          
          {error && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ErrorIcon />
              {error}
            </ErrorMessage>
          )}
          
          {successMessage && (
            <SuccessMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SuccessIcon />
              {successMessage}
            </SuccessMessage>
          )}
          
          <Button 
            type="submit" 
            variant="gradient"
            disabled={loading}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </Form>
        
        <RegisterLink>
          Vous n'avez pas de compte? <Link to="/register">S'inscrire</Link>
        </RegisterLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login; 