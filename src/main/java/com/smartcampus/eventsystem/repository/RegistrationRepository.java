package com.smartcampus.eventsystem.repository;

import com.smartcampus.eventsystem.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByEventId(Long eventId);
    int countByEventId(Long eventId);
    List<Registration> findByUserId(Long userId);
    java.util.Optional<Registration> findByQrToken(String qrToken);
}
