package org.bngy.siminvest.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "SimInvest API",
                version = "1.0",
                description = """
            SimInvest è una piattaforma full-stack per la simulazione e gestione di investimenti digitali e conti risparmio. 
            L'app consente agli utenti di:
            
            - Simulare investimenti in asset con rendimento calcolato in base a tasso e durata
            - Aprire conti personali e monitorarne l'evoluzione grazie a interessi annuali
            - Confermare investimenti simulati e gestirne versamenti/prelievi
            - Salvare lo storico delle transazioni finanziarie
            
            Il backend fornisce una REST API sicura tramite JWT Authentication.
                        Per usare le API protette è necessario autenticarsi con JWT:
                        
                            1. Registrarsi tramite `/api/auth/register` per ricevere il token JWT
                            1a. Eseguire il login con `/api/auth/login` per ricevere il token JWT
                            2. Cliccare su "Authorize" in alto a destra e inserire `Bearer <token>`
                            
            """,
                contact = @Contact(name = "Angelo Francesco Pio Fittipaldi", email = "angelofrancescopiofittipaldi@outlook.it"),
                license = @License(name = "MIT License")
        ),
        security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER,
        description = "Inserisci il token JWT nell'header Authorization come `Bearer <token>`"
)

public class SwaggerConfig {}
