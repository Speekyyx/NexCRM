import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import Button from '../components/Button';

const RegisterContainer = styled.div`
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

const RegisterCard = styled(motion.div)`
  width: 100%;
  max-width: 480px;
  padding: 2.5rem;
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  @media (max-width: 768px) {
    max-width: 90%;
    padding: 2rem 1.5rem;
  }
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

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormGroup = styled.div`
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

const Select = styled.select`
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => theme.colors.text};
  transition: all ${({ theme }) => theme.transitions.normal};
  appearance: none;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(255, 122, 80, 0.3);
  }
  
  option {
    background: ${({ theme }) => theme.colors.cardBg};
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

const LoginLink = styled.div`
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

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    email: '',
    role: 'CLIENT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    if (!formData.username || !formData.password || !formData.confirmPassword || 
        !formData.nom || !formData.prenom || !formData.email) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const result = await authService.register(formData);
      
      if (result.success) {
        if (result.user) {
          // Si l'utilisateur est déjà connecté après l'inscription
          navigate('/dashboard');
        } else {
          // Rediriger vers la page de connexion
          navigate('/login', { state: { message: 'Inscription réussie. Veuillez vous connecter.' } });
        }
      } else {
        setError(result.message || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <RegisterContainer>
      <GradientBlur position="top right" />
      <GradientBlur position="bottom left" />
      
      <RegisterCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo>NexCRM</Logo>
        <Title>Créer un compte</Title>
        <Subtitle>Inscrivez-vous pour accéder à la plateforme</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">Nom d'utilisateur*</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Entrez votre nom d'utilisateur"
              value={formData.username}
              onChange={handleChange}
            />
          </FormGroup>
          
          <FormRow>
            <FormGroup>
              <Label htmlFor="nom">Nom*</Label>
              <Input
                id="nom"
                name="nom"
                type="text"
                placeholder="Entrez votre nom"
                value={formData.nom}
                onChange={handleChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="prenom">Prénom*</Label>
              <Input
                id="prenom"
                name="prenom"
                type="text"
                placeholder="Entrez votre prénom"
                value={formData.prenom}
                onChange={handleChange}
              />
            </FormGroup>
          </FormRow>
          
          <FormGroup>
            <Label htmlFor="email">Email*</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Entrez votre adresse email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormGroup>
          
          <FormRow>
            <FormGroup>
              <Label htmlFor="password">Mot de passe*</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Créez un mot de passe"
                value={formData.password}
                onChange={handleChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="confirmPassword">Confirmation*</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirmez votre mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </FormGroup>
          </FormRow>
          
          <FormGroup>
            <Label htmlFor="role">Rôle*</Label>
            <Select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="CLIENT">Client</option>
              <option value="DEVELOPPEUR">Développeur</option>
              <option value="CHEF_PROJET">Chef de Projet</option>
            </Select>
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
          
          <Button 
            type="submit" 
            variant="gradient"
            disabled={loading}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </Button>
        </Form>
        
        <LoginLink>
          Vous avez déjà un compte? <Link to="/login">Se connecter</Link>
        </LoginLink>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register; 