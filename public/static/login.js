// Login page JavaScript

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberMeCheckbox = document.getElementById('rememberMe');

  // Check if user is already logged in
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    window.location.href = '/';
    return;
  }

  // Check for remembered email
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberMeCheckbox.checked = true;
  }

  // Form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;

    // Hide previous errors
    errorMessage.classList.remove('show');

    // Basic validation
    if (!email || !password) {
      showError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // Password length validation
    if (password.length < 6) {
      showError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 0.5rem;"></i>로그인 중...';

    try {
      // TODO: Replace with actual API call
      // const response = await axios.post('/api/auth/login', { email, password });
      
      // For demo purposes, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Demo: Accept any email/password for now
      const user = {
        id: 1,
        email: email,
        full_name: email.split('@')[0],
        headline: '전문가',
        profile_image: 'https://i.pravatar.cc/150?img=1'
      };

      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(user));

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Show success and redirect
      submitBtn.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>로그인 성공!';
      submitBtn.style.background = 'linear-gradient(135deg, var(--success), #059669)';
      
      setTimeout(() => {
        window.location.href = '/';
      }, 500);

    } catch (error) {
      console.error('Login error:', error);
      
      let errorMsg = '로그인에 실패했습니다. 다시 시도해주세요.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMsg = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (error.response.status === 429) {
          errorMsg = '너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요.';
        } else if (error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      }
      
      showError(errorMsg);
      
      // Reset button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  // Input field animations
  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.style.transform = 'translateY(-2px)';
      input.parentElement.style.transition = 'transform 0.2s';
    });

    input.addEventListener('blur', () => {
      input.parentElement.style.transform = 'translateY(0)';
    });

    // Clear error on input
    input.addEventListener('input', () => {
      if (errorMessage.classList.contains('show')) {
        errorMessage.classList.remove('show');
      }
    });
  });

  // Helper function to show errors
  function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.add('show');
    
    // Shake animation
    errorMessage.style.animation = 'shake 0.5s';
    setTimeout(() => {
      errorMessage.style.animation = '';
    }, 500);
  }

  // Enter key handling
  emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      passwordInput.focus();
    }
  });
});

// Social login functions
function loginWithGoogle() {
  alert('Google 로그인은 준비 중입니다.');
  // TODO: Implement Google OAuth
  // window.location.href = '/api/auth/google';
}

function loginWithGithub() {
  alert('GitHub 로그인은 준비 중입니다.');
  // TODO: Implement GitHub OAuth
  // window.location.href = '/api/auth/github';
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);
