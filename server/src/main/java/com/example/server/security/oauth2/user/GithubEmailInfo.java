package com.example.server.security.oauth2.user;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GithubEmailInfo {
    @JsonProperty("email")
    private String email;
    @JsonProperty("primary")
    private boolean primary;
    @JsonProperty("verified")
    private boolean verified;
    @JsonProperty("visibility")
    private String visibility;

    // Getter 및 Setter 메서드 (생략)

    @Override
    public String toString() {
        return "EmailInfo{" +
                "email='" + email + '\'' +
                ", primary=" + primary +
                ", verified=" + verified +
                ", visibility='" + visibility + '\'' +
                '}';
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isPrimary() {
        return primary;
    }

    public void setPrimary(boolean primary) {
        this.primary = primary;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }
}
