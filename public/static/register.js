// Register form handler
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const headline = document.getElementById('headline').value;
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  
  // Hide previous error
  errorMessage.classList.add('hidden');
  
  // Validation
  if (password.length < 8) {
    errorText.textContent = '비밀번호는 8자 이상이어야 합니다.';
    errorMessage.classList.remove('hidden');
    return;
  }
  
  if (password !== confirmPassword) {
    errorText.textContent = '비밀번호가 일치하지 않습니다.';
    errorMessage.classList.remove('hidden');
    return;
  }
  
  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>가입 중...';
  
  try {
    const response = await axios.post('/api/auth/register', {
      email,
      password,
      full_name: fullName,
      headline: headline || '전문가'
    });
    
    if (response.data.success) {
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Show success message
      submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>가입 완료!';
      submitBtn.classList.add('bg-green-500');
      
      // Show welcome message
      alert(`${fullName}님, 환영합니다! 🎉`);
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  } catch (error) {
    // Show error message
    errorText.textContent = error.response?.data?.error || '회원가입에 실패했습니다.';
    errorMessage.classList.remove('hidden');
    
    // Reset button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Terms all checkbox handler
document.getElementById('termsAll').addEventListener('change', function() {
  const checkboxes = document.querySelectorAll('.checkbox-custom');
  checkboxes.forEach(checkbox => {
    checkbox.checked = this.checked;
  });
});

// Password strength indicator
const passwordInput = document.getElementById('password');
passwordInput.addEventListener('input', function() {
  const password = this.value;
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.match(/[a-z]/)) strength++;
  if (password.match(/[A-Z]/)) strength++;
  if (password.match(/[0-9]/)) strength++;
  if (password.match(/[^a-zA-Z0-9]/)) strength++;
  
  // Remove existing indicator
  const existingIndicator = document.getElementById('password-strength');
  if (existingIndicator) existingIndicator.remove();
  
  if (password.length > 0) {
    const indicator = document.createElement('div');
    indicator.id = 'password-strength';
    indicator.className = 'mt-2 flex space-x-1';
    
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];
    const labels = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
    
    for (let i = 0; i < 5; i++) {
      const bar = document.createElement('div');
      bar.className = `h-1 flex-1 rounded ${i < strength ? colors[strength - 1] : 'bg-gray-200'}`;
      indicator.appendChild(bar);
    }
    
    const label = document.createElement('p');
    label.className = 'text-xs mt-1 ' + (strength < 3 ? 'text-red-500' : 'text-green-500');
    label.textContent = '비밀번호 강도: ' + labels[strength - 1];
    
    this.parentElement.parentElement.appendChild(indicator);
    this.parentElement.parentElement.appendChild(label);
  }
});
