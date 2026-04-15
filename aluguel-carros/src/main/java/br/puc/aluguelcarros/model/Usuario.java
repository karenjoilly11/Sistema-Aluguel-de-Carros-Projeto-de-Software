package br.puc.aluguelcarros.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

/**
 * Entidade de autenticação.
 * Armazena credenciais de acesso ao sistema.
 * A senha é sempre armazenada como hash BCrypt — nunca em texto puro.
 */
@Entity
@Table(name = "usuario")
@Inheritance(strategy = InheritanceType.JOINED)
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String senhaHash;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String role; // ADMIN, OPERADOR, etc.

    public Usuario() {}

    public Usuario(String email, String senhaHash, String nome, String role) {
        this.email     = email;
        this.senhaHash = senhaHash;
        this.nome      = nome;
        this.role      = role;
    }

    public Long getId()           { return id; }
    public String getEmail()      { return email; }
    public void setEmail(String e){ this.email = e; }
    public String getSenhaHash()  { return senhaHash; }
    public void setSenhaHash(String s) { this.senhaHash = s; }
    public String getNome()       { return nome; }
    public void setNome(String n) { this.nome = n; }
    public String getRole()       { return role; }
    public void setRole(String r) { this.role = r; }

    public void setId(Long id) {
        this.id = id;
    }
}
