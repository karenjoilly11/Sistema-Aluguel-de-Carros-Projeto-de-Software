package br.puc.aluguelcarros.controller;

import br.puc.aluguelcarros.dto.ContratoDTO;
import br.puc.aluguelcarros.dto.PedidoDTO;
import br.puc.aluguelcarros.model.PedidoAluguel;
import br.puc.aluguelcarros.service.FinanceiroService;
import br.puc.aluguelcarros.service.PedidoService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.rules.SecurityRule;

import java.util.List;

/**
 * Controller REST para gerenciamento de pedidos de aluguel.
 *
 * <p>Todos os endpoints retornam DTOs ({@link br.puc.aluguelcarros.dto.PedidoDTO}
 * ou {@link br.puc.aluguelcarros.dto.ContratoDTO}) para evitar serialização circular.</p>
 *
 * <p>Endpoints:
 * <ul>
 *   <li>{@code GET    /pedidos/todos}              — lista todos os pedidos (ADMIN)</li>
 *   <li>{@code POST   /pedidos}                    — cria novo pedido de aluguel</li>
 *   <li>{@code GET    /pedidos/cliente/{clienteId}}— pedidos de um cliente específico</li>
 *   <li>{@code DELETE /pedidos/{id}}               — cancela um pedido</li>
 *   <li>{@code POST   /pedidos/{id}/contrato}      — converte pedido em contrato (aprova)</li>
 *   <li>{@code GET    /pedidos/{id}/analise-financeira} — verifica aprovação financeira</li>
 * </ul>
 * </p>
 */
@Controller("/pedidos")
@Secured(SecurityRule.IS_AUTHENTICATED)
public class PedidoController {

    private final PedidoService pedidoService;
    private final FinanceiroService financeiroService;

    public PedidoController(PedidoService pedidoService, FinanceiroService financeiroService) {
        this.pedidoService = pedidoService;
        this.financeiroService = financeiroService;
    }

    @Get("/todos")
    public List<PedidoDTO> listarTodos() {
        return pedidoService.listarTodosDTO();
    }

    @Post
    public HttpResponse<PedidoDTO> criarSolicitacao(@Body PedidoAluguel pedido) {
        return HttpResponse.created(pedidoService.criarSolicitacao(pedido));
    }

    @Get("/cliente/{clienteId}")
    public List<PedidoDTO> listarPorCliente(Long clienteId) {
        return pedidoService.listarPorCliente(clienteId);
    }

    @Delete("/{id}")
    public HttpResponse<Void> cancelarSolicitacao(Long id) {
        pedidoService.cancelarSolicitacao(id);
        return HttpResponse.noContent();
    }

    @Post("/{id}/contrato")
    public HttpResponse<ContratoDTO> converterParaContrato(Long id) {
        return HttpResponse.created(pedidoService.converterParaContrato(id));
    }

    @Post("/{id}/rejeitar")
    public HttpResponse<Void> rejeitarSolicitacao(Long id) {
        pedidoService.rejeitarSolicitacao(id);
        return HttpResponse.noContent();
    }

    @Get("/{id}/analise-financeira")
    public HttpResponse<Boolean> analisarFinanceiro(Long id) {
        boolean aprovado = financeiroService.realizarAnaliseFinanceira(id);
        return HttpResponse.ok(aprovado);
    }
}
