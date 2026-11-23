package vn.doan.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import vn.doan.service.JwtService;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SecurityConfigTest {

    @Test
    void allowsConfiguredFrontendOriginsAndRejectsOtherOrigins() {
        CorsConfigurationSource source = new SecurityConfig(
                new JwtAuthenticationFilter(new JwtService())
        ).corsConfigurationSource(
                "http://localhost:3000, https://brewlite-frontend-omega.vercel.app"
        );
        CorsConfiguration configuration = source.getCorsConfiguration(
                new MockHttpServletRequest("OPTIONS", "/api/auth/login")
        );

        assertNotNull(configuration);
        assertEquals(
                "https://brewlite-frontend-omega.vercel.app",
                configuration.checkOrigin("https://brewlite-frontend-omega.vercel.app")
        );
        assertNull(configuration.checkOrigin("https://untrusted.example"));
        assertTrue(configuration.getAllowedMethods().contains("OPTIONS"));
    }
}
