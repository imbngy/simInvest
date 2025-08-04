package org.bngy.siminvest.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    @Email(message = "Email non valida") @NotBlank(message = "Email obbligatoria")
    private String email;
    @NotBlank(message = "Password obbligatoria")
    private String password;
}