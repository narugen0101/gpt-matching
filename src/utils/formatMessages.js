export function formatMessages(messages, userId) {
    return messages.map(message => {
        const sender = message.sender === userId ? "自分" : "相手";
        return `${sender} : ${message.content}\n`;
      }).join('');
  }
  