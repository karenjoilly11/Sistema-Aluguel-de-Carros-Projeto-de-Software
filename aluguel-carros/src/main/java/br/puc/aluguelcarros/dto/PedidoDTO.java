package br.puc.aluguelcarros.dto;

import io.micronaut.serde.annotation.Serdeable;
import java.time.LocalDate;

/**
 * DTO (Data Transfer Object) para pedidos de aluguel.
 *
 * <p>Usado em todos os endpoints que retornam pedidos para evitar
 * serialização circular: {@code PedidoAluguel → Cliente → pedidos → PedidoAluguel}.
 * Expõe apenas os IDs das entidades relacionadas ({@code clienteId}, {@code automovelId})
 * em vez das entidades completas.</p>
 */
@Serdeable
public class PedidoDTO {
    private Long id;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private String status;
    private Double valorTotal;
    private Long clienteId;
    private Long automovelId;

    public PedidoDTO() {}

    public PedidoDTO(Long id, LocalDate dataInicio, LocalDate dataFim, String status, Double valorTotal, Long clienteId, Long automovelId) {
        this.id = id;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.status = status;
        this.valorTotal = valorTotal;
        this.clienteId = clienteId;
        this.automovelId = automovelId;
    }

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

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public Long getAutomovelId() { return automovelId; }
    public void setAutomovelId(Long automovelId) { this.automovelId = automovelId; }
}
