package com.provana.auth;

import com.provana.user.entity.User;
import com.provana.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUser("admin@provana.com", "Password@123", "Admin", "Provana", Role.ADMIN);
        seedUser("pm@provana.com", "Password@123", "Product", "Manager", Role.PRODUCT_MANAGER);
        seedUser("manager@provana.com", "Password@123", "Store", "Manager", Role.MANAGER);
        seedUser("content@provana.com", "Password@123", "Content", "Specialist", Role.CONTENT_MANAGER);
        seedUser("order@provana.com", "Password@123", "Order", "Specialist", Role.ORDER_MANAGER);
        seedUser("customer@provana.com", "Password@123", "Aarav", "Sharma", Role.CUSTOMER);
    }

    private void seedUser(String email, String rawPassword, String firstName, String lastName, Role role) {
        userRepository.findByEmail(email).ifPresentOrElse(
                user -> {
                    // Update password to ensure it matches current encoder
                    user.setPasswordHash(passwordEncoder.encode(rawPassword));
                    user.setRole(role);
                    user.setActive(true);
                    userRepository.save(user);
                    log.info("Verified seeded account: {} [Role: {}]", email, role);
                },
                () -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setPasswordHash(passwordEncoder.encode(rawPassword));
                    newUser.setFirstName(firstName);
                    newUser.setLastName(lastName);
                    newUser.setRole(role);
                    newUser.setActive(true);
                    userRepository.save(newUser);
                    log.info("Created seeded account: {} [Role: {}]", email, role);
                }
        );
    }
}
