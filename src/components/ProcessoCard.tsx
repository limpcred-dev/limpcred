import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const statusColors = {
  'Em andamento': '#FCD34D',
  'Aguardando documentação': '#F87171',
  'Concluído': '#34D399',
};

interface ProcessoProps {
  processo: {
    id: string;
    titulo: string;
    status: string;
    dataAtualizacao: string;
    descricao: string;
  };
}

export default function ProcessoCard({ processo }: ProcessoProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.titulo}>{processo.titulo}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[processo.status] },
          ]}
        >
          <Text style={styles.statusText}>{processo.status}</Text>
        </View>
      </View>

      <Text style={styles.descricao}>{processo.descricao}</Text>
      
      <View style={styles.footer}>
        <Text style={styles.data}>
          Última atualização: {processo.dataAtualizacao}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  descricao: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  data: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});