import React from 'react';
import { ChannelHeader } from '@/components/channel/ChannelHeader';
import { SubscriptionPlans } from '@/components/channel/SubscriptionPlans';
import { ChannelTabs } from '@/components/channel/ChannelTabs';
import { ContentGrid } from '@/components/channel/ContentGrid';
import { ChannelAbout } from '@/components/channel/ChannelAbout';
import { mockChannels, mockContents, mockSubscriptionPlans, mockReviews } from '@/app/mockData';

export function ChannelDetailPage({ channelId, onNavigate }) {
  const [activeTab, setActiveTab] = React.useState('content');
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  const channel = mockChannels.find(c => c.id === channelId);
  const channelContents = mockContents.filter(c => c.channelId === channelId);
  const plans = mockSubscriptionPlans.filter(p => p.channelId === channelId);

  if (!channel) {
    return <div className="text-center py-12">채널을 찾을 수 없습니다.</div>;
  }

  const handleSubscribe = (planId) => {
    onNavigate('payment', { type: 'subscription', planId });
  };

  return (
    <div className="space-y-8 pb-12">
      <ChannelHeader
        channel={channel}
        isSubscribed={isSubscribed}
        onSubscribeToggle={() => setIsSubscribed(!isSubscribed)}
      />

      {!isSubscribed && (
        <SubscriptionPlans plans={plans} onSubscribe={handleSubscribe} />
      )}

      <ChannelTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        contentCount={channelContents.length}
      />

      {activeTab === 'content' && (
        <ContentGrid
          contents={channelContents}
          isSubscribed={isSubscribed}
          onNavigate={onNavigate}
        />
      )}

      {activeTab === 'about' && (
        <ChannelAbout
          channel={channel}
          contentCount={channelContents.length}
          reviews={mockReviews}
        />
      )}
    </div>
  );
}
