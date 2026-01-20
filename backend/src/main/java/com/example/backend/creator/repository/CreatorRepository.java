package com.example.backend.creator.repository;

import com.example.backend.creator.entity.Creator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CreatorRepository extends JpaRepository<Creator, Long> {

    Optional<Creator> findByMemberId(Long memberId);

    boolean existsByMemberId(Long memberId);
}
