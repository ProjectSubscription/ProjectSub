package com.example.backend.broadcast.newsletter.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Table(name = "newsletters")
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class Newsletter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


}
