package org.bngy.siminvest.service;

import lombok.RequiredArgsConstructor;
import org.bngy.siminvest.auth.AuthRequest;
import org.bngy.siminvest.auth.AuthResponse;
import org.bngy.siminvest.auth.RegisterRequest;
import org.bngy.siminvest.config.JwtService;
import org.bngy.siminvest.exception.EmailAlreadyExistsException;
import org.bngy.siminvest.exception.UsernameAlreadyExistsException;
import org.bngy.siminvest.model.User;
import org.bngy.siminvest.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email già registrata: " + request.getEmail());
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new UsernameAlreadyExistsException("Username già registrato: " + request.getUsername());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }
}