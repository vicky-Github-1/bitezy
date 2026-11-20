package com.bitezy.service;
import com.bitezy.dto.Dtos.*;
import com.bitezy.entity.*;
import com.bitezy.repository.UserRepository;
import com.bitezy.security.JwtService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    @Value("${owner.secret-pin}") private String ownerPin;
    @Value("${google.client-id}") private String googleClientId;

    public AuthResponse register(RegisterRequest r){
        if(!r.password().equals(r.confirmPassword())) throw new RuntimeException("Passwords do not match");
        if(users.existsByEmail(r.email().toLowerCase())) throw new RuntimeException("Email is already registered");
        if(r.role()==UserRole.OWNER){
            if(r.secretPin()==null || !r.secretPin().equals(ownerPin))
                throw new RuntimeException("Invalid owner secret PIN");
        }
        User u=User.builder().fullName(r.fullName().trim()).email(r.email().trim().toLowerCase())
                .password(encoder.encode(r.password())).role(r.role()).build();
        users.save(u);
        return new AuthResponse(jwt.generateToken(u.getEmail()),u.getFullName(),u.getEmail(),u.getRole());
    }
    public AuthResponse login(AuthRequest r){
        User u=users.findByEmail(r.email().trim().toLowerCase()).orElseThrow(()->new RuntimeException("Invalid email or password"));
        if(!encoder.matches(r.password(),u.getPassword())) throw new RuntimeException("Invalid email or password");
        return new AuthResponse(jwt.generateToken(u.getEmail()),u.getFullName(),u.getEmail(),u.getRole());
    }
    public AuthResponse google(GoogleRequest r){
        if(googleClientId==null || googleClientId.isBlank()) throw new RuntimeException("Google login is not configured");
        try{
            GoogleIdTokenVerifier verifier=new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId)).build();
            GoogleIdToken id=verifier.verify(r.credential());
            if(id==null) throw new RuntimeException("Invalid Google credential");
            String email=id.getPayload().getEmail();
            String name=(String)id.getPayload().get("name");
            if(email==null) throw new RuntimeException("Google account email unavailable");
            User u=users.findByEmail(email.toLowerCase()).orElseGet(()->users.save(User.builder()
                    .fullName(name==null?email:name).email(email.toLowerCase())
                    .password(encoder.encode(java.util.UUID.randomUUID().toString())).role(UserRole.CUSTOMER).build()));
            if(u.getRole()!=UserRole.CUSTOMER) throw new RuntimeException("Google login is for customers only");
            return new AuthResponse(jwt.generateToken(u.getEmail()),u.getFullName(),u.getEmail(),u.getRole());
        }catch(Exception e){
            if(e instanceof RuntimeException re) throw re;
            throw new RuntimeException("Google authentication failed");
        }
    }
}
