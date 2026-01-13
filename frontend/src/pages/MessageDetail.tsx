import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Send, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { messageApi } from '../services/api';

interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  sender: {
    id: number;
    name: string;
    avatar?: string;
  };
  receiver: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export function MessageDetail() {
  const { otherUserId } = useParams<{ otherUserId: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/logowanie');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user && otherUserId) {
      fetchMessages();
    }
  }, [user, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await messageApi.getMessages(parseInt(otherUserId!));
      setMessages(response.data);
      
      if (response.data.length > 0) {
        const firstMessage = response.data[0];
        setOtherUser(
          firstMessage.senderId === user?.id 
            ? firstMessage.receiver 
            : firstMessage.sender
        );
      } else {
        try {
          const userResponse = await fetch(`http://localhost:3000/api/users/${otherUserId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setOtherUser(userData);
          }
        } catch (err) {
          console.error('Błąd pobierania użytkownika:', err);
          setOtherUser({
            id: parseInt(otherUserId!),
            name: 'Użytkownik',
            avatar: null,
          });
        }
      }
    } catch (error) {
      console.error('Błąd pobierania wiadomości:', error);
      setOtherUser({
        id: parseInt(otherUserId!),
        name: 'Użytkownik',
        avatar: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await messageApi.sendMessage({
        receiverId: parseInt(otherUserId!),
        content: newMessage.trim(),
      });

      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Błąd wysyłania wiadomości:', error);
      alert('Nie udało się wysłać wiadomości');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Link to="/wiadomosci">
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            
            {otherUser && (
              <>
                <div className="flex-shrink-0">
                  {otherUser.avatar ? (
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {otherUser.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{otherUser.name}</h2>
                  <p className="text-sm text-gray-500">Aktywny</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-600">
                Brak wiadomości. Napisz coś aby rozpocząć rozmowę!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const isMyMessage = message.senderId === user?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-2xl ${
                        isMyMessage
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-900 shadow-sm rounded-bl-none'
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      <div
                        className={`flex items-center gap-1 mt-1 text-xs ${
                          isMyMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-t shadow-lg sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Napisz wiadomość..."
              disabled={sending}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}