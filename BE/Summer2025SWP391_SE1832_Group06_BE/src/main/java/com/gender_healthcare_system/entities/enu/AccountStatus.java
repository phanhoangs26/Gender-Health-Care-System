package com.gender_healthcare_system.entities.enu;


public enum AccountStatus {
    ACTIVE,
    SUSPENDED,
    DELETED;

    public String getStatus() {
        return this.name();
    }
}
