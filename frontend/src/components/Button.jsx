import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const StyledButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: ${({ size }) => {
    if (size === 'sm') return '0.5rem 1rem';
    if (size === 'lg') return '0.75rem 1.5rem';
    return '0.625rem 1.25rem';
  }};
  font-size: ${({ size }) => {
    if (size === 'sm') return '0.875rem';
    if (size === 'lg') return '1.125rem';
    return '1rem';
  }};
  font-weight: 500;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;
  border: none;
  
  ${({ variant, theme }) => {
    switch (variant) {
      case 'outlined':
        return css`
          background: transparent;
          color: ${theme.colors.primary};
          border: 2px solid ${theme.colors.primary};
          
          &:hover {
            background: rgba(255, 122, 80, 0.1);
          }
        `;
      case 'text':
        return css`
          background: transparent;
          color: ${theme.colors.primary};
          
          &:hover {
            background: rgba(255, 122, 80, 0.1);
          }
        `;
      case 'secondary':
        return css`
          background: ${theme.colors.secondary};
          color: white;
          box-shadow: 0 4px 14px rgba(118, 74, 241, 0.4);
          
          &:hover {
            background: ${theme.colors.secondaryDark};
            box-shadow: 0 6px 20px rgba(118, 74, 241, 0.6);
          }
        `;
      case 'gradient':
        return css`
          background: ${theme.colors.gradient.primary};
          color: white;
          box-shadow: 0 4px 14px rgba(255, 122, 80, 0.4);
          
          &:hover {
            box-shadow: 0 6px 20px rgba(255, 122, 80, 0.6);
          }
        `;
      default: // primary
        return css`
          background: ${theme.colors.primary};
          color: white;
          box-shadow: 0 4px 14px rgba(255, 122, 80, 0.4);
          
          &:hover {
            background: ${theme.colors.primaryDark};
            box-shadow: 0 6px 20px rgba(255, 122, 80, 0.6);
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
  
  /* Animation d'ondulation au clic */
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    opacity: 0;
    transition: transform 0.5s, opacity 0.3s;
  }
  
  &:active::after {
    transform: scale(2);
    opacity: 0;
    transition: 0s;
  }
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  ...props 
}) => {
  return (
    <StyledButton 
      variant={variant}
      size={size}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {icon && icon}
      {children}
    </StyledButton>
  );
};

export default Button; 