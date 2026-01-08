package com.gender_healthcare_system.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

@Service
public class JwtService {
    public static final String SECRET =
            "5367566859703373367639792F423F452848284D6251655468576D5A71347437";

    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    public String generateToken(int id, String username, String roleName,
                                String fullName, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("ID", id);
        claims.put("Role", roleName);
        claims.put("Full Name", fullName);
        claims.put("Email", email);
        return createToken(claims, username);
    }

    public String generateTokenForCustomer(int id, String username, String roleName,
                                String fullName, String gender, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("ID", id);
        claims.put("Role", roleName);
        claims.put("Full Name", fullName);
        claims.put("Gender", gender);
        claims.put("Email", email);
        return createToken(claims, username);
    }

    public String generateTokenForAdmin(int id, String username, String roleName) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("ID", id);
        claims.put("Role", roleName);
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String username) {

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    //invalidate token by adding it to a blacklist
    //dung de logout
    public void invalidateToken(String token) {

        blacklistedTokens.add(token);
    }

    public boolean isTokenBlacklisted(String token) {

        return blacklistedTokens.contains(token);
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) &&
                !isTokenExpired(token)) && !isTokenBlacklisted(token);
    }





}
