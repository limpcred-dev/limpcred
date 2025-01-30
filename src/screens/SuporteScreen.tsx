import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { enviarMensagemSuporte } from '../services/suporte';

export default function SuporteScreen() {
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const { user } = useAuth();

  const handleEnviar = async () => {
    if (!assunto.trim() || !mensagem.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      await enviarMensagemSuporte({
        userId: user.uid,
        assunto,
        mensagem,
        dataCriacao: new Date(),
      });

      Alert.alert(
        'Sucesso',
        'Sua mensagem foi enviada com sucesso! Em breve entraremos em contato.',
      );
      setAssunto('');
      setMensagem('');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar sua mensagem. Tente novamente.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Suporte ao Cliente</Text>
        <Text style={styles.description}>
          Envie suas dúvidas ou solicitações. Nossa equipe responderá o mais breve possível.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Assunto"
          value={assunto}
          onChangeText={setAssunto}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Digite sua mensagem..."
          value={mensagem}
          onChangeText={setMensagem}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.button} onPress={handleEnviar}>
          <Text style={styles.buttonText}>Enviar Mensagem</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 120,
  },
  button: {
    backgroundColor: '#1E40AF',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});