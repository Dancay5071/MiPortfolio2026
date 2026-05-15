document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const submitBtn = document.getElementById('submit-btn');
    const spinner = document.getElementById('loading-spinner');
    const btnText = submitBtn.querySelector('span');

    // Comprobar si ya está logueado para redirigir directamente
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (session) {
        window.location.href = 'admin.html';
    }

    // Función para mostrar errores
    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        loginForm.classList.add('animate-pulse');
        setTimeout(() => loginForm.classList.remove('animate-pulse'), 500);
    };

    // Función para ocultar errores
    const hideError = () => {
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        hideError();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showError('Por favor, completa todos los campos.');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-80', 'cursor-not-allowed');
        btnText.textContent = 'Verificando...';
        spinner.classList.remove('hidden');

        try {
            // Autenticación con Supabase
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                throw error;
            }

            // Login Exitoso
            window.location.href = 'admin.html';
        } catch (error) {
            // Login Fallido
            showError(error.message || 'Credenciales incorrectas. Intenta nuevamente.');
            
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-80', 'cursor-not-allowed');
            btnText.textContent = 'INICIAR SESIÓN';
            spinner.classList.add('hidden');
            
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
});
