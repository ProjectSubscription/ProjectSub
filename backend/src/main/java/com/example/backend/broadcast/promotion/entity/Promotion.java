package com.example.backend.broadcast.promotion.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Table(name = "promotions")
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}
