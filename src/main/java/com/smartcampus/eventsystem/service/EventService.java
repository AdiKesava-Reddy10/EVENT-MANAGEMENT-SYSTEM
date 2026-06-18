package com.smartcampus.eventsystem.service;

import com.smartcampus.eventsystem.model.Event;
import com.smartcampus.eventsystem.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAllByOrderByDateAsc();
    }

    public List<Event> getEventsWithFilters(LocalDate date, String department, String type, String keyword) {
        if (date == null && 
           (department == null || department.isEmpty()) && 
           (type == null || type.isEmpty()) &&
           (keyword == null || keyword.isEmpty())) {
            return getAllEvents();
        }
        
        String filterDepartment = (department != null && !department.isEmpty()) ? department : null;
        String filterType = (type != null && !type.isEmpty()) ? type : null;
        String filterKeyword = (keyword != null && !keyword.isEmpty()) ? keyword : null;
        
        return eventRepository.findByFilters(date, filterDepartment, filterType, filterKeyword);
    }


    public Event getEventById(Long id) {
        return eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found with ID " + id));
    }

    public Event saveEvent(Event event) {
        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
}
