import { useState } from 'react';
import { FiSearch, FiEdit2 } from 'react-icons/fi';
import './Messages.scss';

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  const conversations = [
    {
      id: 1,
      user: {
        name: 'Marie Martin',
        avatar: '/avatars/marie.jpg'
      },
      lastMessage: 'Bonjour, j\'ai une question concernant le devoir...',
      timestamp: '10:30',
      unread: true
    },
    // Ajoutez plus de conversations ici
  ];

  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="conversations-list">
          <div className="conversations-header">
            <div className="search-bar">
              <FiSearch className="icon" />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="conversations">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${
                  selectedConversation === conversation.id ? 'active' : ''
                } ${conversation.unread ? 'unread' : ''}`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <img
                  src={conversation.user.avatar}
                  alt={conversation.user.name}
                  className="avatar"
                />
                <div className="conversation-content">
                  <div className="conversation-header">
                    <h3>{conversation.user.name}</h3>
                    <span className="time">{conversation.timestamp}</span>
                  </div>
                  <p className="last-message">{conversation.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-container">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="user-info">
                  <img
                    src={conversations[0].user.avatar}
                    alt={conversations[0].user.name}
                    className="avatar"
                  />
                  <h3>{conversations[0].user.name}</h3>
                </div>
              </div>

              <div className="chat-messages">
                {/* Les messages seront affichés ici */}
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Écrivez votre message..."
                />
                <button className="btn btn-primary">Envoyer</button>
              </div>
            </>
          ) : (
            <div className="no-conversation">
              <FiEdit2 className="icon" />
              <h2>Sélectionnez une conversation</h2>
              <p>Choisissez une conversation dans la liste pour commencer à discuter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
