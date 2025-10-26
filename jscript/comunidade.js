document.addEventListener('DOMContentLoaded', function () {


    const checkMenor = document.getElementById('checkMenorIdade');
    const dadosResponsavel = document.getElementById('dadosResponsavel');

    checkMenor.addEventListener('change', function () {
        if (this.checked) {
            dadosResponsavel.style.display = 'block';
        } else {
            dadosResponsavel.style.display = 'none';
        }
    });


    document.querySelectorAll('.form-select').forEach(select => {
        const updateColor = () => {
            if (select.value === "") {
                select.style.color = '#6c757d';
            } else {
                select.style.color = '#333';
            }
        };
        select.addEventListener('change', updateColor);
        updateColor(); // Cor inicial
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
                                <input type="text" class="form-control" placeholder="Nome Completo">
                            </div>
                        </div>
                        <div class="col-lg-6">
                             <div class="mb-3">
                                <input type="tel" class="form-control" placeholder="Telefone para contato">
                            </div>
                        </div>
                    </div>
                    <button type="button" class="remove-contact-btn">
                        <i class="bi bi-dash"></i>
                    </button>
                `;

        contactsContainer.appendChild(newContact);
    });


    contactsContainer.addEventListener('click', function (e) {
        const removeBtn = e.target.closest('.remove-contact-btn');

        if (removeBtn) {
            const contactEntry = removeBtn.closest('.contact-entry');
            contactEntry.remove();


            updateContactNumbers();
        }
    });

    function updateContactNumbers() {
        const allContacts = contactsContainer.querySelectorAll('.contact-entry');
        allContacts.forEach((contact, index) => {
            const title = contact.querySelector('h5');
            if (title) {
                title.textContent = `Contato ${index + 1}`;
            }
        });
        contactCount = allContacts.length; 
    }

});