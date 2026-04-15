package br.puc.aluguelcarros.dto;

import io.micronaut.serde.annotation.Serdeable;
import java.time.LocalDateTime;

/**
 * DTO (Data Transfer Object) para contratos de aluguel.
 *
 * <p>Evita serialização circular: {@code Contrato → PedidoAluguel → Cliente/Automovel}.
 * Expõe apenas o {@code pedidoId} e o {@code statusPedido} como referência
 * ao pedido associado.</p>
 */
@Serdeable
public class ContratoDTO {
    private Long id;
    private String termos;
    private Double valorFinal;
    private LocalDateTime dataAssinatura;
    private boolean assinado;
    private Long pedidoId;
    private String statusPedido;

    public ContratoDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTermos() { return termos; }
    public void setTermos(String termos) { this.termos = termos; }

    public Double getValorFinal() { return valorFinal; }
    public void setValorFinal(Double valorFinal) { this.valorFinal = valorFinal; }

    public LocalDateTime getDataAssinatura() { return dataAssinatura; }
    public void setDataAssinatura(LocalDateTime dataAssinatura) { this.dataAssinatura = dataAssinatura; }

    public boolean isAssinado() { return assinado; }
    public void setAssinado(boolean assinado) { this.assinado = assinado; }

    public Long getPedidoId() { return pedidoId; }
    public void setPedidoId(Long pedidoId) { this.pedidoId = pedidoId; }

    public String getStatusPedido() { return statusPedido; }
    public void setStatusPedido(String statusPedido) { this.statusPedido = statusPedido; }
}
