package com.costpilot.auth.adapter.web.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private String token;
    private String username;
    private String displayName;
    private String role;
}
