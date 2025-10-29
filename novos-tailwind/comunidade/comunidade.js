document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('form-comunidade');
    if (!form) {
        console.error("Erro Crítico: O formulário com ID 'form-comunidade' não foi encontrado.");
        return;
    }

    // --- Referências ---
    const submitButton = document.getElementById('submit-button');
    const formFeedback = document.getElementById('form-feedback');
    // ------------------------

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
        // Usa classes 'hidden' e 'block' do Tailwind
        if (isChecked) {
            dadosResponsavel.classList.remove('hidden');
            dadosResponsavel.classList.add('block');
        } else {
            dadosResponsavel.classList.remove('block');
            dadosResponsavel.classList.add('hidden');
        }

        inputsResponsavel.forEach(input => {
            input.required = isChecked;
            if (!isChecked) {
                input.value = '';
                if (input.tagName === 'SELECT') {
                    updateSelectColor(input);
                }
                input.classList.remove('input-error');
                // Encontra o parente mais próximo que contém o campo
                const parent = input.closest('.mb-4') || input.closest('.custom-select-wrapper');
                const errorMsg = parent ? parent.querySelector('.error-message') : null;
                if (errorMsg) errorMsg.remove();
            }
        });
    }

    checkMenor.addEventListener('change', toggleResponsavel);
    toggleResponsavel(); // Executa ao carregar a página

    /**
     * Atualiza a cor do texto de um <select> com base se 
     * a opção "placeholder" (value="") está selecionada.
     */
    function updateSelectColor(select) {
        if (select.value === "") {
            select.style.color = '#6c757d'; // Cor do placeholder
        } else {
            select.style.color = '#333'; // Cor do texto
        }
    }

    // Aplica a lógica de cor aos selects normais (não-multiplos)
    document.querySelectorAll('.form-select:not([multiple])').forEach(select => {
        select.addEventListener('change', () => updateSelectColor(select));
        updateSelectColor(select);
    });

    const contactsContainer = document.getElementById('emergencyContactsContainer');
    const addContactBtn = document.getElementById('addContactBtn');
    let contactCount = 1;

    addContactBtn.addEventListener('click', function () {
        contactCount++;
        const newContact = document.createElement('div');
        // Adiciona classes do Tailwind para o novo 'contact-entry'
        newContact.className = 'contact-entry relative p-4 md:p-6 bg-gray-50 border border-gray-200 rounded-md mt-4';
        newContact.innerHTML = `
                <div class="flex flex-wrap -mx-3">
                    <h5 class="w-full px-3 font-bold text-base mt-0 mb-2 text-[#003366]">Contato ${contactCount}</h5>
                    <div class="w-full md:w-1/2 px-3">
                        <div class="mb-4 md:mb-0">
                            <label for="nome_urgencia_${contactCount}" class="sr-only">Nome Completo Contato ${contactCount}</label>
                            <input type="text" id="nome_urgencia_${contactCount}" name="nome_urgencia[]" class="apenas-letras form-control block w-full bg-gray-100 border-none rounded-md py-3 px-4 text-sm text-gray-800 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-opacity-60 md:text-base" placeholder="Nome Completo" required>
                        </div>
                    </div>
                    <div class="w-full md:w-1/2 px-3">
                        <div class="mb-0">
                            <label for="telefone_urgencia_${contactCount}" class="sr-only">Telefone Celular Contato ${contactCount}</label>
                            <input type="text" id="telefone_urgencia_${contactCount}" name="telefone_urgencia[]" class="telefone form-control block w-full bg-gray-100 border-none rounded-md py-3 px-4 text-sm text-gray-800 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-opacity-60 md:text-base" placeholder="Telefone Celular" required maxlength="15">
                        </div>
                    </div>
                </div>
                <button type="button" class="remove-contact-btn absolute top-2.5 right-2.5 bg-red-600 text-white border-none rounded-full w-8 h-8 text-lg flex items-center justify-center leading-none shadow-md transition-all duration-200 ease-in-out hover:bg-red-700 hover:scale-110" aria-label="Remover Contato ${contactCount}"><i class="bi bi-dash" aria-hidden="true"></i></button>
            `;
        contactsContainer.appendChild(newContact);

        // Adiciona formatação de máscara aos novos campos
        newContact.querySelectorAll('.telefone').forEach(input => {
            input.addEventListener('input', (e) => e.target.value = formatTelefone(e.target.value));
        });
        newContact.querySelectorAll('.apenas-letras').forEach(input => {
            input.addEventListener('input', (e) => e.target.value = e.target.value.replace(/[^\p{L}\s'-]/gu, ''));
        });
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

            const removeBtn = contact.querySelector('.remove-contact-btn');
            if (removeBtn) removeBtn.setAttribute('aria-label', `Remover Contato ${index + 1}`);

            const nomeInput = contact.querySelector('input[name="nome_urgencia[]"]');
            const nomeLabel = contact.querySelector(`label[for^="nome_urgencia_"]`);
            if (nomeInput) nomeInput.id = `nome_urgencia_${index + 1}`;
            if (nomeLabel) nomeLabel.setAttribute('for', `nome_urgencia_${index + 1}`);

            const telInput = contact.querySelector('input[name="telefone_urgencia[]"]');
            const telLabel = contact.querySelector(`label[for^="telefone_urgencia_"]`);
            if (telInput) telInput.id = `telefone_urgencia_${index + 1}`;
            if (telLabel) telLabel.setAttribute('for', `telefone_urgencia_${index + 1}`);
        });
        contactCount = allContacts.length;
    }

    /**
     * Exibe uma mensagem de feedback no topo do formulário.
     * @param {'success' | 'danger'} type - O tipo de alerta.
     * @param {string} message - A mensagem HTML para exibir.
     */
    function showMessage(type, message) {
        const alertDiv = document.createElement('div');
        // Usa as novas classes CSS personalizadas
        alertDiv.className = `form-feedback-box feedback-${type}`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
                ${message}
                <button type="button" class="feedback-close-btn" aria-label="Close"></button>
            `;

        formFeedback.innerHTML = ''; // Limpa mensagens antigas
        formFeedback.appendChild(alertDiv);

        alertDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // --- NOVO: Listener para fechar os alertas customizados ---
    formFeedback.addEventListener('click', function (e) {
        const closeButton = e.target.closest('.feedback-close-btn');
        if (closeButton) {
            const alertBox = closeButton.closest('.form-feedback-box');
            // Adiciona um efeito de fade out simples
            alertBox.style.opacity = '0';
            setTimeout(() => alertBox.remove(), 150);
        }
    });


    // --- INÍCIO LÓGICA MULTI-SELECT ---

    // Define as opções para os campos multi-select
    // (As opções foram removidas do HTML para serem gerenciadas aqui)
    const multiSelectOptions = {
        'motivos_acompanhamento': [
            { value: "ansiedade", text: "Ansiedade" },
            { value: "assediomoral", text: "Assédio Moral" },
            { value: "depressao", text: "Depressão" },
            { value: "dfaprendizagem", text: "Dificuldade de Aprendizagem" },
            { value: "humorinstavel", text: "Humor Instável" },
            { value: "insonia", text: "Insônia" },
            { value: "isolasocial", text: "Isolamento Social" },
            { value: "luto", text: "Luto" },
            { value: "tristeza", text: "Tristeza" },
            { value: "apatia", text: "Apatia" },
            { value: "exaustao", text: "Exaustão" },
            { value: "fadiga", text: "Fadiga" },
            { value: "faltanimo", text: "Falta Ânimo" },
            { value: "assediosexual", text: "Assédio Sexual" },
            { value: "outro", text: "Outro" }
        ],
        'medicamentos_usados': [
            { value: "ansiolitico", text: "Ansiolítico" },
            { value: "antidepressivo", text: "Antidepressivo" },
            { value: "antipsicotico", text: "Antipsicótico" },
            { value: "estabhumor", text: "Estabilizador de Humor" },
            { value: "memoriatct", text: "Medicamentos para memória, atenção e concentração" },
            { value: "nenhum", text: "Nenhum" },
            { value: "outro", text: "Outro" }
        ],
        'pcd_neurodivergente': [
            { value: "tea", text: "TEA (Transtorno do Espectro Autista)" },
            { value: "tdah", text: "TDAH (Transtorno do Déficit de Atenção com Hiperatividade)" },
            { value: "def_fisica", text: "Deficiência Física" },
            { value: "def_visual", text: "Deficiência Visual" },
            { value: "def_auditiva", text: "Deficiência Auditiva" },
            { value: "transtorno_aprendizagem", text: "Transtornos de Aprendizagem (Dislexia, etc.)" },
            { value: "altas_habilidades", text: "Altas Habilidades / Superdotação" },
            { value: "nenhum", text: "Nenhum" },
            { value: "outro", text: "Outro" }
        ],
        'doencas_fisicas': [
            { value: "doencaresp", text: "Doenças respiratórias" },
            { value: "cancer", text: "Câncer" },
            { value: "diabete", text: "Diabetes" },
            { value: "disfusexul", text: "Disfunções sexuais" },
            { value: "doencadgt", text: "Doenças degenerativas" },
            { value: "escleorosemlt", text: "Esclerose múltipla" },
            { value: "hcpt", text: "Hipertensão ou cardiopatias" },
            { value: "luposatm", text: "Lúpus ou outras doenças autoimunes" },
            { value: "obesidade", text: "Obesidade" },
            { value: "pblmarenal", text: "Problemas renais" },
            { value: "nenhum", text: "Nenhum" },
            { value: "outro", text: "Outro" }
        ]
    };

    // Estado para rastrear seleções (ex: { motivos_acompanhamento: ['ansiedade', 'luto'] })
    const multiSelectState = {};

    /**
     * Inicializa todos os componentes multi-select no formulário.
     */
    function initializeMultiSelects() {
        Object.keys(multiSelectOptions).forEach(fieldId => {
            const originalSelect = document.getElementById(fieldId);
            if (!originalSelect) {
                 console.warn(`Campo select original com ID '${fieldId}' não encontrado para multi-select.`);
                 return;
            }

            const placeholder = originalSelect.querySelector('option[disabled]')?.textContent || 'Selecione uma ou mais opções';
            const options = multiSelectOptions[fieldId];
            
            // Inicializa o estado
            multiSelectState[fieldId] = [];

            // Cria o novo componente HTML
            const multiSelectWrapper = document.createElement('div');
            multiSelectWrapper.className = 'custom-multiselect-wrapper relative mb-4';
            multiSelectWrapper.dataset.fieldId = fieldId;

            multiSelectWrapper.innerHTML = `
                <label for="${fieldId}_display" class="sr-only">${placeholder}</label>
                
                <!-- MODIFICADO: Removido rounded-md, adicionado rounded-l-md e pr-12 -->
                <div id="${fieldId}_display" name="${fieldId}_display" class="multiselect-display form-control flex items-center flex-wrap gap-1 block w-full bg-gray-100 border-none rounded-l-md py-2 px-4 text-sm text-gray-800 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-opacity-60 md:text-base cursor-pointer pr-12" tabindex="0" role="combobox" aria-haspopup="listbox" aria-expanded="false">
                    <span class="placeholder-text text-gray-500">${placeholder}</span>
                </div>

                <!-- ADICIONADO: Seta azul igual aos outros selects -->
                <div class="custom-arrow absolute top-0 right-0 bottom-0 w-10 bg-[#003366] text-white flex items-center justify-center pointer-events-none rounded-r-md text-lg md:w-12">
                    <i class="bi bi-caret-down-fill" aria-hidden="true"></i>
                </div>

                <div class="multiselect-dropdown absolute hidden top-full left-0 right-0 z-10 bg-white border border-gray-300 rounded-md shadow-lg mt-1" role="listbox">
                    ${options.map(option => `
                        <div class="multiselect-option flex items-center p-2 hover:bg-gray-100 cursor-pointer" data-value="${option.value}" role="option" aria-selected="false">
                            <input type="checkbox" class="w-4 h-4 text-[#003366] rounded border-gray-300 focus:ring-[#003366] mr-2 pointer-events-none" tabindex="-1">
                            <span>${option.text}</span>
                        </div>
                    `).join('')}
                </div>
                <input type="hidden" id="${fieldId}" name="${fieldId}" class="multiselect-hidden-input">
            `;

            // Substitui o select original pelo novo componente
            originalSelect.closest('.custom-select-wrapper').replaceWith(multiSelectWrapper);

            // --- Adiciona Event Listeners para o novo componente ---
            const display = multiSelectWrapper.querySelector('.multiselect-display');
            const dropdown = multiSelectWrapper.querySelector('.multiselect-dropdown');
            const optionsElements = multiSelectWrapper.querySelectorAll('.multiselect-option');

            // Abrir/Fechar dropdown
            display.addEventListener('click', (e) => {
                e.stopPropagation();
                const isExpanded = dropdown.classList.contains('hidden');
                closeAllMultiSelects(); // Fecha todos os outros
                if (isExpanded) {
                    dropdown.classList.remove('hidden');
                    display.setAttribute('aria-expanded', 'true');
                } else {
                    dropdown.classList.add('hidden');
                    display.setAttribute('aria-expanded', 'false');
                }
            });

            // Selecionar/Deselecionar opção
            optionsElements.forEach(optionEl => {
                optionEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const value = optionEl.dataset.value;
                    toggleMultiSelectOption(fieldId, value);
                });
            });
        });
    }

    /**
     * Fecha todos os dropdowns multi-select abertos.
     */
    function closeAllMultiSelects() {
        document.querySelectorAll('.multiselect-dropdown').forEach(dropdown => {
            dropdown.classList.add('hidden');
            const display = dropdown.previousElementSibling;
            if (display && display.classList.contains('multiselect-display')) {
                 display.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /**
     * Alterna o estado de uma opção multi-select.
     * @param {string} fieldId - O ID do campo (ex: 'motivos_acompanhamento').
     * @param {string} value - O valor da opção clicada.
     */
    function toggleMultiSelectOption(fieldId, value) {
        const state = multiSelectState[fieldId];
        if (!state) return;
        
        const index = state.indexOf(value);

        if (index > -1) {
            state.splice(index, 1); // Remove
        } else {
            state.push(value); // Adiciona
        }

        updateMultiSelectUI(fieldId);
    }

    /**
     * Atualiza a UI (pills e input oculto) de um campo multi-select.
     * @param {string} fieldId - O ID do campo a ser atualizado.
     */
    function updateMultiSelectUI(fieldId) {
        const wrapper = document.querySelector(`.custom-multiselect-wrapper[data-field-id="${fieldId}"]`);
        if (!wrapper) return;

        const display = wrapper.querySelector('.multiselect-display');
        const hiddenInput = wrapper.querySelector('.multiselect-hidden-input');
        const placeholder = display.querySelector('.placeholder-text');
        const options = multiSelectOptions[fieldId];
        const state = multiSelectState[fieldId];

        // 1. Limpa pills antigos
        display.querySelectorAll('.multiselect-pill').forEach(pill => pill.remove());

        // 2. Adiciona pills novos
        state.forEach(value => {
            const option = options.find(o => o.value === value);
            if (!option) return;

            const pill = document.createElement('span');
            pill.className = 'multiselect-pill';
            pill.dataset.value = value;
            pill.innerHTML = `
                <span>${option.text}</span>
                <button type="button" class="multiselect-pill-remove" aria-label="Remover ${option.text}">&times;</button>
            `;
            
            // Adiciona o pill antes do placeholder
            display.insertBefore(pill, placeholder);
        });

        // 3. Atualiza o input oculto
        hiddenInput.value = state.join(','); // Envia como string separada por vírgula

        // 4. Atualiza o estado dos checkboxes no dropdown
        wrapper.querySelectorAll('.multiselect-option').forEach(optionEl => {
            const value = optionEl.dataset.value;
            const checkbox = optionEl.querySelector('input[type="checkbox"]');
            if (state.includes(value)) {
                checkbox.checked = true;
                optionEl.setAttribute('aria-selected', 'true');
            } else {
                checkbox.checked = false;
                optionEl.setAttribute('aria-selected', 'false');
            }
        });

         // 5. Limpa erro se o usuário selecionar algo
         if (state.length > 0) {
             clearMultiSelectError(fieldId);
         }
    }
    
    /** Limpa o erro de um campo multi-select específico */
    function clearMultiSelectError(fieldId) {
         const wrapper = document.querySelector(`.custom-multiselect-wrapper[data-field-id="${fieldId}"]`);
         if (!wrapper) return;
         const display = wrapper.querySelector('.multiselect-display');
         
         if (display.classList.contains('input-error')) {
             display.classList.remove('input-error');
             const errorMsg = wrapper.querySelector('.error-message');
             if (errorMsg) errorMsg.remove();
         }
    }

    // --- Event Listeners Globais do Multi-Select ---

    // Clica para remover um pill
    form.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.multiselect-pill-remove');
        if (removeBtn) {
            e.preventDefault(); // Impede o clique de fechar o dropdown
            e.stopPropagation(); // Impede o clique de fechar o dropdown
            const pill = removeBtn.closest('.multiselect-pill');
            const wrapper = removeBtn.closest('.custom-multiselect-wrapper');
            const fieldId = wrapper.dataset.fieldId;
            const value = pill.dataset.value;
            
            toggleMultiSelectOption(fieldId, value);
        }
    });

    // Clica fora para fechar
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-multiselect-wrapper')) {
            closeAllMultiSelects();
        }
    });

    // Inicializa os componentes
    initializeMultiSelects();

    // --- FIM LÓGICA MULTI-SELECT ---


    /** Limpa todos os erros de validação da tela. */
    function clearErrors() {
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });
        formFeedback.innerHTML = '';
    }

    /**
     * Exibe erros de validação do backend nos campos correspondentes.
     * @param {Object} erros - Um objeto onde a chave é o 'id' do campo e o valor é um array de mensagens.
     */
    function displayErrors(erros) {
        console.log("Erros de validação:", erros);

        let firstErrorField = null;

        for (const [fieldName, errorMessages] of Object.entries(erros)) {
            let campo = document.getElementById(fieldName);

            // --- AJUSTE MULTI-SELECT ---
            // Se o ID for de um display (ex: "motivos_acompanhamento_display")
            if (!campo && fieldName.endsWith('_display')) {
                campo = document.getElementById(fieldName);
            }
            // --- FIM AJUSTE ---

            if (!campo && fieldName.includes('[]')) {
                // Tenta encontrar campos de array (ex: nome_urgencia[])
                const camposArray = form.querySelectorAll(`[name="${fieldName}"]`);
                if (camposArray.length > 0) campo = camposArray[0]; // Pega o primeiro, por exemplo
            } else if (!campo) {
                // Tenta encontrar por 'name' se 'id' falhar
                campo = form.querySelector(`[name="${fieldName}"]`);
            }

            if (campo) {
                if (!firstErrorField) firstErrorField = campo;

                // --- AJUSTE MULTI-SELECT ---
                // O 'campo' é o display, mas o 'parentWrapper' é o wrapper principal
                let parentWrapper;
                if (campo.classList.contains('multiselect-display')) {
                    campo.classList.add('input-error');
                    parentWrapper = campo.closest('.custom-multiselect-wrapper');
                } else {
                    campo.classList.add('input-error');
                    parentWrapper = campo.closest('.custom-select-wrapper') || campo.closest('.mb-4') || campo.parentNode;
                }
                // --- FIM AJUSTE ---

                const erroEl = document.createElement('span');
                erroEl.className = 'error-message'; // Classe definida em comunidade.css
                erroEl.textContent = Array.isArray(errorMessages) ? errorMessages.join(' ') : errorMessages;
                
                // Insere após o último elemento no wrapper
                parentWrapper.appendChild(erroEl);

            } else {
                console.warn(`Campo de erro '${fieldName}' não encontrado no DOM.`);
            }
        }

        // Se a mensagem de erro não for a geral, exibe a geral.
        if (!formFeedback.querySelector('.feedback-danger')) {
             showMessage('danger', '<strong>Erro de validação:</strong> Por favor, verifique os campos destacados.');
        }

        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }


    // --- NOVO: Funções de Validação Client-Side ---

    /** Valida um email usando Regex. */
    function isValidEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    /** Valida o comprimento de um CPF (apenas dígitos). */
    function isValidCPF(cpf) {
        const digits = cpf.replace(/\D/g, '');
        return digits.length === 11;
    }

    /** Valida o comprimento de um Telefone (10 ou 11 dígitos). */
    function isValidTelefone(tel) {
        const digits = tel.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 11;
    }

    /** Valida o comprimento de um CEP (8 dígitos). */
    function isValidCEP(cep) {
        const digits = cep.replace(/\D/g, '');
        return digits.length === 8;
    }


    /**
     * --- NOVO: Função principal de validação client-side ---
     * @returns {boolean} - Retorna true se o formulário for válido, false caso contrário.
     */
    function validateForm() {
        const errors = {};
        
        // 1. Pega todos os campos 'required' que estão visíveis (ignora os da seção 'responsavel' se ocultos)
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            // Ignora campos dentro da seção de responsável oculta
            if (field.closest('#dadosResponsavel') && dadosResponsavel.classList.contains('hidden')) {
                 return;
            }
             
            const fieldId = field.id;
            const fieldValue = field.value.trim();

            // Checa campos vazios
            if (field.tagName === 'SELECT' && fieldValue === '') {
                errors[fieldId] = 'Este campo é obrigatório.';
            } else if (field.tagName !== 'SELECT' && fieldValue === '') {
                errors[fieldId] = 'Este campo é obrigatório.';
            }

            // Checa formatos específicos (se não estiverem vazios)
            else if (field.classList.contains('email') && !isValidEmail(fieldValue)) {
                errors[fieldId] = 'Por favor, insira um e-mail válido.';
            }
            else if (field.classList.contains('cpf') && !isValidCPF(fieldValue)) {
                errors[fieldId] = 'Por favor, insira um CPF válido (11 dígitos).';
            }
            else if (field.classList.contains('telefone') && !isValidTelefone(fieldValue)) {
                errors[fieldId] = 'Por favor, insira um telefone válido (10 ou 11 dígitos).';
            }
            else if (field.classList.contains('cep') && !isValidCEP(fieldValue)) {
                errors[fieldId] = 'Por favor, insira um CEP válido (8 dígitos).';
            }
        });

        // --- NOVA VALIDAÇÃO MULTI-SELECT ---
        Object.keys(multiSelectOptions).forEach(fieldId => {
            const wrapper = document.querySelector(`.custom-multiselect-wrapper[data-field-id="${fieldId}"]`);
            if (!wrapper) return;
            
            const hiddenInput = document.getElementById(fieldId);
            const display = wrapper.querySelector('.multiselect-display');
            
            // Assumindo que todos os campos convertidos são 'required'
            if (hiddenInput.value.trim() === '') {
                 errors[display.id] = 'Este campo é obrigatório.'; // Usa o ID do display para o displayErrors
            }
        });
        // --- FIM VALIDAÇÃO MULTI-SELECT ---

        // 2. Checa o Checkbox LGPD (que tem 'required' mas valor diferente)
        const checkLGPD = document.getElementById('checkLGPD');
        if (!checkLGPD.checked) {
            errors[checkLGPD.id] = 'Você deve concordar com os termos.';
        }

        // 3. Processa os erros
        if (Object.keys(errors).length > 0) {
            displayErrors(errors);
            return false;
        }

        return true;
    }


    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        clearErrors();

        // --- MELHORIA: Validação client-side antes do envio ---
        const isFormValid = validateForm();
        if (!isFormValid) {
            return; // Para a execução se o formulário for inválido
        }
        // --- Fim da validação ---

        // --- Estado de Loading (usa nova classe de spinner) ---
        submitButton.disabled = true;
        submitButton.innerHTML = `
                <span class="loading-spinner" role="status" aria-hidden="true"></span>
                Enviando...
            `;

        const formData = new FormData(form);
        const dadosObjeto = {};

        const keys = new Set();
        for (const key of formData.keys()) {
            keys.add(key);
        }

        for (const key of keys) {
            if (key === 'csrfmiddlewaretoken') continue;

            // Ignora os campos multi-select aqui, eles serão tratados abaixo
            if (multiSelectOptions.hasOwnProperty(key)) continue;

            if (key.endsWith('[]')) {
                const cleanKey = key.slice(0, -2);
                dadosObjeto[cleanKey] = formData.getAll(key);
            } else {
                dadosObjeto[key] = formData.get(key);
            }
        }

        // --- INSERÇÃO MULTI-SELECT ---
        // Pega os valores dos inputs ocultos e transforma em arrays
        Object.keys(multiSelectOptions).forEach(fieldId => {
            const hiddenInput = document.getElementById(fieldId);
            if (hiddenInput) {
                // Envia como um array de strings
                dadosObjeto[fieldId] = hiddenInput.value.split(',').filter(Boolean); // filter(Boolean) remove strings vazias
            }
        });
        // --- FIM INSERÇÃO MULTI-SELECT ---

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
                showMessage('success', `<strong>Sucesso!</strong> ${resultado.mensagem || 'Inscrição realizada com sucesso!'}`);

                form.reset();
                
                // --- RESET MULTI-SELECT UI ---
                Object.keys(multiSelectState).forEach(fieldId => {
                    multiSelectState[fieldId] = []; // Limpa o estado
                    updateMultiSelectUI(fieldId); // Atualiza a UI (remove pills, mostra placeholder)
                });
                // --- FIM RESET ---

                document.querySelectorAll('.form-select').forEach(updateSelectColor);
                toggleResponsavel();

                const extraContacts = contactsContainer.querySelectorAll('.contact-entry:not(:first-child)');
                extraContacts.forEach(contact => contact.remove());
                updateContactNumbers();

            } else if (resultado.status === 'erro_validacao') {
                displayErrors(resultado.erros);
            } else {
                showMessage('danger', `Erro do servidor: ${resultado.mensagem || 'Erro desconhecido.'}`);
            }

        } catch (error) {
            console.error('Erro de comunicação:', error);
            showMessage('danger', 'Ocorreu um erro de comunicação com o servidor. Tente novamente mais tarde.');
        } finally {
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
        if (digits.length <= 2) return `(${digits}`; 
        if (digits.length <= 7) return digits.replace(/(\d{2})(\d)/, '($1) $2'); 
        if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'); // Fixo
        return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'); // Celular
    }

    function formatCEP(value) {
        const digits = value.replace(/\D/g, '').slice(0, 8);
        if (digits.length <= 5) return digits;
        return digits.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    }

    form.addEventListener('input', function (e) {
        const target = e.target;

        // Limpa erro ao digitar
        if (target.classList.contains('input-error')) {
            target.classList.remove('input-error');
            const parent = target.closest('.custom-select-wrapper') || target.closest('.mb-4') || target.parentNode;
            const errorMsg = parent ? parent.querySelector('.error-message') : null;
            if (errorMsg) errorMsg.remove();
        }

        // Aplica máscaras
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
            // --- MELHORIA: Permite letras, espaços, apóstrofos e hífens ---
            target.value = target.value.replace(/[^\p{L}\s'-]/gu, '');
        }
    });

    // Limpa erro ao mudar select (para os selects que sobraram)
    form.addEventListener('change', function (e) {
        const target = e.target;
        if (target.tagName === 'SELECT' && target.classList.contains('input-error')) {
            target.classList.remove('input-error');
            const errorMsg = target.closest('.custom-select-wrapper').querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        }
    });

});
