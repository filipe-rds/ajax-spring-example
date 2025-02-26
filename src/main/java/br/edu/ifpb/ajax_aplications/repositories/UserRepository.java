package br.edu.ifpb.ajax_aplications.repositories;

import br.edu.ifpb.ajax_aplications.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
//    List<User> findByNameContainingIgnoreCase(String name);
    Page<User> findByNameContainingIgnoreCase(String name, Pageable pageable);
}