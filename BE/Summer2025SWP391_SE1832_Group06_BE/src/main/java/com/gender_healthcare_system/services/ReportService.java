package com.gender_healthcare_system.services;

import com.gender_healthcare_system.dtos.report.StatisticResponseDTO;
import com.gender_healthcare_system.entities.enu.ConsultationStatus;
import com.gender_healthcare_system.entities.enu.TestingServiceBookingStatus;
import com.gender_healthcare_system.repositories.AccountRepo;
import com.gender_healthcare_system.repositories.ConsultationRepo;
import com.gender_healthcare_system.repositories.TestingServiceBookingRepo;
import com.gender_healthcare_system.utils.UtilFunctions;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ConsultationRepo consultationRepo;
    private final TestingServiceBookingRepo testingServiceBookingRepo;
    private final AccountRepo accountRepo;

    public List<StatisticResponseDTO> getConsultationsStatistics
            (int periodInDays) {

        LocalDate fromDate = UtilFunctions.getCurrentDateWithTimeZone().minusDays(periodInDays);
        return consultationRepo.
                getConsultationsStatistics(ConsultationStatus.COMPLETED, fromDate);
    }

    public List<StatisticResponseDTO> getTestingBookingsStatistics
            (int periodDays) {

        LocalDate fromDate = UtilFunctions.getCurrentDateWithTimeZone().minusDays(periodDays);
        return testingServiceBookingRepo.
                getTestingBookingsStatistics(TestingServiceBookingStatus.COMPLETED, fromDate);
    }

    public long getTotalUserCount() {
        return accountRepo.countTotalAccounts();
    }
}

