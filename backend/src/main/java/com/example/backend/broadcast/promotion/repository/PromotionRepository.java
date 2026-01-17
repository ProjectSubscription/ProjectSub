package com.example.backend.broadcast.promotion.repository;

import com.example.backend.broadcast.promotion.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {

}
