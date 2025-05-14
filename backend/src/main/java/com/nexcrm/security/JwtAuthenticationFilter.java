package com.nexcrm.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String authorizationHeader = request.getHeader("Authorization");
        final String requestURI = request.getRequestURI();
        
        log.info("Request URI: {}", requestURI);
        log.info("Authorization header: {}", authorizationHeader != null ? "present" : "absent");

        String username = null;
        String jwt = null;

        try {
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                jwt = authorizationHeader.substring(7);
                username = jwtTokenUtil.extractUsername(jwt);
                
                log.info("JWT Token traité pour l'utilisateur: {}", username);
            } else {
                log.info("Aucun token JWT trouvé dans la requête");
            }

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                
                log.info("Utilisateur trouvé: {} avec rôles: {}", username, userDetails.getAuthorities());

                if (jwtTokenUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    usernamePasswordAuthenticationToken
                            .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                    
                    log.info("Utilisateur authentifié: {} avec autorités: {}", username, userDetails.getAuthorities());
                } else {
                    log.warn("Token invalide pour l'utilisateur: {}", username);
                }
            } else if (username == null) {
                log.info("Aucun utilisateur trouvé dans le token");
            } else {
                log.info("Authentification déjà présente dans le contexte");
            }
        } catch (ExpiredJwtException e) {
            log.error("JWT Token expiré: {}", e.getMessage());
        } catch (SignatureException e) {
            log.error("Signature JWT invalide: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("JWT Token malformé: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT Token non supporté: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT Token vide ou NULL: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Erreur lors du traitement du JWT: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
} 