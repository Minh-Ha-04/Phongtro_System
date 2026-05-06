package com.example.auth_service.service;

import com.example.auth_service.dto.AuthResponse;
import com.example.auth_service.dto.LoginRequest;
import com.example.auth_service.dto.RegisterRequest;
import com.example.auth_service.entity.User;
import com.example.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("[AUTH-SERVICE] Login attempt for user: {}", request.getUsername());

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    log.warn("[AUTH-SERVICE] User not found: {}", request.getUsername());
                    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sai tài khoản hoặc mật khẩu");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("[AUTH-SERVICE] Wrong password for user: {}", request.getUsername());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sai tài khoản hoặc mật khẩu");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        log.info("[AUTH-SERVICE] Login successful for user: {}", user.getUsername());

        return new AuthResponse(token, user.getUsername(), user.getFullName(), user.getRole());
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        log.info("[AUTH-SERVICE] Register attempt for user: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("[AUTH-SERVICE] Username already exists: {}", request.getUsername());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tài khoản đã tồn tại");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole("ADMIN");

        userRepository.save(user);
        log.info("[AUTH-SERVICE] User registered: {}", user.getUsername());

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return new AuthResponse(token, user.getUsername(), user.getFullName(), user.getRole());
    }

    @Override
    public AuthResponse getCurrentUser(String token) {
        String username = jwtUtil.getUsernameFromToken(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));

        return new AuthResponse(null, user.getUsername(), user.getFullName(), user.getRole());
    }
}
