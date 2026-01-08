package com.gender_healthcare_system.entities.enu;

public enum MeasureUnit {
    MILIMOL_PER_LITER("mmol/L"),
    MICROMOL_PER_LITER("μmol/L"),
    GRAM_PER_LITER("g/L"),
    PER_MICROLITER("/μL"),
    MILIMETER_OF_MERCURY("mmHg"),
    INTERNATIONAL_UNITS_PER_LITER("IU/L"),
    NONE("None");

    private final String symbol;

    MeasureUnit(String symbol) {
        this.symbol = symbol;
    }

    public String getSymbol() {
        return symbol;
    }

    public String getUnit() {
        return this.name();
    }
}
