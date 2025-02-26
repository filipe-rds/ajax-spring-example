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

    // Exibe a página com listagem e formulário de cadastro/edição
    @GetMapping
    public ModelAndView listUsers(ModelAndView mav) {
        mav.setViewName("home");
        return mav;
    }

    // Pesquisa via AJAX que retorna JSON
    @GetMapping("/search")
    public ResponseEntity<Page<User>> searchUsers(
            @RequestParam(defaultValue = "") String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<User> users = userService.searchUsers(name, pageable);
        return ResponseEntity.ok(users);
    }

    // Salva usuário e retorna JSON com status CREATED e o usuário salvo
    @PostMapping("/save")
    public ResponseEntity<User> saveUser(@RequestBody User user) {
        User savedUser = userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    // Exclui usuário e retorna JSON com mensagem de sucesso
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.status(HttpStatus.OK).body("Usuário excluído com sucesso!");
    }

    // Atualiza usuário e retorna JSON com status OK e o usuário salvo
    @PostMapping("/update")
    public ResponseEntity<User> getUser(@RequestBody User userNovo) {
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
