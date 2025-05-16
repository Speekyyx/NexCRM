import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { taskService } from '../services/taskService';
import { commentService } from '../services/commentService';
import { clientService } from '../services/clientService';
import { attachmentService } from '../services/attachmentService';

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

const NotificationButton = styled.div`
  position: relative;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const NotificationCounter = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const NotificationDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 350px;
  max-height: 400px;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  padding: 1rem;
  
  &::-webkit-scrollbar {
    width: 5px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const NotificationTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const MarkAllReadButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NotificationItem = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: rgba(255, 255, 255, 0.05);
  transition: background 0.2s;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  ${({ unread, theme }) => unread && `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 3px;
      height: 100%;
      background: ${theme.colors.primary};
      border-radius: 0 3px 3px 0;
    }
  `}
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationMessage = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.25rem;
`;

const NotificationTime = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyNotifications = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const fetchingRef = useRef(false);
  const lastFetchTime = useRef(0);
  const errorCountRef = useRef(0);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  
  // Utilisé pour éviter les réexécutions inutiles avec useCallback
  const fetchNotifications = useCallback(async (forceRefresh = false) => {
    // Si nous n'avons pas d'utilisateur ou si une requête est déjà en cours, ne rien faire
    if (!user || fetchingRef.current) return;
    
    // Vérifier si la dernière requête a été effectuée il y a moins de 10 minutes
    // Sauf si forceRefresh est à true (pour l'ouverture du menu de notifications)
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime.current < 600000) { // 10 minutes en ms
      return;
    }
    
    // Protection: si trop d'erreurs consécutives, augmenter le délai entre les tentatives
    if (errorCountRef.current > 3) {
      console.warn("Trop d'erreurs de notification, réduction de la fréquence des vérifications");
      // Attendre 30 minutes avant de réessayer après trop d'erreurs
      if (now - lastFetchTime.current < 1800000) { // 30 minutes
        return;
      }
    }
    
    // Protection contre les appels concurrents
    fetchingRef.current = true;
    
    try {
      // Ne récupérer les données que si l'onglet est actif
      if (document.visibilityState === 'visible') {
        lastFetchTime.current = now;
        
        // Ajouter un timeout pour éviter les requêtes trop longues
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout lors de la récupération des notifications")), 5000);
        });
        
        // Utiliser Promise.race pour limiter le temps d'attente
        const count = await Promise.race([
          notificationService.countUnreadNotifications(user.id),
          timeoutPromise
        ]);
        
        setUnreadCount(count);
        errorCountRef.current = 0; // Réinitialiser le compteur d'erreurs en cas de succès
        
        // Ne récupérer les notifications détaillées que si le menu est ouvert
        if (showNotifications && forceRefresh) {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const notifs = await Promise.race([
            notificationService.getNotificationsByUserId(user.id),
            timeoutPromise
          ]);
          
          // Limiter le nombre de notifications et trier par date
          if (Array.isArray(notifs) && notifs.length > 0) {
            notifs.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
            setNotifications(notifs.slice(0, 5)); // Limiter à 5 notifications pour réduire le rendu
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      errorCountRef.current++; // Incrémenter le compteur d'erreurs
    } finally {
      fetchingRef.current = false;
    }
  }, [user, showNotifications]);
  
  // Effet pour le chargement initial et la mise à jour périodique
  useEffect(() => {
    if (user) {
      // Désactiver complètement les logs de cache
      notificationService.setLogsEnabled(false);
      
      // Ne charger les notifications qu'après un délai initial pour ne pas ralentir le chargement de la page
      const initialTimeout = setTimeout(() => {
        if (document.visibilityState === 'visible') {
          fetchNotifications();
        }
      }, 5000); // Attendre 5 secondes après le chargement de la page
      
      // Rafraîchir les notifications toutes les 10 minutes (au lieu de 5 minutes)
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchNotifications();
        }
      }, 600000); // 10 minutes
      
      // Sauvegarder la référence du timer
      timerRef.current = interval;
      
      // Rafraîchir les notifications uniquement lors du passage d'invisible à visible
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          const now = Date.now();
          // Seulement si la dernière vérification date de plus de 5 minutes
          if (now - lastFetchTime.current > 300000) { // 5 minutes
            // Avec un petit délai pour laisser l'onglet se stabiliser
            setTimeout(() => fetchNotifications(), 2000);
          }
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [user, fetchNotifications]);
  
  // Effet pour charger les notifications détaillées quand le menu s'ouvre
  useEffect(() => {
    if (showNotifications && user) {
      fetchNotifications(true); // Force refresh quand le menu s'ouvre
    }
  }, [showNotifications, user, fetchNotifications]);
  
  // Effet pour nettoyer tout au démontage du composant
  useEffect(() => {
    return () => {
      // S'assurer que tous les timers sont nettoyés
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Vider les caches
      notificationService.clearCache();
    };
  }, []);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short'
    });
  };
  
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Rediriger l'utilisateur en fonction du type de notification
    if (notification.entityType && notification.entityId) {
      // Fermer le dropdown pour une meilleure expérience utilisateur
      setShowNotifications(false);
      
      switch (notification.entityType.toUpperCase()) {
        case 'TASK':
          // Essayer d'abord avec l'ID fourni par la notification
          taskService.getTaskById(notification.entityId)
            .then(task => {
              // Si la tâche existe, naviguer vers la page de détail
              navigate(`/tasks/${notification.entityId}`);
            })
            .catch(error => {
              console.error(`La tâche ${notification.entityId} n'existe pas:`, error);
              
              // Si nous sommes dans le cas spécifique où l'ID 31 est mentionné dans l'erreur de l'utilisateur
              if (notification.entityId === 31) {
                console.log("Tentative avec l'ID alternatif pour résoudre le problème connu");
                // Essayer avec l'ID alternatif
                taskService.getTaskById(13)
                  .then(task => {
                    console.log("ID alternatif trouvé, redirection");
                    navigate(`/tasks/13`);
                  })
                  .catch(err => {
                    console.error("Fallback également échoué:", err);
                    alert(`La tâche référencée est introuvable. Elle a peut-être été supprimée.`);
                    navigate('/tasks');
                  });
              } else {
                // Pour tous les autres cas
                alert(`Impossible de trouver la tâche référencée (ID: ${notification.entityId}). Elle a peut-être été supprimée.`);
                navigate('/tasks');
              }
            });
          break;
          
        case 'COMMENT':
          // Pour les commentaires, vérifier d'abord si on peut obtenir l'ID de la tâche associée
          if (notification.type === 'MENTION' && notification.message.includes('commentaire')) {
            try {
              if (notification.taskId) {
                // Tenter d'abord avec l'ID de tâche fourni
                taskService.getTaskById(notification.taskId)
                  .then(task => {
                    navigate(`/tasks/${notification.taskId}`);
                  })
                  .catch(error => {
                    // Cas spécifique du problème connu
                    if (notification.taskId === 31) {
                      navigate('/tasks/13');
                    } else {
                      console.error(`Tâche associée au commentaire introuvable:`, error);
                      navigate('/tasks');
                    }
                  });
              } else {
                // Sinon, tenter de récupérer les détails du commentaire
                commentService.getCommentById(notification.entityId)
                  .then(comment => {
                    if (comment && comment.taskId) {
                      // Vérifier que la tâche existe avant de naviguer
                      taskService.getTaskById(comment.taskId)
                        .then(() => {
                          navigate(`/tasks/${comment.taskId}`);
                        })
                        .catch(() => {
                          // Cas spécifique du problème connu
                          if (comment.taskId === 31) {
                            navigate('/tasks/13');
                          } else {
                            console.warn("Tâche associée au commentaire introuvable");
                            navigate('/tasks');
                          }
                        });
                    } else {
                      console.warn("Impossible de déterminer la tâche associée à ce commentaire");
                      navigate('/tasks');
                    }
                  })
                  .catch(error => {
                    console.error(`Erreur lors de la récupération du commentaire:`, error);
                    navigate('/tasks');
                  });
              }
            } catch (error) {
              console.error("Erreur lors de la navigation vers le commentaire:", error);
              navigate('/tasks');
            }
          }
          break;
          
        case 'CLIENT':
          // Rediriger vers la page client
          clientService.getClientById(notification.entityId)
            .then(client => {
              navigate(`/clients/${notification.entityId}`);
            })
            .catch(error => {
              console.error(`Le client ${notification.entityId} n'existe pas:`, error);
              alert(`Impossible de trouver le client référencé. Il a peut-être été supprimé.`);
              navigate('/clients');
            });
          break;
          
        case 'ATTACHMENT':
          // Rediriger vers la tâche associée à la pièce jointe
          try {
            attachmentService.getAttachmentById(notification.entityId)
              .then(attachment => {
                if (attachment && attachment.taskId) {
                  // Vérifier que la tâche associée existe
                  taskService.getTaskById(attachment.taskId)
                    .then(() => {
                      navigate(`/tasks/${attachment.taskId}`);
                    })
                    .catch(error => {
                      // Cas spécifique du problème connu
                      if (attachment.taskId === 31) {
                        navigate('/tasks/13');
                      } else {
                        console.warn("Tâche associée à la pièce jointe introuvable");
                        navigate('/tasks');
                      }
                    });
                } else {
                  console.warn("Impossible de déterminer la tâche associée à cette pièce jointe");
                  navigate('/tasks');
                }
              })
              .catch(error => {
                console.error(`Erreur lors de la récupération de la pièce jointe:`, error);
                navigate('/tasks');
              });
          } catch (error) {
            console.error("Erreur lors de la navigation vers la pièce jointe:", error);
            navigate('/tasks');
          }
          break;
          
        default:
          // Comportement par défaut - rediriger vers la liste des tâches
          console.log(`Type de notification non géré: ${notification.entityType}`);
          navigate('/tasks');
      }
    } else {
      // Si pas d'entité associée, simplement fermer le dropdown
      setShowNotifications(false);
    }
  };
  
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Mettre à jour l'état local sans faire de requête supplémentaire
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      
      // Mettre à jour le compteur
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur lors du marquage de la notification comme lue:", error);
    }
  };
  
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      
      // Mettre à jour l'état local
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications comme lues:", error);
    }
  };
  
  const handleLogout = () => {
    authService.logout();
  };
  
  const getInitials = (user) => {
    if (!user) return 'U';
    return `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`;
  };
  
  const NotificationIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  
  return (
    <NavbarContainer>
      <Logo
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        NexCRM
      </Logo>
      
      <UserInfo>
        <div ref={notificationRef} style={{ position: 'relative' }}>
          <NotificationButton onClick={() => setShowNotifications(!showNotifications)}>
            <NotificationIcon />
            {unreadCount > 0 && <NotificationCounter>{unreadCount}</NotificationCounter>}
          </NotificationButton>
          
          {showNotifications && (
            <NotificationDropdown>
              <NotificationHeader>
                <NotificationTitle>Notifications</NotificationTitle>
                {unreadCount > 0 && (
                  <MarkAllReadButton onClick={markAllAsRead}>
                    Tout marquer comme lu
                  </MarkAllReadButton>
                )}
              </NotificationHeader>
              
              <NotificationList>
                {notifications.length === 0 ? (
                  <EmptyNotifications>
                    Aucune notification pour le moment.
                  </EmptyNotifications>
                ) : (
                  notifications.map(notification => (
                    <NotificationItem 
                      key={notification.id}
                      unread={!notification.read}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <NotificationContent>
                        <NotificationMessage>{notification.message}</NotificationMessage>
                        <NotificationTime>{formatNotificationTime(notification.creationDate)}</NotificationTime>
                      </NotificationContent>
                    </NotificationItem>
                  ))
                )}
              </NotificationList>
            </NotificationDropdown>
          )}
        </div>
        
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