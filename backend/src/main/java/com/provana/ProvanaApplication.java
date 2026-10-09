package com.provana;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * PROVANA — Production Nutrition & Fitness E-Commerce Platform Backend.
 * <p>
 * Modular Monolith architecture following domain-driven boundaries and strict separation of concerns.
 */
@SpringBootApplication
public class ProvanaApplication {

    private static final Logger log = LoggerFactory.getLogger(ProvanaApplication.class);

    public static void main(String[] args) {
        loadDotenv();
        SpringApplication app = new SpringApplication(ProvanaApplication.class);
        Environment env = app.run(args).getEnvironment();
        logApplicationStartup(env);
    }

    private static void loadDotenv() {
        java.nio.file.Path[] potentialPaths = new java.nio.file.Path[]{
                java.nio.file.Path.of(".env"),
                java.nio.file.Path.of("backend/.env"),
                java.nio.file.Path.of("../.env")
        };

        for (java.nio.file.Path path : potentialPaths) {
            if (java.nio.file.Files.exists(path)) {
                try {
                    java.util.List<String> lines = java.nio.file.Files.readAllLines(path);
                    for (String line : lines) {
                        String trimmed = line.trim();
                        if (trimmed.isEmpty() || trimmed.startsWith("#") || !trimmed.contains("=")) {
                            continue;
                        }
                        int idx = trimmed.indexOf('=');
                        String key = trimmed.substring(0, idx).trim();
                        String value = trimmed.substring(idx + 1).trim();
                        if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
                            value = value.substring(1, value.length() - 1);
                        } else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
                            value = value.substring(1, value.length() - 1);
                        }
                        if (System.getenv(key) == null && System.getProperty(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                    log.info("Successfully loaded environment variables from: {}", path.toAbsolutePath());
                    break;
                } catch (Exception e) {
                    log.warn("Could not read .env file at {}: {}", path, e.getMessage());
                }
            }
        }
    }

    private static void logApplicationStartup(Environment env) {
        String protocol = "http";
        if (env.getProperty("server.ssl.key-store") != null) {
            protocol = "https";
        }
        String serverPort = env.getProperty("server.port", "8080");
        String contextPath = env.getProperty("server.servlet.context-path", "/");
        if (!contextPath.endsWith("/")) {
            contextPath += "/";
        }
        String hostAddress = "localhost";
        try {
            hostAddress = InetAddress.getLocalHost().getHostAddress();
        } catch (UnknownHostException e) {
            log.warn("The host name could not be determined, using `localhost` as fallback");
        }

        log.info("""
                
                --------------------------------------------------------------------------------
                \tApplication '{}' is running! Access URLs:
                \tLocal: \t\t{}://localhost:{}{}
                \tExternal: \t{}://{}:{}{}
                \tSwagger UI: \t{}://localhost:{}{}swagger-ui.html
                \tHealth Check: \t{}://localhost:{}{}actuator/health
                \tActive Profiles: {}
                --------------------------------------------------------------------------------
                """,
                env.getProperty("spring.application.name"),
                protocol, serverPort, contextPath,
                protocol, hostAddress, serverPort, contextPath,
                protocol, serverPort, contextPath,
                protocol, serverPort, contextPath,
                env.getActiveProfiles().length == 0 ? env.getDefaultProfiles() : env.getActiveProfiles()
        );
    }
}
