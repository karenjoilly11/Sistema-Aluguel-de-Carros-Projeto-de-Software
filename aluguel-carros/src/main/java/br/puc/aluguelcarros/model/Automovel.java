package br.puc.aluguelcarros.model;

import jakarta.persistence.*;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Entidade que representa um veículo da frota.
 *
 * <p>Cada automóvel possui uma placa única (índice no banco) e um
 * {@code valorDiaria} utilizado pelo {@link br.puc.aluguelcarros.service.PedidoService}
 * para calcular o valor total do aluguel com base no número de dias.</p>
 *
 * <p>O campo {@code disponivel} indica se o veículo pode ser alugado.
 * O endpoint {@code GET /automoveis} é público (não exige autenticação)
 * para permitir que a landing page exiba a frota sem login.</p>
 */
@Serdeable
@Entity
@Table(name = "automoveis")
public class Automovel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String placa;

    @Column(nullable = false)
    private String marca;

    @Column(nullable = false)
    private String modelo;

    private String cor;
    private int ano;
    private Double valorDiaria;
    private boolean disponivel = true;

    public Automovel() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public String getCor() { return cor; }
    public void setCor(String cor) { this.cor = cor; }

    public int getAno() { return ano; }
    public void setAno(int ano) { this.ano = ano; }

    public Double getValorDiaria() { return valorDiaria; }
    public void setValorDiaria(Double valorDiaria) { this.valorDiaria = valorDiaria; }

    public boolean isDisponivel() { return disponivel; }
    public void setDisponivel(boolean disponivel) { this.disponivel = disponivel; }
}
