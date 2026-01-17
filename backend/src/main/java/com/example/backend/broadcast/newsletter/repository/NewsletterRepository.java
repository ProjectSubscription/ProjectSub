package com.example.backend.broadcast.newsletter.repository;

import com.example.backend.broadcast.newsletter.entity.Newsletter;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsletterRepository extends JpaRepository<Newsletter, Long> {

}
