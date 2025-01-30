import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import ProcessoCard from '../components/ProcessoCard';
import { useAuth } from '../hooks/useAuth';
import { fetchProcessosCliente } from '../services/processos';

export default function ProcessosScreen() {
  const [processos, setProcessos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const loadProcessos = async () => {
    try {
      const data = await fetchProcessosCliente(user.uid);
      setProcessos(data);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProcessos();
    setRefreshing(false);
  };

  useEffect(() => {
    loadProcessos();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={processos}
        renderItem={({ item }) => <ProcessoCard processo={item} />}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhum processo encontrado
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});