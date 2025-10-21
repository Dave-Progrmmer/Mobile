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
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const data = await quizzesAPI.getAll();
      setQuizzes(data.quizzes);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setAnswers({});
    setModalVisible(true);
  };

  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    setAnswers({ ...answers, [questionIndex]: optionIndex });
  };

  const handleSubmit = async () => {
    if (!selectedQuiz) return;

    const questionCount = selectedQuiz.questions?.length || 0;
    if (Object.keys(answers).length < questionCount) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const result = await quizzesAPI.submitAnswer(selectedQuiz._id, answers);
      Alert.alert(
        'Quiz Submitted',
        `Your score: ${result.score || 0}/${questionCount}`,
        [{ text: 'OK', onPress: () => setModalVisible(false) }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
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
        <Text style={styles.quizTitle}>{item.title}</Text>
        <Text style={styles.quizDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.quizMeta}>
          <Text style={styles.quizMetaText}>
            {item.questions?.length || 0} questions
          </Text>
        </View>
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
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedQuiz?.title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                {selectedQuiz?.description}
              </Text>

              {selectedQuiz?.questions?.map((question: any, qIndex: number) => (
                <View key={qIndex} style={styles.questionCard}>
                  <Text style={styles.questionText}>
                    {qIndex + 1}. {question.question}
                  </Text>

                  {question.options?.map((option: string, oIndex: number) => (
                    <TouchableOpacity
                      key={oIndex}
                      style={[
                        styles.optionButton,
                        answers[qIndex] === oIndex && styles.optionSelected,
                      ]}
                      onPress={() => selectAnswer(qIndex, oIndex)}
                      disabled={submitting}
                    >
                      <View style={[
                        styles.radio,
                        answers[qIndex] === oIndex && styles.radioSelected,
                      ]}>
                        {answers[qIndex] === oIndex && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                      <Text style={[
                        styles.optionText,
                        answers[qIndex] === oIndex && styles.optionTextSelected,
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </Text>
              </TouchableOpacity>
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
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  quizDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  quizMeta: {
    flexDirection: 'row',
  },
  quizMetaText: {
    fontSize: 12,
    color: '#9ca3af',
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
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  questionCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    lineHeight: 22,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  optionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
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
    fontSize: 14,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});