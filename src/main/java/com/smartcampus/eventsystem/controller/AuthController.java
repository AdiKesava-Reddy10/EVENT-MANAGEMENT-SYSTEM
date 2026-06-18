package com.smartcampus.eventsystem.controller;

import com.smartcampus.eventsystem.model.User;
import com.smartcampus.eventsystem.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AuthController {

    @Autowired
    private UserService userService;

    // @GetMapping("/signup")
    // public String showSignupForm(Model model) {
    //     if (!model.containsAttribute("user")) {
    //         model.addAttribute("user", new User());
    //     }
    //     return "signup";
    // }

    // @PostMapping("/signup")
    // public String processSignup(@Valid @ModelAttribute("user") User user, BindingResult bindingResult, RedirectAttributes redirectAttributes) {
    //     if (bindingResult.hasErrors()) {
    //         redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.user", bindingResult);
    //         redirectAttributes.addFlashAttribute("user", user);
    //         return "redirect:/signup";
    //     }
    // 
    //     try {
    //         user.setRole("ROLE_STUDENT"); // Default role
    //         userService.registerNewUserClass(user);
    //         redirectAttributes.addFlashAttribute("successMessage", "Account created successfully! You can now log in.");
    //         return "redirect:/login";
    //     } catch (RuntimeException e) {
    //         redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
    //         redirectAttributes.addFlashAttribute("user", user);
    //         return "redirect:/signup";
    //     }
    // }
}
