package com.gender_healthcare_system.entities.enu;

public enum Rating {
    VERY_BAD,
    BAD,
    AVERAGE,
    GOOD,
    EXCELLENT
    ;

    public String getRating() {
        return this.name();
    }
}

