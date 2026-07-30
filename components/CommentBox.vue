<template>
  <section class="comment-section" aria-labelledby="comment-section-title">
    <div class="comment-card">
      <!-- Section Header with Gallery Context -->
      <header class="comment-header">
        <div class="comment-badge">
          <i class="pi pi-comments" aria-hidden="true" />
          <span>STREFA OPINII</span>
        </div>
        <h2 id="comment-section-title" class="comment-title">Zostaw komentarz</h2>
        <p class="comment-subtitle">
          Podziel się swoją opinią o zdjęciach z galerii
          <span class="active-context-tag">«{{ activeCategoryLabel }}»</span>
        </p>
      </header>

      <!-- Form -->
      <form class="comment-form" @submit.prevent="handleSend">
        <!-- Input 1: Name -->
        <div class="form-group">
          <label for="comment-username" class="form-label">
            Twoje Imię <span class="required-star">*</span>
          </label>
          <div class="input-wrapper">
            <i class="pi pi-user input-icon" aria-hidden="true" />
            <input
              id="comment-username"
              v-model.trim="username"
              type="text"
              class="form-input"
              placeholder="np. Anna Kowalska"
              required
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <!-- Input 2: Comment Text -->
        <div class="form-group">
          <label for="comment-body" class="form-label">
            Treść komentarza <span class="required-star">*</span>
          </label>
          <div class="input-wrapper">
            <i class="pi pi-pencil input-icon input-icon--top" aria-hidden="true" />
            <textarea
              id="comment-body"
              v-model.trim="commentText"
              class="form-textarea"
              rows="4"
              placeholder="Napisz, co sądzisz o zaprezentowanych kadrach..."
              required
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary submit-btn"
            :disabled="isSubmitting || !commentText"
          >
            <i v-if="isSubmitting" class="pi pi-spin pi-spinner" aria-hidden="true" />
            <i v-else class="pi pi-send" aria-hidden="true" />
            <span>{{ isSubmitting ? 'Wysyłanie...' : 'Wyślij komentarz' }}</span>
          </button>
        </div>
      </form>

      <!-- Success Notification Toast/Alert -->
      <Transition name="fade">
        <div v-if="feedbackMessage" :class="['feedback-toast', `feedback-toast--${feedbackType}`]" role="alert">
          <i :class="['pi', feedbackType === 'success' ? 'pi-check-circle' : 'pi-exclamation-circle']" aria-hidden="true" />
          <span>{{ feedbackMessage }}</span>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { photoStore } from '../stores/photos'
import { db } from '../firebaseInitializer'
import { collection, addDoc } from 'firebase/firestore'

const store = photoStore()
const username = ref('')
const commentText = ref('')
const isSubmitting = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')

const activeCategoryLabel = computed(() => store.activeCategoryLabel)

async function handleSend() {
  if (!commentText.value) {
    showFeedback('Proszę wprowadzić treść komentarza.', 'error')
    return
  }

  isSubmitting.value = true
  feedbackMessage.value = ''

  try {
    const payload = {
      username: username.value || 'Anonim',
      comment: commentText.value,
      category: store.category,
      date: new Date()
    }

    const docRef = await addDoc(collection(db, 'comments'), payload)
    if (docRef && docRef.id) {
      showFeedback('Dziękujemy! Twój komentarz został pomyślnie dodany.', 'success')
      username.value = ''
      commentText.value = ''
    } else {
      showFeedback('Nie udało się wysłać komentarza. Spróbuj ponownie.', 'error')
    }
  } catch (err) {
    console.error('[CommentBox] Error adding comment:', err)
    showFeedback('Wystąpił błąd podczas wysyłania komentarza.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

function showFeedback(msg, type = 'success') {
  feedbackMessage.value = msg
  feedbackType.value = type
  setTimeout(() => {
    feedbackMessage.value = ''
  }, 4500)
}
</script>

<style scoped>
.comment-section {
  max-width: 1280px;
  margin: 40px auto 60px auto;
  padding: 0 24px;
}

.comment-card {
  background: var(--bg-surface, #121218);
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 20px;
  padding: 36px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.1);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-brand, #8B5CF6);
  background: rgba(139, 92, 246, 0.12);
  padding: 4px 12px;
  border-radius: 9999px;
  align-self: flex-start;
}

.comment-title {
  font-family: var(--font-serif, Georgia, serif);
  font-size: 1.75rem;
  font-weight: 600;
  color: #FFFFFF;
}

.comment-subtitle {
  color: var(--text-secondary, #A0A0B2);
  font-size: 0.9375rem;
}

.active-context-tag {
  color: var(--text-brand, #A78BFA);
  font-weight: 600;
}

/* Form inputs & static labels */
.comment-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #F3F3F6);
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-star {
  color: var(--color-brand, #8B5CF6);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted, #6E6E82);
  font-size: 1rem;
  pointer-events: none;
}

.input-icon--top {
  top: 14px;
}

.form-input, .form-textarea {
  width: 100%;
  background: #181824;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 12px 14px 12px 42px;
  color: #FFFFFF;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--color-brand, #8B5CF6);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.35);
  background: #1D1D2C;
}

.form-textarea {
  resize: vertical;
  min-height: 110px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.submit-btn {
  padding: 12px 28px;
}

/* Feedback Toast */
.feedback-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 500;
}

.feedback-toast--success {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34D399;
}

.feedback-toast--error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #F87171;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .comment-card {
    padding: 24px 20px;
  }
}
</style>
