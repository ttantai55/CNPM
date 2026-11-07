package vn.doan.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import vn.doan.domain.User;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    // Khóa bí mật (Độ dài phải đủ lớn cho thuật toán HMAC-SHA)
    private static final String SECRET_KEY = "3cfa76ef14937c1c0ea519f8fc03488257d079366e6b48325a2781498fa7c992";
    
    // Thời gian sống của token (Ví dụ: 1 ngày = 86400000 ms)
    private static final long EXPIRATION_TIME = 86400000L;

    private SecretKey getSignInKey() {
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // 1. Hàm sinh Token từ đối tượng User Entity
    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail()) 
                .claim("id", user.getId())
                .claim("role", user.getRole())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSignInKey()) // Bản mới tự nhận thuật toán từ SecretKey
                .compact();
    }

    // 2. Lấy Email từ Token
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 3. Kiểm tra token còn hạn không
    public boolean isTokenValid(String token, User user) {
        final String email = extractEmail(token);
        return (email.equals(user.getEmail())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey()) // Cú pháp parser mới của JJWT 0.12+
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}