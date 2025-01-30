import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, MessageSquare, AlertCircle } from 'lucide-react-native';

const tipoIcons = {
  processo: AlertCircle,
  suporte: MessageSquare,
  sistema: Bell
};

interface NotificacaoItemProps {
  notificacao: {
    id: string;
    titulo: string;
    mensagem: string;
    tipo: keyof typeof tipoIcons;
    lida: boolean;
    dataCriacao: Date;
  };
  onPress: () => void;
}

export default function NotificacaoItem({ notificacao, onPress }: NotificacaoItemProps) {
  const Icon = tipoIcons[notificacao.tipo];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notificacao.lida && styles.naoLida
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Icon size={24} color="#1E40AF" />
      </View>
      <View style={styles.conteudo}>
        <Text style={styles.titulo}>{notificacao.titulo}</Text>
        <Text style={styles.mensagem} numberOfLines={2}>
          {notificacao.mensagem}
        </Text>
        <Text style={styles.data}>
          {new Date(notificacao.dataCriacao).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  naoLida: {
    backgroundColor: '#EFF6FF',
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  conteudo: {
    flex: 1,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  mensagem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  data: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});