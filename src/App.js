// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import Web3 from 'web3';
import GroupChatContract from './GroupChat.json';

function App() {
  const [web3, setWeb3] = useState(null);
  const [groupChat, setGroupChat] = useState(null);
  const [groupId, setGroupId] = useState('');
  const [message, setMessage] = useState('');
  const [groupMessages, setGroupMessages] = useState([]);

  useEffect(() => {
    async function init() {
      // Connect to local Ganache
      const web3Instance = new Web3('http://localhost:8545');
      setWeb3(web3Instance);

      // Load contract
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = GroupChatContract.networks[networkId];
      const instance = new web3Instance.eth.Contract(
        GroupChatContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      setGroupChat(instance);
    }
    init();
  }, []);

  const handleSendMessage = async () => {
    try {
      if (!web3 || !groupChat || !groupId || !message) {
        console.error('Web3, groupChat, groupId, or message is not initialized or empty.');
        return;
      }
  
      console.log('Sending message:', message);
      const accounts = await web3.eth.getAccounts();
      console.log('Sender account:', accounts[0]);
  
      await groupChat.methods.sendMessage(groupId, message).send({ from: accounts[0] });
      console.log('Message sent successfully.');
  
      setMessage(''); // Clear message input
      fetchGroupMessages(); // Fetch updated group messages
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  

  const fetchGroupMessages = async () => {
    if (!web3 || !groupChat) return;

    const messagesCount = await groupChat.methods.getGroupMessageCount(groupId).call();
    const messages = [];
    for (let i = 0; i < messagesCount; i++) {
      const message = await groupChat.methods.groupMessages(groupId, i).call();
      messages.push(message);
    }
    setGroupMessages(messages);
  };

  return (
    <div className="App">
      <h1>Group Chat dApp</h1>
      <input
        type="text"
        placeholder="Enter Group ID"
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
      />
      <br />
      <textarea
        rows="4"
        cols="50"
        placeholder="Enter Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <br />
      <button onClick={handleSendMessage}>Send Message</button>

      <div>
        <h2>Group Messages</h2>
        {groupMessages.map((msg, index) => (
          <div key={index}>
            <p>Sender: {msg.sender}</p>
            <p>Content: {msg.content}</p>
            <p>Timestamp: {new Date(msg.timestamp * 1000).toLocaleString()}</p>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
