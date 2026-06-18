package com.smartcampus.eventsystem.config;

import com.smartcampus.eventsystem.model.Event;
import com.smartcampus.eventsystem.model.User;
import com.smartcampus.eventsystem.repository.EventRepository;
import com.smartcampus.eventsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Ensure existing users have hashed passwords (migration for older DBs)
        java.util.List<User> existingUsers = userRepository.findAll();
        boolean usersUpdated = false;
        for (User user : existingUsers) {
            if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
                userRepository.save(user);
                usersUpdated = true;
            }
        }
        if (usersUpdated) {
            System.out.println("Migrated existing users to use BCrypt hashed passwords.");
        }

        // Ensure at least 2 events are marked as past (for certificate testing)
        java.util.List<Event> allEvents = eventRepository.findAll();
        int pastCount = 0;
        for (Event event : allEvents) {
            if (pastCount < 2) {
                if (event.getDate() != null && event.getDate().isAfter(LocalDate.now().minusDays(1))) {
                    event.setDate(LocalDate.now().minusDays(10));
                    eventRepository.save(event);
                }
                pastCount++;
            }
        }
        if (pastCount > 0) {
            System.out.println("Ensured " + pastCount + " events are in the past for certificate generation testing.");
        }

        // Seed Users
        if (userRepository.count() == 0) {
            userRepository.save(new User("admin", passwordEncoder.encode("password"), "ROLE_ADMIN"));
            userRepository.save(new User("student", passwordEncoder.encode("password"), "ROLE_STUDENT"));
            System.out.println("Seeded admin and student users in database.");
        }

        // Seed Future Events
        if (eventRepository.count() == 0) {
            Event e1 = new Event();
            e1.setTitle("Intro to Machine Learning");
            e1.setDescription("A beginner friendly workshop exploring the basics of ML using Python and Scikit-Learn.");
            e1.setDate(LocalDate.now().plusDays(5));
            e1.setTime("10:00 AM");
            e1.setDepartment("Computer Science");
            e1.setLocation("Auditorium A");
            e1.setType("Workshop");
            e1.setTotalSeats(100);
            e1.setOrganizer("Dr. Alan Turing");
            e1.setImageUrl("https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80");

            Event e2 = new Event();
            e2.setTitle("Annual Tech Symposium");
            e2.setDescription("The largest tech gathering featuring guest speakers from leading tech companies.");
            e2.setDate(LocalDate.now().plusDays(15));
            e2.setTime("09:00 AM");
            e2.setDepartment("Engineering");
            e2.setLocation("Main Hall");
            e2.setType("Seminar");
            e2.setTotalSeats(500);
            e2.setOrganizer("Tech Community");
            e2.setImageUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80");

            Event e3 = new Event();
            e3.setTitle("React.js Frontend Bootcamp");
            e3.setDescription("Learn modern React paradigms including Hooks, Context API, and state management.");
            e3.setDate(LocalDate.now().plusDays(20));
            e3.setTime("01:00 PM");
            e3.setDepartment("Software Engineering");
            e3.setLocation("Lab 402");
            e3.setType("Workshop");
            e3.setTotalSeats(50);
            e3.setOrganizer("Jane Doe");
            e3.setImageUrl("https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80");

            Event e4 = new Event();
            e4.setTitle("Cybersecurity Awareness Panel");
            e4.setDescription("Expert panel discussing modern threats, phishing, and enterprise security.");
            e4.setDate(LocalDate.now().plusDays(25));
            e4.setTime("03:00 PM");
            e4.setDepartment("IT Security");
            e4.setLocation("Room 101");
            e4.setType("Seminar");
            e4.setTotalSeats(150);
            e4.setOrganizer("Security Team");
            e4.setImageUrl("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80");

            eventRepository.save(e1);
            eventRepository.save(e2);
            eventRepository.save(e3);
            eventRepository.save(e4);
            System.out.println("Seeded 4 future events in database.");
        }
    }
}
