package br.puc.aluguelcarros.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import io.micronaut.serde.annotation.Serdeable;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidade que representa um cliente do sistema de aluguel.
 *
 * <p>Herda de {@link Usuario} via {@code InheritanceType.JOINED}: os dados de
 * autenticação ficam na tabela {@code usuario} e os dados específicos do
 * cliente ficam na tabela {@code clientes}, ligadas pela PK/FK compartilhada.</p>
 *
 * <p>Um cliente pode ter até 3 {@link Rendimento}s cadastrados (composição forte),
 * utilizados pela análise financeira para aprovação de pedidos.
 * A lista de {@link PedidoAluguel}s é mapeada como associação bidirecional
 * e <strong>não é serializada no JSON</strong> para evitar referência circular —
 * use os endpoints de pedidos para acessá-los.</p>
 *
 * <p>O campo {@code cpf} é opcional ({@code nullable=true}) para permitir
 * cadastro imediato sem documento.</p>
 */
@Serdeable
@Entity
@Table(name = "clientes")
public class Cliente extends Usuario {

    // No diagrama: CPF (int), Endereco (String), Profissao (String)
    @Column(nullable = true, unique = true)
    private String cpf; 

    private String endereco;
    private String profissao;

    // Relacionamento 1..1 com PedidoAluguel conforme o diagrama
    @OneToMany(mappedBy = "cliente", fetch = FetchType.EAGER)
    private List<PedidoAluguel> pedidos = new ArrayList<>();

    // Relacionamento de composição (losango preto) com Rendimento (0..3)
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id")
    @Size(max = 3)
    private List<Rendimento> rendimentos = new ArrayList<>();

    public Cliente() { super(); }

    // Getters e Setters
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getProfissao() { return profissao; }
    public void setProfissao(String profissao) { this.profissao = profissao; }
    public List<Rendimento> getRendimentos() { return rendimentos; }
    public void setRendimentos(List<Rendimento> rendimentos) { this.rendimentos = rendimentos; }

    public List<PedidoAluguel> getPedidos() {
        return pedidos;
    }

    public void setPedidos(List<PedidoAluguel> pedidos) {
        this.pedidos = pedidos;
    }
}