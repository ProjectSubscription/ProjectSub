package com.example.backend.channel.validator;

import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.repository.ChannelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChannelValidatorImpl implements ChannelValidator {

    private final ChannelRepository channelRepository;

    @Override
    public void validateChannel(Long channelId) {
        channelRepository.findById(channelId)
                .orElseThrow(() ->
                        new IllegalArgumentException("존재하지 않는 채널입니다.")
                );
    }

    @Override
    public void validateActive(Long channelId) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() ->
                        new IllegalArgumentException("존재하지 않는 채널입니다.")
                );

        if (!channel.isActive()) {
            throw new IllegalStateException("비활성화된 채널입니다.");
        }
    }

    @Override
    public void validateOwner(Long creatorId, Long channelId) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() ->
                        new IllegalArgumentException("존재하지 않는 채널입니다.")
                );

        if (!channel.getCreatorId().equals(creatorId)) {
            throw new IllegalStateException("채널 소유자가 아닙니다.");
        }
    }
}