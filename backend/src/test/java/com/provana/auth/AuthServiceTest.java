package com.provana.auth;

import com.provana.auth.dto.AuthResponse;
import com.provana.auth.dto.LoginRequest;
import com.provana.auth.dto.RegisterRequest;
import com.provana.common.exception.DuplicateResourceException;
import com.provana.common.exception.UnauthorizedException;
import com.provana.user.entity.User;
import com.provana.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("athlete@provana.com");
        testUser.setPasswordHash("$2a$10$hashedPassword");
        testUser.setFirstName("Aarav");
        testUser.setLastName("Sharma");
        testUser.setRole(Role.CUSTOMER);
        testUser.setActive(true);
    }

    @Test
    @DisplayName("Should register new user successfully")
    void register_Success() {
        RegisterRequest request = new RegisterRequest("athlete@provana.com", "Password@123", "Aarav", "Sharma", "+919876543210");

        when(userRepository.existsByEmail("athlete@provana.com")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("$2a$10$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtTokenProvider.generateToken(any(User.class))).thenReturn("mock-jwt-token");
        when(jwtTokenProvider.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("mock-jwt-token");
        assertThat(response.user().email()).isEqualTo("athlete@provana.com");
        assertThat(response.user().role()).isEqualTo(Role.CUSTOMER);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when email already registered")
    void register_DuplicateEmail_ThrowsException() {
        RegisterRequest request = new RegisterRequest("athlete@provana.com", "Password@123", "Aarav", null, null);
        when(userRepository.existsByEmail("athlete@provana.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("User already exists with email: 'athlete@provana.com'");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should login successfully with correct credentials")
    void login_Success() {
        LoginRequest request = new LoginRequest("athlete@provana.com", "Password@123");

        when(userRepository.findByEmail("athlete@provana.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("Password@123", testUser.getPasswordHash())).thenReturn(true);
        when(jwtTokenProvider.generateToken(testUser)).thenReturn("valid-jwt-token");
        when(jwtTokenProvider.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("valid-jwt-token");
        assertThat(response.user().role()).isEqualTo(Role.CUSTOMER);
    }

    @Test
    @DisplayName("Should throw UnauthorizedException with wrong password")
    void login_WrongPassword_ThrowsUnauthorized() {
        LoginRequest request = new LoginRequest("athlete@provana.com", "WrongPassword");

        when(userRepository.findByEmail("athlete@provana.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("WrongPassword", testUser.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid email or password");
    }
}
