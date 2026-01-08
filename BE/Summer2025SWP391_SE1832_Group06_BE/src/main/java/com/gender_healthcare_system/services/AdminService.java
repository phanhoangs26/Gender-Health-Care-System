package com.gender_healthcare_system.services;

import com.gender_healthcare_system.repositories.AccountRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AdminService {

    private final AccountRepo accountRepo;

}
