import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppButton } from '../../../components/ui/app-button';
import { AppCard } from '../../../components/ui/app-card';
import { EmptyState } from '../../../components/ui/empty-state';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../../constants/theme';

const formatMessageTime = (createdAt) => {
  if (!createdAt) {
    return 'Now';
  }

  const value = new Date(createdAt);

  if (Number.isNaN(value.getTime())) {
    return 'Now';
  }

  return value.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getInitials = (playerName) => {
  if (!playerName) {
    return '?';
  }

  return playerName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
};

export const ChatPanel = ({
  messages,
  onSendMessage,
  sendingDisabled = false,
  currentPlayerName,
  title = 'Room Chat',
  caption = 'Fast live updates via Socket.IO',
  placeholder = 'Send a room message',
  emptyTitle = 'No messages yet',
  emptyDescription = 'Once someone speaks up, the whole room will see it here in real time.',
  minHeight = 360,
}) => {
  const [draft, setDraft] = useState('');
  const maxLength = 240;

  const preparedMessages = useMemo(
    () =>
      messages.map((message, index) => ({
        ...message,
        id: `${message.playerName || 'player'}-${index}`,
        sentAt: formatMessageTime(message.createdAt),
      })),
    [messages]
  );

  const submit = () => {
    const nextMessage = draft.trim();

    if (!nextMessage || sendingDisabled) {
      return;
    }

    onSendMessage(nextMessage);
    setDraft('');
  };

  return (
    <AppCard style={[styles.card, { minHeight }]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.caption}>{caption}</Text>
        </View>

        <View style={styles.counterPill}>
          <Text style={styles.counterText}>{preparedMessages.length} live</Text>
        </View>
      </View>

      {preparedMessages.length ? (
        <FlatList
          data={preparedMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isOwnMessage = item.playerName === currentPlayerName;

            return (
              <View style={[styles.messageRow, isOwnMessage ? styles.messageRowSelf : null]}>
                <View style={[styles.avatar, isOwnMessage ? styles.avatarSelf : null]}>
                  <Text style={[styles.avatarText, isOwnMessage ? styles.avatarTextSelf : null]}>
                    {getInitials(item.playerName)}
                  </Text>
                </View>

                <View style={[styles.messageBubble, isOwnMessage ? styles.messageBubbleSelf : null]}>
                  <View style={styles.messageMeta}>
                    <Text style={[styles.messageAuthor, isOwnMessage ? styles.messageAuthorSelf : null]}>
                      {isOwnMessage ? 'You' : item.playerName || 'Player'}
                    </Text>
                    <Text style={styles.messageTime}>{item.sentAt}</Text>
                  </View>

                  <Text style={[styles.messageBody, isOwnMessage ? styles.messageBodySelf : null]}>
                    {item.text}
                  </Text>
                </View>
              </View>
            );
          }}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyWrap}>
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </View>
      )}

      <View style={styles.composer}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDim}
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          multiline
          maxLength={maxLength}
          textAlignVertical="top"
        />

        <View style={styles.composerFooter}>
          <Text style={styles.helperNote}>
            {sendingDisabled ? 'Reconnect to send messages.' : `${draft.trim().length}/${maxLength} characters`}
          </Text>
          <AppButton label="Send" onPress={submit} disabled={sendingDisabled || !draft.trim()} />
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 24,
  },
  caption: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
  },
  counterPill: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(53,208,186,0.12)',
  },
  counterText: {
    color: COLORS.accentAlt,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  list: {
    flexGrow: 0,
    minHeight: 180,
    maxHeight: 340,
  },
  listContent: {
    gap: 12,
    paddingVertical: 4,
  },
  emptyWrap: {
    minHeight: 180,
    justifyContent: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  messageRowSelf: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarSelf: {
    backgroundColor: 'rgba(255,122,89,0.18)',
    borderColor: 'rgba(255,122,89,0.32)',
  },
  avatarText: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 12,
  },
  avatarTextSelf: {
    color: COLORS.white,
  },
  messageBubble: {
    flex: 1,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 14,
    gap: 8,
  },
  messageBubbleSelf: {
    borderColor: 'rgba(255,122,89,0.24)',
    backgroundColor: 'rgba(255,122,89,0.16)',
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  messageAuthor: {
    color: COLORS.accentAlt,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  messageAuthorSelf: {
    color: COLORS.white,
  },
  messageTime: {
    color: COLORS.textDim,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 12,
  },
  messageBody: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 21,
  },
  messageBodySelf: {
    color: COLORS.white,
  },
  composer: {
    gap: 12,
  },
  input: {
    minHeight: 96,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  composerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  helperNote: {
    flex: 1,
    color: COLORS.textDim,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 13,
  },
});
