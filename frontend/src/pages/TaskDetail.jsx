import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { taskService } from '../services/taskService';
import { commentService } from '../services/commentService';
import { userService } from '../services/userService';
import { clientService } from '../services/clientService';
import { attachmentService } from '../services/attachmentService';
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

const CommentSection = styled(Section)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const CommentInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const CommentInput = styled.textarea`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.75rem 1.4rem;
  color: ${({ theme }) => theme.colors.text};
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  z-index: 1;
  position: relative;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(255, 122, 80, 0.2);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const FormattedPreview = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0.60rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: inherit;
  background: transparent;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
  pointer-events: none;
  color: transparent;
  
  .mention-tag, .mention-tag-client {
    color: transparent;
    position: relative;
    
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 4px;
      z-index: -1;
    }
  }
  
  .mention-tag::before {
    background: rgba(255, 122, 80, 0.2);
  }
  
  .mention-tag-client::before {
    background: rgba(80, 160, 255, 0.15);
  }
`;

const MentionDropdown = styled.div`
  position: absolute;
  background: #1e1e2d;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10000;
  width: 220px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
`;

const MentionItem = styled.div`
  padding: 0.5rem 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const MentionTag = styled.span`
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.2rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin: 0 0.2rem;
  font-size: 0.9em;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CommentCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CommentAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CommentMeta = styled.div`
  color: ${({ theme }) => theme.colors.textTertiary};
  font-size: 0.8rem;
`;

const CommentContent = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

const CommentDeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.error};
  opacity: 0.6;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const NoCommentsMessage = styled.p`
  color: ${({ theme }) => theme.colors.textTertiary};
  text-align: center;
  padding: 1rem;
`;

const formatCommentDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
  </svg>
);

const FormOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
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

const AttachmentSection = styled(Section)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AttachmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const AttachmentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FileIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 122, 80, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.primary};
`;

const FileName = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const FileSize = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-left: 0.5rem;
`;

const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: 1rem;
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  width: fit-content;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const SelectedFileName = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.5rem;
`;

const AttachmentActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const DocumentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [clients, setClients] = useState([]);
  const [submittingTask, setSubmittingTask] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentionType, setMentionType] = useState(null); // 'user' ou 'client'
  const [selectedMentions, setSelectedMentions] = useState({
    users: new Set(),
    clients: new Set()
  });
  const [formattedComment, setFormattedComment] = useState('');
  
  const textareaRef = useRef(null);
  const mirrorRef = useRef(null);
  
  useEffect(() => {
    // Récupérer l'utilisateur connecté à partir du localStorage
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
      } catch (err) {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
      }
    }
  }, []);
  
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
  
  useEffect(() => {
    const fetchComments = async () => {
      if (id === 'new' || !id) return;
      
      try {
        const commentData = await commentService.getCommentsByTaskId(id);
        setComments(commentData);
      } catch (err) {
        console.error(`Erreur lors du chargement des commentaires pour la tâche ${id}:`, err);
        // Ne pas définir d'erreur ici pour ne pas bloquer le rendu de la page
      }
    };
    
    fetchComments();
  }, [id]);
  
  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const data = await userService.getDeveloperUsers();
        setDevelopers(data);
      } catch (error) {
        console.error('Erreur lors du chargement des développeurs:', error);
      }
    };
    
    const fetchClients = async () => {
      try {
        const data = await clientService.getAllClients();
        setClients(data);
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
      }
    };
    
    fetchDevelopers();
    fetchClients();
  }, []);
  
  useEffect(() => {
    if (task && !editedTask) {
      setEditedTask({
        ...task,
        assignedUserId: task.assignedUser?.id || '',
        clientId: task.client?.id || '',
      });
    }
  }, [task]);
  
  useEffect(() => {
    const fetchAttachments = async () => {
      if (id === 'new' || !id) return;
      
      try {
        const data = await attachmentService.getAttachmentsByTaskId(id);
        setAttachments(data);
      } catch (err) {
        console.error(`Erreur lors du chargement des pièces jointes pour la tâche ${id}:`, err);
      }
    };
    
    fetchAttachments();
  }, [id]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'assignedUserId') {
      setEditedTask({
        ...editedTask,
        assignedUser: {
          id: value || null
        }
      });
    } else if (name === 'clientId') {
      setEditedTask({
        ...editedTask,
        client: {
          id: value || null
        }
      });
    } else {
      setEditedTask({
        ...editedTask,
        [name]: value
      });
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (submittingTask) return;
    
    setSubmittingTask(true);
    
    try {
      const updatedTask = await taskService.updateTask(id, editedTask);
      setTask(updatedTask);
      setShowEditForm(false);
      alert('Tâche mise à jour avec succès!');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      alert('Impossible de mettre à jour la tâche. Veuillez réessayer.');
    } finally {
      setSubmittingTask(false);
    }
  };
  
  const handleCloseForm = () => {
    setShowEditForm(false);
    // Reset form if needed
    if (task) {
      setEditedTask({
        ...task,
        assignedUserId: task.assignedUser?.id || '',
        clientId: task.client?.id || '',
      });
    }
  };
  
  const handleCommentInput = (e) => {
    const value = e.target.value;
    setNewComment(value);

    // Générer l'aperçu formaté
    let formattedText = value;
    
    // Formater les mentions d'utilisateurs (seulement celles qui existent dans le texte)
    developers.forEach(dev => {
      const devUsername = `@${dev.username}`;
      if (formattedText.includes(devUsername)) {
        const regex = new RegExp(`@${dev.username}(\\s|$)`, 'g');
        formattedText = formattedText.replace(regex, `<span class="mention-tag">@${dev.username}</span>$1`);
      }
    });
    
    // Formater les mentions de clients (seulement celles qui existent dans le texte)
    clients.forEach(client => {
      const clientName = `@${client.nom}`;
      if (formattedText.includes(clientName)) {
        const regex = new RegExp(`@${client.nom}(\\s|$)`, 'g');
        formattedText = formattedText.replace(regex, `<span class="mention-tag-client">@${client.nom}</span>$1`);
      }
    });
    
    setFormattedComment(formattedText);

    // Détecter la position du @ et calculer où mettre le dropdown
    const lastAtSymbol = value.lastIndexOf('@');
    
    if (lastAtSymbol !== -1) {
      const textAfterAt = value.slice(lastAtSymbol + 1);
      const spaceAfterAt = textAfterAt.indexOf(' ');
      
      if (spaceAfterAt === -1) {
        setMentionSearch(textAfterAt);
        setShowMentionDropdown(true);
        
        // Type de mention
        setMentionType(textAfterAt.toLowerCase().startsWith('c') ? 'client' : 'user');
        
        // Obtenir la position exacte du @
        const textarea = textareaRef.current;
        if (!textarea) return;
        
        // Obtenir la position du curseur
        const cursorPos = lastAtSymbol;
        
        // Créer un div temporaire avec le même style que le textarea
        const div = document.createElement('div');
        const style = window.getComputedStyle(textarea);
        
        // Copier les styles pertinents
        div.style.font = style.font;
        div.style.width = textarea.offsetWidth + 'px';
        div.style.padding = style.padding;
        div.style.whiteSpace = 'pre-wrap';
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.top = '0';
        div.style.left = '0';
        
        // Ajouter le texte jusqu'au @
        const textBeforeAt = value.substring(0, cursorPos);
        div.textContent = textBeforeAt;
        
        // Ajouter un span pour le @
        const atSpan = document.createElement('span');
        atSpan.id = 'at-marker';
        atSpan.textContent = '@';
        div.appendChild(atSpan);
        
        // Ajouter à la page pour mesurer
        document.body.appendChild(div);
        
        // Mesurer où se trouve le @
        const atMarker = div.querySelector('#at-marker');
        const atRect = atMarker.getBoundingClientRect();
        
        // Nettoyer
        document.body.removeChild(div);
        
        // Position du dropdown à côté du @
        const textareaRect = textarea.getBoundingClientRect();
        
        setMentionPosition({
          top: atRect.top - textareaRect.top + textareaRect.top + window.scrollY,
          left: atRect.left - textareaRect.left + textareaRect.left + window.scrollX
        });
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };

  const getTextWidth = (text, element) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const style = window.getComputedStyle(element);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return context.measureText(text).width;
  };

  const handleMentionSelect = (item) => {
    console.log("Mention sélectionnée:", item);
    
    // Insérer la mention dans le texte
    const mentionText = mentionType === 'user' ? `@${item.username}` : `@${item.nom}`;
    const lastAtSymbol = newComment.lastIndexOf('@');
    const newText = newComment.slice(0, lastAtSymbol) + mentionText + ' ' + newComment.slice(lastAtSymbol + mentionSearch.length + 1);
    
    setNewComment(newText);
    setShowMentionDropdown(false);
    
    // Mettre à jour l'aperçu formaté de manière optimisée pour éviter les doublons
    let formattedText = newText;
    
    // Réinitialiser l'aperçu formaté à chaque fois pour éviter l'accumulation
    // Appliquer seulement les mentions qui existent réellement dans le texte
    developers.forEach(dev => {
      const devUsername = `@${dev.username}`;
      if (formattedText.includes(devUsername)) {
        const regex = new RegExp(`@${dev.username}(\\s|$)`, 'g');
        formattedText = formattedText.replace(regex, `<span class="mention-tag">@${dev.username}</span>$1`);
      }
    });
    
    clients.forEach(client => {
      const clientName = `@${client.nom}`;
      if (formattedText.includes(clientName)) {
        const regex = new RegExp(`@${client.nom}(\\s|$)`, 'g');
        formattedText = formattedText.replace(regex, `<span class="mention-tag-client">@${client.nom}</span>$1`);
      }
    });
    
    setFormattedComment(formattedText);
    
    // Mettre à jour les mentions sélectionnées
    if (mentionType === 'user') {
      setSelectedMentions(prev => ({
        ...prev,
        users: new Set([...prev.users, item.id])
      }));
    } else {
      setSelectedMentions(prev => ({
        ...prev,
        clients: new Set([...prev.clients, item.id])
      }));
    }
    
    // Donner le focus au textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
      
      // Placer le curseur à la fin du texte
      const len = newText.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !currentUser || submittingComment) {
      return;
    }
    
    setSubmittingComment(true);
    
    const userIds = Array.from(selectedMentions.users);
    const clientIds = Array.from(selectedMentions.clients);
    
    console.log("DONNÉES AVANT ENVOI:", JSON.stringify({
      contenu: newComment.trim(),
      taskId: parseInt(id),
      authorId: currentUser.id,
      mentionedUserIds: userIds,
      mentionedClientIds: clientIds
    }, null, 2));
    
    try {
      const commentData = {
        contenu: newComment.trim(),
        taskId: parseInt(id),
        authorId: currentUser.id,
        mentionedUserIds: userIds,
        mentionedClientIds: clientIds
      };
      
      const savedComment = await commentService.createComment(commentData);
      console.log("DONNÉES APRÈS RÉPONSE:", JSON.stringify(savedComment, null, 2));
      
      setComments([...comments, savedComment]);
      setNewComment('');
      setFormattedComment('');
      setSelectedMentions({ users: new Set(), clients: new Set() });
    } catch (err) {
      console.error('Erreur lors de la création du commentaire:', err);
      alert('Impossible d\'ajouter le commentaire. Veuillez réessayer.');
    } finally {
      setSubmittingComment(false);
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    if (!commentId || !window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }
    
    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error(`Erreur lors de la suppression du commentaire ${commentId}:`, err);
      alert('Impossible de supprimer le commentaire. Veuillez réessayer.');
    }
  };
  
  const handleEditClick = () => {
    setShowEditForm(true);
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
  
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  
  const handleFileUpload = async () => {
    if (!selectedFile || !currentUser) {
      if (!selectedFile) {
        alert('Veuillez sélectionner un fichier.');
      } else if (!currentUser) {
        alert('Vous devez être connecté pour télécharger un fichier.');
      }
      return;
    }
    
    setUploadingFile(true);
    
    try {
      const data = await attachmentService.uploadAttachment(selectedFile, id);
      
      // Ajouter la nouvelle pièce jointe à la liste
      setAttachments([...attachments, data]);
      
      // Réinitialiser le fichier sélectionné
      setSelectedFile(null);
      
      // Réinitialiser l'élément input file
      document.getElementById('file-upload').value = '';
      
      alert('Fichier téléchargé avec succès!');
    } catch (err) {
      console.error('Erreur lors du téléchargement du fichier:', err);
      alert('Impossible de télécharger le fichier. Veuillez réessayer.');
    } finally {
      setUploadingFile(false);
    }
  };
  
  const handleDeleteAttachment = async (attachmentId) => {
    if (!currentUser) {
      alert('Vous devez être connecté pour supprimer un fichier.');
      return;
    }
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette pièce jointe ?')) {
      return;
    }
    
    try {
      await attachmentService.deleteAttachment(attachmentId);
      
      // Mettre à jour la liste des pièces jointes
      setAttachments(attachments.filter(attachment => attachment.id !== attachmentId));
      
      alert('Pièce jointe supprimée avec succès!');
    } catch (err) {
      console.error('Erreur lors de la suppression de la pièce jointe:', err);
      alert('Impossible de supprimer la pièce jointe. Veuillez réessayer.');
    }
  };
  
  const renderMentionDropdown = () => {
    if (!showMentionDropdown) return null;
    const filteredItems = mentionType === 'user'
      ? developers.filter(dev => dev.username.toLowerCase().includes(mentionSearch.toLowerCase()))
      : clients.filter(client => client.nom.toLowerCase().includes(mentionSearch.toLowerCase()));
    if (filteredItems.length === 0) return null;
    // Fixer la position du dropdown exactement près du @
    // en ajustant juste assez pour la visibilité
    return (
      <div style={{
        position: 'fixed', // Position fixe pour éviter les problèmes de défilement
        top: mentionPosition.top + 24, // Ajuster légèrement sous le @
        left: mentionPosition.left,
        zIndex: 10000
      }}>
        <MentionDropdown>
          {filteredItems.map(item => (
            <MentionItem
              key={item.id}
              onClick={() => handleMentionSelect(item)}
            >
              <UserAvatar>
                {getInitials({
                  prenom: mentionType === 'user' ? item.username.split(' ')[0] : item.nom.split(' ')[0],
                  nom: mentionType === 'user' ? item.username.split(' ')[1] || '' : item.nom.split(' ')[1] || ''
                })}
              </UserAvatar>
              {mentionType === 'user' ? item.username : item.nom}
            </MentionItem>
          ))}
        </MentionDropdown>
      </div>
    );
  };

  const renderCommentContent = (content, mentionedUsers, mentionedClients) => {
    console.log("Mentions utilisateurs:", mentionedUsers);
    console.log("Mentions clients:", mentionedClients);
    
    // Si aucune mention, simplement retourner le contenu
    if ((!mentionedUsers || mentionedUsers.length === 0) && 
        (!mentionedClients || mentionedClients.length === 0)) {
      return content;
    }
    
    // Convertir le texte en fragments React avec des styles directs
    let segments = [content];
    
    // Traitement des mentions utilisateurs
    if (mentionedUsers && mentionedUsers.length > 0) {
      mentionedUsers.forEach(username => {
        const atUsername = `@${username}`;
        // Vérifier si cette mention existe dans le texte
        if (content.includes(atUsername)) {
          const newSegments = [];
          
          segments.forEach(segment => {
            if (typeof segment === 'string') {
              const parts = segment.split(atUsername);
              for (let i = 0; i < parts.length; i++) {
                if (i > 0) {
                  // Ajouter la mention stylisée
                  newSegments.push(
                    <span key={`user-${username}-${i}`} style={{ 
                      background: 'rgba(255, 122, 80, 0.2)',
                      color: '#ff7a50',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      margin: '0 0.2rem',
                      fontSize: '0.9em',
                      display: 'inline-block'
                    }}>{atUsername}</span>
                  );
                }
                if (parts[i].length > 0) {
                  newSegments.push(parts[i]);
                }
              }
            } else {
              newSegments.push(segment);
            }
          });
          
          segments = newSegments;
        }
      });
    }
    
    // Traitement des mentions clients
    if (mentionedClients && mentionedClients.length > 0) {
      mentionedClients.forEach(clientName => {
        const atClientName = `@${clientName}`;
        // Vérifier si cette mention existe dans le texte
        if (content.includes(atClientName)) {
          const newSegments = [];
          
          segments.forEach(segment => {
            if (typeof segment === 'string') {
              const parts = segment.split(atClientName);
              for (let i = 0; i < parts.length; i++) {
                if (i > 0) {
                  // Ajouter la mention stylisée
                  newSegments.push(
                    <span key={`client-${clientName}-${i}`} style={{ 
                      background: 'rgba(80, 160, 255, 0.15)',
                      color: '#50a0ff',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      margin: '0 0.2rem',
                      fontSize: '0.9em',
                      display: 'inline-block'
                    }}>{atClientName}</span>
                  );
                }
                if (parts[i].length > 0) {
                  newSegments.push(parts[i]);
                }
              }
            } else {
              newSegments.push(segment);
            }
          });
          
          segments = newSegments;
        }
      });
    }
    
    return <>{segments}</>;
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
      
      <AttachmentSection>
        <SectionTitle>
          <DocumentIcon />
          Pièces jointes
        </SectionTitle>
        
        {currentUser ? (
          <FileUploadContainer>
            <FileInputLabel htmlFor="file-upload">
              <UploadIcon />
              Sélectionner un fichier
            </FileInputLabel>
            <FileInput 
              id="file-upload" 
              type="file" 
              onChange={handleFileChange} 
            />
            
            {selectedFile && (
              <SelectedFileName>
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </SelectedFileName>
            )}
            
            <Button
              variant="primary"
              onClick={handleFileUpload}
              disabled={!selectedFile || uploadingFile}
              style={{ alignSelf: 'flex-start' }}
            >
              {uploadingFile ? 'Téléchargement...' : 'Télécharger'}
            </Button>
          </FileUploadContainer>
        ) : (
          <div style={{ marginBottom: '1rem', color: 'var(--color-warning)' }}>
            Connectez-vous pour ajouter des pièces jointes.
          </div>
        )}
        
        <AttachmentList>
          {attachments.length === 0 ? (
            <p>Aucune pièce jointe pour cette tâche.</p>
          ) : (
            attachments.map(attachment => (
              <AttachmentItem key={attachment.id}>
                <AttachmentInfo>
                  <FileIcon>
                    <DocumentIcon />
                  </FileIcon>
                  <div>
                    <FileName>{attachment.fileName}</FileName>
                    <FileSize>{formatFileSize(attachment.fileSize)}</FileSize>
                  </div>
                </AttachmentInfo>
                
                <AttachmentActions>
                  <Button
                    variant="text"
                    onClick={() => window.open(attachmentService.getDownloadUrl(attachment.id), '_blank')}
                    title="Télécharger"
                    style={{ padding: '0.25rem' }}
                  >
                    <DownloadIcon />
                  </Button>
                  
                  {currentUser && (currentUser.id === attachment.uploadedById || currentUser.role === 'CHEF_PROJET') && (
                    <Button
                      variant="text"
                      onClick={() => handleDeleteAttachment(attachment.id)}
                      title="Supprimer"
                      style={{ padding: '0.25rem', color: 'var(--color-error)' }}
                    >
                      <TrashIcon />
                    </Button>
                  )}
                </AttachmentActions>
              </AttachmentItem>
            ))
          )}
        </AttachmentList>
      </AttachmentSection>
      
      <CommentSection>
        <SectionTitle>Commentaires</SectionTitle>
        
        {currentUser && (
          <CommentForm onSubmit={handleSubmitComment}>
            <div style={{ position: 'relative' }}>
              <CommentInputWrapper>
                <CommentInput
                  ref={textareaRef}
                  value={newComment}
                  onChange={handleCommentInput}
                  placeholder="Ajouter un commentaire... (utilisez @ pour mentionner)"
                  required
                />
                <FormattedPreview dangerouslySetInnerHTML={{ __html: formattedComment }} />
              </CommentInputWrapper>
              {renderMentionDropdown()}
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={!newComment.trim() || submittingComment}
              style={{ alignSelf: 'flex-end' }}
            >
              {submittingComment ? 'Envoi en cours...' : 'Ajouter'}
            </Button>
          </CommentForm>
        )}
        
        <CommentList>
          {comments.length === 0 ? (
            <NoCommentsMessage>Aucun commentaire pour cette tâche.</NoCommentsMessage>
          ) : (
            comments.map(comment => (
              <CommentCard key={comment.id}>
                <CommentHeader>
                  <CommentAuthor>
                    <UserAvatar>{getInitials({ prenom: comment.authorUsername.split(' ')[0], nom: comment.authorUsername.split(' ')[1] || '' })}</UserAvatar>
                    <strong>{comment.authorUsername}</strong>
                  </CommentAuthor>
                  
                  <CommentMeta>
                    {formatCommentDate(comment.dateCreation)}
                    {currentUser && (currentUser.id === comment.authorId || currentUser.role === 'CHEF_PROJET') && (
                      <CommentDeleteButton
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        title="Supprimer le commentaire"
                      >
                        <TrashIcon />
                      </CommentDeleteButton>
                    )}
                  </CommentMeta>
                </CommentHeader>
                
                <CommentContent>
                  {renderCommentContent(
                    comment.contenu,
                    comment.mentionedUsernames || [],
                    comment.mentionedClientNames || []
                  )}
                </CommentContent>
              </CommentCard>
            ))
          )}
        </CommentList>
      </CommentSection>
      
      {showEditForm && editedTask && (
        <FormOverlay 
          onClick={handleCloseForm}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <FormCard 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <FormContainer onSubmit={handleEditSubmit}>
              <FormTitle>Modifier la tâche</FormTitle>
              
              <FormRow>
                <InputGroup>
                  <Label htmlFor="titre">Titre</Label>
                  <Input 
                    type="text" 
                    id="titre" 
                    name="titre" 
                    value={editedTask.titre} 
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
                    value={editedTask.dateCreation ? editedTask.dateCreation.split('T')[0] : ''} 
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
                  value={editedTask.description || ''} 
                  onChange={handleInputChange} 
                />
              </InputGroup>
              
              <FormRow>
                <InputGroup>
                  <Label htmlFor="priorite">Priorité</Label>
                  <Select 
                    id="priorite" 
                    name="priorite" 
                    value={editedTask.priorite} 
                    onChange={handleInputChange}
                  >
                    <option value="BASSE">Basse</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="HAUTE">Haute</option>
                  </Select>
                </InputGroup>
                
                <InputGroup>
                  <Label htmlFor="statut">Statut</Label>
                  <Select 
                    id="statut" 
                    name="statut" 
                    value={editedTask.statut} 
                    onChange={handleInputChange}
                  >
                    <option value="A_FAIRE">À faire</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINEE">Terminée</option>
                  </Select>
                </InputGroup>
              </FormRow>
              
              <FormRow>
                <InputGroup>
                  <Label htmlFor="dateEcheance">Date d'échéance</Label>
                  <Input 
                    type="date" 
                    id="dateEcheance" 
                    name="dateEcheance" 
                    value={editedTask.dateEcheance ? editedTask.dateEcheance.split('T')[0] : ''} 
                    onChange={handleInputChange} 
                  />
                </InputGroup>
                
                <InputGroup>
                  <Label htmlFor="cout">Coût (€)</Label>
                  <Input 
                    type="number" 
                    id="cout" 
                    name="cout" 
                    value={editedTask.cout || ''} 
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
                    value={editedTask.assignedUser?.id || ''} 
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
                    value={editedTask.client?.id || ''} 
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
                  disabled={submittingTask}
                >
                  {submittingTask ? 'Enregistrement...' : 'Enregistrer les modifications'}
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
    </TaskDetailContainer>
  );
};

export default TaskDetail; 