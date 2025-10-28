document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('form-comunidade');
    if (!form) {
        console.error("Erro Crítico: O formulário com ID 'form-comunidade' não foi encontrado.");
        return;
    }

    const submitButton = document.getElementById('submit-button');
    const formFeedback = document.getElementById('form-feedback');

    const csrfTokenInput = form.querySelector('[name=csrfmiddlewaretoken]');
    if (!csrfTokenInput || !csrfTokenInput.value) {
        console.warn('Input CSRF token não encontrado ou vazio. O envio para o Django falhará.');
    }
    const csrfToken = csrfTokenInput ? csrfTokenInput.value : '';

    const checkMenor = document.getElementById('checkMenorIdade');
    const dadosResponsavel = document.getElementById('dadosResponsavel');
    const inputsResponsavel = dadosResponsavel.querySelectorAll('input, select');

    function toggleResponsavel() {
        const isChecked = checkMenor.checked;
        dadosResponsavel.style.display = isChecked ? 'block' : 'none';
        
        inputsResponsavel.forEach(input => {
            input.required = isChecked;
            if (!isChecked) {
                input.value = ''; 
                if(input.tagName === 'SELECT') {
                    updateSelectColor(input); 
                }
                input.classList.remove('input-error');
                const errorMsg = input.parentNode.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            }
        });
    }
    
    checkMenor.addEventListener('change', toggleResponsavel);
    toggleResponsavel(); 

    function updateSelectColor(select) {
        if (select.value === "") {
            select.style.color = '#6c757d';
        } else {
            select.style.color = '#333';
        }
    }
    
    document.querySelectorAll('.form-select').forEach(select => {
        select.addEventListener('change', () => updateSelectColor(select));
        // Garante a cor correta no carregamento da página
        updateSelectColor(select);
    });

    const contactsContainer = document.getElementById('emergencyContactsContainer');
    const addContactBtn = document.getElementById('addContactBtn');
    let contactCount = 1;

    addContactBtn.addEventListener('click', function () {
        contactCount++;
        const newContact = document.createElement('div');
        newContact.className = 'contact-entry';
        newContact.innerHTML = `
            <div class="row">
                <h5>Contato ${contactCount}</h5>
                <div class="col-lg-6"> <!-- Usando lg-6, mas poderia ser md-6 também -->
                    <div class="mb-3">
                        <label for="nome_urgencia_${contactCount}" class="visually-hidden">Nome Completo Contato ${contactCount}</label>
                        <input type="text" id="nome_urgencia_${contactCount}" name="nome_urgencia[]" class="apenas-letras form-control" placeholder="Nome Completo" required>
                    </div>
                </div>
                <div class="col-lg-6">
                     <div class="mb-3">
                        <label for="telefone_urgencia_${contactCount}" class="visually-hidden">Telefone Celular Contato ${contactCount}</label>
                        <input type="text" id="telefone_urgencia_${contactCount}" name="telefone_urgencia[]" class="telefone form-control" placeholder="Telefone Celular" required maxlength="15">
                    </div>
                </div>
            </div>
            <button type="button" class="remove-contact-btn" aria-label="Remover Contato ${contactCount}"><i class="bi bi-dash" aria-hidden="true"></i></button>
        `;
        contactsContainer.appendChild(newContact);
        
        // Adiciona formatação de máscara aos novos campos
        newContact.querySelectorAll('.telefone').forEach(input => {
            input.addEventListener('input', (e) => e.target.value = formatTelefone(e.target.value));
        });
        newContact.querySelectorAll('.apenas-letras').forEach(input => {
            input.addEventListener('input', (e) => e.target.value = e.target.value.replace(/[^\p{L}\s]/gu, ''));
        });
    });

    contactsContainer.addEventListener('click', function (e) {
        // Usa .closest() para garantir que o clique no ícone também funcione
        const removeBtn = e.target.closest('.remove-contact-btn');
        if (removeBtn) {
            removeBtn.closest('.contact-entry').remove();
            updateContactNumbers();
        }
    });

    function updateContactNumbers() {
        const allContacts = contactsContainer.querySelectorAll('.contact-entry');
        allContacts.forEach((contact, index) => {
            const title = contact.querySelector('h5');
            if (title) title.textContent = `Contato ${index + 1}`;
            
            // Atualiza o 'aria-label' do botão de remover
            const removeBtn = contact.querySelector('.remove-contact-btn');
            if(removeBtn) removeBtn.setAttribute('aria-label', `Remover Contato ${index + 1}`);

            // Atualiza 'for' e 'id' dos inputs para acessibilidade
            const nomeInput = contact.querySelector('input[name="nome_urgencia[]"]');
            const nomeLabel = contact.querySelector(`label[for^="nome_urgencia_"]`);
            if(nomeInput) nomeInput.id = `nome_urgencia_${index + 1}`;
            if(nomeLabel) nomeLabel.setAttribute('for', `nome_urgencia_${index + 1}`);

            const telInput = contact.querySelector('input[name="telefone_urgencia[]"]');
            const telLabel = contact.querySelector(`label[for^="telefone_urgencia_"]`);
            if(telInput) telInput.id = `telefone_urgencia_${index + 1}`;
            if(telLabel) telLabel.setAttribute('for', `telefone_urgencia_${index + 1}`);

        });
        contactCount = allContacts.length;
    }

    /**
     * Exibe uma mensagem de feedback no topo do formulário.
     * @param {'success' | 'danger'} type - O tipo de alerta (Bootstrap).
     * @param {string} message - A mensagem HTML para exibir.
     */
    function showMessage(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        formFeedback.innerHTML = ''; // Limpa mensagens antigas
        formFeedback.appendChild(alertDiv);
        
        // Rola a tela para a mensagem para que o usuário a veja
        alertDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /** Limpa todos os erros de validação da tela. */
    function clearErrors() {
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });
        formFeedback.innerHTML = ''; // Limpa mensagens de sucesso/erro globais
    }

    /**
     * Exibe erros de validação do backend nos campos correspondentes.
     * @param {Object} erros - Um objeto onde a chave é o 'id' do campo e o valor é um array de mensagens.
     */
    function displayErrors(erros) {
        console.log("Erros de validação do Django:", erros);
        
        let firstErrorField = null;

        for (const [fieldName, errorMessages] of Object.entries(erros)) {
            // Tenta encontrar por ID, que é o mais comum
            let campo = document.getElementById(fieldName);
            
            // Se não encontrar por ID, tenta por 'name' (para casos como 'nome_urgencia[]')
            if (!campo && fieldName.includes('[]')) {
                 // Pega o primeiro campo do array que deu erro
                campo = form.querySelector(`[name="${fieldName}"]`);
            } else if (!campo) {
                // Fallback para 'name' genérico
                campo = form.querySelector(`[name="${fieldName}"]`);
            }
            
            if (campo) {
                if (!firstErrorField) firstErrorField = campo; // Armazena o primeiro campo com erro
                
                campo.classList.add('input-error');
                
                // Cria o elemento de erro
                const erroEl = document.createElement('span');
                erroEl.className = 'error-message';
                erroEl.textContent = errorMessages.join(' '); 
                
                // Insere a mensagem de erro após o campo (ou após o 'custom-arrow' se for um select)
                const parentWrapper = campo.closest('.custom-select-wrapper') || campo.parentNode;
                parentWrapper.insertBefore(erroEl, parentWrapper.lastChild.nextSibling);

            } else {
                console.warn(`Campo de erro '${fieldName}' não encontrado no DOM.`);
            }
        }
        
        // Exibe uma mensagem de erro geral
        showMessage('danger', '<strong>Erro de validação:</strong> Por favor, verifique os campos destacados.');

        // Rola para o primeiro campo com erro
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); 
        clearErrors(); 

        // --- Estado de Loading ---
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Enviando...
        `;
        
        // Coleta de dados (FormData é ótimo para isso)
        const formData = new FormData(form);
        const dadosObjeto = {};
        
        // Agrupa campos de array (como 'nome_urgencia[]')
        const keys = new Set();
        for (const key of formData.keys()) {
            keys.add(key);
        }

        for (const key of keys) {
            if (key === 'csrfmiddlewaretoken') continue;

            if (key.endsWith('[]')) {
                const cleanKey = key.slice(0, -2); // Remove '[]'
                dadosObjeto[cleanKey] = formData.getAll(key);
            } else {
                dadosObjeto[key] = formData.get(key);
            }
        }

        // Garante que os checkboxes sejam enviados como booleanos
        dadosObjeto.menorIdade = checkMenor.checked;
        dadosObjeto.deAcordo = document.getElementById('checkLGPD').checked;

        console.log("Dados a serem enviados (JSON):", dadosObjeto);

        try {
            const response = await fetch(form.action, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken 
                },
                body: JSON.stringify(dadosObjeto)
            });

            const resultado = await response.json();

            if (response.ok) {
                // Sucesso
                showMessage('success', `<strong>Sucesso!</strong> ${resultado.mensagem || 'Inscrição realizada com sucesso!'}`);
                
                form.reset();
                
                // Reseta a cor de todos os selects
                document.querySelectorAll('.form-select').forEach(updateSelectColor);
                // Esconde a seção do responsável
                toggleResponsavel(); 
                
                // Remove contatos de emergência extras
                const extraContacts = contactsContainer.querySelectorAll('.contact-entry:not(:first-child)');
                extraContacts.forEach(contact => contact.remove());
                updateContactNumbers(); // Reseta a contagem

            } else if (resultado.status === 'erro_validacao') {
                // Erro de validação do Django
                displayErrors(resultado.erros);
            } else {
                // Outro erro do servidor (500, 404, etc.)
                showMessage('danger', `Erro do servidor: ${resultado.mensagem || 'Erro desconhecido.'}`);
            }

        } catch (error) {
            console.error('Erro de comunicação:', error);
            showMessage('danger', 'Ocorreu um erro de comunicação com o servidor. Tente novamente mais tarde.');
        } finally {
            // Restaura o botão
            submitButton.disabled = false;
            submitButton.innerHTML = 'Salvar Inscrição';
        }
    });
    
    // --- Funções de Formatação (Máscaras) ---

    function formatCPF(value) {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return digits.replace(/(\d{3})(\d)/, '$1.$2');
        if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d)/, '$1.$2.$3');
        return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    }

    function formatTelefone(value) {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 2) return digits; // (XX
        if (digits.length <= 7) return digits.replace(/(\d{2})(\d)/, '($1) $2'); // (XX) XXXXX
        // Trata 9o dígito
        if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'); // Fixo
        return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'); // Celular
    }

    function formatCEP(value) {
        const digits = value.replace(/\D/g, '').slice(0, 8);
        if (digits.length <= 5) return digits;
        return digits.replace(/(\d{5})(\d{1,3})/, '$1-$2'); // XXXXX-XXX
    }

    // Listener de input para aplicar máscaras dinamicamente
    form.addEventListener('input', function(e) {
        const target = e.target;

        // Remove erros de validação assim que o usuário começa a corrigir
        if (target.classList.contains('input-error')) {
            target.classList.remove('input-error');
            const errorMsg = target.parentNode.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        }

        if (target.classList.contains('cpf')) {
            target.value = formatCPF(target.value);
        }
        
        if (target.classList.contains('telefone')) {
            target.value = formatTelefone(target.value);
        }

        if (target.classList.contains('cep')) {
            target.value = formatCEP(target.value);
        }

        if (target.classList.contains('apenas-letras')) {
            // Regex '\p{L}' é ótima para nomes em português (inclui acentos)
            target.value = target.value.replace(/[^\p{L}\s]/gu, '');
        }
    });

    // Listener para selects (para limpar erro ao mudar)
    form.addEventListener('change', function(e) {
         const target = e.target;
         if (target.tagName === 'SELECT' && target.classList.contains('input-error')) {
            target.classList.remove('input-error');
            const errorMsg = target.closest('.custom-select-wrapper').querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
         }
    });

});
