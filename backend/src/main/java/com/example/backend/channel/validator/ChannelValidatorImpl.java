package com.example.backend.channel.validator;

import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.repository.ChannelRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
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
                        new BusinessException(ErrorCode.CHANNEL_NOT_FOUND)
                );
    }

    @Override
    public void validateActive(Long channelId) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.CHANNEL_NOT_FOUND)
                );

        if (!channel.isActive()) {
            throw new BusinessException(ErrorCode.CHANNEL_INACTIVE);
        }
    }

    @Override
    public void validateOwner(Long creatorId, Long channelId) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.CHANNEL_NOT_FOUND)
                );

        if (!channel.getCreatorId().equals(creatorId)) {
            throw new BusinessException(ErrorCode.CHANNEL_OWNER_MISMATCH);
        }
    }
}