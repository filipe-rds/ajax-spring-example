// Inicializa a listagem de usuários quando a página é carregada
$(document).ready(function() {
    searchUsers(); // Chama a função que busca os usuários da API e os exibe na tabela
});

// Variáveis globais para controle da paginação
let currentPage = 0; // Página atual começa em 0 (primeira página)
const pageSize = 5;  // Define o número de usuários exibidos por página

/**
 * Função para buscar usuários da API e atualizar a tabela na interface.
 *
 * @param {string} name - Nome do usuário a ser pesquisado (padrão: vazio).
 * @param {number} page - Número da página atual (padrão: currentPage).
 */
function searchUsers(name = "", page = currentPage) {
    $.ajax({
        url: `/search?name=${encodeURIComponent(name)}&page=${page}&size=${pageSize}`, // Faz a requisição para a API com nome e paginação
        method: "GET",
        success: function(response) {
            $("#userTableBody").empty(); // Remove os dados antigos da tabela antes de preencher com novos

            // Itera sobre os usuários retornados e adiciona cada um como uma linha na tabela
            response.content.forEach(user => {
                $("#userTableBody").append(`
                    <tr class="bg-gray-900 hover:bg-green-700 transition-all duration-200 border-b border-gray-700">
                        <td class="border px-4 py-3 text-center font-semibold text-white">${user.id}</td>
                        <td class="border px-4 py-3 text-center text-white truncate w-1/3">${user.name}</td>
                        <td class="border px-4 py-3 text-center text-white truncate w-1/3">${user.email}</td>
                        <td class="border px-4 py-3 text-center w-1/3">
                            <!-- Botão para editar o usuário -->
                            <button type="button" class="bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-md hover:bg-yellow-400 hover:scale-105 transition-all duration-200 edit-btn"
                                    data-id="${user.id}" data-name="${user.name}" data-email="${user.email}">
                                ✏️ Editar
                            </button>
                            <!-- Botão para excluir o usuário -->
                            <button type="button" class="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-400 hover:scale-105 transition-all duration-200"
                                    onclick="deleteUser(${user.id})">
                                🗑️ Excluir
                            </button>
                        </td>
                    </tr>
                `);
            });

            // Adiciona evento de clique para os botões de edição (não pode ser feito dentro do loop diretamente)
            $(".edit-btn").click(function() {
                editUser(this);
            });

            // Atualiza a paginação para refletir a resposta da API
            updatePagination(response);
        },
        error: function(error) {
            console.log(`Erro ${error.status}: ${error.responseText}`); // Exibe erro no console caso a requisição falhe
        }
    });
}

/**
 * Função para mudar de página na listagem de usuários.
 * Atualiza a página atual e refaz a busca com o nome digitado na pesquisa.
 *
 * @param {number} page - Número da nova página.
 */
function changePage(page) {
    currentPage = page; // Atualiza a variável de controle da página atual
    searchUsers($("#search").val(), page); // Recarrega os usuários para a nova página
}

/**
 * Função para atualizar a interface da paginação com base na resposta da API.
 *
 * @param {Object} response - Resposta da API contendo informações sobre a paginação.
 */
function updatePagination(response) {
    $("#pagination").empty(); // Remove os botões de paginação existentes

    // Verifica se há mais de uma página disponível
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

/**
 * Função para salvar um novo usuário ou atualizar um usuário existente.
 * Se o ID estiver preenchido, faz uma atualização; caso contrário, cria um novo usuário.
 */
function saveUser() {
    const user = {
        id: $("#userId").val() || null, // Se houver um ID no campo oculto, significa que está editando um usuário
        name: $("#name").val(),
        email: $("#email").val()
    };

    $("#createUserBtn").prop("disabled", true); // Desabilita o botão para evitar múltiplos cliques

    const url = user.id ? "/update" : "/save"; // Define a URL com base na ação (criação ou edição)

    $.ajax({
        url: url,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(user), // Converte o objeto em JSON para envio
        success: function(response) {
            console.log("Usuário salvo/atualizado com sucesso!", response);
            resetForm(); // Limpa o formulário após salvar
            searchUsers($("#search").val(), currentPage); // Mantém a página atual após salvar
            $("#createUserBtn").prop("disabled", false);
        },
        error: function(error) {
            console.log(`Erro ${error.status}: ${error.responseText}`);
            $("#createUserBtn").prop("disabled", false); // Reabilita o botão caso ocorra erro
        }
    });
}

/**
 * Função para excluir um usuário da lista.
 *
 * @param {number} id - ID do usuário a ser excluído.
 */
function deleteUser(id) {
    $.ajax({
        url: `/delete/${id}`,
        method: "DELETE",
        success: function(response) {
            console.log("Usuário excluído com sucesso!");

            // Se a página ficar vazia após a exclusão, volta uma página
            if ($("#userTableBody tr").length === 1 && currentPage > 0) {
                currentPage--;
            }

            searchUsers($("#search").val(), currentPage); // Atualiza a tabela sem recarregar a página
        },
        error: function(error) {
            console.log(`Erro ${error.status}: ${error.responseText}`);
        }
    });
}

/**
 * Função para carregar os dados de um usuário no formulário de edição.
 *
 * @param {HTMLElement} button - Botão que foi clicado para edição.
 */
function editUser(button) {
    const user = {
        id: button.dataset.id,
        name: button.dataset.name,
        email: button.dataset.email
    };

    // Preenche os campos do formulário com os dados do usuário
    $("#userId").val(user.id);
    $("#name").val(user.name);
    $("#email").val(user.email);

    // Muda o texto do botão para "Atualizar" e exibe o botão de cancelar edição
    $("#createUserBtn").text("Atualizar");
    $("#cancelEditBtn").removeClass("hidden");
}

/**
 * Função para limpar o formulário e restaurar o estado inicial.
 */
function resetForm() {
    $("#createUserForm").trigger("reset"); // Reseta os campos do formulário
    $("#userId").val(""); // Remove o ID do campo oculto
    $("#createUserBtn").text("Salvar"); // Restaura o botão para "Salvar"
    $("#cancelEditBtn").addClass("hidden"); // Esconde o botão de cancelar edição
}
