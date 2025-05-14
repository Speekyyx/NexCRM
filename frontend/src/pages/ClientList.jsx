import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import api from '../services/api';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const ClientListContainer = styled.div`
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

const ClientTable = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Td = styled.td`
  padding: 1rem;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const Tr = styled.tr`
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
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

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

// Animation pour la liste
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    societe: ''
  });
  
  useEffect(() => {
    fetchClients();
  }, []);
  
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateClient = () => {
    setCurrentClient(null);
    setFormData({
      nom: '',
      email: '',
      telephone: '',
      adresse: '',
      societe: ''
    });
    setShowForm(true);
  };
  
  const handleEditClient = (client) => {
    setCurrentClient(client);
    setFormData({
      nom: client.nom,
      email: client.email,
      telephone: client.telephone || '',
      adresse: client.adresse || '',
      societe: client.societe || ''
    });
    setShowForm(true);
  };
  
  const handleDeleteClient = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await api.delete(`/clients/${id}`);
        fetchClients();
      } catch (error) {
        console.error('Erreur lors de la suppression du client:', error);
      }
    }
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentClient(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentClient) {
        // Mise à jour
        await api.put(`/clients/${currentClient.id}`, formData);
      } else {
        // Création
        await api.post('/clients', formData);
      }
      fetchClients();
      handleCloseForm();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du client:', error);
    }
  };
  
  return (
    <ClientListContainer>
      <Header>
        <Title>
          Gestionnaire de <span>Clients</span>
        </Title>
        
        <Button 
          variant="gradient"
          onClick={handleCreateClient}
          icon={<AddIcon />}
        >
          Nouveau client
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
              <FormTitle>
                {currentClient ? 'Modifier un client' : 'Créer un nouveau client'}
              </FormTitle>
              
              <FormRow>
                <InputGroup>
                  <Label htmlFor="nom">Nom</Label>
                  <Input 
                    type="text" 
                    id="nom" 
                    name="nom" 
                    value={formData.nom} 
                    onChange={handleInputChange} 
                    required 
                  />
                </InputGroup>
                
                <InputGroup>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                  />
                </InputGroup>
              </FormRow>
              
              <FormRow>
                <InputGroup>
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input 
                    type="tel" 
                    id="telephone" 
                    name="telephone" 
                    value={formData.telephone} 
                    onChange={handleInputChange} 
                  />
                </InputGroup>
                
                <InputGroup>
                  <Label htmlFor="societe">Société</Label>
                  <Input 
                    type="text" 
                    id="societe" 
                    name="societe" 
                    value={formData.societe} 
                    onChange={handleInputChange} 
                  />
                </InputGroup>
              </FormRow>
              
              <InputGroup>
                <Label htmlFor="adresse">Adresse</Label>
                <Input 
                  type="text" 
                  id="adresse" 
                  name="adresse" 
                  value={formData.adresse} 
                  onChange={handleInputChange} 
                />
              </InputGroup>
              
              <ButtonGroup>
                <Button 
                  type="submit" 
                  variant="gradient"
                >
                  {currentClient ? 'Mettre à jour' : 'Créer'}
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
      ) : clients.length > 0 ? (
        <ClientTable>
          <Table>
            <thead>
              <tr>
                <Th>Nom</Th>
                <Th>Email</Th>
                <Th>Téléphone</Th>
                <Th>Société</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <Tr key={client.id}>
                  <Td>{client.nom}</Td>
                  <Td>{client.email}</Td>
                  <Td>{client.telephone || '-'}</Td>
                  <Td>{client.societe || '-'}</Td>
                  <Td>
                    <ActionButtons>
                      <Button 
                        variant="icon" 
                        size="small"
                        onClick={() => handleEditClient(client)}
                        icon={<EditIcon />}
                      />
                      <Button 
                        variant="icon-danger" 
                        size="small"
                        onClick={() => handleDeleteClient(client.id)}
                        icon={<DeleteIcon />}
                      />
                    </ActionButtons>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </ClientTable>
      ) : (
        <EmptyState
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <EmptyStateTitle>Aucun client trouvé</EmptyStateTitle>
          <p>Commencez par créer un nouveau client</p>
          <Button 
            variant="primary"
            style={{ marginTop: '1.5rem' }}
            onClick={handleCreateClient}
            icon={<AddIcon />}
          >
            Créer un client
          </Button>
        </EmptyState>
      )}
    </ClientListContainer>
  );
};

export default ClientList; 