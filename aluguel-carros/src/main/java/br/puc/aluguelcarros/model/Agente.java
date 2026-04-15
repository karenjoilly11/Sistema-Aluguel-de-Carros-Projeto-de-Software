package br.puc.aluguelcarros.model;

import jakarta.persistence.*;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Entidade que representa um agente operacional do sistema.
 *
 * <p>Agente é a classe intermediária da hierarquia de usuários entre
 * {@link Usuario} e as entidades especializadas {@link Banco} e {@link Empresa}.
 * Possui dados pessoais adicionais como CPF, endereço e profissão.</p>
 *
 * <p>Na hierarquia JPA (InheritanceType.JOINED):
 * <pre>
 *   Usuario
 *     └── Agente (tabela: agentes)
 *           ├── Banco  (tabela: bancos)
 *           └── Empresa (tabela: empresas)
 * </pre>
 * </p>
 */
@Serdeable
@Entity
@Table(name = "agentes")
public class Agente extends Usuario {

    @Column(nullable = false, unique = true)
    private String cpf; // No diagrama está int, mas String é melhor para CPF (0 à esquerda)

    private String endereco;
    private String profissao;

    public Agente() {}

    // Getters e Setters
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getProfissao() { return profissao; }
    public void setProfissao(String profissao) { this.profissao = profissao; }
}