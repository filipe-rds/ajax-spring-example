package br.edu.ifpb.ajax_aplications.controllers;

import br.edu.ifpb.ajax_aplications.models.User;
import br.edu.ifpb.ajax_aplications.services.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;

@Controller
@RequestMapping("/")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /*
        - Exibe a página inicial com a listagem de usuários e o formulário de cadastro/edição.
        - Retorna a view "home" para ser renderizada no navegador.
    */
    @GetMapping
    public ModelAndView listUsers(ModelAndView mav) {
        mav.setViewName("home");
        return mav;
    }

    /*
        - Realiza a busca de usuários de forma paginada e ordenada por ID em ordem crescente.
        - Retorna um JSON contendo uma página de usuários conforme os parâmetros fornecidos.
    */
    @GetMapping("/search")
    public ResponseEntity<Page<User>> searchUsers(
            @RequestParam(defaultValue = "") String name, // Nome para pesquisa (opcional)
            @RequestParam(defaultValue = "0") int page,  // Número da página (padrão: 0)
            @RequestParam(defaultValue = "5") int size   // Quantidade de registros por página (padrão: 5)
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<User> users = userService.searchUsers(name, pageable);
        return ResponseEntity.ok(users);
    }

    /*
        - Salva um novo usuário e retorna o objeto salvo no formato JSON com status HTTP 201 (CREATED).
        - O usuário é recebido no corpo da requisição (JSON) e processado pelo serviço.
    */
    @PostMapping("/save")
    public ResponseEntity<User> saveUser(@RequestBody User user) {
        User savedUser = userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    /*
        - Exclui um usuário pelo ID fornecido na URL e retorna uma mensagem de sucesso no formato JSON.
        - Caso a exclusão seja bem-sucedida, retorna status HTTP 200 (OK).
    */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.status(HttpStatus.OK).body("Usuário excluído com sucesso!");
    }

    /*
        - Atualiza os dados de um usuário existente e retorna o usuário atualizado no formato JSON.
        - Se o usuário for encontrado, seus dados são atualizados e retornados com status HTTP 200 (OK).
        - Se o usuário não for encontrado, retorna status HTTP 304 (NOT MODIFIED) sem alterar nada.
    */
    @PostMapping("/update")
    public ResponseEntity<User> updateUser(@RequestBody User userNovo) {
        User user = userService.findbyId(userNovo.getId());
        if (user != null) {
            user.setName(userNovo.getName());
            user.setEmail(userNovo.getEmail());
            User savedUser = userService.save(user);
            return ResponseEntity.status(HttpStatus.OK).body(savedUser);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();
        }
    }

}
