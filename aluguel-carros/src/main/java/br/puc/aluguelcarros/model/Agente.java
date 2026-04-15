package br.puc.aluguelcarros.model;

import jakarta.persistence.*;
import io.micronaut.core.annotation.Introspected;

@Introspected
@Entity
@Table(name = "agentes")
public class Agente extends Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String cpf; // No diagrama está int, mas String é melhor para CPF (0 à esquerda)

    private String endereco;
    private String profissao;

    public Agente() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getProfissao() { return profissao; }
    public void setProfissao(String profissao) { this.profissao = profissao; }
}