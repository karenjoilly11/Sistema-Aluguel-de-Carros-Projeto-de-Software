package br.puc.aluguelcarros.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clientes")
// O Cliente herda Nome, Email e Senha de Usuario via herança JPA
public class Cliente extends Usuario {

    // No diagrama: CPF (int), Endereco (String), Profissao (String)
    @Column(nullable = false, unique = true)
    private String cpf; 

    private String endereco;
    private String profissao;

    // Relacionamento 1..1 com PedidoAluguel conforme o diagrama
    @OneToMany(mappedBy = "cliente")
    private List<PedidoAluguel> pedidos = new ArrayList<>();

    // Relacionamento de composição (losango preto) com Rendimento (0..3)
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
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