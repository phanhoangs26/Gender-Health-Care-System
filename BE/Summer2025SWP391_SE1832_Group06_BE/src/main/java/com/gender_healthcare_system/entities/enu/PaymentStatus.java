package com.gender_healthcare_system.entities.enu;

public enum PaymentStatus {
    PAID,
    REFUNDED;

    public String getStatus() {
        return this.name();
    }
}
