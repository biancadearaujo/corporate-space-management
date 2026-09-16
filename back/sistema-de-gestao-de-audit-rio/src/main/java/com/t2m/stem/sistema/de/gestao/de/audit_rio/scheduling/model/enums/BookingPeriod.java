package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums;

public enum BookingPeriod {
    MORNING(4),
    AFTERNOON(4),
    FULL_TIME(8);

    private final int durationInHours;

    BookingPeriod(int durationInHours) {
        this.durationInHours = durationInHours;
    }

    public int getDurationInHours() {
        return durationInHours;
    }
}
