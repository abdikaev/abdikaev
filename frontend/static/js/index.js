// Mobile Menu Class
class MobileMenu {
  constructor({ containerId, backdropId, buttonId, menuItems, isAuthenticated = false }) {
    this.elements = {
      container: document.getElementById(containerId),
      backdrop: document.getElementById(backdropId),
      button: document.getElementById(buttonId),
    };
    this.menuItems = menuItems;
    this.isAuthenticated = isAuthenticated;
    this.isOpen = false;
    this.init();
  }

  // Initialize menu
  init() {
    this.render();
    this.bindEvents();
  }

  // Render menu items
  render() {
    this.elements.container.innerHTML = `
      ${this.menuItems
        .map(item => `<a href="${item.href}">${item.label}</a>`)
        .join('')}
      <div class="auth-buttons">
        ${
          this.isAuthenticated
            ? `<a href="#profile"><img src="img/avatar-placeholder.png" alt="User Avatar" class="avatar" title="Перейти в профиль" loading="lazy"></a>`
            : `
              <a href="login.html" class="btn-secondary">Войти</a>
              <a href="role-selection.html" class="btn-primary">Регистрация</a>
            `
        }
      </div>
    `;
  }

  // Toggle menu visibility
  toggle(isOpen) {
    this.isOpen = isOpen;
    this.elements.container.classList.toggle('show', isOpen);
    this.elements.backdrop.classList.toggle('show', isOpen);
    this.elements.button.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
  }

  // Bind event listeners
  bindEvents() {
    this.elements.button.addEventListener('click', () => {
      this.toggle(!this.isOpen);
    });
    this.elements.backdrop.addEventListener('click', () => this.toggle(false));
  }
}

// Chat Service Class
class ChatService {
  // Send message to API
  async sendMessage(message) {
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error('API error');
      return await response.json();
    } catch (error) {
      console.warn('Using mock service:', error);
      return await this.mockSendMessage(message);
    }
  }

  // Mock API response for fallback
  async mockSendMessage(message) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const responses = {
      'математика|алгебра|геометрия': 'Ищу отзывы о курсах по математике! Хотите продолжить курс или найти новый? Есть курсы по ЕГЭ и углубленной алгебре.',
      'английский|english': 'Английский: от разговорных курсов до IELTS. Хотите оставить отзыв или продолжить обучение?',
      'программирование|python|javascript': 'Курсы по программированию: Python, JS и др. Хотите углубиться или попробовать новый курс?',
      'курс|новый курс|создать курс': 'Перейдите в раздел "Создать курс" и заполните форму или уточните предмет для рекомендаций (например, физика, Data Science).',
      'сообщения|студенты': 'Выберите студента в разделе "Сообщения" для общения.',
      'профиль|аккаунт': 'Нажмите на аватар в правом верхнем углу или перейдите в профиль через меню.',
      'контакты|связаться': 'Контакты: support@edumentor.ru, +7 (495) 123-45-67, Москва, ул. Лермонтова, 15.',
      'оценить|отзыв': 'Назови курс, чтобы оставить отзыв!',
      'цена|стоимость': 'Стоимость курса зависит от его настроек. Укажите предмет или детали в форме создания.',
      'привет|здравствуйте': 'Здравствуйте! Чем могу помочь с вашими курсами или поиском нового?',
      '': 'Пожалуйста, уточните ваш запрос, например, "создать курс" или "найти курс по математике".',
    };
    const key = Object.keys(responses).find(k => new RegExp(k, 'i').test(message.trim()));
    return { success: true, message: responses[key] || responses[''] };
  }
}

// Chat Assistant Class
class ChatAssistant {
  constructor() {
    this.elements = {
      assistantBtn: document.getElementById('assistant-button'),
      modal: document.getElementById('assistant-modal'),
    };
    this.state = {
      isOpen: false,
      messages: [
        {
          content: 'Здравствуйте! Я ваш ассистент. Помогу с курсами и студентами. Задайте вопрос!',
          isUser: false,
        },
      ],
      input: '',
      isTyping: false,
    };
    this.chatService = new ChatService();
    this.init();
  }

  // Initialize chat assistant
  init() {
    this.render();
    this.bindEvents();
  }

  // Render chat assistant content
  render() {
    this.elements.modal.innerHTML = `
      <div class="assistant-header">
        <span>Ассистент EduPath</span>
        <button id="assistant-close-btn" aria-label="Закрыть">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="chat-container">
        ${this.state.messages
          .map(
            (msg, idx) =>
              `<div class="message ${msg.isUser ? 'user-message' : 'bot-message'}" key="${idx}">${
                msg.content
              }</div>`
          )
          .join('')}
        ${this.state.isTyping ? `<div class="message bot-message">Думаю…</div>` : ''}
      </div>
      <div class="chat-input-container">
        <input id="chat-input" class="chat-input" type="text" placeholder="Задайте вопрос..." aria-label="Сообщение" value="${
          this.state.input
        }">
        <button id="send-button" class="send-button" aria-label="Отправить" ${
          !this.state.input.trim() ? 'disabled' : ''
        }>Отправить</button>
      </div>
    `;
    this.elements.modal.classList.toggle('show', this.state.isOpen);
    this.elements.input = this.elements.modal.querySelector('#chat-input');
    this.elements.sendBtn = this.elements.modal.querySelector('#send-button');
    this.elements.chatContainer = this.elements.modal.querySelector('.chat-container');
    if (this.elements.chatContainer) {
      this.elements.chatContainer.scrollTop = this.elements.chatContainer.scrollHeight;
    }
  }

  // Handle sending a message
  async handleSend() {
    if (!this.state.input.trim()) return;
    this.state.messages = [...this.state.messages, { content: this.state.input, isUser: true }];
    this.state.input = '';
    this.state.isTyping = true;
    this.render();
    const { message } = await this.chatService.sendMessage(this.state.messages.at(-1).content);
    this.state.isTyping = false;
    this.state.messages = [...this.state.messages, { content: message, isUser: false }];
    this.render();
  }

  // Update input value without re-rendering
  updateInput(value) {
    this.state.input = value;
    if (this.elements.sendBtn) {
      this.elements.sendBtn.disabled = !value.trim();
    }
  }

  // Debounce input events
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Bind event listeners
  bindEvents() {
    this.elements.assistantBtn.addEventListener('click', () => {
      this.state.isOpen = !this.state.isOpen;
      this.render();
    });
    this.elements.modal.addEventListener('click', e => {
      if (e.target.id === 'assistant-close-btn') {
        this.state.isOpen = false;
        this.render();
      }
      if (e.target.id === 'send-button') {
        this.handleSend();
      }
    });
    this.elements.modal.addEventListener('input', e => {
      if (e.target.id === 'chat-input') {
        this.updateInput(e.target.value);
      }
    });
    this.elements.modal.addEventListener('keypress', e => {
      if (e.target.id === 'chat-input' && e.key === 'Enter') {
        this.handleSend();
      }
    });
    this.elements.modal.addEventListener('input', this.debounce(e => {
      if (e.target.id === 'chat-input') {
        this.updateInput(e.target.value);
      }
    }, 100));
  }
}

// Course Manager Class
class CourseManager {
  constructor() {
    this.bindEvents();
  }

  // Handle course actions
  handleCourseAction(action, course) {
    alert(`${action === 'edit' ? 'Редактировать' : 'Удалить'} курс: ${course}`);
    // Replace with actual API calls or logic
  }

  // Bind event listeners for course buttons
  bindEvents() {
    document.querySelectorAll('.courses .card button').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        const course = button.dataset.course;
        this.handleCourseAction(action, course);
      });
    });
  }
}

// Initialize application
const initApp = () => {
  new MobileMenu({
    containerId: 'mobile-menu',
    backdropId: 'mobile-menu-backdrop',
    buttonId: 'mobile-menu-btn',
    menuItems: [
      { href: '#dashboard', label: 'Главная' },
      { href: '#my-courses', label: 'Мои курсы' },
      { href: '#profile', label: 'Профиль' },
    ],
    isAuthenticated: false, // Set to true for authenticated users
  });
  new ChatAssistant();
  new CourseManager();
};

// Run on DOM load
document.addEventListener('DOMContentLoaded', initApp);