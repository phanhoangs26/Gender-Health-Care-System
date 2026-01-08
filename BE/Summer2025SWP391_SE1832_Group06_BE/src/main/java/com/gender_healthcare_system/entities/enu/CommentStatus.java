package com.gender_healthcare_system.entities.enu;

public enum CommentStatus {
    REMOVED,
    ACTIVE;

    public String getStatus(){
        return this.name();
    }
}
