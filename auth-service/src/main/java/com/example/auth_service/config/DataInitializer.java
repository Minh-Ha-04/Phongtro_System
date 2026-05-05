package com.example.auth_service.config;

import com.example.auth_service.entity.User;
import com.example.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setFullName("Administrator");
            admin.setRole("ADMIN");
            userRepository.save(admin);
            log.info("[AUTH-SERVICE] Admin account created: admin / 123456");
        } else {
            log.info("[AUTH-SERVICE] Admin account already exists, skipping seed.");
        }
    }
}
