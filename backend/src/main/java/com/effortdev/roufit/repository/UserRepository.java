package com.effortdev.roufit.repository;

import com.effortdev.roufit.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByGoogleSub(String googleSub);
    Optional<User> findByEmail(String email);
}
