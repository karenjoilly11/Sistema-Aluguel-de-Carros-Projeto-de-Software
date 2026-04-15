package br.puc.aluguelcarros.model;

import jakarta.persistence.*;
import io.micronaut.serde.annotation.Serdeable;
import java.time.LocalDateTime;

/**
 * Entidade que representa o contrato formal de aluguel.
 *
 * <p>Um contrato é gerado a partir de um {@link PedidoAluguel} aprovado
 * via {@code POST /pedidos/{id}/contrato}. Existe uma relação
 * {@code OneToOne} entre Contrato e PedidoAluguel.</p>
 *
 * <p>O contrato pode ser assinado digitalmente via
 * {@code POST /contratos/{id}/assinar}, que registra a
 * {@code dataAssinatura} e marca {@code assinado = true}.</p>
 *
 * <p>Opcionalmente, um {@link Banco} pode ser vinculado ao contrato
 * para representar o crédito bancário utilizado no aluguel.</p>
 *
 * <p><strong>Serialização:</strong> os endpoints retornam
 * {@link br.puc.aluguelcarros.dto.ContratoDTO} para evitar referências
 * circulares via {@code pedido → cliente/automovel}.</p>
 */
@Serdeable
@Entity
@Table(name = "contratos")
public class Contrato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String termos;

    private Double valorFinal;
    private LocalDateTime dataAssinatura;
    private boolean assinado = false;

    @OneToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    private PedidoAluguel pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banco_id")
    private Banco banco;

    public Contrato() {}

    // --- MÉTODOS DE LÓGICA (RESOLVEM OS ERROS DE COMPILAÇÃO) ---

    /**
     * Resolve o erro: vincularCreditoBancario(Banco) is undefined
     */
    public void vincularCreditoBancario(Banco banco) {
        this.banco = banco;
    }

    public boolean isPossuiCredito() {
        return this.banco != null;
    }

    public PedidoAluguel getPedidoAluguel() {
        return this.pedido;
    }

    public void setPedidoAluguel(PedidoAluguel pedido) {
        this.pedido = pedido;
    }

    public void registrarAssinatura() {
        this.assinado = true;
        this.dataAssinatura = LocalDateTime.now();
    }

    // --- Getters e Setters Padrão ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTermos() { return termos; }
    public void setTermos(String termos) { this.termos = termos; }

    public Double getValorFinal() { return valorFinal; }
    public void setValorFinal(Double valorFinal) { this.valorFinal = valorFinal; }

    public boolean isAssinado() { return assinado; }
}