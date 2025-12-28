<template>
  <div class="editor-container">
    <!-- Шапка с заголовком и статистикой -->
    <div class="card header-card">
      <div class="card-header">
        <h2 class="card-title">
          <span class="icon">🌐</span>
          Редактор локализации для WhatsApp бота
        </h2>
        <p class="card-description">
          Удобный инструмент для редактирования фраз. Поддержка WhatsApp форматирования: *жирный* и _курсив_
        </p>
      </div>
      <div class="card-content">
        <div class="stats-grid">
          <div class="stat-item">
            <label>Всего фраз</label>
            <div class="stat-value">{{ Object.keys(phrases).length }}</div>
          </div>
          <div class="stat-item">
            <label>Выбрана фраза</label>
            <div class="stat-value truncated">
              {{ activeKey || '-' }}
            </div>
          </div>
          <div class="stat-item">
            <label>Статус JSON</label>
            <span :class="['status-badge', isJsonValid ? 'status-valid' : 'status-error']">
              {{ isJsonValid ? '✓ Валиден' : '✗ Ошибка' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Основной редактор -->
    <div class="main-editor-grid">
      <!-- Левая панель - список фраз -->
      <div class="card phrases-card">
        <div class="card-header">
          <h3 class="card-title">Список фраз</h3>
          <p class="card-description">
            Выберите фразу для редактирования
          </p>
          <div class="search-container">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input
                  v-model="searchQuery"
                  placeholder="Поиск по ключу или тексту..."
                  class="search-input"
                  type="text"
              />
            </div>
          </div>
        </div>
        <div class="card-content scrollable">
          <div class="phrases-list">
            <div v-if="filteredPhrases.length === 0" class="no-phrases-message">
              <div class="message-icon">📋</div>
              <div class="message-title">Фраз не найдено</div>
              <div class="message-description">
                Вставьте исходный JSON в редактор ниже или добавьте новую фразу
              </div>
            </div>

            <template v-else>
              <div
                  v-for="(phrase, index) in filteredPhrases"
                  :key="phrase.key"
                  :class="[
              'phrase-item',
              activeKey === phrase.key ? 'phrase-item-active' : ''
            ]"
                  @click="selectPhrase(phrase.key)"
              >
                <!-- Добавляем номер -->
                <div class="phrase-header">
                  <span class="phrase-number">{{ index + 1 }}</span>
                  <button
                      class="copy-key-btn"
                      @click.stop="copyPhraseKey(phrase.key, $event)"
                      :title="`Копировать ключ: ${phrase.key}`"
                  >
                    <svg v-if="copiedKey !== phrase.key" class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <!-- Иконка галочки -->
                    <svg v-else class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                </div>

                <div class="phrase-key">{{ phrase.key }}</div>
                <div class="phrase-preview">
                  {{ truncateText(phrase.value) }}
                </div>
              </div>
            </template>
          </div>
        </div>

      </div>

      <!-- Центральная панель - редактор -->
      <div class="card editor-card">
        <CardHeader>
          <CardTitle>Редактор фразы</CardTitle>
          <CardDescription>
            {{ activeKey ? `Редактирование: ${activeKey}` : 'Выберите фразу для редактирования' }}
          </CardDescription>
        </CardHeader>
        <div class="card-content editor-content">
          <!-- Контекстное меню -->
          <div
              v-if="showContextMenu"
              ref="contextMenu"
              class="context-menu"
              :style="contextMenuStyle"
          >
            <div class="context-menu-item" @click="applyFormat('bold')">
              <span class="context-menu-icon">*</span>
              <span>Жирный текст</span>
              <span class="context-menu-hint">*текст*</span>
            </div>
            <div class="context-menu-item" @click="applyFormat('italic')">
              <span class="context-menu-icon">_</span>
              <span>Курсив</span>
              <span class="context-menu-hint">_текст_</span>
            </div>
            <div class="context-menu-divider"></div>
          </div>

          <!-- Поле редактирования -->
          <div v-if="activeKey" class="editor-section">
            <div class="field-group">
              <label for="text-editor" class="field-label">
                Текст фразы
                <span class="format-hint">
                  (правой кнопкой для форматирования)
                </span>
              </label>
              <textarea
                  id="text-editor"
                  ref="textEditor"
                  v-model="currentText"
                  :rows="getTextAreaRows()"
                  placeholder="Введите текст фразы..."
                  class="text-editor mono-font"
                  @input="handleTextChange"
                  @contextmenu.prevent="showTextContextMenu"
                  @click="hideContextMenu"
              ></textarea>

              <div class="formatting-tips">
                <div class="format-tip">
                  <span class="format-icon">*</span>
                  <span class="format-text">*жирный текст*</span>
                  <span class="format-description">— жирный в WhatsApp</span>
                </div>
                <div class="format-tip">
                  <span class="format-icon">_</span>
                  <span class="format-text">_курсивный текст_</span>
                  <span class="format-description">— курсив в WhatsApp</span>
                </div>
                <div class="format-tip">
                  <span class="format-icon">\n</span>
                  <span class="format-text">перенос строки</span>
                  <span class="format-description">— Enter в редакторе</span>
                </div>
              </div>

              <div class="field-hint">
                <div class="hint-text">
                  <span class="hint-icon">💡</span>
                  <span>Используйте Enter для переноса строки, правую кнопку мыши для форматирования</span>
                </div>
                <div class="char-count">Символов: {{ currentText.length }}</div>
              </div>
            </div>

            <!-- Предпросмотр с WhatsApp-стилем -->
            <div class="field-group">
              <label class="field-label">Предпросмотр (WhatsApp)</label>
              <div
                  class="preview-box whatsapp-preview"
                  v-html="currentPreview"
              ></div>
              <div class="whatsapp-preview-note">
                Как это будет выглядеть в WhatsApp
              </div>
              <p class="field-description">
                Здесь отображается, как будет выглядеть текст с WhatsApp-форматированием
              </p>
            </div>
          </div>

          <!-- Состояние при отсутствии выбранной фразы -->
          <div v-else class="empty-state">
            <div class="empty-icon">📝</div>
            <h4 class="empty-title">Фраза не выбрана</h4>
            <p class="empty-description">
              Выберите фразу из списка слева, чтобы начать редактирование
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Панель JSON -->
    <div class="card json-card">
      <div class="card-header">
        <div class="json-header-row">
          <h3 class="card-title">
            <span class="icon">{} </span>
            JSON редактор
          </h3>
          <div class="json-controls">
            <button
                class="btn btn-outline"
                @click="formatJson"
                :disabled="!isJsonValid"
            >
              <span class="btn-icon">🔧</span>
              Форматировать
            </button>
            <button
                class="btn btn-primary"
                @click="copyJson"
                :disabled="!isJsonValid"
                :class="{ 'btn-success': copySuccess }"
            >
              <span class="btn-icon" v-if="!copySuccess">📋</span>
              <span class="btn-icon" v-else>✅</span>
              {{ copySuccess ? 'Скопировано!' : 'Копировать JSON' }}
            </button>
          </div>
        </div>
        <p class="card-description">
          JSON обновляется автоматически при редактировании фраз. WhatsApp форматирование сохраняется.
        </p>
      </div>
      <div class="card-content">
        <!-- Статус JSON -->
        <div :class="['alert', isJsonValid ? 'alert-info' : 'alert-error']">
          {{ jsonStatusMessage }}
        </div>

        <!-- JSON редактор -->
        <div class="field-group">
          <label for="json-editor" class="field-label">JSON данные</label>
          <textarea
              id="json-editor"
              v-model="jsonText"
              :rows="12"
              placeholder='Введите JSON в формате { "ключ": "значение" }'
              class="json-editor mono-font"
              :class="{ 'json-error': !isJsonValid }"
              @input="handleJsonChange"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Быстрые действия -->
    <div class="card actions-card">
      <div class="card-content">
        <div class="actions-container">
          <button class="btn btn-outline" @click="addNewPhrase">
            <span class="btn-icon">➕</span>
            Добавить фразу
          </button>
          <button class="btn btn-outline" @click="resetToInitial" :disabled="isInitialData">
            <span class="btn-icon">↺</span>
            Сбросить
          </button>
          <button class="btn btn-outline" @click="exportJson" :disabled="!isJsonValid">
            <span class="btn-icon">📥</span>
            Экспорт JSON
          </button>
          <div class="auto-format-toggle">
            <label class="toggle-label">
              <input
                  type="checkbox"
                  v-model="autoFormat"
                  class="toggle-input"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-text">Автоформатирование</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, watch, onMounted, nextTick, onUnmounted} from 'vue'

// Props
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
    })
  }
})

// Реактивные данные
const phrases = ref({})
const activeKey = ref(null)
const searchQuery = ref('')
const jsonText = ref('')
const isJsonValid = ref(true)
const jsonStatusMessage = ref('JSON валиден')
const copySuccess = ref(false)
const autoFormat = ref(true)
const lastValidJson = ref('')

// Контекстное меню
const textEditor = ref(null)
const contextMenu = ref(null)
const showContextMenu = ref(false)
const contextMenuStyle = ref({})
const selectedText = ref({
  start: 0,
  end: 0,
  text: ''
})

onUnmounted(() => {
  if (copyTimeout.value) {
    clearTimeout(copyTimeout.value)
  }
})

// Вычисляемые свойства
const phrasesArray = computed(() => {
  return Object.entries(phrases.value).map(([key, value]) => ({
    key,
    value,
    text: value.replace(/\\n/g, '\n') // Простая замена для отображения
  }))
})

const filteredPhrases = computed(() => {
  if (!searchQuery.value.trim()) {
    return phrasesArray.value
  }

  const query = searchQuery.value.toLowerCase()
  return phrasesArray.value.filter(phrase =>
      phrase.key.toLowerCase().includes(query) ||
      phrase.value.toLowerCase().includes(query)
  )
})

const currentText = computed({
  get() {
    if (activeKey.value && phrases.value[activeKey.value]) {
      // Просто заменяем \n на переносы строк для textarea
      return phrases.value[activeKey.value].replace(/\\n/g, '\n')
    }
    return ''
  },
  set(value) {
    if (activeKey.value) {
      // Заменяем переносы строк на \n для хранения
      phrases.value[activeKey.value] = value.replace(/\n/g, '\\n')
      updateJsonText()
    }
  }
})

const currentPreview = computed(() => {
  return renderWhatsAppPreview(currentText.value) // currentText уже с переносами
})

const isInitialData = computed(() => {
  return JSON.stringify(phrases.value) === JSON.stringify(props.initialData)
})

const copiedKey = ref(null)
const copyTimeout = ref(null)

// Обновите метод copyPhraseKey:

// Методы
const truncateText = (text) => {
  if (!text) return ''
  const plainText = text.replace(/\\n/g, ' ')
  return plainText.length > 60
      ? plainText.substring(0, 60) + '...'
      : plainText
}

const selectPhrase = (key) => {
  activeKey.value = key
  hideContextMenu()
}

const getTextAreaRows = () => {
  const lines = currentText.value.split('\n').length
  return Math.min(Math.max(lines, 3), 10)
}

const updateJsonText = () => {
  try {
    // Создаем временный объект для JSON.stringify
    const tempPhrases = {}
    Object.entries(phrases.value).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Заменяем \n на специальный маркер
        tempPhrases[key] = value.replace(/\\n/g, '___NEWLINE___')
      } else {
        tempPhrases[key] = value
      }
    })

    // Создаем JSON
    let json = JSON.stringify(tempPhrases, null, autoFormat.value ? 2 : 0)

    // Восстанавливаем \n из маркера
    json = json.replace(/"___NEWLINE___"/g, '"\\n"')

    // Убираем двойные маркеры, если они есть
    json = json.replace(/___NEWLINE___/g, '\\n')

    jsonText.value = json
    lastValidJson.value = json
    isJsonValid.value = true
    jsonStatusMessage.value = `JSON валиден. Фраз: ${Object.keys(phrases.value).length}`
  } catch (error) {
    isJsonValid.value = false
    jsonStatusMessage.value = 'Ошибка в JSON'
  }
}

const escapeForJson = (value) => {
  if (typeof value !== 'string') return value

  // В value уже могут быть экранированные кавычки из редактора (когда пользователь ввел \")
  // JSON.stringify сам экранирует кавычки, поэтому нам нужно подготовить строку

  // 1. Сначала заменяем двойные обратные слеши на одиночные
  // 2. JSON.stringify сам позаботится об экранировании
  return value
      .replace(/\\\\/g, '\\') // Убираем двойные обратные слеши
      .replace(/\\n/g, '\n')  // Временно убираем \n
}

const handleTextChange = () => {
  // Дебаунсинг для производительности
  clearTimeout(window.textChangeTimeout)
  window.textChangeTimeout = setTimeout(updateJsonText, 100)
}

const handleJsonChange = () => {
  try {
    const reviver = (key, value) => {
      if (typeof value === 'string') {
        // Восстанавливаем \n из \\n
        return value.replace(/\\\\n/g, '\\n')
      }
      return value
    }

    const parsed = JSON.parse(jsonText.value, reviver)

    phrases.value = parsed
    isJsonValid.value = true
    jsonStatusMessage.value = `JSON валиден. Фраз: ${Object.keys(parsed).length}`

    if (activeKey.value && !parsed[activeKey.value]) {
      activeKey.value = Object.keys(parsed)[0] || null
    }
  } catch (error) {
    isJsonValid.value = false
    jsonStatusMessage.value = 'Ошибка парсинга JSON'
  }
}

const formatJson = () => {
  try {
    const parsed = JSON.parse(jsonText.value)
    jsonText.value = JSON.stringify(parsed, null, 2)
    isJsonValid.value = true
    jsonStatusMessage.value = 'JSON отформатирован'
  } catch (error) {
    // Если JSON невалиден, пытаемся восстановить из последнего валидного
    if (lastValidJson.value) {
      jsonText.value = lastValidJson.value
      handleJsonChange()
    }
  }
}

const copyJson = async () => {
  if (!isJsonValid.value) return

  try {
    await navigator.clipboard.writeText(jsonText.value)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea')
    textArea.value = jsonText.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)

    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}

const addNewPhrase = () => {
  let newKey = 'new_phrase'
  let counter = 1

  while (phrases.value[newKey]) {
    newKey = `new_phrase_${counter}`
    counter++
  }

  phrases.value[newKey] = ''
  activeKey.value = newKey
  updateJsonText()
  hideContextMenu()

  // Фокус на текстовое поле
  nextTick(() => {
    if (textEditor.value) {
      textEditor.value.focus()
    }
  })
}

const resetToInitial = () => {
  phrases.value = { ...props.initialData }
  activeKey.value = Object.keys(phrases.value)[0]
  updateJsonText()
  hideContextMenu()
}

const exportJson = () => {
  if (!isJsonValid.value) return

  const blob = new Blob([jsonText.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'whatsapp_localization.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Контекстное меню для форматирования
const showTextContextMenu = (event) => {
  if (!activeKey.value || !textEditor.value) return

  const textarea = textEditor.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  if (start === end) {
    // Нет выделенного текста
    return
  }

  selectedText.value = {
    start,
    end,
    text: currentText.value.substring(start, end)
  }

  // Получаем позицию выделенного текста
  const textBeforeSelection = currentText.value.substring(0, start)
  const linesBefore = textBeforeSelection.split('\n')
  const currentLine = linesBefore[linesBefore.length - 1]

  // Создаем скрытый элемент для измерения
  const measureSpan = document.createElement('span')
  measureSpan.style.position = 'absolute'
  measureSpan.style.visibility = 'hidden'
  measureSpan.style.whiteSpace = 'pre'
  measureSpan.style.font = window.getComputedStyle(textarea).font
  measureSpan.textContent = currentLine
  document.body.appendChild(measureSpan)

  const charWidth = measureSpan.offsetWidth / currentLine.length
  const selectionStartInLine = start - (textBeforeSelection.length - currentLine.length)
  const selectionWidth = charWidth * selectedText.value.text.length

  // Позиция начала выделения
  const rect = textarea.getBoundingClientRect()
  const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20

  // Вычисляем позицию для меню (под выделенным текстом)
  const menuX = rect.left + (selectionStartInLine * charWidth) + 10
  const menuY = rect.top + ((linesBefore.length) * lineHeight) + 5

  // Убеждаемся, что меню не выходит за границы экрана
  const menuWidth = 240
  const menuHeight = 120
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let finalX = menuX
  let finalY = menuY

  if (menuX + menuWidth > viewportWidth - 10) {
    finalX = viewportWidth - menuWidth - 10
  }
  if (finalX < 10) finalX = 10

  if (menuY + menuHeight > viewportHeight - 10) {
    // Если не помещается снизу, показываем сверху
    finalY = menuY - menuHeight - 5
  }
  if (finalY < 10) finalY = 10

  contextMenuStyle.value = {
    left: `${finalX}px`,
    top: `${finalY}px`,
    position: 'fixed',
    zIndex: '10000'
  }

  document.body.removeChild(measureSpan)
  showContextMenu.value = true

  // Закрываем меню при клике вне его
  document.addEventListener('click', hideContextMenuOnClickOutside)
  document.addEventListener('scroll', hideContextMenu)
}

const hideContextMenu = () => {
  showContextMenu.value = false
  document.removeEventListener('click', hideContextMenuOnClickOutside)
  document.removeEventListener('scroll', hideContextMenu)
}

const hideContextMenuOnClickOutside = (event) => {
  if (contextMenu.value && !contextMenu.value.contains(event.target)) {
    hideContextMenu()
  }
}

const applyFormat = (formatType) => {
  if (!selectedText.value.text || !textEditor.value) {
    hideContextMenu()
    return
  }

  const textarea = textEditor.value
  const { start, end, text } = selectedText.value
  let formattedText = text

  switch (formatType) {
    case 'bold':
      // Проверяем, не обернут ли уже текст в *
      if (text.startsWith('*') && text.endsWith('*')) {
        // Убираем форматирование
        formattedText = text.substring(1, text.length - 1)
      } else {
        // Добавляем форматирование
        formattedText = `*${text}*`
      }
      break

    case 'italic':
      // Проверяем, не обернут ли уже текст в _
      if (text.startsWith('_') && text.endsWith('_')) {
        // Убираем форматирование
        formattedText = text.substring(1, text.length - 1)
      } else {
        // Добавляем форматирование
        formattedText = `_${text}_`
      }
      break

    case 'escape':
      // Экранируем специальные символы WhatsApp
      formattedText = text
          .replace(/\*/g, '\\*')
          .replace(/_/g, '\\_')
          .replace(/~/g, '\\~')
          .replace(/```/g, '\\`\\`\\`')
          .replace(/`/g, '\\`')
      break
  }

  // Заменяем выделенный текст
  const newText = currentText.value.substring(0, start) +
      formattedText +
      currentText.value.substring(end)

  // Обновляем текст
  currentText.value = newText

  // Устанавливаем курсор после вставленного текста
  nextTick(() => {
    textarea.focus()
    const newPosition = start + formattedText.length
    textarea.setSelectionRange(newPosition, newPosition)

    // Прокручиваем к курсору
    textarea.scrollTop = textarea.scrollHeight
  })

  hideContextMenu()
}

const renderWhatsAppPreview = (text) => {
  if (!text) return ''

  let result = text

  // 1. Сначала обрабатываем все форматирование
  const processNestedFormatting = (str) => {
    const process = (text) => {
      const regex = /([*_]+)([^*_]+)\1/g
      let lastProcessed = text
      let processed = text

      do {
        lastProcessed = processed
        processed = processed.replace(regex, (fullMatch, markers, content) => {
          const trimmedContent = content.trim()

          // Если это просто число между звездочками - это жирное число
          if (markers === '*' && /^\d+$/.test(trimmedContent)) {
            return `<strong>${content}</strong>`
          }

          // Проверяем, не является ли это математическим выражением
          // Если это похоже на формулу (содержит * как оператор), оставляем как есть
          if (markers === '*' && isMathExpression(content)) {
            return fullMatch // возвращаем оригинал
          }

          const hasBold = markers.includes('*')
          const hasItalic = markers.includes('_')

          if (hasBold && hasItalic) {
            return `<em><strong>${content}</strong></em>`
          } else if (hasBold) {
            return `<strong>${content}</strong>`
          } else if (hasItalic) {
            return `<em>${content}</em>`
          }

          return fullMatch
        })
      } while (processed !== lastProcessed)

      return processed
    }

    return process(str)
  }

  // 2. Обрабатываем одиночное форматирование
  const processSingleFormatting = (str) => {
    let processed = str

    // Жирный текст
    processed = processed.replace(/\*([^*]+)\*/g, (match, content) => {
      if (match.includes('<') && match.includes('>')) {
        return match
      }

      const trimmed = content.trim()

      // Простые числа - делаем жирными
      if (/^\d+$/.test(trimmed)) {
        return `<strong>${content}</strong>`
      }

      // Если это похоже на формулу - не форматируем
      if (isMathExpression(content)) {
        return match
      }

      return `<strong>${content}</strong>`
    })

    // Курсив
    processed = processed.replace(/_([^_]+)_/g, (match, content) => {
      if (match.includes('<') && match.includes('>')) {
        return match
      }

      // Не форматируем формулы курсивом
      if (isMathExpression(content)) {
        return match
      }

      return `<em>${content}</em>`
    })

    return processed
  }

  // 3. Основная обработка
  // Сначала вложенное форматирование
  result = processNestedFormatting(result)
  // Потом одиночное
  result = processSingleFormatting(result)

  // 4. Особый случай: формулы без пробелов (типа 2*2+2*2)
  // Нужно еще раз пройтись и проверить, не пропустили ли мы формулы
  const finalCheck = (str) => {
    // Ищем паттерны типа число*число, которые могли остаться незащищенными
    const formulaRegex = /(\d[\d\s]*\*[\d\s\.]+\d[\d\s]*)(?![^<]*>)/g

    return str.replace(formulaRegex, (match) => {
      // Если это похоже на формулу и не внутри тегов форматирования
      if (isMathExpression(match) && !match.includes('<strong>') && !match.includes('<em>')) {
        return match // оставляем как есть
      }
      return match
    })
  }

  result = finalCheck(result)

  // 5. Обрабатываем переносы строк
  result = result.replace(/\n/g, '<br>')

  // 6. Обрабатываем разделители
  result = result.replace(/-{4,}/g,
      '<div style="border-top: 1px solid #ccc; margin: 10px 0; opacity: 0.5;"></div>')

  return result
}

// Улучшенная проверка математического выражения
const isMathExpression = (text) => {
  const trimmed = text.trim()

  if (!trimmed) return false

  // Простые числа - НЕ формулы
  if (/^\d+$/.test(trimmed)) {
    return false
  }

  // Если содержит оператор умножения/деления в контексте цифр
  // Проверяем паттерны типа: цифра*цифра, цифра * цифра и т.д.
  const hasNumbers = /\d/.test(trimmed)
  const hasMathOperators = /[\*\/\+\-]/.test(trimmed)
  const hasLetters = /[а-яА-Яa-zA-Z]/.test(trimmed)

  // Если есть буквы - это не формула
  if (hasLetters) return false

  if (hasNumbers && hasMathOperators) {
    // Проверяем, что это действительно формула, а не форматирование
    const parts = trimmed.split(/[\+\-\*\/]/)
    const validParts = parts.filter(part => {
      const p = part.trim()
      return p !== '' && /^[\d\s\.\,]+$/.test(p)
    })

    // Должно быть минимум 2 числовых части
    if (validParts.length >= 2) {
      // Дополнительная проверка для звездочек
      if (trimmed.includes('*')) {
        // Проверяем контекст звездочек
        const starMatch = trimmed.match(/\*/g)
        if (starMatch && starMatch.length > 0) {
          // Для каждого * проверяем, что слева и справа цифры/пробелы
          const positions = []
          let pos = trimmed.indexOf('*')
          while (pos !== -1) {
            const before = trimmed.substring(0, pos).trim()
            const after = trimmed.substring(pos + 1).trim()

            // * должен быть между цифрами или числами
            const isValidPosition =
                (before.length > 0 && /\d$/.test(before) || before.endsWith(')')) &&
                (after.length > 0 && /^\d/.test(after) || after.startsWith('('))

            positions.push(isValidPosition)
            pos = trimmed.indexOf('*', pos + 1)
          }

          // Если хотя бы один * находится в математическом контексте - это формула
          return positions.some(p => p === true)
        }
      }
      return true
    }
  }

  return false
}

const copyPhraseKey = async (key, event) => {
  // Очищаем предыдущий таймаут
  if (copyTimeout.value) {
    clearTimeout(copyTimeout.value)
  }

  try {
    await navigator.clipboard.writeText(key)

    // Устанавливаем текущий скопированный ключ
    copiedKey.value = key

    // Сбрасываем через 3 секунды
    copyTimeout.value = setTimeout(() => {
      copiedKey.value = null
    }, 3000)

  } catch (err) {
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea')
    textArea.value = key
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)

    // Все равно показываем галочку
    copiedKey.value = key
    copyTimeout.value = setTimeout(() => {
      copiedKey.value = null
    }, 3000)
  }

  // Останавливаем всплытие события
  event.stopPropagation()
}




// Инициализация
onMounted(() => {
  phrases.value = { ...props.initialData }
  activeKey.value = Object.keys(phrases.value)[0]
  updateJsonText()

  // Закрываем контекстное меню при нажатии Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideContextMenu()
    }
  })
})

// Следим за изменениями в phrases и автоматически обновляем JSON
watch(
    () => phrases.value,
    () => {
      updateJsonText()
    },
    { deep: true }
)

// Автоформатирование при изменении флага
watch(autoFormat, (newVal) => {
  if (newVal && isJsonValid.value) {
    formatJson()
  }
})
</script>

<style scoped>
/* Основные стили */
.editor-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Карточки */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  overflow: hidden;
}

.card-header {
  padding: 24px 24px 0;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-description {
  color: #666;
  font-size: 14px;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.card-content {
  padding: 24px;
}

.header-card {
  background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
  color: white;
}

.header-card .card-title,
.header-card .card-description {
  color: white;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-item label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: white;
}

.truncated {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-valid {
  background: rgba(34, 197, 94, 0.2);
  color: #000000;
}

.status-error {
  background: rgba(239, 68, 68, 0.2);
  color: #000000;
}

/* Основной редактор */
.main-editor-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 24px;
}

@media (max-width: 1200px) {
  .main-editor-grid {
    grid-template-columns: 1fr;
  }
}

/* Контекстное меню */
.context-menu {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px;
  min-width: 240px;
  z-index: 10000;
  border: 1px solid #e5e7eb;
}

.context-menu-item {
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 6px;
  transition: background-color 0.2s;
  font-size: 14px;
}

.context-menu-item:hover {
  background-color: #f3f4f6;
}

.context-menu-icon {
  font-weight: bold;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.context-menu-hint {
  margin-left: auto;
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
}

.context-menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 6px 0;
}

.format-hint {
  font-size: 12px;
  font-weight: normal;
  color: #6b7280;
  margin-left: 8px;
}

.formatting-tips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 12px 0;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.format-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.format-icon {
  font-weight: bold;
  font-size: 14px;
  color: #667eea;
}

.format-text {
  font-family: monospace;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
}

.format-description {
  color: #6b7280;
  font-size: 12px;
}

/* Поиск */
.search-container {
  margin-top: 12px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #999;
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #25D366;
}

/* Список фраз */
.scrollable {
  padding: 0 !important;
  max-height: 500px;
  overflow-y: auto;
}

.phrases-list {
  padding: 8px;
}

.phrase-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}

.phrase-item:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
  transform: translateX(4px);
}

.phrase-item-active {
  background: #25D366 !important;
  border-color: #25D366 !important;
  color: white;
}

.phrase-key {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.phrase-preview {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.phrase-item-active .phrase-preview {
  color: rgba(255, 255, 255, 0.9);
}

/* Редактор */
.editor-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field-group {
  display: flex;
  flex-direction: column;
  position: relative;
}

.field-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.text-editor,
.json-editor {
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.2s;
}

.text-editor:focus,
.json-editor:focus {
  outline: none;
  border-color: #25D366;
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
}

.json-error {
  border-color: #ef4444;
}

.mono-font {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 13px;
}

.field-hint {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  color: #6b7280;
  font-size: 12px;
}

.hint-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hint-icon {
  font-size: 14px;
}

.char-count {
  font-weight: 500;
}

.preview-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  min-height: 80px;
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 14px;
  position: relative;
}

.whatsapp-preview {
  background: #e5f7ed;
  border-color: #25D366;
}

.whatsapp-preview-note {
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 11px;
  color: #128C7E;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
}

.field-description {
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
}

/* Пустое состояние */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #9ca3af;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #6b7280;
}

/* JSON панель */
.json-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.json-controls {
  display: flex;
  gap: 8px;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.alert-info {
  background: #dbeafe;
  color: #1e40af;
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
}

/* Кнопки */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: #25D366;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #128C7E;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-success {
  background: #10b981 !important;
}

.btn-success:hover {
  background: #059669 !important;
}

.btn-icon {
  font-size: 16px;
}

/* Действия */
.actions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.auto-format-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.toggle-label {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  border-radius: 24px;
  transition: .4s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

.toggle-input:checked + .toggle-slider {
  background-color: #25D366;
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.toggle-text {
  font-size: 14px;
  color: #374151;
}

/* Анимации */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.btn-success {
  animation: pulse 2s ease-in-out;
}

.whatsapp-preview strong {
  font-weight: bold;
  color: #1a1a1a;
}

.whatsapp-preview em {
  font-style: italic;
  color: #1a1a1a;
}

.no-phrases-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  color: #6b7280;
  padding: 20px;
}

.message-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.message-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.message-description {
  font-size: 14px;
  line-height: 1.5;
  max-width: 300px;
}


.phrase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.phrase-number {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 28px;
  text-align: center;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

.copy-key-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #9ca3af;
}

.copy-key-btn:hover {
  background: #f3f4f6;
  color: #6b7280;
  transform: translateY(-1px);
}

.copy-key-btn:active {
  transform: translateY(0);
}

.copy-icon, .check-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.check-icon {
  stroke: #10b981;
}

.phrase-item-active .phrase-number {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.phrase-item-active .copy-key-btn {
  color: rgba(255, 255, 255, 0.7);
}

.phrase-item-active .copy-key-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.phrase-item-active .check-icon {
  stroke: #a7f3d0;
}

/* Анимация для галочки */
@keyframes checkmark {
  0% {
    stroke-dasharray: 0, 100;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 100, 0;
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dasharray: 100, 0;
    stroke-dashoffset: 0;
  }
}

.check-icon polyline {
  animation: checkmark 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  stroke-dasharray: 100, 100;
  stroke-dashoffset: 100;
}

/* Анимация для копирования */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

.copy-key-btn:active svg {
  animation: pulse 0.3s ease;
}
</style>