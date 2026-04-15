package br.puc.aluguelcarros.model;

import jakarta.persistence.*;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Entidade que representa uma fonte de renda de um {@link Cliente}.
 *
 * <p>Cada cliente pode cadastrar até 3 rendimentos (composição forte via
 * {@code CascadeType.ALL} em {@link Cliente#getRendimentos()}).
 * Os rendimentos são usados pelo {@link br.puc.aluguelcarros.service.FinanceiroService}
 * para análise de crédito: a soma dos rendimentos deve ser maior ou igual
 * a 3x o valor total do pedido de aluguel para ser aprovado.</p>
 *
 * <p>Tipos comuns de rendimento: {@code salario}, {@code aluguel},
 * {@code autonomo}, {@code pensao}, etc.</p>
 */
@Serdeable
@Entity
@Table(name = "rendimentos")
public class Rendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tipo; // ex: salario, aluguel, autonomo

    @Column(nullable = false)
    private Double valor;

    private String comprovante; // caminho ou referencia do comprovante

    public Rendimento() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Double getValor() { return valor; }
    public void setValor(Double valor) { this.valor = valor; }

    public String getComprovante() { return comprovante; }
    public void setComprovante(String comprovante) { this.comprovante = comprovante; }
}
