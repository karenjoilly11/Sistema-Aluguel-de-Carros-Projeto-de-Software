package br.puc.aluguelcarros.model;

import jakarta.persistence.*;
import io.micronaut.serde.annotation.Serdeable;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

/**
 * Entidade que representa uma solicitação de aluguel de veículo.
 *
 * <p>Ciclo de vida do status:
 * <pre>
 *   PENDENTE → APROVADO → CONCLUIDO
 *           ↘ CANCELADO
 * </pre>
 * </p>
 *
 * <p>As associações {@code cliente} e {@code automovel} são {@code LAZY} e
 * anotadas com {@code @JsonIgnore} para evitar serialização circular.
 * Todos os endpoints que retornam pedidos utilizam {@link br.puc.aluguelcarros.dto.PedidoDTO},
 * que expõe apenas os IDs dessas entidades.</p>
 *
 * <p>O {@code valorTotal} é calculado automaticamente pelo
 * {@link br.puc.aluguelcarros.service.PedidoService} com base no
 * {@code valorDiaria} do automóvel e no número de dias entre
 * {@code dataInicio} e {@code dataFim}.</p>
 */
@Serdeable
@Entity
@Table(name = "pedidos_aluguel")
public class PedidoAluguel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate dataInicio;

    @Column(nullable = false)
    private LocalDate dataFim;

    @Column(nullable = false)
    private String status; // PENDENTE, APROVADO, CANCELADO, CONCLUIDO

    private Double valorTotal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    @JsonIgnore
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "automovel_id", nullable = false)
    @JsonIgnore
    private Automovel automovel;

    @OneToOne(mappedBy = "pedido", cascade = CascadeType.ALL)
    private Contrato contrato;

    public PedidoAluguel() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }

    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getValorTotal() { return valorTotal; }
    public void setValorTotal(Double valorTotal) { this.valorTotal = valorTotal; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public Automovel getAutomovel() { return automovel; }
    public void setAutomovel(Automovel automovel) { this.automovel = automovel; }

    public Contrato getContrato() { return contrato; }
    public void setContrato(Contrato contrato) { this.contrato = contrato; }
}
