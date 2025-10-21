// app/quizzes.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { quizzesAPI } from '../../services/api';

export default function QuizzesScreen() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const data = await quizzesAPI.getAll();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setSelectedAnswer(null);
    setResult(null);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!selectedQuiz || selectedAnswer === null) {
      Alert.alert('Error', 'Please select an answer');
      return;
    }

    setSubmitting(true);
    try {
      const response = await quizzesAPI.submitAnswer(selectedQuiz._id, selectedAnswer);
      setResult(response);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedQuiz(null);
    setSelectedAnswer(null);
    setResult(null);
  };

  const renderQuiz = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.quizCard}
      onPress={() => openQuiz(item)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="school" size={32} color="#6366f1" />
      </View>
      <View style={styles.quizContent}>
        <Text style={styles.quizQuestion}>{item.question}</Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Bible Quizzes' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Bible Quizzes' }} />
      <View style={styles.container}>
        <FlatList
          data={quizzes}
          renderItem={renderQuiz}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadQuizzes} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>No quizzes available</Text>
            </View>
          }
        />

        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bible Quiz</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={28} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedQuiz && (
                <View style={styles.questionCard}>
                  <Text style={styles.questionText}>{selectedQuiz.question}</Text>

                  {selectedQuiz.options?.map((option: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        selectedAnswer === index && styles.optionSelected,
                        result && result.correctIndex === index && styles.optionCorrect,
                        result && selectedAnswer === index && !result.isCorrect && styles.optionWrong,
                      ]}
                      onPress={() => !result && setSelectedAnswer(index)}
                      disabled={!!result || submitting}
                    >
                      <View style={[
                        styles.radio,
                        selectedAnswer === index && styles.radioSelected,
                      ]}>
                        {selectedAnswer === index && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                      <Text style={[
                        styles.optionText,
                        selectedAnswer === index && styles.optionTextSelected,
                      ]}>
                        {option}
                      </Text>
                      {result && result.correctIndex === index && (
                        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                      )}
                    </TouchableOpacity>
                  ))}

                  {result && (
                    <View style={[styles.resultCard, result.isCorrect ? styles.correctCard : styles.wrongCard]}>
                      <View style={styles.resultHeader}>
                        <Ionicons 
                          name={result.isCorrect ? 'checkmark-circle' : 'close-circle'} 
                          size={32} 
                          color={result.isCorrect ? '#10b981' : '#ef4444'} 
                        />
                        <Text style={[styles.resultText, { color: result.isCorrect ? '#10b981' : '#ef4444' }]}>
                          {result.isCorrect ? 'Correct!' : 'Incorrect'}
                        </Text>
                      </View>
                      {result.explanation && (
                        <Text style={styles.explanationText}>{result.explanation}</Text>
                      )}
                      <Text style={styles.correctAnswerText}>
                        Correct Answer: {result.correctAnswer}
                      </Text>
                    </View>
                  )}

                  {!result && (
                    <TouchableOpacity
                      style={[styles.submitButton, (submitting || selectedAnswer === null) && styles.buttonDisabled]}
                      onPress={handleSubmit}
                      disabled={submitting || selectedAnswer === null}
                    >
                      <Text style={styles.submitButtonText}>
                        {submitting ? 'Submitting...' : 'Submit Answer'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {result && (
                    <TouchableOpacity
                      style={styles.nextButton}
                      onPress={closeModal}
                    >
                      <Text style={styles.nextButtonText}>Close</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quizContent: {
    flex: 1,
  },
  quizQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#6366f1',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
    lineHeight: 26,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  optionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  optionCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
  },
  optionWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#6366f1',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
  resultCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
  },
  correctCard: {
    backgroundColor: '#d1fae5',
  },
  wrongCard: {
    backgroundColor: '#fee2e2',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  explanationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 10,
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  nextButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});