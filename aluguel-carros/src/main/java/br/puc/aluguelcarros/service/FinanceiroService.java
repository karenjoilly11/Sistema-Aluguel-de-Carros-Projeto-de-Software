package br.puc.aluguelcarros.service;

import br.puc.aluguelcarros.model.Cliente;
import br.puc.aluguelcarros.model.PedidoAluguel;
import br.puc.aluguelcarros.model.Rendimento;
import br.puc.aluguelcarros.repository.PedidoRepository;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;

/**
 * Serviço responsável pela análise financeira dos pedidos de aluguel.
 *
 * <p>Implementa a regra de negócio de crédito:
 * a soma de todos os rendimentos do cliente deve ser
 * <strong>maior ou igual a 3× o valor total do pedido</strong>
 * para que a análise retorne {@code true} (aprovado).</p>
 *
 * <p>Se o cliente não possuir nenhum rendimento cadastrado,
 * a análise retorna {@code false} imediatamente.</p>
 *
 * <p>O método {@code realizarAnaliseFinanceira} é anotado com {@code @Transactional}
 * para carregar o cliente e seus rendimentos (EAGER) dentro de uma sessão Hibernate.</p>
 */
@Singleton
public class FinanceiroService {

    private final PedidoRepository pedidoRepo;

    public FinanceiroService(PedidoRepository pedidoRepo) {
        this.pedidoRepo = pedidoRepo;
    }

    /**
     * Analisa a viabilidade financeira de um pedido.
     * Critérios:
     * - Cliente deve ter pelo menos 1 rendimento informado
     * - Renda mensal mínima deve ser >= 3x o valor total do pedido
     */
    @Transactional
    public boolean realizarAnaliseFinanceira(Long pedidoId) {
        PedidoAluguel pedido = pedidoRepo.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado: " + pedidoId));
        Cliente cliente = pedido.getCliente();

        // Valida se tem rendimentos
        if (cliente.getRendimentos() == null || cliente.getRendimentos().isEmpty()) {
            return false;
        }

        // Calcula renda total
        double rendimentoTotal = cliente.getRendimentos().stream()
                .mapToDouble(Rendimento::getValor)
                .sum();

        // Valida se renda é suficiente (mínimo 3x o valor do aluguel)
        double fatorSeguranca = 3.0;
        return rendimentoTotal >= (pedido.getValorTotal() * fatorSeguranca);
    }

    @Transactional
    public boolean validarRendimentos(Cliente cliente) {
        if (cliente.getRendimentos() == null || cliente.getRendimentos().isEmpty()) {
            return false;
        }
        double totalRendimento = cliente.getRendimentos().stream()
                .mapToDouble(Rendimento::getValor)
                .sum();
        return totalRendimento > 0;
    }
}
