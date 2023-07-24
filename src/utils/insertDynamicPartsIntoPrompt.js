export const insertDynamicPartsIntoPrompt = (promptTemplate, formattedMessages, newMessage) => {
    // Replace placeholder with actual values
    const newPrompt = promptTemplate.replace('formattedText', formattedMessages).replace('newMessage}', newMessage);
    console.log(`newPrompt:${newPrompt}`)
    return newPrompt;
};
