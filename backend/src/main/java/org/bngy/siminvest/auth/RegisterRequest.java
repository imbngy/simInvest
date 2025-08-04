package org.bngy.siminvest.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Username obbligatorio") @Size(min = 3, max = 20)
    private String username;
    @Email(message = "Email non valida") @NotBlank(message = "Email obbligatoria")
    private String email;
    @NotBlank(message = "Password obbligatoria") @Size(min = 6, message = "La password deve essere di almeno 6 caratteri")
    private String password;
}