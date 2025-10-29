document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('form-comunidade');
    if (!form) {
        console.error("Erro Crítico: O formulário com ID 'form-comunidade' não foi encontrado.");
        return;
    }

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
                <div class="col-lg-6">
                    <div class="mb-3">
                        <input type="text" name="nome_urgencia[]" class="apenas-letras form-control" placeholder="Nome Completo" required>
                    </div>
                </div>
                <div class="col-lg-6">
                     <div class="mb-3">
                        <input type="text" name="telefone_urgencia[]" class="telefone form-control" placeholder="Telefone Celular" required maxlength="15">
                    </div>
                </div>
            </div>
            <button type="button" class="remove-contact-btn"><i class="bi bi-dash"></i></button>
        `;
        contactsContainer.appendChild(newContact);
    });

    contactsContainer.addEventListener('click', function (e) {
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
        });
        contactCount = allContacts.length;
    }


    function clearErrors() {
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });
    }

    /** Exibe os erros vindos do Django no formulário. */
    function displayErrors(erros) {
        console.log("Erros de validação do Django:", erros);
        
        for (const [fieldName, errorMessages] of Object.entries(erros)) {
            // O ID do campo no HTML deve ser igual ao nome do campo no forms.py
            const campo = document.getElementById(fieldName); 
            
            if (campo) {
                campo.classList.add('input-error');
                
                // Cria e insere a mensagem de erro logo após o campo
                const erroEl = document.createElement('span');
                erroEl.className = 'error-message';
                erroEl.textContent = errorMessages.join(' '); // Junta múltiplas mensagens
                
                // Insere depois do campo, dentro do wrapper 'mb-3'
                campo.parentNode.insertBefore(erroEl, campo.nextSibling);
            } else {
                console.warn(`Campo de erro '${fieldName}' não encontrado no DOM.`);
            }
        }
        
        const firstError = document.querySelector('.error-message');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Intercepta o evento de 'submit' do formulário
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Evita o envio tradicional
        clearErrors(); // Limpa erros antigos

        // 1. Coletar dados do formulário
        const formData = new FormData(form);
        const dadosObjeto = {};
        const keys = new Set();
        for (const key of formData.keys()) {
            keys.add(key);
        }

        // Constrói o objeto JSON, tratando campos de array (com '[]')
        for (const key of keys) {
            if (key === 'csrfmiddlewaretoken') continue;

            if (key.endsWith('[]')) {
                const cleanKey = key.slice(0, -2); 
                dadosObjeto[cleanKey] = formData.getAll(key);
            } else {
                dadosObjeto[key] = formData.get(key);
            }
        }

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

                console.log(resultado.mensagem || 'Inscrição realizada com sucesso!');
                alert(resultado.mensagem || 'Inscrição realizada com sucesso!');
                form.reset();
                

                document.querySelectorAll('.form-select').forEach(updateSelectColor);
                toggleResponsavel(); 
                
  
                const extraContacts = contactsContainer.querySelectorAll('.contact-entry:not(:first-child)');
                extraContacts.forEach(contact => contact.remove());
                updateContactNumbers(); 

            } else if (resultado.status === 'erro_validacao') {
                // Erros de validação do Django
                displayErrors(resultado.erros);
            } else {
                // Outro erro de servidor (500, 404, etc.)
                alert(`Erro do servidor: ${resultado.mensagem || 'Erro desconhecido.'}`);
            }

        } catch (error) {
            console.error('Erro de comunicação:', error);
            alert('Ocorreu um erro de comunicação com o servidor.');
        }
    });
    

    function formatCPF(value) {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return digits.replace(/(\d{3})(\d)/, '$1.$2');
        if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d)/, '$1.$2.$3');
        return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    }


    function formatTelefone(value) {
        const digits = value.replace(/\D/g, '').slice(0, 11);

        if (digits.length <= 2) return digits;
        if (digits.length <= 7) return digits.replace(/(\d{2})(\d)/, '($1) $2');
        return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    form.addEventListener('input', function(e) {
        const target = e.target;


        if (target.classList.contains('cpf')) {
            target.value = formatCPF(target.value);
        }
        
        if (target.classList.contains('telefone')) {
            target.value = formatTelefone(target.value);
        }

        if (target.classList.contains('apenas-letras')) {
            target.value = target.value.replace(/[^\p{L}\s]/gu, '');
        }
    });

});
