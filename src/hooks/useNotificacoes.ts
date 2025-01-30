import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { salvarTokenNotificacao, buscarNotificacoes } from '../services/notificacoes';
import { useAuth } from './useAuth';

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const carregarNotificacoes = async () => {
      try {
        const dados = await buscarNotificacoes(user.uid);
        setNotificacoes(dados);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarNotificacoes();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const configurarNotificacoes = async () => {
      try {
        const messaging = getMessaging();
        const token = await getToken(messaging);
        await salvarTokenNotificacao(user.uid, token);

        const unsubscribe = onMessage(messaging, (mensagem) => {
          Alert.alert(
            mensagem.notification?.title || 'Nova Notificação',
            mensagem.notification?.body
          );
          
          // Atualiza a lista de notificações
          carregarNotificacoes();
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Erro ao configurar notificações:', error);
      }
    };

    if (Platform.OS !== 'web') {
      configurarNotificacoes();
    }
  }, [user]);

  return {
    notificacoes,
    carregando
  };
}