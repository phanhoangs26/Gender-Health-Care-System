package com.gender_healthcare_system.entities.enu;

public enum PaymentMethod {
    CASH,
    BANKING;

    public String getPaymentMethod() {
        return this.name();
    }
}
