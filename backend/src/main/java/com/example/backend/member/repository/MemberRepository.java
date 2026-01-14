package com.example.backend.member.repository;

import com.example.backend.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    boolean existsByEmail(String email);

    boolean existsByNickname(String nickname);

    @Query("select m from Member m join fetch m.roles where m.id = :id")
    Optional<Member> findById(Long id);

    @Query("select m from Member m join fetch m.roles")
    List<Member> findAll();

    @Query("select m from Member m join fetch m.roles where m.email = :email")
    Optional<Member> findByEmail(String email);

    Optional<Member> findByOauthProviderAndOauthProviderId(String provider, String providerId);
}
