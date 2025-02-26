package br.edu.ifpb.ajax_aplications.services;

import br.edu.ifpb.ajax_aplications.models.User;
import br.edu.ifpb.ajax_aplications.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User save(User user) {
        return userRepository.save(user);
    }


    public Page<User> searchUsers(String name, Pageable pageable) {
        return userRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    public void delete(Long id) {
        userRepository.deleteById(id);
    }

    public User findbyId(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}