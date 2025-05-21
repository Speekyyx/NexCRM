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
  justify-content: space-between;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: 1rem;
  transition: all ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
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
  align-items: center;
  gap: 0.75rem;
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
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.5rem;
  font-size: 1rem;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
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

const AssignedUsersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const AssignedCount = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: rgba(255, 255, 255, 0.05);
  padding: 0.3rem 0.8rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.danger};
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.colors.dangerHover};
    transform: scale(1.1);
  }
  
  &:disabled {
    color: ${({ theme }) => theme.colors.textSecondary};
    cursor: not-allowed;
    
    &:hover {
      transform: none;
    }
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const AssignmentRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  align-items: center;
`;

const AddButton = styled.button`
  background: none;
  border: 2px dashed ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary}10;
  }
`;

const Categories = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const CategoryTag = styled.span`
  font-size: 0.8rem;
  padding: 0.3rem 0.8rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.primary}15;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  button {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    opacity: 0.6;
    
    &:hover {
      opacity: 1;
    }
  }
`;

const CategorySelect = styled(Select)`
  min-width: 200px;
`;

const TaskDetail = ({ taskId: propTaskId, onClose, updateTaskInList, isModal = false }) => {
  const { id: paramTaskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [clients, setClients] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [mentionDropdownVisible, setMentionDropdownVisible] = useState(false);
  const [mentionSearchResults, setMentionSearchResults] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [assignmentRows, setAssignmentRows] = useState([{ id: Date.now() }]);
  const [selectedMentions, setSelectedMentions] = useState({
    users: new Set(),
    clients: new Set()
  });
  const [formattedComment, setFormattedComment] = useState('');
  const commentInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const activeTaskId = propTaskId || paramTaskId;

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
    if (activeTaskId) {
      fetchTask();
      fetchComments();
      fetchDevelopers();
      fetchClients();
      fetchAttachments();
      fetchCategories();
    }
  }, [activeTaskId]);

  useEffect(() => {
    if (task && !editedTask) {
      setEditedTask({
        ...task,
        assignedUsers: task.assignedUsers || [],
        clientId: task.client?.id || '',
      });
      // Initialiser les lignes d'assignation avec les utilisateurs existants
      if (task.assignedUsers && task.assignedUsers.length > 0) {
        setAssignmentRows(task.assignedUsers.map(user => ({ 
          id: Date.now() + user.id, 
          userId: user.id 
        })));
      }
    }
  }, [task]);

  const fetchTask = async () => {
    try {
      const taskData = await taskService.getTaskById(activeTaskId);
      setTask(taskData);
      if (updateTaskInList) {
        updateTaskInList(taskData);
      }
    } catch (err) {
      console.error(`Erreur lors du chargement de la tâche ${activeTaskId}:`, err);
      setError('Impossible de charger les détails de la tâche. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const commentData = await commentService.getCommentsByTaskId(activeTaskId);
      setComments(commentData);
    } catch (err) {
      console.error(`Erreur lors du chargement des commentaires pour la tâche ${activeTaskId}:`, err);
    }
  };

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

  const fetchAttachments = async () => {
    try {
      const data = await attachmentService.getAttachmentsByTaskId(activeTaskId);
      setAttachments(data);
    } catch (err) {
      console.error(`Erreur lors du chargement des pièces jointes pour la tâche ${activeTaskId}:`, err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'assignedUsers') {
      setEditedTask({
        ...editedTask,
        assignedUsers: [...editedTask.assignedUsers, { id: value }]
      });
    } else if (name === 'clientId') {
      setEditedTask({
        ...editedTask,
        client: { id: value || null }
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
    try {
      const updatedTask = await taskService.updateTask(activeTaskId, editedTask);
      setTask(updatedTask);
      if (updateTaskInList) {
        updateTaskInList(updatedTask);
      }
      setShowEditForm(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      alert('Impossible de mettre à jour la tâche. Veuillez réessayer.');
    }
  };

  const handleBackClick = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate('/tasks');
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await taskService.deleteTask(activeTaskId);
        if (isModal && onClose) {
          onClose();
        } else {
          navigate('/tasks');
        }
      } catch (err) {
        console.error(`Erreur lors de la suppression de la tâche ${activeTaskId}:`, err);
        setError('Impossible de supprimer la tâche. Veuillez réessayer.');
      }
    }
  };

  const handleEditClick = () => {
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setShowEditForm(false);
    if (task) {
      setEditedTask({
        ...task,
        assignedUsers: task.assignedUsers || [],
        clientId: task.client?.id || '',
      });
    }
  };

  const handleCommentInput = (e) => {
    const value = e.target.value;
    setNewComment(value);
    
    // Générer l'aperçu formaté
    let formattedText = value;
    
    // Formater les mentions d'utilisateurs
    developers.forEach(dev => {
      const devUsername = `@${dev.username}`;
      if (formattedText.includes(devUsername)) {
        const regex = new RegExp(`@${dev.username}(\\s|$)`, 'g');
        formattedText = formattedText.replace(regex, `<span class="mention-tag">@${dev.username}</span>$1`);
      }
    });
    
    // Formater les mentions de clients
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
        const searchText = textAfterAt.toLowerCase();
        setMentionDropdownVisible(true);
        
        // Filtrer les résultats selon que l'on cherche un client ou un utilisateur
        if (searchText.startsWith('c')) {
          // Recherche de clients
          const filteredClients = clients.filter(client => 
            client.nom.toLowerCase().includes(searchText.slice(1))
          );
          setMentionSearchResults(filteredClients.map(client => ({
            id: client.id,
            type: 'client',
            name: client.nom
          })));
        } else {
          // Recherche d'utilisateurs
          const filteredUsers = developers.filter(dev => 
            dev.username.toLowerCase().includes(searchText) ||
            `${dev.prenom} ${dev.nom}`.toLowerCase().includes(searchText)
          );
          setMentionSearchResults(filteredUsers.map(user => ({
            id: user.id,
            type: 'user',
            name: user.username,
            displayName: `${user.prenom} ${user.nom}`
          })));
        }
        
        // Calculer la position du curseur
        if (commentInputRef.current) {
          const cursorPosition = commentInputRef.current.selectionStart;
          setCursorPosition(cursorPosition);
        }
      } else {
        setMentionDropdownVisible(false);
      }
    } else {
      setMentionDropdownVisible(false);
    }
  };

  const handleMentionSelect = (item) => {
    const mentionText = item.type === 'user' ? `@${item.name}` : `@${item.name}`;
    const beforeMention = newComment.substring(0, cursorPosition - 1);
    const afterMention = newComment.substring(cursorPosition);
    const updatedComment = `${beforeMention}${mentionText} ${afterMention}`;
    
    setNewComment(updatedComment);
    setMentionDropdownVisible(false);
    
    // Mettre à jour les mentions sélectionnées
    if (item.type === 'user') {
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
    
    // Focus sur le textarea et placer le curseur après la mention
    if (commentInputRef.current) {
      commentInputRef.current.focus();
      const newPosition = beforeMention.length + mentionText.length + 1;
      commentInputRef.current.setSelectionRange(newPosition, newPosition);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !currentUser || submittingComment) {
      return;
    }
    
    setSubmittingComment(true);
    
    try {
      const commentData = {
        contenu: newComment.trim(),
        taskId: activeTaskId,
        authorId: currentUser.id,
        mentionedUserIds: Array.from(selectedMentions.users),
        mentionedClientIds: Array.from(selectedMentions.clients)
      };
      
      const savedComment = await commentService.createComment(commentData);
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

  const renderMentionDropdown = () => {
    if (!mentionDropdownVisible || mentionSearchResults.length === 0) return null;
    
    return (
      <MentionDropdown>
        {mentionSearchResults.map(item => (
          <MentionItem
            key={`${item.type}-${item.id}`}
            onClick={() => handleMentionSelect(item)}
          >
            <UserAvatar>
              {item.type === 'user' 
                ? getInitials({ prenom: item.displayName.split(' ')[0], nom: item.displayName.split(' ')[1] || '' })
                : item.name.charAt(0)
              }
            </UserAvatar>
            <span>{item.type === 'user' ? item.displayName : item.name}</span>
          </MentionItem>
        ))}
      </MentionDropdown>
    );
  };

  const renderCommentContent = (content, mentionedUsers, mentionedClients) => {
    if ((!mentionedUsers || mentionedUsers.length === 0) && 
        (!mentionedClients || mentionedClients.length === 0)) {
      return content;
    }
    
    let segments = [content];
    
    // Traitement des mentions utilisateurs
    if (mentionedUsers && mentionedUsers.length > 0) {
      mentionedUsers.forEach(username => {
        const atUsername = `@${username}`;
        if (content.includes(atUsername)) {
          segments = segments.flatMap(segment => {
            if (typeof segment === 'string') {
              const parts = segment.split(atUsername);
              return parts.reduce((acc, part, i) => {
                if (i === 0) return [part];
                return [...acc, 
                  <MentionTag key={`user-${username}-${i}`}>{atUsername}</MentionTag>,
                  part
                ];
              }, []);
            }
            return [segment];
          });
        }
      });
    }
    
    // Traitement des mentions clients
    if (mentionedClients && mentionedClients.length > 0) {
      mentionedClients.forEach(clientName => {
        const atClientName = `@${clientName}`;
        if (content.includes(atClientName)) {
          segments = segments.flatMap(segment => {
            if (typeof segment === 'string') {
              const parts = segment.split(atClientName);
              return parts.reduce((acc, part, i) => {
                if (i === 0) return [part];
                return [...acc, 
                  <MentionTag key={`client-${clientName}-${i}`} isClient>{atClientName}</MentionTag>,
                  part
                ];
              }, []);
            }
            return [segment];
          });
        }
      });
    }
    
    return <>{segments}</>;
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
    
    setUploading(true);
    
    try {
      const data = await attachmentService.uploadAttachment(selectedFile, activeTaskId);
      setAttachments([...attachments, data]);
      setSelectedFile(null);
      
      // Réinitialiser l'élément input file
      document.getElementById('file-upload').value = '';
      
      alert('Fichier téléchargé avec succès!');
    } catch (err) {
      console.error('Erreur lors du téléchargement du fichier:', err);
      alert('Impossible de télécharger le fichier. Veuillez réessayer.');
    } finally {
      setUploading(false);
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
      setAttachments(attachments.filter(attachment => attachment.id !== attachmentId));
      alert('Pièce jointe supprimée avec succès!');
    } catch (err) {
      console.error('Erreur lors de la suppression de la pièce jointe:', err);
      alert('Impossible de supprimer la pièce jointe. Veuillez réessayer.');
    }
  };

  const handleAddAssignment = () => {
    setAssignmentRows([...assignmentRows, { id: Date.now() }]);
  };

  const handleRemoveAssignment = (rowId) => {
    if (assignmentRows.length > 1) {
      setAssignmentRows(assignmentRows.filter(row => row.id !== rowId));
      setEditedTask(prev => ({
        ...prev,
        assignedUsers: prev.assignedUsers.filter((_, index) => 
          index !== assignmentRows.findIndex(row => row.id === rowId)
        )
      }));
    }
  };

  const handleAssignmentChange = (rowId, userId) => {
    const selectedUser = developers.find(dev => dev.id === parseInt(userId));
    if (selectedUser) {
      const updatedUsers = [...(editedTask.assignedUsers || [])];
      const rowIndex = assignmentRows.findIndex(row => row.id === rowId);
      
      if (rowIndex !== -1) {
        updatedUsers[rowIndex] = { id: selectedUser.id };
      } else {
        updatedUsers.push({ id: selectedUser.id });
      }
      
      setEditedTask({
        ...editedTask,
        assignedUsers: updatedUsers.filter(user => user !== null)
      });
    }
  };

  const handleRemoveUserAssignment = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer cet utilisateur de la tâche ?')) {
      return;
    }

    try {
      const updatedTask = {
        ...task,
        assignedUsers: task.assignedUsers.filter(user => user.id !== userId)
      };
      
      const result = await taskService.updateTask(activeTaskId, updatedTask);
      setTask(result);
      if (updateTaskInList) {
        updateTaskInList(result);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'assignation:', err);
      alert('Impossible de retirer l\'utilisateur de la tâche. Veuillez réessayer.');
    }
  };

  const handleAddCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      const updatedTask = {
        ...task,
        categories: [...(task.categories || []), 
          categories.find(c => c.id === parseInt(selectedCategory))
        ]
      };
      
      const result = await taskService.updateTask(activeTaskId, updatedTask);
      setTask(result);
      setSelectedCategory('');
      
      if (updateTaskInList) {
        updateTaskInList(result);
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la catégorie:', err);
      alert('Impossible d\'ajouter la catégorie. Veuillez réessayer.');
    }
  };
  
  const handleRemoveCategory = async (categoryId) => {
    try {
      const updatedTask = {
        ...task,
        categories: task.categories.filter(c => c.id !== categoryId)
      };
      
      const result = await taskService.updateTask(activeTaskId, updatedTask);
      setTask(result);
      
      if (updateTaskInList) {
        updateTaskInList(result);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de la catégorie:', err);
      alert('Impossible de supprimer la catégorie. Veuillez réessayer.');
    }
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
        >
          {isModal ? 'Fermer' : 'Retour à la liste'}
        </Button>
      </ErrorContainer>
    );
  }

  if (!task) {
    return (
      <ErrorContainer>
        <h2>Tâche non trouvée</h2>
        <p>La tâche que vous recherchez n'existe pas ou a été supprimée.</p>
        <Button 
          variant="primary" 
          onClick={handleBackClick} 
          icon={<BackIcon />}
        >
          {isModal ? 'Fermer' : 'Retour à la liste'}
        </Button>
      </ErrorContainer>
    );
  }

  return (
    <TaskDetailContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
            variant="secondary" 
            onClick={handleBackClick} 
            icon={<BackIcon />}
          >
            {isModal ? 'Fermer' : 'Retour'}
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

      {task.assignedUsers && task.assignedUsers.length > 0 && (
        <Section>
          <AssignedUsersHeader>
            <SectionTitle>Assigné à</SectionTitle>
            <AssignedCount>
              {task.assignedUsers.length} {task.assignedUsers.length > 1 ? 'utilisateurs' : 'utilisateur'}
            </AssignedCount>
          </AssignedUsersHeader>
          
          {task.assignedUsers.map(user => (
            <UserCard key={user.id}>
              <UserInfo>
                <UserAvatar>{getInitials(user)}</UserAvatar>
                <div>
                  <UserName>{user.prenom} {user.nom}</UserName>
                  <UserRole>{translateRoleName(user.role)}</UserRole>
                </div>
              </UserInfo>
              {currentUser && (currentUser.role === 'CHEF_PROJET' || currentUser.id === task.createdById) && (
                <RemoveButton
                  onClick={() => handleRemoveUserAssignment(user.id)}
                  title="Retirer cet utilisateur"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </RemoveButton>
              )}
            </UserCard>
          ))}
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
              disabled={!selectedFile || uploading}
              style={{ alignSelf: 'flex-start' }}
            >
              {uploading ? 'Téléchargement...' : 'Télécharger'}
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
                  ref={commentInputRef}
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
                    <UserAvatar>{getInitials({ 
                      prenom: comment.authorUsername.split(' ')[0], 
                      nom: comment.authorUsername.split(' ')[1] || '' 
                    })}</UserAvatar>
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
        <FormOverlay onClick={handleCloseForm}>
          <FormCard
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
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
                <InputGroup style={{ flex: 2 }}>
                  <Label>Assigner à des développeurs</Label>
                  {assignmentRows.map((row) => (
                    <AssignmentRow key={row.id}>
                      <Select
                        value={editedTask.assignedUsers[assignmentRows.findIndex(r => r.id === row.id)]?.id || ''}
                        onChange={(e) => handleAssignmentChange(row.id, e.target.value)}
                        style={{ flex: 1 }}
                      >
                        <option value="">Sélectionner un développeur</option>
                        {developers.map((dev) => (
                          <option key={dev.id} value={dev.id}>
                            {dev.prenom} {dev.nom}
                          </option>
                        ))}
                      </Select>
                      {assignmentRows.length > 1 && (
                        <RemoveButton
                          type="button"
                          onClick={() => handleRemoveAssignment(row.id)}
                          title="Retirer ce développeur"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </RemoveButton>
                      )}
                    </AssignmentRow>
                  ))}
                  <AddButton
                    type="button"
                    onClick={handleAddAssignment}
                  >
                    + Ajouter un développeur
                  </AddButton>
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
                  variant="primary"
                >
                  Enregistrer les modifications
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

      <Section>
        <SectionTitle>Catégories</SectionTitle>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <CategorySelect
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Sélectionner une catégorie</option>
            {categories
              .filter(category => !task.categories?.some(c => c.id === category.id))
              .map(category => (
                <option key={category.id} value={category.id}>
                  {category.nom}
                </option>
              ))
            }
          </CategorySelect>
          <Button
            variant="secondary"
            onClick={handleAddCategory}
            disabled={!selectedCategory}
          >
            Ajouter
          </Button>
        </div>
        
        {task.categories && task.categories.length > 0 ? (
          <Categories>
            {task.categories.map(category => (
              <CategoryTag key={category.id}>
                {category.nom}
                <button onClick={() => handleRemoveCategory(category.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </CategoryTag>
            ))}
          </Categories>
        ) : (
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Aucune catégorie assignée
          </p>
        )}
      </Section>
    </TaskDetailContainer>
  );
};

export default TaskDetail; 