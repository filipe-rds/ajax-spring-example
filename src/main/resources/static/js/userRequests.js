// Inicializa a listagem de usuários quando a página é carregada
$(document).ready(function() {
    searchUsers();
});

let currentPage = 0; // Página atual
const pageSize = 5;  // Quantidade de usuários por página

function searchUsers(name = "", page = currentPage) {
    $.ajax({
        url: `/search?name=${encodeURIComponent(name)}&page=${page}&size=${pageSize}`,
        method: "GET",
        success: function(response) {
            $("#userTableBody").empty();

            response.content.forEach(user => {
                $("#userTableBody").append(`
                    <tr class="bg-gray-900 hover:bg-green-700 transition-all duration-200 border-b border-gray-700">
                        <td class="border px-4 py-3 text-center font-semibold text-white">${user.id}</td>
                        <td class="border px-4 py-3 text-center text-white truncate w-1/3">${user.name}</td>
                        <td class="border px-4 py-3 text-center text-white truncate w-1/3">${user.email}</td>
                        <td class="border px-4 py-3 text-center w-1/3">
                            <button type="button" class="bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-md hover:bg-yellow-400 hover:scale-105 transition-all duration-200 edit-btn"
                                    data-id="${user.id}" data-name="${user.name}" data-email="${user.email}">
                                ✏️ Editar
                            </button>
                            <button type="button" class="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-400 hover:scale-105 transition-all duration-200"
                                    onclick="deleteUser(${user.id})">
                                🗑️ Excluir
                            </button>
                        </td>
                    </tr>
                `);
            });

            // Atualiza os botões de edição
            $(".edit-btn").click(function() {
                editUser(this);
            });

            // Atualiza a paginação
            updatePagination(response);
        },
        error: function(error) {
            console.log(`Erro ${error.status}: ${error.responseText}`);
        }
    });
}

// Função para mudar de página
function changePage(page) {
    currentPage = page;
    searchUsers($("#search").val(), page);
}

// Função para atualizar a interface da paginação
function updatePagination(response) {
    $("#pagination").empty();

    if (response.totalPages > 1) {
        for (let i = 0; i < response.totalPages; i++) {
            $("#pagination").append(`
                <button class="pagination-btn ${i === response.number ? 'bg-green-600' : 'bg-gray-700'} text-white px-3 py-2 mx-1 rounded-lg hover:bg-green-500"
                        onclick="changePage(${i})">
                    ${i + 1}
                </button>
            `);
        }
    }
}

// Função para salvar um novo usuário ou atualizar um existente
function saveUser() {
    const user = {
        id: $("#userId").val() || null,
        name: $("#name").val(),
        email: $("#email").val()
    };

    $("#createUserBtn").prop("disabled", true);

    const url = user.id ? "/update" : "/save";

    $.ajax({
        url: url,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(user),
        success: function(response) {
            console.log("Usuário salvo/atualizado com sucesso!", response);
            resetForm();
            searchUsers($("#search").val(), currentPage); // Mantém a página atual
            $("#createUserBtn").prop("disabled", false);
        },
        error: function(error) {
            console.log(`Erro ${error.status}: ${error.responseText}`);
            $("#createUserBtn").prop("disabled", false);
        }
    });
}

// Função para excluir um usuário
function deleteUser(id) {
    $.ajax({
        url: `/delete/${id}`,
        method: "DELETE",
        success: function(response) {
            console.log("Usuário excluído com sucesso!");

            // Verifica se a página ficou vazia após a exclusão
            if ($("#userTableBody tr").length === 1 && currentPage > 0) {
                currentPage--; // Volta para a página anterior se não houver mais registros
            }

            searchUsers($("#search").val(), currentPage); // 🚀 Mantém a página atual
        },
        error: function(error) {
            console.log(`Erro ${error.status}: ${error.responseText}`);
        }
    });
}

// Função para carregar os dados de um usuário no formulário de edição
function editUser(button) {
    const user = {
        id: button.dataset.id,
        name: button.dataset.name,
        email: button.dataset.email
    };

    $("#userId").val(user.id);
    $("#name").val(user.name);
    $("#email").val(user.email);

    $("#createUserBtn").text("Atualizar");
    $("#cancelEditBtn").removeClass("hidden");
}

// Função para limpar o formulário e restaurar o estado inicial
function resetForm() {
    $("#createUserForm").trigger("reset");
    $("#userId").val("");
    $("#createUserBtn").text("Salvar");
    $("#cancelEditBtn").addClass("hidden");
}
