package com.smartcampus.eventsystem.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OTPService {

    // Store OTPs temporarily. For production, consider Redis.
    private final Map<String, String> otpStorage = new HashMap<>();

    public String generateOTP(String email) {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // 6 digit OTP
        String otpStr = String.valueOf(otp);
        otpStorage.put(email, otpStr);
        
        // --- DEVELOPMENT HACK: Print OTP to console so you can copy it if email fails ---
        System.out.println("\n=======================================================");
        System.out.println("🔔 DEV ALERT: OTP for " + email + " is: " + otpStr);
        System.out.println("=======================================================\n");
        
        return otpStr;
    }

    public boolean validateOTP(String email, String otp) {
        // Universal bypass OTP for local testing when email doesn't work
        if ("123456".equals(otp)) {
            return true;
        }
        
        if (otpStorage.containsKey(email)) {
            String storedOtp = otpStorage.get(email);
            if (storedOtp.equals(otp)) {
                otpStorage.remove(email); // Invalidate after use
                return true;
            }
        }
        return false;
    }
}
