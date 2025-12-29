import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { messageApi } from '../services/api';

interface Conversation {
  otherUser: {
    id: number;
    name: string;
    avatar?: string;
  };
  lastMessage: {
    id: number;
    content: string;
    createdAt: string;
    senderId: number;
  };
  messages: any[];
}

export function Messages() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/logowanie');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      console.log('Fetching conversations...');
      const response = await messageApi.getConversations();
      console.log('Conversations response:', response.data);
      setConversations(response.data);
    } catch (error: any) {
      console.error('Błąd pobierania konwersacji:', error);
      console.error('Error details:', error.response?.data);
      // Nie pokazuj błędu użytkownikowi - po prostu zostaw pustą listę
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 48) {
      return 'Wczoraj';
    } else {
      return date.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Wiadomości</h1>
          <p className="text-gray-600 mt-2">
            Twoje rozmowy ({conversations.length})
          </p>
        </div>

        {conversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Brak wiadomości
            </h2>
            <p className="text-gray-600 mb-6">
              Zacznij rozmawiać z kimś o produktach!
            </p>
            <Link to="/produkty">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
                Przeglądaj produkty
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => {
              const isLastMessageFromMe = conversation.lastMessage.senderId === user?.id;

              return (
                <Link
                  key={conversation.otherUser.id}
                  to={`/wiadomosci/${conversation.otherUser.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-4 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {conversation.otherUser.avatar ? (
                        <img
                          src={conversation.otherUser.avatar}
                          alt={conversation.otherUser.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {conversation.otherUser.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.otherUser.name}
                        </h3>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(conversation.lastMessage.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {isLastMessageFromMe && (
                          <span className="text-blue-600 font-medium">Ty: </span>
                        )}
                        {conversation.lastMessage.content}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <MessageCircle className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}