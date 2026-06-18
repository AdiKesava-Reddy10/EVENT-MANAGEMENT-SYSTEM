package com.smartcampus.eventsystem.repository;

import com.smartcampus.eventsystem.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    
    // Search query with filters
    @Query("SELECT e FROM Event e WHERE " +
           "(:date IS NULL OR e.date >= :date) AND " +
           "(:department IS NULL OR LOWER(e.department) LIKE LOWER(CONCAT('%', :department, '%'))) AND " +
           "(:type IS NULL OR LOWER(e.type) LIKE LOWER(CONCAT('%', :type, '%'))) AND " +
           "(:keyword IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY e.date ASC")
    List<Event> findByFilters(@Param("date") LocalDate date, 
                              @Param("department") String department, 
                              @Param("type") String type,
                              @Param("keyword") String keyword);

    List<Event> findAllByOrderByDateAsc();
}
