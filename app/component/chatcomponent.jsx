import React, { useState, useCallback } from 'react';
import { Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { styled } from 'nativewind';

const GradientBackground = styled(View);

const ChatComponent = ({ messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() !== '') {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  }, [newMessage, onSendMessage]);

  return (
    <View className="flex-1 bg-white rounded-md p-4">
      <Text className="text-2xl text-black mb-4">Chat</Text>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View
            key={item.id}
            className="mb-2 flex-row border border-black m-2 text-center items-center"
          >
            <Text className="text-white bg-black mr-3 h-full text-sm">
              {item.playerName}
            </Text>
            <Text className="text-black bg-white mr-3">:</Text>
            <Text className="text-black bg-white w-full">{item.text}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
      />
      <View className="flex-row items-center mt-4">
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          className="bg-gray-200 rounded-md p-2 flex-1"
          placeholder="Type a message..."
          placeholderTextColor="#888888"
        />
        <TouchableOpacity
          className="bg-blue-600 rounded-md p-2 ml-2"
          onPress={handleSendMessage}
        >
          <Text className="text-white">Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatComponent;
