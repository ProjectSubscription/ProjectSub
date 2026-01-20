package com.example.backend.channel.validator;

public interface ChannelValidator {
    //채널 존재 여부 검증
    void validateChannel(Long channelId);

    //채널 활설 상태 검증
    void validateActive(Long channelId);

    //채널 소유자 검증
    void validateOwner(Long creatorId, Long channelId);

}
