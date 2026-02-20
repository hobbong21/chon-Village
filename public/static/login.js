// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  
  // Hide previous error
  errorMessage.classList.add('hidden');
  
  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>로그인 중...';
  
  try {
    const response = await axios.post('/api/auth/login', {
      email,
      password
    });
    
    if (response.data.success) {
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Show success message
      submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>로그인 성공!';
      submitBtn.classList.add('bg-green-500');
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  } catch (error) {
    // Show error message
    errorText.textContent = error.response?.data?.error || '로그인에 실패했습니다.';
    errorMessage.classList.remove('hidden');
    
    // Reset button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Demo user hint
const emailInput = document.getElementById('email');
emailInput.addEventListener('focus', function() {
  if (!this.value) {
    const hint = document.createElement('div');
    hint.id = 'demo-hint';
    hint.className = 'text-xs text-gray-500 mt-1';
    hint.innerHTML = '<i class="fas fa-info-circle mr-1"></i>데모 계정: john.doe@example.com';
    this.parentElement.appendChild(hint);
  }
});

emailInput.addEventListener('blur', function() {
  const hint = document.getElementById('demo-hint');
  if (hint) {
    hint.remove();
  }
});
