package com.costpilot.auth.service;

import com.costpilot.auth.adapter.persistence.JpaUserRepository;
import com.costpilot.auth.adapter.web.dto.LoginRequest;
import com.costpilot.auth.adapter.web.dto.LoginResponse;
import com.costpilot.auth.domain.AppUser;
import com.costpilot.auth.infrastructure.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JpaUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public LoginResponse login(LoginRequest request) {
        AppUser user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        if (!user.getEnabled()) {
            throw new IllegalArgumentException("비활성화된 계정입니다.");
        }

        String token = jwtProvider.generateToken(user.getUsername(), user.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .role(user.getRole().name())
                .build();
    }
}
