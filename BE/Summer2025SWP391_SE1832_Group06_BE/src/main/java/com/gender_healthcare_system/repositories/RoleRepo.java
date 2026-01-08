package com.gender_healthcare_system.repositories;

import com.gender_healthcare_system.entities.user.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepo extends JpaRepository<Role, Integer> {

    Role findByRoleId(int roleId);
}
