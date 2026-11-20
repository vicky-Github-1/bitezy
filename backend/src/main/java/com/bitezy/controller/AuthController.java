package com.bitezy.controller;
import com.bitezy.dto.Dtos.*;
import com.bitezy.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService auth;
    @PostMapping("/register") public AuthResponse register(@Valid @RequestBody RegisterRequest r){return auth.register(r);}
    @PostMapping("/login") public AuthResponse login(@Valid @RequestBody AuthRequest r){return auth.login(r);}
    @PostMapping("/google") public AuthResponse google(@Valid @RequestBody GoogleRequest r){return auth.google(r);}
}
