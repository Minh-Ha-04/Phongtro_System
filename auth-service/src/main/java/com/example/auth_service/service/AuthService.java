package com.example.auth_service.service;

import com.example.auth_service.dto.AuthResponse;
import com.example.auth_service.dto.LoginRequest;
import com.example.auth_service.dto.RegisterRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    AuthResponse getCurrentUser(String token);
}
