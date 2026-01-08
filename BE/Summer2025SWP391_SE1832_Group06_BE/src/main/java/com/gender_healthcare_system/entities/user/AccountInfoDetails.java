package com.gender_healthcare_system.entities.user;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collection;
import java.util.Collections;

public class AccountInfoDetails implements UserDetails {

    private final int id;
    private final String username;
    private final String password;
    private final String rolename;
    private final Collection<? extends GrantedAuthority> authorities;

    public AccountInfoDetails(Account userInfo) {
        this.id = userInfo.getAccountId();
        this.username = userInfo.getUsername(); // lấy từ thực thể Account
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        this.password = encoder.encode(userInfo.getPassword());

        this.rolename = userInfo.getRole().getRoleName();
        // đảm bảo userInfo.getRole() != null
        String roleName = "ROLE_" + userInfo.getRole().getRoleName().toUpperCase();

        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(roleName));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public int getId() {
        return id;
    }

    public String getRolename() {
        return rolename;
    }
}
