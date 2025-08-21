package com.act.backend.controllers;

import com.act.backend.dto.EventDTO;
import com.act.backend.dto.StudentAttendanceDTO;
import com.act.backend.models.Faculty;
import com.act.backend.services.FacultyService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/faculty")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyService facultyService;

    // ✅ REGISTER (initially unapproved)
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Faculty faculty) {
        return ResponseEntity.ok(facultyService.register(faculty));
    }

    // ✅ LOGIN (only after approval + password set)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpSession session) {
        try {
            Faculty f = facultyService.login(body.get("email"), body.get("password"));
            session.setAttribute("faculty", f);
            return ResponseEntity.ok(f);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // ✅ LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Faculty logged out");
    }

    // ✅ GET PROFILE
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(HttpSession session) {
        Faculty f = (Faculty) session.getAttribute("faculty");
        if (f == null) {
            return ResponseEntity.status(401).body("Not logged in");
        }
        return ResponseEntity.ok(f);
    }

    // ✅ UPDATE PROFILE
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(HttpSession session, @RequestBody Faculty updated) {
        Faculty f = (Faculty) session.getAttribute("faculty");
        if (f == null) return ResponseEntity.status(401).body("Not logged in");

        Faculty saved = facultyService.updateProfile(f, updated);
        session.setAttribute("faculty", saved); // keep session updated
        return ResponseEntity.ok(saved);
    }

    // ✅ UPDATE PASSWORD
    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(HttpSession session, @RequestBody Map<String, String> body) {
        Faculty f = (Faculty) session.getAttribute("faculty");
        if (f == null) return ResponseEntity.status(401).body("Not logged in");

        try {
            facultyService.updatePassword(f, body.get("currentPassword"), body.get("newPassword"));
            return ResponseEntity.ok("Password updated");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ SET PASSWORD (after approval link)
    @PostMapping("/set-password")
    public ResponseEntity<?> setPassword(@RequestParam String email, @RequestParam String password) {
        try {
            facultyService.setPassword(email, password);
            return ResponseEntity.ok("Password set successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // ✅ GET EVENTS ASSIGNED TO FACULTY
    @GetMapping("/events")
    public ResponseEntity<?> getAssignedEvents(HttpSession session) {
        Faculty f = (Faculty) session.getAttribute("faculty");
        if (f == null) return ResponseEntity.status(401).body("Not logged in");

        return ResponseEntity.ok(facultyService.getAssignedEvents(f));
    }

    // ✅ GET STUDENTS OF AN EVENT
    @GetMapping("/events/{eventId}/students")
    public ResponseEntity<?> getStudentsByEvent(@PathVariable Long eventId, HttpSession session) {
        Faculty f = (Faculty) session.getAttribute("faculty");
        if (f == null) return ResponseEntity.status(401).body("Not logged in");

        try {
            List<StudentAttendanceDTO> students = facultyService.getStudentsByEvent(f, eventId);
            return ResponseEntity.ok(students);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ MARK ATTENDANCE
    @PostMapping("/events/{eventId}/attendance")
    public ResponseEntity<?> markAttendance(@PathVariable Long eventId,
                                            @RequestParam Long studentId,
                                            @RequestParam Boolean present,
                                            HttpSession session) {
        Faculty f = (Faculty) session.getAttribute("faculty");
        if (f == null) return ResponseEntity.status(401).body("Not logged in");

        try {
            facultyService.markAttendance(f, eventId, studentId, present);
            return ResponseEntity.ok("Attendance marked as " + (present ? "Present" : "Absent"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
