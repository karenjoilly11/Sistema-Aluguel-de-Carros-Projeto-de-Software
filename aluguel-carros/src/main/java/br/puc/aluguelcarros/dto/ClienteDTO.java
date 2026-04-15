package br.puc.aluguelcarros.dto;

import io.micronaut.serde.annotation.Serdeable;
import java.util.List;

/**
 * DTO (Data Transfer Object) para clientes.
 *
 * <p>Evita serialização circular: {@code Cliente → pedidos → PedidoAluguel → cliente}.
 * Inclui os rendimentos como lista de {@link RendimentoDTO} aninhado,
 * permitindo que o frontend exiba o resumo financeiro do cliente.</p>
 *
 * <p>A senha (<em>senhaHash</em>) nunca é incluída neste DTO.</p>
 */
@Serdeable
public class ClienteDTO {
    private Long id;
    private String nome;
    private String email;
    private String role;
    private String cpf;
    private String endereco;
    private String profissao;
    private List<RendimentoDTO> rendimentos;

    public ClienteDTO() {}

    @Serdeable
    public static class RendimentoDTO {
        private Long id;
        private String tipo;
        private Double valor;
        private String comprovante;

        public RendimentoDTO() {}

        public RendimentoDTO(Long id, String tipo, Double valor, String comprovante) {
            this.id = id;
            this.tipo = tipo;
            this.valor = valor;
            this.comprovante = comprovante;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTipo() { return tipo; }
        public void setTipo(String tipo) { this.tipo = tipo; }
        public Double getValor() { return valor; }
        public void setValor(Double valor) { this.valor = valor; }
        public String getComprovante() { return comprovante; }
        public void setComprovante(String comprovante) { this.comprovante = comprovante; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getProfissao() { return profissao; }
    public void setProfissao(String profissao) { this.profissao = profissao; }
    public List<RendimentoDTO> getRendimentos() { return rendimentos; }
    public void setRendimentos(List<RendimentoDTO> rendimentos) { this.rendimentos = rendimentos; }
}
