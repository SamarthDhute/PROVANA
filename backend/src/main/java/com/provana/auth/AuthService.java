package com.provana.auth;

import com.provana.auth.dto.AuthResponse;
import com.provana.auth.dto.LoginRequest;
import com.provana.auth.dto.RegisterRequest;
import com.provana.auth.dto.UserSummaryDto;
import com.provana.common.exception.DuplicateResourceException;
import com.provana.common.exception.ResourceNotFoundException;
import com.provana.common.exception.UnauthorizedException;
import com.provana.user.entity.User;
import com.provana.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("User", "email", normalizedEmail);
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName() != null ? request.lastName().trim() : null);
        user.setPhone(request.phone() != null ? request.phone().trim() : null);
        user.setRole(Role.CUSTOMER);
        user.setActive(true);

        User savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(savedUser);

        return new AuthResponse(
                token,
                "Bearer",
                jwtTokenProvider.getExpirationMs(),
                mapToSummary(savedUser)
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password credentials"));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new UnauthorizedException("Account is deactivated. Please contact support.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password credentials");
        }

        String token = jwtTokenProvider.generateToken(user);

        return new AuthResponse(
                token,
                "Bearer",
                jwtTokenProvider.getExpirationMs(),
                mapToSummary(user)
        );
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return mapToSummary(user);
    }

    public UserSummaryDto mapToSummary(User user) {
        return new UserSummaryDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getRole(),
                user.getRole().getPermissions()
        );
    }
}
