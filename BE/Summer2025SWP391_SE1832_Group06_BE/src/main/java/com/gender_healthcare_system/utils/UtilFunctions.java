package com.gender_healthcare_system.utils;

import com.gender_healthcare_system.entities.enu.GenderType;
import com.gender_healthcare_system.entities.enu.PaymentMethod;
import com.gender_healthcare_system.entities.enu.ResultType;
import com.gender_healthcare_system.exceptions.AppException;
import com.gender_healthcare_system.payloads.todo.TestingServiceResultCompletePayload;
import com.gender_healthcare_system.payloads.todo.TestingServiceResultPayload;
import org.apache.commons.lang3.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

public class UtilFunctions {

    public static String generateTransactionId(){

        long currentTimeMillis = System.currentTimeMillis();
        long timeTrimmed = currentTimeMillis / 100000;
        long timeTrailing = currentTimeMillis % 100000;
        return String.valueOf(timeTrimmed + timeTrailing);
    }

    public static LocalDateTime convertTimeStampToLocalDateTime(String timeStamp){

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

        return LocalDateTime.parse(timeStamp, formatter);
    }

    public static LocalDateTime getCurrentDateTimeWithTimeZone(){
        ZoneId zone = ZoneId.of("Asia/Bangkok");
        return LocalDateTime.now(zone);
    }

    public static LocalDate getCurrentDateWithTimeZone(){
        ZoneId zone = ZoneId.of("Asia/Bangkok");
        return LocalDate.now(zone);
    }

    public static void validateIssueDateAndExpiryDate(LocalDate issueDate,
                                                      LocalDate expiryDate){
        ZoneId zone = ZoneId.of("Asia/Bangkok");
        LocalDate currentDate = LocalDate.now(zone);

        long daysCheckPoint = 365 + 182;
        long yearsCheckPoint = 2;

        boolean validateIssueDate = issueDate.isEqual(currentDate)
                || issueDate.isAfter(currentDate);

        if(validateIssueDate){

            throw new AppException(400, "Issue Date cannot be equal to or after current Date");
        }

        if(expiryDate != null) {
            
            boolean validateExpiryDate = expiryDate.isEqual(currentDate)
                    || expiryDate.isBefore(currentDate);

            if (validateExpiryDate) {

                throw new AppException(400, "Expiry Date cannot be equal to or before current Date");
            }

            long differenceInDays = ChronoUnit.DAYS.between(currentDate, expiryDate);

            if (differenceInDays < daysCheckPoint) {

                throw new AppException(400, "Expiry Date has to be after current Date " +
                        "by 1 and a half years or more");
            }

            long differenceInYears = ChronoUnit.YEARS.between(issueDate, expiryDate);

            if (differenceInYears < yearsCheckPoint) {

                throw new AppException(400, "Expiry Date has to be after Issue Date " +
                        "by 2 years or more");
            }
        }
    }

    public static void validateExpectedStartTime(LocalDateTime expectedStartTime){
        LocalDate currentDate = getCurrentDateWithTimeZone();

        LocalDate validateDate = expectedStartTime.toLocalDate();

        long daysBetween = ChronoUnit.DAYS.between(currentDate, validateDate);
        if(daysBetween <= 0){
            throw new AppException(400, "Expected Start Time cannot be before " +
                    "or of the same Date as current Date");
        }

        int minute = expectedStartTime.getMinute();

        if(minute > 0){
            System.out.println("Minute of expected start time cannot be greater than 0");
        }
    }

    public static void validateRescheduleExpectedStartTime(LocalDateTime expectedStartTime){
        LocalDateTime currentDateTime = getCurrentDateTimeWithTimeZone();

        int minute = expectedStartTime.getMinute();

        if(minute > 0){
            System.out.println("Minute of expected start time cannot be greater than 0");
        }

        long hoursBetween = ChronoUnit.HOURS.between(currentDateTime, expectedStartTime);
        if(hoursBetween < 3){
            throw new AppException(400, "Reschedule Expected Start Time must be at least " +
                    "3 hours late or more compared to current DateTime");
        }

    }

    public static void validateRealStartAndEndTime
            (LocalDateTime expectedStartTime, LocalDateTime expectedEndTime,
             LocalDateTime realStartTime, LocalDateTime realEndTime){

        long minutesCheckPoint1 = 90 ;
        long minutesCheckPoint2 = 60 ;

        long startTimeDifference = ChronoUnit.MINUTES.between(expectedStartTime, realStartTime);

        if(startTimeDifference < 0 || startTimeDifference > minutesCheckPoint1){

            throw new AppException(400,
                    "Real Start time cannot be before Expected Start time" +
                            "and can only be 90 minutes later at most " +
                            "compared to Expected Start time");
        }

        if(realEndTime.isEqual(expectedStartTime)
                || realEndTime.isBefore(expectedStartTime)){

            throw new AppException(400,
                    "Real End time cannot be equal to or before Expected Start time");
        }

        long startAndEndTimeDifference =
                ChronoUnit.MINUTES.between(realStartTime, realEndTime);

        if(startAndEndTimeDifference < 20
                || startAndEndTimeDifference > minutesCheckPoint2){

            throw new AppException(400,
                    "Real End time must be at least 20 minute or at most 60 minute later " +
                            "compared to Real Start time");
        }

    }

    public static void validateBulkTestTemplates
            (List<TestingServiceResultPayload> resultTemplates) {

        Map<String, Set<GenderType>> nameToGenders = new HashMap<>();
        Set<String> duplicateKeys = new HashSet<>();

        for (TestingServiceResultPayload template : resultTemplates) {
            String title = template.getTitle();
            ResultType testType = template.getType();
            GenderType gender = template.getGenderType();

            //Check if testTemplate with resultType of TEXT or POSITIVE_NEGATIVE
            //have measure unit or min max value
            if(testType != ResultType.NUMERIC &&
                    (template.getMeasureUnit() != null
                    || template.getMinValue() != null
                    || template.getMaxValue() != null)){

                throw new AppException(400,
                        "Test with title "+ title +" and test type " +testType.name() +
                                "cannot have a measure unit, min or max value");
            }

            //Check if testTemplate with resultType of NUMERIC
            //does not have measure unit or min max value
            if(testType == ResultType.NUMERIC &&
                    (template.getMeasureUnit() == null
                            || template.getMinValue() == null
                            || template.getMaxValue() == null)){

                throw new AppException(400,
                        "Test with title "+ title +" and test type " +testType.name() +
                                "is missing a measure unit, min or max value");
            }

            String compositeKey = title + "|" + gender;

            //check if there are duplicates, for example template with
            //gender type ANY can only have at most one title + gender combination
            //and gender type MALE or FEMALE can only have at most
            //2 title + gender combinations (MALE or FEMALE)
            if (!duplicateKeys.add(compositeKey)) {
                throw new AppException(400,
                        "Duplicate test with title " + title + " and gender type " + gender
                                + "' in the input list."
                );
            }

            nameToGenders
                    .computeIfAbsent(title, k -> new HashSet<>())
                    .add(gender);

            BigDecimal minValue = template.getMinValue();
            BigDecimal maxValue = template.getMaxValue();

            if(minValue.compareTo(maxValue) > 0){
                throw new AppException(400,
                        "Test with title " + title + " has min value greater than max value");
            }
        }

        for (Map.Entry<String, Set<GenderType>> entry : nameToGenders.entrySet()) {
            Set<GenderType> genders = entry.getValue();
            if (genders.contains(GenderType.ANY) &&
                    (genders.contains(GenderType.MALE) || genders.contains(GenderType.FEMALE))) {
                throw new AppException(400, "Conflict in input: Cannot mix 'ANY' " +
                        "with gender-specific test for title: " + entry.getKey()
                );
            }

            if ((!genders.contains(GenderType.MALE) && genders.contains(GenderType.FEMALE))
            || (genders.contains(GenderType.MALE) && !genders.contains(GenderType.FEMALE))) {
                throw new AppException(400, "Missing input: Missing MALE or FEMALE test for " +
                        "gender-specific test with " +
                        "title: " + entry.getKey()
                );
            }

        }
    }

    public static void validateRealTestResult
            (List<TestingServiceResultCompletePayload> resultList){

        for(TestingServiceResultCompletePayload item: resultList){

            if(!item.getResult().contains("POSITIVE")
            && !item.getResult().contains("NEGATIVE")) {
                BigDecimal realValue = new BigDecimal(item.getResult());
                BigDecimal minValue = item.getMinValue();
                BigDecimal maxValue = item.getMaxValue();

                if (minValue.compareTo(maxValue) > 0) {
                    throw new AppException(400,
                            "Test with title " + item.getTitle() +
                                    " has min value greater than max value");
                }

                if (realValue.compareTo(minValue) < 0
                        || realValue.compareTo(maxValue) > 0) {

                    throw new AppException(400, "Real value for test with title "
                            + item.getTitle() + "must be within accepted range: [" +
                            item.getMinValue() + "," + item.getMaxValue() + "]");
                }
            }
        }
    }



    public static void validateRealStartTime(LocalDateTime expectedStartTime, LocalDateTime realStartTime) {
        long maxDelayInMinutes = 90;
        long minAdvanceInMinutes = -10;

        long diffMinutes = ChronoUnit.MINUTES.between(expectedStartTime, realStartTime);

        if (diffMinutes < minAdvanceInMinutes || diffMinutes > maxDelayInMinutes) {
            throw new AppException(400, "Real start time must be within -10 to +90 minutes of expected start time. " +
                    "Provided difference: " + diffMinutes + " minutes");
        }
    }

    public static void validatePaymentInput(PaymentMethod method, String transactionId){

        if(method == PaymentMethod.CASH
                && !StringUtils.isEmpty(transactionId) ){

            throw new AppException(400,
                    "Input TransactionId is not required when using CASH method");
        }

        if(method == PaymentMethod.BANKING
                && StringUtils.isEmpty(transactionId) ){

            throw new AppException(400,
                    "TransactionId is required when using BANKING method");
        }
    }

    /*public static void validatePeriodDetails(Gender gender, GenderSpecificDetails details){

        if(gender == Gender.MALE && details != null){
            throw new AppException(400, "Gender MALE cannot have period details");
        }

        if(gender == Gender.FEMALE && details == null){
            throw new AppException(400, "Gender FEMALE must have period details");
        }

        if(details != null){

            if(Boolean.TRUE.equals(details.getHasMenstrualCycle()) &&
                    (details.getCycleLengthDays() == null ||
                            details.getLastCycleStart() == null)){

                throw new AppException(400,
                        "Cycle details are required when hasMenstrualCycle is true");
            }

            if(Boolean.FALSE.equals(details.getHasMenstrualCycle()) &&
                    (details.getCycleLengthDays() != null ||
                            details.getLastCycleStart() != null)){

                throw new AppException(400,
                        "Cycle details are not required when hasMenstrualCycle is false");
            }
        }
    }*/
}
