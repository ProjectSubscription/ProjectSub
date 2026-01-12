package com.example.backend.subscription.dto.response;

import java.util.Map;

public record SubscriberStatisticsResponse(Long totalSubscribers, Map<String, Long> ageGroupDistribution, Map<String, Long> genderDistribution) {}
